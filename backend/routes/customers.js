const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/customers/food-posts
 * Public/Customer browsing of active homemade food pre-orders
 */
router.get('/food-posts', async (req, res) => {
  try {
    const { category, dietary, area, search } = req.query;

    let sql = `
      SELECT fp.*,
             u.name as cook_name, u.avatar as cook_avatar,
             pp.business_name, pp.fssai_number, pp.rating as cook_rating, pp.verification_status,
             (4 - fp.active_customer_bookings_count) as slots_remaining
      FROM food_posts fp
      JOIN users u ON fp.cook_id = u.id
      LEFT JOIN partner_profiles pp ON fp.cook_id = pp.user_id
      WHERE fp.status = 'ACTIVE' AND fp.order_closes_at > NOW()
    `;
    const params = [];

    if (category && category !== 'all') {
      sql += ` AND fp.category = ?`;
      params.push(category);
    }
    if (dietary && dietary !== 'all') {
      sql += ` AND fp.dietary = ?`;
      params.push(dietary);
    }
    if (area && area !== 'all') {
      sql += ` AND fp.area = ?`;
      params.push(area);
    }
    if (search) {
      sql += ` AND (fp.dish_name LIKE ? OR fp.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY fp.cooking_starts_at ASC`;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, posts: rows });
  } catch (error) {
    console.error('Customer food posts fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/customers/food-posts/:id
 */
router.get('/food-posts/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT fp.*,
              u.name as cook_name, u.avatar as cook_avatar,
              pp.business_name, pp.fssai_number, pp.rating as cook_rating, pp.verification_status, pp.kitchen_address,
              (4 - fp.active_customer_bookings_count) as slots_remaining
       FROM food_posts fp
       JOIN users u ON fp.cook_id = u.id
       LEFT JOIN partner_profiles pp ON fp.cook_id = pp.user_id
       WHERE fp.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Homemade food post not found.' });
    }

    res.json({ success: true, post: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/customers/donations
 * Public/Customer browsing of free surplus food listings
 */
router.get('/donations', async (req, res) => {
  try {
    const { category, dietary, area, search } = req.query;

    let sql = `
      SELECT fd.*,
             u.name as donor_name,
             pp.business_name, pp.verification_status
      FROM food_donations fd
      JOIN users u ON fd.donor_id = u.id
      LEFT JOIN partner_profiles pp ON fd.donor_id = pp.user_id
      WHERE fd.status = 'AVAILABLE' AND fd.expires_at > NOW() AND fd.remaining_servings > 0
    `;
    const params = [];

    if (category && category !== 'all') {
      sql += ` AND fd.category = ?`;
      params.push(category);
    }
    if (dietary && dietary !== 'all') {
      sql += ` AND fd.dietary = ?`;
      params.push(dietary);
    }
    if (area && area !== 'all') {
      sql += ` AND fd.area = ?`;
      params.push(area);
    }
    if (search) {
      sql += ` AND (fd.title LIKE ? OR fd.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY fd.expires_at ASC`;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, donations: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/customers/orders
 * Place a pre-order with strict cutoff & max 4-customer enforcement
 */
router.post('/orders', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      postId,
      plateQuantity,
      fulfillmentType = 'PICKUP',
      deliveryAddress = '',
      customerPhone,
      paymentMethod = 'UPI',
    } = req.body;

    const customerId = req.user.id;
    const quantity = parseInt(plateQuantity, 10);

    if (!postId || !quantity || quantity < 1) {
      connection.release();
      return res.status(400).json({ error: 'Please provide valid post ID and quantity.' });
    }

    await connection.beginTransaction();

    // 1. Lock food post row
    const [posts] = await connection.query(
      `SELECT * FROM food_posts WHERE id = ? FOR UPDATE`,
      [postId]
    );

    if (posts.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Food post not found.' });
    }

    const post = posts[0];

    // 2. CUTOFF CHECK: order_closes_at must be strictly in the future
    const now = new Date();
    const orderClosesAt = new Date(post.order_closes_at);
    if (now >= orderClosesAt) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: 'Pre-order window has closed. Home cooks require at least 30 minutes preparation buffer before cooking starts.',
      });
    }

    // 3. REMAINING PLATES CHECK
    if (post.remaining_plates < quantity) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: `Only ${post.remaining_plates} plate(s) remaining for this cooking session.`,
      });
    }

    // 4. FOUR-CUSTOMER LIMIT CHECK
    // Check if this customer already has an existing booking for this post
    const [existingCustomerOrders] = await connection.query(
      `SELECT id FROM food_orders WHERE post_id = ? AND customer_id = ? AND status != 'CANCELLED'`,
      [postId, customerId]
    );

    const isNewCustomerForThisPost = existingCustomerOrders.length === 0;

    if (isNewCustomerForThisPost && post.active_customer_bookings_count >= 4) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: 'Booking Limit Reached: To guarantee home quality, this home cook has reached the maximum limit of 4 unique customers for this cooking session.',
      });
    }

    // 5. Calculate totals
    const unitPrice = parseFloat(post.price_per_plate);
    const deliveryFee = fulfillmentType === 'DELIVERY' ? parseFloat(post.delivery_fee || 0) : 0;
    const totalAmount = unitPrice * quantity + deliveryFee;

    const orderId = `ord_${Date.now()}`;

    // 6. Insert food order
    await connection.query(
      `INSERT INTO food_orders (
        id, post_id, customer_id, customer_name, customer_phone,
        plate_quantity, unit_price, delivery_fee, total_amount,
        fulfillment_type, delivery_address, status, payment_method, payment_status,
        cooking_starts_at, order_closes_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, 'PAID', ?, ?)`,
      [
        orderId,
        postId,
        customerId,
        req.user.name,
        customerPhone || req.user.phone || '9876543210',
        quantity,
        unitPrice,
        deliveryFee,
        totalAmount,
        fulfillmentType,
        deliveryAddress || post.pickup_address,
        paymentMethod,
        post.cooking_starts_at,
        post.order_closes_at,
      ]
    );

    // 7. Update food post stock and customer booking count
    const newRemainingPlates = post.remaining_plates - quantity;
    const newBookingCount = isNewCustomerForThisPost
      ? post.active_customer_bookings_count + 1
      : post.active_customer_bookings_count;
    const newStatus = newRemainingPlates === 0 ? 'SOLD_OUT' : 'ACTIVE';

    await connection.query(
      `UPDATE food_posts
       SET remaining_plates = ?, active_customer_bookings_count = ?, status = ?
       WHERE id = ?`,
      [newRemainingPlates, newBookingCount, newStatus, postId]
    );

    // 8. Create Cook Notification
    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'ORDER')`,
      [
        `notif_${Date.now()}`,
        post.cook_id,
        `New Pre-order: ${post.dish_name}`,
        `${req.user.name} ordered ${quantity} plate(s) (₹${totalAmount}). Slots filled: ${newBookingCount}/4.`,
      ]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Your home-cooked meal pre-order is confirmed!',
      orderId,
      totalAmount,
      slotsFilled: newBookingCount,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Customer place order error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/customers/orders
 * Customer's order history
 */
router.get('/orders', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT fo.*, fp.dish_name, fp.category, fp.dietary, fp.image_url,
              u.name as cook_name, pp.business_name, pp.kitchen_address, pp.fssai_number
       FROM food_orders fo
       JOIN food_posts fp ON fo.post_id = fp.id
       JOIN users u ON fp.cook_id = u.id
       LEFT JOIN partner_profiles pp ON fp.cook_id = pp.user_id
       WHERE fo.customer_id = ?
       ORDER BY fo.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/customers/reservations
 * Claim free food donation
 */
router.post('/reservations', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { donationId, servings = 1 } = req.body;
    const requestedServings = parseInt(servings, 10);

    if (!donationId || requestedServings < 1) {
      connection.release();
      return res.status(400).json({ error: 'Donation ID and valid servings are required.' });
    }

    await connection.beginTransaction();

    const [donations] = await connection.query(
      `SELECT * FROM food_donations WHERE id = ? FOR UPDATE`,
      [donationId]
    );

    if (donations.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Food donation post not found.' });
    }

    const donation = donations[0];

    if (new Date() >= new Date(donation.expires_at)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'This food donation listing has expired.' });
    }

    if (donation.remaining_servings < requestedServings) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: `Only ${donation.remaining_servings} serving(s) available.` });
    }

    // Insert reservation
    await connection.query(
      `INSERT INTO reservations (donation_id, claimant_id, servings, status)
       VALUES (?, ?, ?, 'CLAIMED')`,
      [donationId, req.user.id, requestedServings]
    );

    // Update remaining servings
    const newRemaining = donation.remaining_servings - requestedServings;
    const newStatus = newRemaining === 0 ? 'RESERVED' : 'AVAILABLE';

    await connection.query(
      `UPDATE food_donations SET remaining_servings = ?, status = ? WHERE id = ?`,
      [newRemaining, newStatus, donationId]
    );

    // Notify donor
    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'DONATION')`,
      [
        `notif_${Date.now()}`,
        donation.donor_id,
        `Free Food Claimed: ${donation.title}`,
        `${req.user.name} reserved ${requestedServings} serving(s). Pickup address: ${donation.pickup_address}`,
      ]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Free food claim reserved successfully! Please pick up before expiration.',
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/customers/reservations
 */
router.get('/reservations', authenticate, async (req, res) => {
  try {
    const [reservations] = await db.query(
      `SELECT r.*, fd.title, fd.category, fd.dietary, fd.pickup_address, fd.expires_at, fd.storage_instructions,
              u.name as donor_name, u.phone as donor_phone, pp.business_name
       FROM reservations r
       JOIN food_donations fd ON r.donation_id = fd.id
       JOIN users u ON fd.donor_id = u.id
       LEFT JOIN partner_profiles pp ON fd.donor_id = pp.user_id
       WHERE r.claimant_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/customers/favourites
 */
router.get('/favourites', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, u.name as cook_name, u.avatar,
              pp.business_name, pp.kitchen_address, pp.rating, pp.area, pp.verification_status
       FROM favourites f
       JOIN users u ON f.cook_id = u.id
       LEFT JOIN partner_profiles pp ON f.cook_id = pp.user_id
       WHERE f.customer_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, favourites: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/customers/favourites/toggle
 */
router.post('/favourites/toggle', authenticate, async (req, res) => {
  try {
    const { cookId } = req.body;
    if (!cookId) return res.status(400).json({ error: 'Cook ID required.' });

    const [exists] = await db.query(
      `SELECT id FROM favourites WHERE customer_id = ? AND cook_id = ?`,
      [req.user.id, cookId]
    );

    if (exists.length > 0) {
      await db.query(`DELETE FROM favourites WHERE customer_id = ? AND cook_id = ?`, [req.user.id, cookId]);
      return res.json({ success: true, isFavourite: false, message: 'Removed from favourite cooks.' });
    } else {
      const [userExists] = await db.query(`SELECT id FROM users WHERE id = ?`, [cookId]);
      if (userExists.length === 0) {
        return res.json({ success: true, isFavourite: true, message: 'Saved to local favourites.' });
      }
      await db.query(`INSERT INTO favourites (customer_id, cook_id) VALUES (?, ?)`, [req.user.id, cookId]);
      return res.json({ success: true, isFavourite: true, message: 'Added to favourite cooks.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/customers/profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [userRows] = await db.query(`SELECT id, name, email, phone, avatar FROM users WHERE id = ?`, [req.user.id]);
    const [profileRows] = await db.query(`SELECT * FROM customer_profiles WHERE user_id = ?`, [req.user.id]);

    res.json({
      success: true,
      user: userRows[0] || null,
      profile: profileRows[0] || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/customers/profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, defaultDeliveryAddress, area, dietaryPreference, notificationRadiusKm } = req.body;

    if (name || phone) {
      await db.query(`UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?`, [
        name,
        phone,
        req.user.id,
      ]);
    }

    await db.query(
      `UPDATE customer_profiles SET
        default_delivery_address = COALESCE(?, default_delivery_address),
        area = COALESCE(?, area),
        dietary_preference = COALESCE(?, dietary_preference),
        notification_radius_km = COALESCE(?, notification_radius_km)
       WHERE user_id = ?`,
      [defaultDeliveryAddress, area, dietaryPreference, notificationRadiusKm, req.user.id]
    );

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
