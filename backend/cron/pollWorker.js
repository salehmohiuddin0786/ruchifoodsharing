const cron = require('node-cron');
const db = require('../config/db');

/**
 * Dish Polling Scheduled Worker
 * Runs every 30 seconds to strictly enforce:
 * 1. Automatic poll closure when voting_ends_at <= NOW()
 * 2. Winner calculation or TIE detection
 * 3. Notification dispatch to cook and participating voters
 */
function startPollWorker() {
  console.log('🗳️ Background Dish Poll Worker scheduled (checks every 30s)...');

  cron.schedule('*/30 * * * * *', async () => {
    try {
      await closeExpiredPolls();
    } catch (err) {
      console.error('❌ Error in poll worker:', err.message);
    }
  });
}

async function closeExpiredPolls() {
  // Find ACTIVE polls where deadline has passed
  const [expiredPolls] = await db.query(
    `SELECT dp.*, u.name as cook_name
     FROM dish_polls dp
     JOIN users u ON dp.cook_id = u.id
     WHERE dp.status = 'ACTIVE' AND dp.voting_ends_at <= NOW()`
  );

  if (expiredPolls.length === 0) return;

  for (const poll of expiredPolls) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch options with vote counts
      const [options] = await connection.query(
        `SELECT id, dish_name, vote_count 
         FROM dish_poll_options 
         WHERE poll_id = ? 
         ORDER BY vote_count DESC, created_at ASC`,
        [poll.id]
      );

      const totalVotes = options.reduce((sum, o) => sum + (o.vote_count || 0), 0);

      // Fetch all customer IDs who voted in this poll
      const [voters] = await connection.query(
        `SELECT DISTINCT customer_id FROM dish_poll_votes WHERE poll_id = ?`,
        [poll.id]
      );

      const resId = `res_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      if (options.length === 0 || totalVotes === 0) {
        // No votes cast
        await connection.query(
          `UPDATE dish_polls 
           SET status = 'CLOSED', total_votes = 0, winner_option_id = NULL 
           WHERE id = ?`,
          [poll.id]
        );

        await connection.query(
          `INSERT INTO dish_poll_results 
            (id, poll_id, winning_option_id, total_votes, result_type, finalized_at)
           VALUES (?, ?, NULL, 0, 'NO_VOTES', NOW())`,
          [resId, poll.id]
        );

        // Notify cook
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await connection.query(
          `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
           VALUES (?, ?, 'PARTNER', '🗳️ Poll Closed (No Votes)', ?, 'POLL')`,
          [notifId, poll.cook_id, `Your dish poll "${poll.title}" closed with 0 votes.`]
        );
      } else {
        const highestVote = options[0].vote_count;
        const tiedOptions = options.filter((o) => o.vote_count === highestVote);

        if (tiedOptions.length > 1) {
          // TIE DETECTED: Cook must manually break the tie
          await connection.query(
            `UPDATE dish_polls 
             SET status = 'TIED', total_votes = ? 
             WHERE id = ?`,
            [totalVotes, poll.id]
          );

          await connection.query(
            `INSERT INTO dish_poll_results 
              (id, poll_id, winning_option_id, total_votes, result_type, finalized_at)
             VALUES (?, ?, NULL, ?, 'TIE_BREAK_MANUAL', NOW())`,
            [resId, poll.id, totalVotes]
          );

          // Audit log
          const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          await connection.query(
            `INSERT INTO dish_poll_audit_logs 
              (id, poll_id, actor_id, action, old_value, new_value)
             VALUES (?, ?, ?, 'POLL_TIED', JSON_OBJECT('status', 'ACTIVE'), JSON_OBJECT('status', 'TIED', 'tied_dishes', ?))`,
            [auditId, poll.id, poll.cook_id, JSON.stringify(tiedOptions.map((o) => o.dish_name))]
          );

          // Notify cook to break tie
          const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const tiedNames = tiedOptions.map((o) => `"${o.dish_name}"`).join(' and ');
          await connection.query(
            `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
             VALUES (?, ?, 'PARTNER', '⚖️ Dish Voting Tied!', ?, 'POLL')`,
            [
              notifId,
              poll.cook_id,
              `Voting ended in a tie between ${tiedNames} (${highestVote} votes each). Please select the winning dish on your dashboard.`,
            ]
          );

          // Notify voters about tie
          for (const voter of voters) {
            const vNotifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await connection.query(
              `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
               VALUES (?, ?, 'CUSTOMER', '⚖️ Dish Poll Tied', ?, 'POLL')`,
              [
                vNotifId,
                voter.customer_id,
                `The poll "${poll.title}" resulted in a tie! The chef will make the final selection shortly.`,
              ]
            );
          }
        } else {
          // CLEAR WINNER
          const winner = options[0];

          await connection.query(
            `UPDATE dish_polls 
             SET status = 'CLOSED', total_votes = ?, winner_option_id = ? 
             WHERE id = ?`,
            [totalVotes, winner.id, poll.id]
          );

          await connection.query(
            `INSERT INTO dish_poll_results 
              (id, poll_id, winning_option_id, total_votes, result_type, finalized_at)
             VALUES (?, ?, ?, ?, 'CLEAR_WINNER', NOW())`,
            [resId, poll.id, winner.id, totalVotes]
          );

          // Audit log
          const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          await connection.query(
            `INSERT INTO dish_poll_audit_logs 
              (id, poll_id, actor_id, action, old_value, new_value)
             VALUES (?, ?, ?, 'POLL_CLOSED_WINNER', JSON_OBJECT('status', 'ACTIVE'), JSON_OBJECT('status', 'CLOSED', 'winner', ?))`,
            [auditId, poll.id, poll.cook_id, winner.dish_name]
          );

          // Notify cook
          const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          await connection.query(
            `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
             VALUES (?, ?, 'PARTNER', '🏆 Winner Decided!', ?, 'POLL')`,
            [
              notifId,
              poll.cook_id,
              `Poll "${poll.title}" closed! Winning dish is "${winner.dish_name}" with ${winner.vote_count} votes. Ready to publish pre-orders?`,
            ]
          );

          // Notify voters
          for (const voter of voters) {
            const vNotifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await connection.query(
              `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
               VALUES (?, ?, 'CUSTOMER', '🏆 Winning Dish Announced!', ?, 'POLL')`,
              [
                vNotifId,
                voter.customer_id,
                `Voting closed for "${poll.title}". The winning dish is "${winner.dish_name}"! Watch out for pre-orders.`,
              ]
            );
          }
        }
      }

      await connection.commit();
      console.log(`🗳️ Auto-finalized dish poll "${poll.title}" (ID: ${poll.id}).`);
    } catch (err) {
      await connection.rollback();
      console.error(`❌ Failed to auto-close poll ${poll.id}:`, err);
    } finally {
      connection.release();
    }
  }
}

module.exports = { startPollWorker, closeExpiredPolls };
