const cron = require('node-cron');
const db = require('../config/db');

/**
 * Cutoff and Expiry Scheduled Worker
 * Runs every 30 seconds to strictly enforce:
 * 1. Automatic 30-minute cutoff before cooking_starts_at (order_closes_at <= NOW())
 * 2. Safe collection deadline expiration for free food donations (expires_at <= NOW())
 */
function startCutoffWorker() {
  console.log('⏱️ Background Cutoff Worker scheduled (checks every 30s)...');

  cron.schedule('*/30 * * * * *', async () => {
    try {
      // 1. Close Food Posts that passed order_closes_at
      const [closedPosts] = await db.query(
        `SELECT id, cook_id, dish_name, active_customer_bookings_count 
         FROM food_posts 
         WHERE status = 'ACTIVE' AND order_closes_at <= NOW()`
      );

      if (closedPosts.length > 0) {
        for (const post of closedPosts) {
          await db.query(
            `UPDATE food_posts SET status = 'CLOSED' WHERE id = ?`,
            [post.id]
          );

          // Verify cook exists before inserting notification
          const [cookUser] = await db.query(`SELECT id FROM users WHERE id = ?`, [post.cook_id]);
          if (cookUser.length > 0) {
            const notifId = `notif_close_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await db.query(
              `INSERT INTO notifications (id, user_id, title, message, type)
               VALUES (?, ?, ?, ?, 'ORDER')`,
              [
                notifId,
                post.cook_id,
                '🔒 Pre-Orders Closed (30m Cutoff)',
                `Orders for "${post.dish_name}" closed 30 mins before cooking. Final bookings: ${post.active_customer_bookings_count}/4 slots. Time to prepare!`,
              ]
            );
          }
        }
        console.log(`⏱️ Auto-closed ${closedPosts.length} food posts past 30m cutoff.`);
      }

      // 2. Expire Food Donations past safe collection deadline
      const [expiredDonations] = await db.query(
        `SELECT id, donor_id, title 
         FROM food_donations 
         WHERE status = 'AVAILABLE' AND expires_at <= NOW()`
      );

      if (expiredDonations.length > 0) {
        for (const don of expiredDonations) {
          await db.query(
            `UPDATE food_donations SET status = 'EXPIRED' WHERE id = ?`,
            [don.id]
          );
        }
        console.log(`⏱️ Auto-expired ${expiredDonations.length} surplus food donations.`);
      }
    } catch (err) {
      console.error('❌ Error in cutoff worker:', err.message);
    }
  });
}

module.exports = { startCutoffWorker };
