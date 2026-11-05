const express = require('express');
const router = express.Router();
const db = require('../config/db');
const notificationService = require('../services/notificationService');
const {
  authenticate,
  requirePartner,
  requireCustomer,
  requireAdmin,
} = require('../middleware/auth');

// Optional auth helper: populates req.user if token is present, but doesn't block guests
async function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.ruchi_token) {
      token = req.cookies.ruchi_token;
    }

    if (!token) return next();

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'ruchi_secure_jwt_secret_hyderabad_2026';
    const decoded = jwt.verify(token, JWT_SECRET);

    const [userRows] = await db.query(
      `SELECT u.id, u.name, u.email, u.status FROM users u WHERE u.id = ?`,
      [decoded.id]
    );

    if (userRows.length > 0 && userRows[0].status !== 'SUSPENDED') {
      const [roleRows] = await db.query(
        `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
        [userRows[0].id]
      );
      userRows[0].roles = roleRows.map((r) => r.name);
      req.user = userRows[0];
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
}

/**
 * =========================================================================
 * 1. CUSTOMER & PUBLIC DISH VOTING ENDPOINTS
 * =========================================================================
 */

/**
 * GET /api/polls/active
 * View all currently active dish voting polls
 */
router.get('/active', optionalAuth, async (req, res) => {
  try {
    const [polls] = await db.query(
      `SELECT dp.*, 
              u.name as cook_name, u.avatar as cook_avatar,
              pp.business_name, pp.kitchen_address, pp.rating as cook_rating, pp.fssai_number
       FROM dish_polls dp
       JOIN users u ON dp.cook_id = u.id
       LEFT JOIN partner_profiles pp ON dp.cook_id = pp.user_id
       WHERE dp.status = 'ACTIVE' AND dp.voting_ends_at > NOW()
       ORDER BY dp.voting_ends_at ASC`
    );

    for (const poll of polls) {
      const [options] = await db.query(
        `SELECT * FROM dish_poll_options WHERE poll_id = ? ORDER BY vote_count DESC, created_at ASC`,
        [poll.id]
      );

      // Calculate percentages
      const total = poll.total_votes || 0;
      poll.options = options.map((opt) => ({
        ...opt,
        percentage: total > 0 ? Math.round((opt.vote_count / total) * 100) : 0,
      }));

      // Check if logged-in user has already voted
      if (req.user) {
        const [userVote] = await db.query(
          `SELECT option_id FROM dish_poll_votes WHERE poll_id = ? AND customer_id = ?`,
          [poll.id, req.user.id]
        );
        poll.userVotedOptionId = userVote.length > 0 ? userVote[0].option_id : null;
      } else {
        poll.userVotedOptionId = null;
      }
    }

    res.json({ success: true, polls });
  } catch (err) {
    console.error('Active polls fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/polls/history
 * View closed, tied, and finalized polls
 */
router.get('/history', optionalAuth, async (req, res) => {
  try {
    const [polls] = await db.query(
      `SELECT dp.*, 
              u.name as cook_name, u.avatar as cook_avatar,
              pp.business_name, pp.kitchen_address, pp.rating as cook_rating,
              dpr.result_type, dpr.tie_break_reason, dpr.finalized_at,
              wopt.dish_name as winning_dish_name, wopt.image as winning_dish_image,
              wopt.description as winning_dish_description, wopt.estimated_price as winning_dish_price,
              fp.id as linked_preorder_id
       FROM dish_polls dp
       JOIN users u ON dp.cook_id = u.id
       LEFT JOIN partner_profiles pp ON dp.cook_id = pp.user_id
       LEFT JOIN dish_poll_results dpr ON dp.id = dpr.poll_id
       LEFT JOIN dish_poll_options wopt ON dp.winner_option_id = wopt.id
       LEFT JOIN food_posts fp ON fp.cook_id = dp.cook_id AND fp.dish_name = wopt.dish_name AND fp.status = 'ACTIVE'
       WHERE dp.status IN ('CLOSED', 'TIED')
       ORDER BY dp.voting_ends_at DESC
       LIMIT 20`
    );

    for (const poll of polls) {
      const [options] = await db.query(
        `SELECT * FROM dish_poll_options WHERE poll_id = ? ORDER BY vote_count DESC, created_at ASC`,
        [poll.id]
      );
      const total = poll.total_votes || 0;
      poll.options = options.map((opt) => ({
        ...opt,
        percentage: total > 0 ? Math.round((opt.vote_count / total) * 100) : 0,
      }));

      if (req.user) {
        const [userVote] = await db.query(
          `SELECT option_id FROM dish_poll_votes WHERE poll_id = ? AND customer_id = ?`,
          [poll.id, req.user.id]
        );
        poll.userVotedOptionId = userVote.length > 0 ? userVote[0].option_id : null;
      }
    }

    res.json({ success: true, polls });
  } catch (err) {
    console.error('Polls history fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/polls/:id
 * Single poll details with full option metrics
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [polls] = await db.query(
      `SELECT dp.*, 
              u.name as cook_name, u.avatar as cook_avatar,
              pp.business_name, pp.kitchen_address, pp.rating as cook_rating, pp.fssai_number,
              dpr.result_type, dpr.tie_break_reason, dpr.finalized_at,
              wopt.dish_name as winning_dish_name, wopt.image as winning_dish_image
       FROM dish_polls dp
       JOIN users u ON dp.cook_id = u.id
       LEFT JOIN partner_profiles pp ON dp.cook_id = pp.user_id
       LEFT JOIN dish_poll_results dpr ON dp.id = dpr.poll_id
       LEFT JOIN dish_poll_options wopt ON dp.winner_option_id = wopt.id
       WHERE dp.id = ?`,
      [req.params.id]
    );

    if (polls.length === 0) {
      return res.status(404).json({ error: 'Dish voting poll not found.' });
    }

    const poll = polls[0];
    const [options] = await db.query(
      `SELECT * FROM dish_poll_options WHERE poll_id = ? ORDER BY vote_count DESC, created_at ASC`,
      [poll.id]
    );

    const total = poll.total_votes || 0;
    poll.options = options.map((opt) => ({
      ...opt,
      percentage: total > 0 ? Math.round((opt.vote_count / total) * 100) : 0,
    }));

    if (req.user) {
      const [userVote] = await db.query(
        `SELECT option_id FROM dish_poll_votes WHERE poll_id = ? AND customer_id = ?`,
        [poll.id, req.user.id]
      );
      poll.userVotedOptionId = userVote.length > 0 ? userVote[0].option_id : null;
    } else {
      poll.userVotedOptionId = null;
    }

    res.json({ success: true, poll });
  } catch (err) {
    console.error('Poll detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/polls/:id/vote
 * Cast or change vote for a dish in an active poll
 */
router.post('/:id/vote', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { optionId } = req.body;
    if (!optionId) {
      return res.status(400).json({ error: 'Option ID is required to cast a vote.' });
    }

    await connection.beginTransaction();

    // 1. Check poll validity and status
    const [polls] = await connection.query(
      `SELECT * FROM dish_polls WHERE id = ? FOR UPDATE`,
      [req.params.id]
    );

    if (polls.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Dish poll not found.' });
    }

    const poll = polls[0];

    // Rule 5: Only active & published polls accept votes
    if (poll.status !== 'ACTIVE') {
      await connection.rollback();
      return res.status(400).json({
        error: `Voting is not active for this poll (Current status: ${poll.status}).`,
      });
    }

    // Rule 4: Voting is not allowed after deadline
    const now = new Date();
    if (new Date(poll.voting_ends_at) <= now) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Voting has closed for this poll. Deadlines are strictly enforced.',
      });
    }

    // Rule 7: Cook cannot vote in their own poll
    if (poll.cook_id === req.user.id) {
      await connection.rollback();
      return res.status(403).json({
        error: 'Home cooks cannot vote in their own dish polls.',
      });
    }

    // Rule 8: Suspended accounts cannot vote
    if (req.user.status === 'SUSPENDED') {
      await connection.rollback();
      return res.status(403).json({
        error: 'Your account is suspended. Voting is restricted.',
      });
    }

    // Verify option belongs to this poll
    const [optRows] = await connection.query(
      `SELECT * FROM dish_poll_options WHERE id = ? AND poll_id = ?`,
      [optionId, poll.id]
    );

    if (optRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Invalid dish option selected for this poll.',
      });
    }

    const selectedDish = optRows[0];

    // Rule 1 & 2: One active vote per customer, change allowed before deadline
    const [existingVote] = await connection.query(
      `SELECT * FROM dish_poll_votes WHERE poll_id = ? AND customer_id = ? FOR UPDATE`,
      [poll.id, req.user.id]
    );

    let isVoteChange = false;
    let oldOptionId = null;

    if (existingVote.length > 0) {
      oldOptionId = existingVote[0].option_id;

      if (oldOptionId === optionId) {
        // Same vote already recorded
        await connection.rollback();
        return res.json({
          success: true,
          message: `Your vote for "${selectedDish.dish_name}" is already confirmed.`,
          userVotedOptionId: optionId,
        });
      }

      isVoteChange = true;

      // Update existing vote
      await connection.query(
        `UPDATE dish_poll_votes SET option_id = ?, updated_at = NOW() WHERE poll_id = ? AND customer_id = ?`,
        [optionId, poll.id, req.user.id]
      );

      // Decrement old option
      await connection.query(
        `UPDATE dish_poll_options SET vote_count = GREATEST(0, vote_count - 1) WHERE id = ?`,
        [oldOptionId]
      );

      // Increment new option
      await connection.query(
        `UPDATE dish_poll_options SET vote_count = vote_count + 1 WHERE id = ?`,
        [optionId]
      );

      // Audit log: VOTE_CHANGED
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, old_value, new_value)
         VALUES (?, ?, ?, 'VOTE_CHANGED', JSON_OBJECT('old_option_id', ?), JSON_OBJECT('new_option_id', ?))`,
        [auditId, poll.id, req.user.id, oldOptionId, optionId]
      );
    } else {
      // First vote by customer
      const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO dish_poll_votes (id, poll_id, option_id, customer_id) VALUES (?, ?, ?, ?)`,
        [voteId, poll.id, optionId, req.user.id]
      );

      // Increment option vote count
      await connection.query(
        `UPDATE dish_poll_options SET vote_count = vote_count + 1 WHERE id = ?`,
        [optionId]
      );

      // Increment poll total_votes
      await connection.query(
        `UPDATE dish_polls SET total_votes = total_votes + 1 WHERE id = ?`,
        [poll.id]
      );

      // Audit log: VOTE_CAST
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, old_value, new_value)
         VALUES (?, ?, ?, 'VOTE_CAST', NULL, JSON_OBJECT('option_id', ?, 'dish_name', ?))`,
        [auditId, poll.id, req.user.id, optionId, selectedDish.dish_name]
      );
    }

    // Customer Notification: Voting successfully submitted
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
       VALUES (?, ?, 'CUSTOMER', '🗳️ Vote Confirmed!', ?, 'POLL')`,
      [
        notifId,
        req.user.id,
        isVoteChange
          ? `Your vote for "${poll.title}" was updated to "${selectedDish.dish_name}".`
          : `You voted for "${selectedDish.dish_name}" in "${poll.title}". Thanks for supporting local cooks!`,
      ]
    );

    await connection.commit();

    // Fetch updated options metrics
    const [updatedOptions] = await db.query(
      `SELECT * FROM dish_poll_options WHERE poll_id = ? ORDER BY vote_count DESC`,
      [poll.id]
    );
    const [[{ total_votes }]] = await db.query(
      `SELECT total_votes FROM dish_polls WHERE id = ?`,
      [poll.id]
    );

    const metrics = updatedOptions.map((opt) => ({
      ...opt,
      percentage: total_votes > 0 ? Math.round((opt.vote_count / total_votes) * 100) : 0,
    }));

    res.json({
      success: true,
      message: isVoteChange
        ? `Vote updated to "${selectedDish.dish_name}"!`
        : `Vote recorded for "${selectedDish.dish_name}"!`,
      userVotedOptionId: optionId,
      totalVotes: total_votes,
      options: metrics,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Vote submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit vote.' });
  } finally {
    connection.release();
  }
});

/**
 * =========================================================================
 * 2. HOME COOK ENDPOINTS
 * =========================================================================
 */

/**
 * GET /api/polls/cook/my-polls
 * Get all polls created by the logged in cook
 */
router.get('/cook/my-polls', authenticate, requirePartner, async (req, res) => {
  try {
    const [polls] = await db.query(
      `SELECT dp.*, 
              dpr.result_type, dpr.tie_break_reason, dpr.finalized_at,
              wopt.dish_name as winning_dish_name, wopt.image as winning_dish_image,
              fp.id as linked_preorder_id
       FROM dish_polls dp
       LEFT JOIN dish_poll_results dpr ON dp.id = dpr.poll_id
       LEFT JOIN dish_poll_options wopt ON dp.winner_option_id = wopt.id
       LEFT JOIN food_posts fp ON fp.cook_id = dp.cook_id AND fp.dish_name = wopt.dish_name AND fp.status = 'ACTIVE'
       WHERE dp.cook_id = ?
       ORDER BY dp.created_at DESC`,
      [req.user.id]
    );

    for (const poll of polls) {
      const [options] = await db.query(
        `SELECT * FROM dish_poll_options WHERE poll_id = ? ORDER BY vote_count DESC, created_at ASC`,
        [poll.id]
      );
      const total = poll.total_votes || 0;
      poll.options = options.map((opt) => ({
        ...opt,
        percentage: total > 0 ? Math.round((opt.vote_count / total) * 100) : 0,
      }));
    }

    res.json({ success: true, polls });
  } catch (err) {
    console.error('Cook my-polls error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/polls/cook
 * Create a new dish poll with 2 to 5 options
 */
router.post('/cook', authenticate, requirePartner, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      title,
      description,
      cookingDate,
      votingStartsAt,
      votingEndsAt,
      options,
      status = 'DRAFT',
    } = req.body;

    if (!title || !cookingDate || !votingEndsAt) {
      return res.status(400).json({
        error: 'Title, cooking date, and voting end deadline are required.',
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2 || options.length > 5) {
      return res.status(400).json({
        error: 'You must provide a minimum of two (2) and maximum of five (5) dish options.',
      });
    }

    // Validate options content
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt.dishName || !opt.dishName.trim()) {
        return res.status(400).json({
          error: `Dish #${i + 1} must have a valid name.`,
        });
      }
    }

    const startsAt = votingStartsAt ? new Date(votingStartsAt) : new Date();
    const endsAt = new Date(votingEndsAt);

    if (endsAt <= startsAt) {
      return res.status(400).json({
        error: 'Voting end time must be after the voting start time.',
      });
    }

    await connection.beginTransaction();

    const pollId = `poll_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await connection.query(
      `INSERT INTO dish_polls 
        (id, cook_id, title, description, cooking_date, voting_starts_at, voting_ends_at, status, total_votes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        pollId,
        req.user.id,
        title.trim(),
        description ? description.trim() : null,
        cookingDate,
        startsAt,
        endsAt,
        status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      ]
    );

    // Insert options
    for (const opt of options) {
      const optionId = `opt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO dish_poll_options 
          (id, poll_id, dish_name, description, image, food_type, estimated_price, vote_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          optionId,
          pollId,
          opt.dishName.trim(),
          opt.description ? opt.description.trim() : '',
          opt.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
          opt.foodType === 'NON_VEG' ? 'NON_VEG' : 'VEG',
          opt.estimatedPrice ? parseFloat(opt.estimatedPrice) : null,
        ]
      );
    }

    // Audit log
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await connection.query(
      `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, new_value)
       VALUES (?, ?, ?, 'CREATE_POLL', JSON_OBJECT('title', ?, 'status', ?, 'optionsCount', ?))`,
      [auditId, pollId, req.user.id, title, status, options.length]
    );

    // Notification if published
    if (status === 'ACTIVE') {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
         VALUES (?, ?, 'PARTNER', '🗳️ Poll Live!', 'Your dish poll is live and accepting community votes.', 'POLL')`,
        [notifId, req.user.id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: status === 'ACTIVE' ? 'Dish poll published live!' : 'Poll saved as draft.',
      pollId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create poll error:', err);
    res.status(500).json({ error: err.message || 'Failed to create dish poll.' });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/polls/cook/:id/publish
 * Publish draft poll to ACTIVE
 */
router.post('/cook/:id/publish', authenticate, requirePartner, async (req, res) => {
  try {
    const [existing] = await db.query(
      `SELECT * FROM dish_polls WHERE id = ? AND cook_id = ?`,
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Poll not found or unauthorized.' });
    }

    const poll = existing[0];
    if (new Date(poll.voting_ends_at) <= new Date()) {
      return res.status(400).json({ error: 'Cannot publish a poll whose deadline has already passed.' });
    }

    await db.query(`UPDATE dish_polls SET status = 'ACTIVE' WHERE id = ?`, [poll.id]);

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await db.query(
      `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, old_value, new_value)
       VALUES (?, ?, ?, 'PUBLISH_POLL', JSON_OBJECT('status', 'DRAFT'), JSON_OBJECT('status', 'ACTIVE'))`,
      [auditId, poll.id, req.user.id]
    );

    res.json({ success: true, message: 'Poll published live!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/polls/cook/:id/cancel
 * Cancel a poll
 */
router.post('/cook/:id/cancel', authenticate, requirePartner, async (req, res) => {
  try {
    const { reason = 'Cancelled by home chef' } = req.body;
    const [existing] = await db.query(
      `SELECT * FROM dish_polls WHERE id = ? AND cook_id = ?`,
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Poll not found or unauthorized.' });
    }

    await db.query(`UPDATE dish_polls SET status = 'CANCELLED' WHERE id = ?`, [req.params.id]);

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await db.query(
      `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, old_value, new_value)
       VALUES (?, ?, ?, 'CANCEL_POLL', JSON_OBJECT('status', existing.status), JSON_OBJECT('status', 'CANCELLED', 'reason', ?))`,
      [auditId, req.params.id, req.user.id, reason]
    );

    res.json({ success: true, message: 'Poll has been cancelled.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/polls/cook/:id/tie-break
 * Rule 6: Manual tie-breaking by cook with reason logged
 */
router.post('/cook/:id/tie-break', authenticate, requirePartner, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { winningOptionId, tieBreakReason } = req.body;

    if (!winningOptionId || !tieBreakReason) {
      return res.status(400).json({
        error: 'Winning option ID and tie-break explanation reason are required.',
      });
    }

    await connection.beginTransaction();

    const [polls] = await connection.query(
      `SELECT * FROM dish_polls WHERE id = ? AND cook_id = ? FOR UPDATE`,
      [req.params.id, req.user.id]
    );

    if (polls.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Poll not found or unauthorized.' });
    }

    const poll = polls[0];
    if (poll.status !== 'TIED') {
      await connection.rollback();
      return res.status(400).json({
        error: `Only tied polls can be manually resolved. (Current status: ${poll.status})`,
      });
    }

    // Verify option belongs to poll
    const [opt] = await connection.query(
      `SELECT * FROM dish_poll_options WHERE id = ? AND poll_id = ?`,
      [winningOptionId, poll.id]
    );

    if (opt.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Selected winning option does not belong to this poll.' });
    }

    const winner = opt[0];

    // Mark poll closed with manual winner
    await connection.query(
      `UPDATE dish_polls 
       SET status = 'CLOSED', winner_option_id = ? 
       WHERE id = ?`,
      [winner.id, poll.id]
    );

    // Update or insert result
    const resId = `res_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await connection.query(
      `INSERT INTO dish_poll_results 
        (id, poll_id, winning_option_id, total_votes, result_type, tie_break_reason, finalized_at)
       VALUES (?, ?, ?, ?, 'TIE_BREAK_MANUAL', ?, NOW())
       ON DUPLICATE KEY UPDATE 
        winning_option_id = VALUES(winning_option_id),
        result_type = 'TIE_BREAK_MANUAL',
        tie_break_reason = VALUES(tie_break_reason),
        finalized_at = NOW()`,
      [resId, poll.id, winner.id, poll.total_votes, tieBreakReason]
    );

    // Audit log
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await connection.query(
      `INSERT INTO dish_poll_audit_logs 
        (id, poll_id, actor_id, action, old_value, new_value)
       VALUES (?, ?, ?, 'TIE_BREAK_MANUAL', JSON_OBJECT('status', 'TIED'), JSON_OBJECT('winner', ?, 'reason', ?))`,
      [auditId, poll.id, req.user.id, winner.dish_name, tieBreakReason]
    );

    // Notify participating voters
    const [voters] = await connection.query(
      `SELECT DISTINCT customer_id FROM dish_poll_votes WHERE poll_id = ?`,
      [poll.id]
    );

    for (const v of voters) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
         VALUES (?, ?, 'CUSTOMER', '⚖️ Tie Resolved: Winner Selected!', ?, 'POLL')`,
        [
          notifId,
          v.customer_id,
          `The tie in "${poll.title}" was resolved. The home chef selected "${winner.dish_name}"! Reason: ${tieBreakReason}`,
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Tie resolved! "${winner.dish_name}" is the final winner.`,
      winnerOptionId: winner.id,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Tie break error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/polls/cook/:id/create-preorder
 * Rule 11: Integration with pre-orders from winning dish
 * Automatically populates dish details, applies 4-customer limit and 30-min cutoff
 */
router.post('/cook/:id/create-preorder', authenticate, requirePartner, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      pricePerPlate,
      totalPlates = 15,
      cookingStartsAt,
      deliveryAvailable = false,
      deliveryFee = 0,
      ingredients = '',
      allergens = '',
    } = req.body;

    if (!pricePerPlate || !cookingStartsAt) {
      return res.status(400).json({
        error: 'Price per plate and cooking start time are required.',
      });
    }

    await connection.beginTransaction();

    const [polls] = await connection.query(
      `SELECT dp.*, opt.dish_name, opt.description as opt_desc, opt.image, opt.food_type
       FROM dish_polls dp
       JOIN dish_poll_options opt ON dp.winner_option_id = opt.id
       WHERE dp.id = ? AND dp.cook_id = ? AND dp.status = 'CLOSED'`,
      [req.params.id, req.user.id]
    );

    if (polls.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        error: 'Only finalized polls with an announced winning dish can be turned into pre-orders.',
      });
    }

    const poll = polls[0];

    // Fetch cook's profile for address
    const [profile] = await connection.query(
      `SELECT * FROM partner_profiles WHERE user_id = ?`,
      [req.user.id]
    );

    const kitchenAddress = profile[0]?.kitchen_address || 'Verified Neighborhood Kitchen';
    const area = profile[0]?.area || 'Local Area';

    // RUCHI Rule: Automatic 30-minute cutoff before cooking_starts_at
    const cookTime = new Date(cookingStartsAt);
    const cutoffTime = new Date(cookTime.getTime() - 30 * 60 * 1000);

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await connection.query(
      `INSERT INTO food_posts (
        id, cook_id, dish_name, description, category, dietary,
        price_per_plate, total_plates, remaining_plates, active_customer_bookings_count,
        cooking_starts_at, order_closes_at, pickup_address, area,
        delivery_available, delivery_fee, ingredients, allergens, status, image_url
      ) VALUES (?, ?, ?, ?, 'HOMEMADE_MEAL', ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        postId,
        req.user.id,
        poll.dish_name,
        poll.opt_desc || `Voted #1 community choice from poll "${poll.title}"! Freshly prepared homestyle.`,
        poll.food_type === 'NON_VEG' ? 'NON_VEG' : 'VEG',
        parseFloat(pricePerPlate),
        parseInt(totalPlates, 10),
        parseInt(totalPlates, 10),
        cookTime,
        cutoffTime,
        kitchenAddress,
        area,
        deliveryAvailable ? 1 : 0,
        parseFloat(deliveryFee || 0),
        ingredients,
        allergens,
        poll.image,
      ]
    );

    // Audit log
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await connection.query(
      `INSERT INTO dish_poll_audit_logs 
        (id, poll_id, actor_id, action, new_value)
       VALUES (?, ?, ?, 'CONVERTED_TO_PREORDER', JSON_OBJECT('food_post_id', ?, 'dish', ?))`,
      [auditId, poll.id, req.user.id, postId, poll.dish_name]
    );

    // Notify all customers who voted for this dish that pre-order is now live!
    const [voters] = await connection.query(
      `SELECT DISTINCT customer_id FROM dish_poll_votes WHERE poll_id = ? AND option_id = ?`,
      [poll.id, poll.winner_option_id]
    );

    for (const v of voters) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        `INSERT INTO notifications (id, user_id, portal_target, title, message, type)
         VALUES (?, ?, 'CUSTOMER', '🎉 Your Winning Dish is Ready to Pre-Order!', ?, 'ORDER')`,
        [
          notifId,
          v.customer_id,
          `"${poll.dish_name}" won the vote and pre-orders are officially open! Only 4 customer booking slots available before 30m cutoff.`,
        ]
      );
    }

    await connection.commit();

    // Broadcast Platform-wide Notification: NEW_PREORDER (Sound: PREORDER_BELL)
    notificationService
      .broadcastEvent({
        eventType: 'NEW_PREORDER',
        sourceId: postId,
        createdBy: req.user.id,
        title: '🔔 New Pre-Order Available!',
        message: `Pre-orders are now open for ${poll.dish_name}. Reserve yours now!`,
        imageUrl: poll.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        targetUrl: `/food/${postId}`,
        payload: {
          postId,
          dishName: poll.dish_name,
          pricePerPlate: parseFloat(pricePerPlate),
          totalPlates: parseInt(totalPlates, 10),
          orderClosesAt: cutoffTime.toISOString(),
          cookingStartsAt: cookTime.toISOString(),
          kitchenAddress,
          area,
          imageUrl: poll.image,
        },
      })
      .catch((err) => console.error('[Notifications] Failed to broadcast poll pre-order:', err.message));

    res.status(201).json({
      success: true,
      message: `Pre-order for "${poll.dish_name}" published successfully!`,
      foodPostId: postId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create pre-order error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * =========================================================================
 * 3. ADMIN MANAGEMENT & MODERATION ENDPOINTS
 * =========================================================================
 */

/**
 * GET /api/polls/admin/all
 * View all polls with admin filters
 */
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT dp.*, 
             u.name as cook_name, u.email as cook_email, u.phone as cook_phone,
             pp.business_name, pp.kitchen_address,
             dpr.result_type, dpr.tie_break_reason, dpr.finalized_at,
             wopt.dish_name as winning_dish_name
      FROM dish_polls dp
      JOIN users u ON dp.cook_id = u.id
      LEFT JOIN partner_profiles pp ON dp.cook_id = pp.user_id
      LEFT JOIN dish_poll_results dpr ON dp.id = dpr.poll_id
      LEFT JOIN dish_poll_options wopt ON dp.winner_option_id = wopt.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` AND dp.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (dp.title LIKE ? OR u.name LIKE ? OR pp.business_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY dp.created_at DESC`;

    const [polls] = await db.query(sql, params);

    for (const poll of polls) {
      const [options] = await db.query(
        `SELECT * FROM dish_poll_options WHERE poll_id = ? ORDER BY vote_count DESC`,
        [poll.id]
      );
      poll.options = options;
    }

    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/polls/admin/:id/audit-logs
 * Fetch audit logs for a poll
 */
router.get('/admin/:id/audit-logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT al.*, u.name as actor_name, u.email as actor_email
       FROM dish_poll_audit_logs al
       JOIN users u ON al.actor_id = u.id
       WHERE al.poll_id = ?
       ORDER BY al.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/polls/admin/:id/moderate
 * Moderate inappropriate titles, descriptions, or options
 */
router.put('/admin/:id/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    await db.query(
      `UPDATE dish_polls SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?`,
      [title, description, req.params.id]
    );

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await db.query(
      `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, new_value)
       VALUES (?, ?, ?, 'ADMIN_MODERATE', JSON_OBJECT('title', ?, 'description', ?))`,
      [auditId, req.params.id, req.user.id, title, description]
    );

    res.json({ success: true, message: 'Poll details moderated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/polls/admin/:id/suspend
 * Suspend fraudulent poll
 */
router.post('/admin/:id/suspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reason = 'Suspended by platform administrator' } = req.body;

    await db.query(
      `UPDATE dish_polls SET status = 'CANCELLED' WHERE id = ?`,
      [req.params.id]
    );

    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await db.query(
      `INSERT INTO dish_poll_audit_logs (id, poll_id, actor_id, action, new_value)
       VALUES (?, ?, ?, 'ADMIN_SUSPEND', JSON_OBJECT('reason', ?))`,
      [auditId, req.params.id, req.user.id, reason]
    );

    res.json({ success: true, message: 'Poll suspended.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/polls/admin/stats
 * Overview metrics for dish voting
 */
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[{ totalPolls }]] = await db.query(`SELECT COUNT(*) as totalPolls FROM dish_polls`);
    const [[{ activePolls }]] = await db.query(
      `SELECT COUNT(*) as activePolls FROM dish_polls WHERE status = 'ACTIVE'`
    );
    const [[{ closedPolls }]] = await db.query(
      `SELECT COUNT(*) as closedPolls FROM dish_polls WHERE status = 'CLOSED'`
    );
    const [[{ totalVotesCast }]] = await db.query(
      `SELECT COUNT(*) as totalVotesCast FROM dish_poll_votes`
    );
    const [[{ totalVoters }]] = await db.query(
      `SELECT COUNT(DISTINCT customer_id) as totalVoters FROM dish_poll_votes`
    );

    res.json({
      success: true,
      stats: {
        totalPolls,
        activePolls,
        closedPolls,
        totalVotesCast,
        totalVoters,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
