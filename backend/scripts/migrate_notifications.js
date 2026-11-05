const db = require('../config/db');

async function migrate() {
  console.log('Running notification system MySQL migration...');

  // 1. Upgrade notifications table columns
  try {
    const [cols] = await db.query('DESCRIBE notifications');
    const existing = new Set(cols.map((c) => c.Field));

    if (!existing.has('event_id')) {
      await db.query(`ALTER TABLE notifications ADD COLUMN event_id VARCHAR(64) NULL AFTER user_id`);
      console.log('Added event_id to notifications');
    }
    if (!existing.has('image_url')) {
      await db.query(`ALTER TABLE notifications ADD COLUMN image_url TEXT NULL AFTER message`);
      console.log('Added image_url to notifications');
    }
    if (!existing.has('target_url')) {
      await db.query(`ALTER TABLE notifications ADD COLUMN target_url TEXT NULL AFTER image_url`);
      console.log('Added target_url to notifications');
    }
    if (!existing.has('read_at')) {
      await db.query(`ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP NULL AFTER is_read`);
      console.log('Added read_at to notifications');
    }

    // Check indexes
    const [indexes] = await db.query('SHOW INDEX FROM notifications');
    const indexNames = new Set(indexes.map((i) => i.Key_name));

    if (!indexNames.has('uniq_user_event')) {
      // Add unique constraint for (user_id, event_id)
      try {
        await db.query(`ALTER TABLE notifications ADD UNIQUE KEY uniq_user_event (user_id, event_id)`);
        console.log('Added uniq_user_event constraint');
      } catch (e) {
        console.log('Note on uniq_user_event:', e.message);
      }
    }

    if (!indexNames.has('idx_user_read_created')) {
      await db.query(`ALTER TABLE notifications ADD INDEX idx_user_read_created (user_id, is_read, created_at)`);
      console.log('Added idx_user_read_created index');
    }
  } catch (err) {
    console.error('Error altering notifications:', err.message);
  }

  // 2. Create notification_events
  await db.query(`
    CREATE TABLE IF NOT EXISTS notification_events (
      id VARCHAR(64) PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      source_id VARCHAR(64) NULL,
      created_by VARCHAR(64) NULL,
      payload TEXT NULL,
      status VARCHAR(30) DEFAULT 'PROCESSED',
      recipients_count INT DEFAULT 0,
      success_count INT DEFAULT 0,
      failure_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP NULL,
      INDEX idx_event_type (event_type),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table notification_events verified');

  // 3. Create user_notification_preferences
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_notification_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL UNIQUE,
      push_enabled TINYINT(1) DEFAULT 1,
      sound_enabled TINYINT(1) DEFAULT 1,
      sound_volume FLOAT DEFAULT 0.8,
      new_dish_enabled TINYINT(1) DEFAULT 1,
      preorder_enabled TINYINT(1) DEFAULT 1,
      free_food_enabled TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table user_notification_preferences verified');

  // 4. Create user_push_subscriptions
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      device_id VARCHAR(128) NULL,
      platform VARCHAR(30) DEFAULT 'web',
      subscription_token TEXT NULL,
      endpoint TEXT NULL,
      p256dh TEXT NULL,
      auth TEXT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_active (user_id, is_active),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table user_push_subscriptions verified');

  console.log('Notification migration completed successfully!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
