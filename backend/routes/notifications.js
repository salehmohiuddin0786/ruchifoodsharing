const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticate, requireAdmin } = require('../middleware/auth');
const db = require('../config/db');

/**
 * GET /api/notifications
 * Authenticated: Get current user's paginated notifications
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'ALL', unreadOnly = 'false' } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      page: Number(page),
      limit: Number(limit),
      type,
      unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/unread-count
 * Fast unread counter for header notification bell
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 */
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications/clear-all
 */
router.delete('/clear-all', authenticate, async (req, res) => {
  try {
    const result = await notificationService.clearAllNotifications(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/notifications/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification & sound preferences
 */
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const prefs = await notificationService.getPreferences(req.user.id);
    res.json({ success: true, preferences: prefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update notification & sound preferences
 */
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const prefs = await notificationService.updatePreferences(req.user.id, req.body);
    res.json({ success: true, preferences: prefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/subscribe-push
 * Save browser/device push token
 */
router.post('/subscribe-push', authenticate, async (req, res) => {
  try {
    await notificationService.savePushSubscription(req.user.id, req.body);
    res.json({ success: true, message: 'Push subscription saved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// ADMIN NOTIFICATION MANAGEMENT
// =============================================================================

/**
 * GET /api/notifications/admin/events
 * View all notification events and delivery stats
 */
router.get('/admin/events', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'ALL', eventType = 'ALL' } = req.query;
    const result = await notificationService.getAdminEvents({
      page: Number(page),
      limit: Number(limit),
      status,
      eventType,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/admin/broadcast
 * Send a platform-wide announcement
 */
router.post('/admin/broadcast', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, message, imageUrl, targetUrl } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const result = await notificationService.broadcastEvent({
      eventType: 'ANNOUNCEMENT',
      sourceId: null,
      createdBy: req.user.id,
      title: `📢 ${title}`,
      message,
      imageUrl: imageUrl || null,
      targetUrl: targetUrl || '/',
      payload: { title, message, targetUrl, imageUrl },
    });

    res.json({ success: true, ...result, message: 'Platform broadcast sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/admin/events/:id/retry
 * Retry a failed event
 */
router.post('/admin/events/:id/retry', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await notificationService.retryEvent(req.params.id);
    res.json({ success: true, ...result, message: 'Notification event retried successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// BACKWARD COMPATIBILITY
// =============================================================================
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [req.params.userId]
    );
    res.json({ success: true, notifications: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await db.query(`UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ?`, [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
