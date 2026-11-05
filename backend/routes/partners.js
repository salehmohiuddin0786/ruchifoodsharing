const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requirePartner } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// All partner routes require authentication and COOK, DONOR, or COOK_DONOR role
router.use(authenticate);
router.use(requirePartner);

/**
 * GET /api/partners/dashboard
 * Aggregated metrics for home cooks and food donors
 */
router.get('/dashboard', async (req, res) => {
  try {
    const partnerId = req.user.id;

    // Cook stats
    const [[{ activePosts }]] = await db.query(
      `SELECT COUNT(*) as activePosts FROM food_posts WHERE cook_id = ? AND status = 'ACTIVE'`,
      [partnerId]
    );
    const [[{ totalOrders, totalEarnings }]] = await db.query(
      `SELECT COUNT(fo.id) as totalOrders, COALESCE(SUM(fo.total_amount), 0) as totalEarnings
       FROM food_orders fo
       JOIN food_posts fp ON fo.post_id = fp.id
       WHERE fp.cook_id = ? AND fo.status != 'CANCELLED'`,
      [partnerId]
    );

    // Donor stats
    const [[{ activeDonations, totalServingsDonated }]] = await db.query(
      `SELECT COUNT(*) as activeDonations, COALESCE(SUM(total_servings), 0) as totalServingsDonated
       FROM food_donations WHERE donor_id = ?`,
      [partnerId]
    );

    // Upcoming cooking schedule (posts starting in future or today)
    const [upcomingSchedules] = await db.query(
      `SELECT id, dish_name, category, dietary, remaining_plates, total_plates, 
              active_customer_bookings_count, cooking_starts_at, order_closes_at, status
       FROM food_posts
       WHERE cook_id = ? AND status IN ('ACTIVE', 'SOLD_OUT')
       ORDER BY cooking_starts_at ASC
       LIMIT 5`,
      [partnerId]
    );

    // Recent orders
    const [recentOrders] = await db.query(
      `SELECT fo.*, fp.dish_name, u.name as customer_name, u.phone as customer_phone
       FROM food_orders fo
       JOIN food_posts fp ON fo.post_id = fp.id
       JOIN users u ON fo.customer_id = u.id
       WHERE fp.cook_id = ?
       ORDER BY fo.created_at DESC
       LIMIT 6`,
      [partnerId]
    );

    // Partner profile
    const [profileRows] = await db.query(`SELECT * FROM partner_profiles WHERE user_id = ?`, [partnerId]);

    res.json({
      success: true,
      stats: {
        activePosts,
        totalOrders,
        totalEarnings: parseFloat(totalEarnings),
        activeDonations,
        totalServingsDonated,
      },
      upcomingSchedules,
      recentOrders,
      profile: profileRows[0] || null,
    });
  } catch (error) {
    console.error('Partner dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/partners/posts
 * List all cooking posts created by this cook
 */
router.get('/posts', async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT fp.*,
              (SELECT COUNT(*) FROM food_orders fo WHERE fo.post_id = fp.id AND fo.status != 'CANCELLED') as order_count
       FROM food_posts fp
       WHERE fp.cook_id = ?
       ORDER BY fp.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/partners/posts
 * Create a new homemade food post
 * STRICT ENFORCEMENT:
 * - order_closes_at = cooking_starts_at - 30 minutes
 * - Max customer bookings = 4
 */
router.post('/posts', async (req, res) => {
  try {
    const {
      dishName,
      description = '',
      category = 'Curry',
      dietary = 'VEG',
      pricePerPlate,
      totalPlates,
      cookingStartsAt,
      pickupAddress,
      area = 'Madhapur',
      deliveryAvailable = false,
      deliveryFee = 0,
      ingredients = '',
      allergens = 'None',
      imageUrl = '',
    } = req.body;

    if (!dishName || !pricePerPlate || !totalPlates || !cookingStartsAt) {
      return res.status(400).json({ error: 'Dish name, price, total plates, and cooking start time are required.' });
    }

    const cookingTime = new Date(cookingStartsAt);
    if (isNaN(cookingTime.getTime())) {
      return res.status(400).json({ error: 'Invalid cooking start timestamp.' });
    }

    // MANDATORY 30-MINUTE CUTOFF
    const orderClosesAt = new Date(cookingTime.getTime() - 30 * 60 * 1000);

    const postId = `post_${Date.now()}`;
    const plates = parseInt(totalPlates, 10);
    const price = parseFloat(pricePerPlate);

    await db.query(
      `INSERT INTO food_posts (
        id, cook_id, dish_name, description, category, dietary,
        price_per_plate, total_plates, remaining_plates, active_customer_bookings_count,
        cooking_starts_at, order_closes_at, pickup_address, area,
        delivery_available, delivery_fee, ingredients, allergens, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        postId,
        req.user.id,
        dishName,
        description,
        category,
        dietary,
        price,
        plates,
        plates,
        cookingTime,
        orderClosesAt,
        pickupAddress || 'Kitchen Address, Hyderabad',
        area,
        deliveryAvailable ? 1 : 0,
        parseFloat(deliveryFee) || 0,
        ingredients,
        allergens,
        imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
      ]
    );

    // Trigger Platform-wide Real-Time Notification: NEW_PREORDER (Sound: PREORDER_BELL)
    notificationService
      .broadcastEvent({
        eventType: 'NEW_PREORDER',
        sourceId: postId,
        createdBy: req.user.id,
        title: '🔔 New Pre-Order Available!',
        message: `Pre-orders are now open for ${dishName}. Reserve yours now!`,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        targetUrl: `/food/${postId}`,
        payload: {
          postId,
          dishName,
          pricePerPlate: price,
          totalPlates: plates,
          orderClosesAt: orderClosesAt.toISOString(),
          cookingStartsAt: cookingTime.toISOString(),
          pickupAddress: pickupAddress || 'Kitchen Address, Hyderabad',
          area,
          imageUrl,
        },
      })
      .catch((err) => console.error('[Notifications] Failed to broadcast pre-order event:', err.message));

    res.status(201).json({
      success: true,
      message: 'Homemade food post published successfully with 30-min pre-cooking cutoff.',
      postId,
      orderClosesAt: orderClosesAt.toISOString(),
    });
  } catch (error) {
    console.error('Create food post error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/partners/posts/:id/toggle-pause
 */
router.put('/posts/:id/toggle-pause', async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT status FROM food_posts WHERE id = ? AND cook_id = ?`,
      [req.params.id, req.user.id]
    );
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized.' });
    }

    const newStatus = posts[0].status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    await db.query(`UPDATE food_posts SET status = ? WHERE id = ?`, [newStatus, req.params.id]);

    res.json({ success: true, status: newStatus, message: `Post is now ${newStatus}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/partners/preorders
 * All pre-orders placed with this cook
 */
router.get('/preorders', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT fo.*, fp.dish_name, fp.category, fp.dietary, fp.cooking_starts_at, fp.order_closes_at,
              u.name as customer_name, u.phone as customer_phone, u.email as customer_email
       FROM food_orders fo
       JOIN food_posts fp ON fo.post_id = fp.id
       JOIN users u ON fo.customer_id = u.id
       WHERE fp.cook_id = ?
       ORDER BY fo.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/partners/preorders/:id/status
 * Update status of an order: PREPARING, READY, COLLECTED, CANCELLED
 */
router.put('/preorders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    // Verify ownership
    const [orders] = await db.query(
      `SELECT fo.id, fo.customer_id, fp.dish_name FROM food_orders fo
       JOIN food_posts fp ON fo.post_id = fp.id
       WHERE fo.id = ? AND fp.cook_id = ?`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized.' });
    }

    await db.query(`UPDATE food_orders SET status = ? WHERE id = ?`, [status, req.params.id]);

    // Send customer notification
    const notifId = `notif_${Date.now()}`;
    await db.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'ORDER')`,
      [
        notifId,
        orders[0].customer_id,
        `Order Update: ${orders[0].dish_name}`,
        `Your order status has been updated to '${status}'.`,
      ]
    );

    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/partners/donations
 * List all donations created by this donor
 */
router.get('/donations', async (req, res) => {
  try {
    const [donations] = await db.query(
      `SELECT fd.*,
              (SELECT COUNT(*) FROM reservations r WHERE r.donation_id = fd.id) as claim_count
       FROM food_donations fd
       WHERE fd.donor_id = ?
       ORDER BY fd.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/partners/donations
 * Create a new free surplus food donation listing
 */
router.post('/donations', async (req, res) => {
  try {
    const {
      title,
      description = '',
      category = 'Curry & Rice',
      dietary = 'VEG',
      totalServings,
      preparedAt,
      expiresAt,
      pickupAddress,
      area = 'Begumpet',
      storageInstructions = 'Refrigerate immediately. Consume within 6 hours of pickup.',
      allergens = 'None',
      imageUrl = '',
    } = req.body;

    if (!title || !totalServings || !expiresAt) {
      return res.status(400).json({ error: 'Title, total servings, and expiration time are required.' });
    }

    const donationId = `don_${Date.now()}`;
    const servings = parseInt(totalServings, 10);

    await db.query(
      `INSERT INTO food_donations (
        id, donor_id, title, description, category, dietary,
        total_servings, remaining_servings, prepared_at, expires_at,
        pickup_address, area, storage_instructions, allergens, status, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?)`,
      [
        donationId,
        req.user.id,
        title,
        description,
        category,
        dietary,
        servings,
        servings,
        preparedAt ? new Date(preparedAt) : new Date(),
        new Date(expiresAt),
        pickupAddress || 'Banquet Hall, Begumpet, Hyderabad',
        area,
        storageInstructions,
        allergens,
        imageUrl || 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
      ]
    );

    // Trigger Platform-wide Real-Time Notification: FREE_FOOD (Sound: FREE_FOOD_CHORD)
    notificationService
      .broadcastEvent({
        eventType: 'FREE_FOOD',
        sourceId: donationId,
        createdBy: req.user.id,
        title: '❤️ Free Food Available!',
        message: 'Free food is available! Check the details and collect it before it runs out.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
        targetUrl: '/free-food',
        payload: {
          donationId,
          title,
          totalServings: servings,
          expiresAt: new Date(expiresAt).toISOString(),
          pickupAddress: pickupAddress || 'Banquet Hall, Begumpet, Hyderabad',
          area,
          imageUrl,
        },
      })
      .catch((err) => console.error('[Notifications] Failed to broadcast free food event:', err.message));

    res.status(201).json({
      success: true,
      message: 'Surplus food donation listed successfully for community sharing.',
      donationId,
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/partners/donation-claims
 * Claims made on this partner's donations
 */
router.get('/donation-claims', async (req, res) => {
  try {
    const [claims] = await db.query(
      `SELECT r.*, fd.title as donation_title, fd.pickup_address,
              u.name as claimant_name, u.phone as claimant_phone
       FROM reservations r
       JOIN food_donations fd ON r.donation_id = fd.id
       JOIN users u ON r.claimant_id = u.id
       WHERE fd.donor_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/partners/donation-claims/:id/status
 */
router.put('/donation-claims/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'COLLECTED', 'CANCELLED'
    await db.query(`UPDATE reservations SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ success: true, message: `Reservation status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/partners/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const [userRows] = await db.query(`SELECT id, name, email, phone, avatar FROM users WHERE id = ?`, [req.user.id]);
    const [profileRows] = await db.query(`SELECT * FROM partner_profiles WHERE user_id = ?`, [req.user.id]);

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
 * PUT /api/partners/profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, businessName, fssaiNumber, bio, kitchenAddress, area } = req.body;

    if (name || phone) {
      await db.query(`UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?`, [
        name,
        phone,
        req.user.id,
      ]);
    }

    await db.query(
      `UPDATE partner_profiles SET
        business_name = COALESCE(?, business_name),
        fssai_number = COALESCE(?, fssai_number),
        bio = COALESCE(?, bio),
        kitchen_address = COALESCE(?, kitchen_address),
        area = COALESCE(?, area)
       WHERE user_id = ?`,
      [businessName, fssaiNumber, bio, kitchenAddress, area, req.user.id]
    );

    res.json({ success: true, message: 'Partner profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
