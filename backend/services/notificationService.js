const crypto = require('crypto');
const db = require('../config/db');
const { getIO } = require('../socket');

/**
 * Global Real-time Notification Engine for RUCHI Platform
 */
class NotificationService {
  /**
   * Broadcast an event to all eligible active members
   * @param {Object} params
   * @param {'NEW_DISH'|'NEW_PREORDER'|'FREE_FOOD'|'ANNOUNCEMENT'} params.eventType
   * @param {string} params.sourceId
   * @param {string} params.createdBy
   * @param {string} params.title
   * @param {string} params.message
   * @param {string} [params.imageUrl]
   * @param {string} [params.targetUrl]
   * @param {Object} [params.payload]
   */
  async broadcastEvent({
    eventType,
    sourceId,
    createdBy,
    title,
    message,
    imageUrl = null,
    targetUrl = null,
    payload = {},
  }) {
    const eventId = crypto.randomUUID();
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

    try {
      // 1. Create Notification Event record
      await db.query(
        `INSERT INTO notification_events (id, event_type, source_id, created_by, payload, status, recipients_count, created_at)
         VALUES (?, ?, ?, ?, ?, 'PROCESSING', 0, NOW())`,
        [eventId, eventType, sourceId || null, createdBy || null, payloadStr]
      );

      // 2. Fetch all active, registered eligible users (exclude creator)
      const [eligibleUsers] = await db.query(
        `SELECT u.id, u.email, u.name,
                p.push_enabled, p.sound_enabled, p.sound_volume,
                p.new_dish_enabled, p.preorder_enabled, p.free_food_enabled
         FROM users u
         LEFT JOIN user_notification_preferences p ON u.id = p.user_id
         WHERE u.status = 'ACTIVE' AND (u.id != ? OR ? IS NULL)`,
        [createdBy || null, createdBy || null]
      );

      // Filter by user preferences if set
      const targetUsers = eligibleUsers.filter((u) => {
        if (eventType === 'NEW_DISH' && u.new_dish_enabled === 0) return false;
        if (eventType === 'NEW_PREORDER' && u.preorder_enabled === 0) return false;
        if (eventType === 'FREE_FOOD' && u.free_food_enabled === 0) return false;
        return true;
      });

      const totalRecipients = targetUsers.length;
      let successCount = 0;
      let failureCount = 0;

      // 3. Batch insert notifications in chunks of 500 to avoid blocking MySQL
      const CHUNK_SIZE = 500;
      for (let i = 0; i < targetUsers.length; i += CHUNK_SIZE) {
        const chunk = targetUsers.slice(i, i + CHUNK_SIZE);
        const values = [];

        chunk.forEach((u) => {
          const notifId = crypto.randomUUID();
          values.push([
            notifId,
            u.id,
            eventId,
            'CUSTOMER',
            title,
            message,
            eventType,
            imageUrl,
            targetUrl,
            0, // is_read
            new Date(),
          ]);
        });

        if (values.length > 0) {
          try {
            await db.query(
              `INSERT IGNORE INTO notifications 
               (id, user_id, event_id, portal_target, title, message, type, image_url, target_url, is_read, created_at)
               VALUES ?`,
              [values]
            );
            successCount += values.length;
          } catch (batchErr) {
            console.error('Notification batch insertion error:', batchErr.message);
            failureCount += values.length;
          }
        }
      }

      // 4. Update Event Status
      await db.query(
        `UPDATE notification_events 
         SET status = ?, recipients_count = ?, success_count = ?, failure_count = ?, processed_at = NOW()
         WHERE id = ?`,
        [failureCount > 0 ? 'PARTIAL' : 'PROCESSED', totalRecipients, successCount, failureCount, eventId]
      );

      // 5. Real-time delivery via Socket.IO
      const io = getIO();
      if (io) {
        const socketPayload = {
          eventId,
          type: eventType,
          title,
          message,
          imageUrl,
          targetUrl,
          createdAt: new Date().toISOString(),
          soundType:
            eventType === 'NEW_DISH'
              ? 'DISH_CHIME'
              : eventType === 'NEW_PREORDER'
              ? 'PREORDER_BELL'
              : eventType === 'FREE_FOOD'
              ? 'FREE_FOOD_CHORD'
              : 'DEFAULT_ALERT',
        };

        // Broadcast to all connected clients
        io.emit('new_notification', socketPayload);
        io.emit('global_notification', socketPayload);

        // Targeted user room updates for unread counts
        targetUsers.forEach((u) => {
          io.to(`user_${u.id}`).emit('user_notification', {
            ...socketPayload,
            userId: u.id,
          });
        });
      }

      console.log(
        `[NotificationService] Event ${eventType} broadcasted to ${successCount}/${totalRecipients} members successfully.`
      );

      return {
        success: true,
        eventId,
        recipientsCount: totalRecipients,
        successCount,
      };
    } catch (err) {
      console.error('[NotificationService] Broadcast Event Failed:', err);
      // Mark event as failed
      try {
        await db.query(`UPDATE notification_events SET status = 'FAILED' WHERE id = ?`, [eventId]);
      } catch (_) {}
      throw err;
    }
  }

  /**
   * Get paginated notifications for a customer
   */
  async getUserNotifications(userId, { page = 1, limit = 20, type = 'ALL', unreadOnly = false }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (type && type !== 'ALL') {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    if (unreadOnly) {
      whereClause += ' AND is_read = 0';
    }

    const [rows] = await db.query(
      `SELECT id, user_id AS userId, event_id AS eventId, portal_target AS portalTarget,
              title, message, type, image_url AS imageUrl, target_url AS targetUrl,
              is_read AS isRead, created_at AS createdAt, read_at AS readAt
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total FROM notifications ${whereClause}`,
      params
    );

    const [[unreadRow]] = await db.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    return {
      notifications: rows,
      total: countRow.total,
      unreadCount: unreadRow.unread,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRow.total / limit) || 1,
    };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId) {
    await db.query(
      `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    const [[unreadRow]] = await db.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit('unread_count_updated', { unreadCount: unreadRow.unread });
    }

    return { success: true, unreadCount: unreadRow.unread };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await db.query(
      `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit('unread_count_updated', { unreadCount: 0 });
    }

    return { success: true, unreadCount: 0 };
  }

  /**
   * Delete single notification
   */
  async deleteNotification(notificationId, userId) {
    await db.query(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [notificationId, userId]);

    const [[unreadRow]] = await db.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit('unread_count_updated', { unreadCount: unreadRow.unread });
    }

    return { success: true, unreadCount: unreadRow.unread };
  }

  /**
   * Clear all notifications for user
   */
  async clearAllNotifications(userId) {
    await db.query(`DELETE FROM notifications WHERE user_id = ?`, [userId]);

    const io = getIO();
    if (io) {
      io.to(`user_${userId}`).emit('unread_count_updated', { unreadCount: 0 });
    }

    return { success: true, unreadCount: 0 };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const [[unreadRow]] = await db.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
    return unreadRow ? unreadRow.unread : 0;
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId) {
    const [rows] = await db.query(
      `SELECT id, user_id AS userId, push_enabled AS pushEnabled, sound_enabled AS soundEnabled,
              sound_volume AS soundVolume, new_dish_enabled AS newDishEnabled,
              preorder_enabled AS preorderEnabled, free_food_enabled AS freeFoodEnabled
       FROM user_notification_preferences WHERE user_id = ?`,
      [userId]
    );

    if (rows.length > 0) {
      return rows[0];
    }

    // Default preferences
    return {
      userId,
      pushEnabled: true,
      soundEnabled: true,
      soundVolume: 0.8,
      newDishEnabled: true,
      preorderEnabled: true,
      freeFoodEnabled: true,
    };
  }

  /**
   * Upsert user notification preferences
   */
  async updatePreferences(userId, prefs = {}) {
    const {
      pushEnabled = true,
      soundEnabled = true,
      soundVolume = 0.8,
      newDishEnabled = true,
      preorderEnabled = true,
      freeFoodEnabled = true,
    } = prefs;

    await db.query(
      `INSERT INTO user_notification_preferences 
       (user_id, push_enabled, sound_enabled, sound_volume, new_dish_enabled, preorder_enabled, free_food_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         push_enabled = VALUES(push_enabled),
         sound_enabled = VALUES(sound_enabled),
         sound_volume = VALUES(sound_volume),
         new_dish_enabled = VALUES(new_dish_enabled),
         preorder_enabled = VALUES(preorder_enabled),
         free_food_enabled = VALUES(free_food_enabled),
         updated_at = NOW()`,
      [
        userId,
        pushEnabled ? 1 : 0,
        soundEnabled ? 1 : 0,
        Number(soundVolume),
        newDishEnabled ? 1 : 0,
        preorderEnabled ? 1 : 0,
        freeFoodEnabled ? 1 : 0,
      ]
    );

    return this.getPreferences(userId);
  }

  /**
   * Save Web Push subscription
   */
  async savePushSubscription(userId, { deviceId, platform = 'web', subscriptionToken, endpoint, p256dh, auth }) {
    await db.query(
      `INSERT INTO user_push_subscriptions 
       (user_id, device_id, platform, subscription_token, endpoint, p256dh, auth, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, deviceId || null, platform, subscriptionToken || null, endpoint || null, p256dh || null, auth || null]
    );

    return { success: true };
  }

  /**
   * Admin: Get all notification events with stats
   */
  async getAdminEvents({ page = 1, limit = 20, status = 'ALL', eventType = 'ALL' }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    if (eventType && eventType !== 'ALL') {
      whereClause += ' AND e.event_type = ?';
      params.push(eventType);
    }

    const [rows] = await db.query(
      `SELECT e.id, e.event_type AS eventType, e.source_id AS sourceId,
              e.created_by AS createdBy, e.payload, e.status,
              e.recipients_count AS recipientsCount, e.success_count AS successCount,
              e.failure_count AS failureCount, e.created_at AS createdAt,
              e.processed_at AS processedAt,
              u.name AS creatorName, u.email AS creatorEmail
       FROM notification_events e
       LEFT JOIN users u ON e.created_by = u.id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total FROM notification_events e ${whereClause}`,
      params
    );

    const [[statsRow]] = await db.query(`
      SELECT 
        COUNT(*) AS totalEvents,
        SUM(recipients_count) AS totalRecipients,
        SUM(success_count) AS totalSuccess,
        SUM(failure_count) AS totalFailure
      FROM notification_events
    `);

    return {
      events: rows.map((r) => ({
        ...r,
        payload: r.payload ? JSON.parse(r.payload) : {},
      })),
      total: countRow.total,
      stats: {
        totalEvents: statsRow.totalEvents || 0,
        totalRecipients: statsRow.totalRecipients || 0,
        totalSuccess: statsRow.totalSuccess || 0,
        totalFailure: statsRow.totalFailure || 0,
      },
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRow.total / limit) || 1,
    };
  }

  /**
   * Admin: Retry a failed event
   */
  async retryEvent(eventId) {
    const [[event]] = await db.query(
      `SELECT * FROM notification_events WHERE id = ?`,
      [eventId]
    );

    if (!event) {
      throw new Error('Notification event not found.');
    }

    const payload = event.payload ? JSON.parse(event.payload) : {};
    return this.broadcastEvent({
      eventType: event.event_type,
      sourceId: event.source_id,
      createdBy: event.created_by,
      title: payload.title || 'Platform Notification',
      message: payload.message || 'Notification broadcast update',
      imageUrl: payload.imageUrl,
      targetUrl: payload.targetUrl,
      payload,
    });
  }
}

module.exports = new NotificationService();
