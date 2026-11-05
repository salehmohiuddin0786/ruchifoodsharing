const express = require('express');
const router = express.Router();
const db = require('../config/db');
const notificationService = require('../services/notificationService');

/**
 * GET /api/donations
 * List free surplus food posts
 */
router.get('/', async (req, res) => {
  try {
    const { area, category, dietary, search } = req.query;

    let query = `
      SELECT d.*, u.name as donor_name, u.avatar as donor_avatar, dp.donor_type, dp.organization_name
      FROM food_donation_posts d
      JOIN users u ON d.donor_id = u.id
      LEFT JOIN donor_profiles dp ON d.donor_id = dp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND d.category = ?`;
      params.push(category);
    }

    if (dietary && dietary !== 'all') {
      query += ` AND d.dietary = ?`;
      params.push(dietary);
    }

    if (area && area !== 'all') {
      query += ` AND d.area = ?`;
      params.push(area);
    }

    if (search) {
      query += ` AND (d.title LIKE ? OR d.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY d.created_at DESC`;

    const [rows] = await db.query(query, params);

    // Calculate dynamic expiry status
    const now = new Date();
    const posts = rows.map((post) => {
      const expiresAt = new Date(post.expires_at);
      let status = post.status;
      if (status === 'available' && now >= expiresAt) {
        status = 'expired';
      }
      return {
        ...post,
        status,
        isExpired: now >= expiresAt,
        expiresAtIso: expiresAt.toISOString(),
        preparedAtIso: new Date(post.prepared_at).toISOString(),
      };
    });

    res.json({ success: true, posts });
  } catch (error) {
    console.error('Fetch Donations Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/donations
 * Create free surplus food post (Free Food Sharing Module)
 */
router.post('/', async (req, res) => {
  try {
    const {
      donorId,
      title,
      description,
      category,
      dietary = 'veg',
      totalServings,
      preparedAt,
      expiresAt, // Safe collection deadline
      pickupAddress,
      area = 'Begumpet',
      latitude = 17.4447,
      longitude = 78.4664,
      storageInstructions = '',
      allergens = '',
      imageUrl = '',
    } = req.body;

    if (!donorId || !title || !totalServings || !expiresAt) {
      return res.status(400).json({ error: 'Missing required donation fields.' });
    }

    const postId = `don_post_${Date.now()}`;
    const prepDate = preparedAt ? new Date(preparedAt) : new Date();
    const expDate = new Date(expiresAt);

    await db.query(
      `INSERT INTO food_donation_posts 
       (id, donor_id, title, description, category, dietary, total_servings, remaining_servings, 
        prepared_at, expires_at, pickup_address, area, latitude, longitude, storage_instructions, allergens, status, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)`,
      [
        postId,
        donorId,
        title,
        description,
        category || 'Cooked Surplus',
        dietary,
        totalServings,
        totalServings,
        prepDate,
        expDate,
        pickupAddress,
        area,
        latitude,
        longitude,
        storageInstructions,
        allergens,
        imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ]
    );

    // Trigger Platform-wide Real-Time Notification: FREE_FOOD (Sound: FREE_FOOD_CHORD)
    notificationService
      .broadcastEvent({
        eventType: 'FREE_FOOD',
        sourceId: postId,
        createdBy: donorId,
        title: '❤️ Free Food Available!',
        message: 'Free food is available! Check the details and collect it before it runs out.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        targetUrl: '/free-food',
        payload: {
          postId,
          title,
          totalServings,
          expiresAt: expDate.toISOString(),
          pickupAddress,
          area,
          imageUrl,
        },
      })
      .catch((err) => console.error('[Notifications] Failed to broadcast free food event:', err.message));

    res.json({
      success: true,
      message: 'Surplus food donation post created successfully at ₹0.',
      postId,
    });
  } catch (error) {
    console.error('Create Donation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/donations/:id/reserve
 * Customer reserves servings of surplus food at no charge
 */
router.post('/:id/reserve', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const postId = req.params.id;
    const { claimantId, servings = 1 } = req.body;

    if (!claimantId || servings < 1) {
      connection.release();
      return res.status(400).json({ error: 'Claimant ID and valid servings are required.' });
    }

    await connection.beginTransaction();

    const [posts] = await connection.query(
      `SELECT * FROM food_donation_posts WHERE id = ? FOR UPDATE`,
      [postId]
    );

    if (posts.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Donation post not found.' });
    }

    const post = posts[0];
    const now = new Date();

    if (now >= new Date(post.expires_at)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'Safe collection deadline has expired for this food share.' });
    }

    if (post.status !== 'available' || post.remaining_servings < servings) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: `Only ${post.remaining_servings} serving(s) remain available.` });
    }

    const updatedRemaining = post.remaining_servings - servings;
    const newStatus = updatedRemaining === 0 ? 'reserved' : 'available';

    await connection.query(
      `UPDATE food_donation_posts SET remaining_servings = ?, status = ? WHERE id = ?`,
      [updatedRemaining, newStatus, postId]
    );

    await connection.query(
      `INSERT INTO donation_claims (post_id, claimant_id, servings, status) VALUES (?, ?, ?, 'claimed')`,
      [postId, claimantId, servings]
    );

    // Notify donor
    const notifId = `notif_clm_${Date.now()}`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'donation_reserved')`,
      [
        notifId,
        post.donor_id,
        '💚 Free Food Claimed',
        `${servings} serving(s) of "${post.title}" reserved for community collection.`,
      ]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: `Reserved ${servings} serving(s) of free food. Please collect by the deadline.`,
      remainingServings: updatedRemaining,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/donations/:id/mark-collected
 * Donor marks surplus food as handed over/collected
 */
router.put('/:id/mark-collected', async (req, res) => {
  try {
    await db.query(
      `UPDATE food_donation_posts SET status = 'collected', remaining_servings = 0 WHERE id = ?`,
      [req.params.id]
    );
    res.json({ success: true, message: 'Donation marked as successfully collected.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
