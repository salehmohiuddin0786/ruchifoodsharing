const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * Haversine distance formula (in km)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * GET /api/preorders
 * Query active/upcoming preorders with distance and filter options
 */
router.get('/', async (req, res) => {
  try {
    const { userLat, userLon, area, category, dietary, search } = req.query;

    let query = `
      SELECT p.*, u.name as cook_name, u.avatar as cook_avatar, 
             cp.kitchen_name, cp.fssai_number, cp.rating as cook_rating, cp.verification_status
      FROM preorder_posts p
      JOIN users u ON p.cook_id = u.id
      LEFT JOIN home_cook_profiles cp ON p.cook_id = cp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    if (dietary && dietary !== 'all') {
      query += ` AND p.dietary = ?`;
      params.push(dietary);
    }

    if (area && area !== 'all') {
      query += ` AND p.area = ?`;
      params.push(area);
    }

    if (search) {
      query += ` AND (p.dish_name LIKE ? OR p.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.cooking_starts_at ASC`;

    const [rows] = await db.query(query, params);

    // Compute distance if lat/lon provided
    const posts = rows.map((post) => {
      let distanceKm = null;
      if (userLat && userLon) {
        distanceKm = calculateDistanceKm(
          parseFloat(userLat),
          parseFloat(userLon),
          parseFloat(post.latitude),
          parseFloat(post.longitude)
        );
      }

      // Check real-time cutoff
      const now = new Date();
      const cutoffTime = new Date(post.order_closes_at);
      let dynamicStatus = post.status;
      if (post.status === 'active' && now >= cutoffTime) {
        dynamicStatus = 'closed';
      }

      return {
        ...post,
        status: dynamicStatus,
        distanceKm,
        isCutoffPassed: now >= cutoffTime,
        orderClosesAtIso: cutoffTime.toISOString(),
        cookingStartsAtIso: new Date(post.cooking_starts_at).toISOString(),
      };
    });

    res.json({ success: true, posts });
  } catch (error) {
    console.error('Fetch Preorders Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/preorders
 * Cook announces a new pre-order meal
 * Strict Business Rule: order_closes_at = cooking_starts_at - 30 minutes
 */
router.post('/', async (req, res) => {
  try {
    const {
      cookId,
      dishName,
      description,
      category,
      dietary = 'veg',
      pricePerPlate,
      totalPlates,
      cookingStartsAt, // ISO string or timestamp
      pickupAddress,
      area = 'Banjara Hills',
      latitude = 17.4156,
      longitude = 78.4357,
      deliveryAvailable = false,
      deliveryFee = 0,
      ingredients = '',
      allergens = '',
      imageUrl = '',
    } = req.body;

    if (!cookId || !dishName || !pricePerPlate || !totalPlates || !cookingStartsAt) {
      return res.status(400).json({ error: 'Missing required post fields.' });
    }

    const cookStart = new Date(cookingStartsAt);
    const now = new Date();

    // Calculate automatic 30-minute cutoff
    const orderClosesAt = new Date(cookStart.getTime() - 30 * 60000);

    // Validate that cutoff is at least in the future
    if (orderClosesAt <= now) {
      return res.status(400).json({
        error: 'Cooking start time must be at least 35 minutes in the future to allow for the 30-minute advance order cutoff.',
      });
    }

    const postId = `post_pre_${Date.now()}`;

    await db.query(
      `INSERT INTO preorder_posts 
       (id, cook_id, dish_name, description, category, dietary, price_per_plate, total_plates, remaining_plates, 
        active_customer_bookings_count, cooking_starts_at, order_closes_at, pickup_address, area, latitude, longitude, 
        delivery_available, delivery_fee, ingredients, allergens, status, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        postId,
        cookId,
        dishName,
        description,
        category || 'Home Kitchen Special',
        dietary,
        pricePerPlate,
        totalPlates,
        totalPlates, // initial remaining = total
        cookStart,
        orderClosesAt,
        pickupAddress || area,
        area,
        latitude,
        longitude,
        deliveryAvailable,
        deliveryFee,
        ingredients,
        allergens,
        imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ]
    );

    // Broadcast notifications to nearby customers (within 10 km)
    const [nearbyUsers] = await db.query(
      `SELECT u.id, u.latitude, u.longitude, np.radius_km 
       FROM users u
       LEFT JOIN notification_preferences np ON u.id = np.user_id
       WHERE u.id != ? AND (np.opt_in IS NULL OR np.opt_in = TRUE)`,
      [cookId]
    );

    for (const user of nearbyUsers) {
      const dist = calculateDistanceKm(latitude, longitude, user.latitude, user.longitude);
      const userRadius = user.radius_km || 10;
      if (dist <= userRadius) {
        const notifId = `notif_dish_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.query(
          `INSERT INTO notifications (id, user_id, title, message, type)
           VALUES (?, ?, ?, ?, 'new_dish')`,
          [
            notifId,
            user.id,
            `🍲 New Homemade Dish in ${area}!`,
            `"${dishName}" announced for ₹${pricePerPlate}/plate. Orders close strictly 30m before cooking starts.`,
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'Pre-order post created successfully with 30-minute cutoff enforced.',
      postId,
      orderClosesAt: orderClosesAt.toISOString(),
    });
  } catch (error) {
    console.error('Create Preorder Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/preorders/:id/book
 * STRICT TRANSACTIONAL BOOKING WITH ROW LOCKING
 * Enforces:
 * 1. 30-minute automatic cutoff
 * 2. Maximum four active customer bookings per post
 * 3. Atomic plate inventory reservation
 */
router.post('/:id/book', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const postId = req.params.id;
    const {
      customerId,
      customerName,
      customerPhone,
      plateQuantity = 1,
      fulfillmentType = 'pickup',
      deliveryAddress = '',
      paymentMethod = 'upi',
    } = req.body;

    if (!customerId || !plateQuantity || plateQuantity < 1) {
      connection.release();
      return res.status(400).json({ error: 'Valid customer ID and plate quantity are required.' });
    }

    // Begin atomic MySQL transaction
    await connection.beginTransaction();

    // Row-lock the post for concurrency safety
    const [posts] = await connection.query(
      `SELECT * FROM preorder_posts WHERE id = ? FOR UPDATE`,
      [postId]
    );

    if (posts.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Pre-order post not found.' });
    }

    const post = posts[0];

    // RULE 1: Check Post Status
    if (post.status !== 'active') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: `Order rejected: This post is currently ${post.status.toUpperCase()} and not accepting orders.`,
      });
    }

    // RULE 2: Automatic 30-Minute Cutoff
    const now = new Date();
    const cutoffTime = new Date(post.order_closes_at);
    if (now >= cutoffTime) {
      // Auto-update to closed in database
      await connection.query(
        `UPDATE preorder_posts SET status = 'closed' WHERE id = ?`,
        [postId]
      );
      await connection.commit();
      connection.release();
      return res.status(400).json({
        error: 'Order Cutoff Passed: Orders close automatically 30 minutes before cooking start time.',
      });
    }

    // RULE 3: Four-Customer-Order Rule
    // Get distinct active customers who have ordered for this post
    const [existingOrders] = await connection.query(
      `SELECT DISTINCT customer_id FROM preorder_orders WHERE post_id = ? AND status != 'cancelled'`,
      [postId]
    );

    const distinctCustomerIds = existingOrders.map((o) => o.customer_id);
    const isCustomerNewToPost = !distinctCustomerIds.includes(customerId);

    if (isCustomerNewToPost && distinctCustomerIds.length >= 4) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error:
          'Order Limit Reached: Each cooking post accepts a maximum of 4 separate customer bookings to guarantee home-cooked quality.',
      });
    }

    // RULE 4: Plate Inventory Check
    if (plateQuantity > post.remaining_plates) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: `Insufficient plates remaining. Only ${post.remaining_plates} plate(s) available.`,
      });
    }

    // ALL VALIDATIONS PASSED -> EXECUTE ATOMIC STOCK DEDUCTION
    const updatedRemainingPlates = post.remaining_plates - plateQuantity;
    const updatedCustomerCount = isCustomerNewToPost
      ? distinctCustomerIds.length + 1
      : distinctCustomerIds.length;

    // Determine status (sold out if 0 plates remain or 4 customer slots filled)
    let newStatus = 'active';
    if (updatedRemainingPlates === 0 || updatedCustomerCount >= 4) {
      newStatus = 'sold_out';
    }

    await connection.query(
      `UPDATE preorder_posts 
       SET remaining_plates = ?, active_customer_bookings_count = ?, status = ?
       WHERE id = ?`,
      [updatedRemainingPlates, updatedCustomerCount, newStatus, postId]
    );

    // Create Order Record
    const orderId = `ord_${Date.now()}`;
    const deliveryFee = fulfillmentType === 'delivery' ? parseFloat(post.delivery_fee || 0) : 0;
    const totalAmount = parseFloat(post.price_per_plate) * plateQuantity + deliveryFee;

    await connection.query(
      `INSERT INTO preorder_orders 
       (id, post_id, customer_id, customer_name, customer_phone, plate_quantity, unit_price, delivery_fee, 
        total_amount, fulfillment_type, delivery_address, status, payment_method, payment_status, cooking_starts_at, order_closes_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 'paid', ?, ?)`,
      [
        orderId,
        postId,
        customerId,
        customerName || 'Customer',
        customerPhone || '+91 98765 00000',
        plateQuantity,
        post.price_per_plate,
        deliveryFee,
        totalAmount,
        fulfillmentType,
        deliveryAddress,
        paymentMethod,
        post.cooking_starts_at,
        post.order_closes_at,
      ]
    );

    // Create Pre-order Item
    await connection.query(
      `INSERT INTO preorder_order_items (order_id, item_reference, quantity, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, post.dish_name, plateQuantity, post.price_per_plate, totalAmount]
    );

    // Create In-App Notifications
    const notifCustomer = `notif_ord_${Date.now()}_1`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'order_status')`,
      [
        notifCustomer,
        customerId,
        '🎉 Pre-Order Confirmed!',
        `Your reservation for ${plateQuantity} plate(s) of "${post.dish_name}" is confirmed. Booking slot secured (${updatedCustomerCount}/4).`,
      ]
    );

    const notifCook = `notif_ord_${Date.now()}_2`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'order_status')`,
      [
        notifCook,
        post.cook_id,
        `🔔 New Booking Slot Filled (${updatedCustomerCount}/4)`,
        `${customerName} booked ${plateQuantity} plate(s) of "${post.dish_name}". Remaining plates: ${updatedRemainingPlates}.`,
      ]
    );

    // Commit Transaction
    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: `Successfully booked ${plateQuantity} plate(s)! Your customer slot is confirmed.`,
      order: {
        id: orderId,
        postId,
        dishName: post.dish_name,
        plateQuantity,
        totalAmount,
        status: 'confirmed',
        remainingPlates: updatedRemainingPlates,
        activeCustomerBookingsCount: updatedCustomerCount,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Booking Transaction Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/preorders/orders/customer/:customerId
 * Customer gets their orders
 */
router.get('/orders/customer/:customerId', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, p.dish_name, p.image_url, u.name as cook_name, p.pickup_address, p.area
       FROM preorder_orders o
       JOIN preorder_posts p ON o.post_id = p.id
       JOIN users u ON p.cook_id = u.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [req.params.customerId]
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/preorders/orders/cook/:cookId
 * Cook gets orders received for their posts
 */
router.get('/orders/cook/:cookId', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, p.dish_name, p.total_plates, p.remaining_plates, p.active_customer_bookings_count
       FROM preorder_orders o
       JOIN preorder_posts p ON o.post_id = p.id
       WHERE p.cook_id = ?
       ORDER BY o.created_at DESC`,
      [req.params.cookId]
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/preorders/orders/:id/status
 * Cook updates preparation status: confirmed -> preparing -> ready -> collected
 */
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const [orders] = await db.query(`SELECT * FROM preorder_orders WHERE id = ?`, [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

    const order = orders[0];
    await db.query(`UPDATE preorder_orders SET status = ? WHERE id = ?`, [status, req.params.id]);

    // Send notification
    let msg = `Your pre-order #${order.id} status changed to ${status.toUpperCase()}.`;
    if (status === 'preparing') msg = `👩‍🍳 Cook has started preparing your meal!`;
    if (status === 'ready') msg = `🍱 Your meal is READY for collection/delivery!`;
    if (status === 'collected') msg = `✅ Order complete. Thank you for supporting local home cooks!`;

    const notifId = `notif_st_${Date.now()}`;
    await db.query(
      `INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, 'order_status')`,
      [notifId, order.customer_id, 'Order Update', msg]
    );

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/preorders/orders/:id/cancel
 * Cancel pre-order (Allowed strictly before 30-min cutoff)
 */
router.post('/orders/:id/cancel', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT * FROM preorder_orders WHERE id = ? FOR UPDATE`,
      [req.params.id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    const now = new Date();
    const cutoff = new Date(order.order_closes_at);

    if (now >= cutoff) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        error: 'Cancellation deadline passed: Cannot cancel after the 30-minute pre-cooking cutoff.',
      });
    }

    await connection.query(`UPDATE preorder_orders SET status = 'cancelled' WHERE id = ?`, [order.id]);

    // Release plate inventory
    const [posts] = await connection.query(
      `SELECT * FROM preorder_posts WHERE id = ? FOR UPDATE`,
      [order.post_id]
    );
    if (posts.length > 0) {
      const post = posts[0];
      const newRemaining = post.remaining_plates + order.plate_quantity;
      const newBookingsCount = Math.max(0, post.active_customer_bookings_count - 1);
      const newStatus = newRemaining > 0 && newBookingsCount < 4 ? 'active' : post.status;

      await connection.query(
        `UPDATE preorder_posts 
         SET remaining_plates = ?, active_customer_bookings_count = ?, status = ?
         WHERE id = ?`,
        [newRemaining, newBookingsCount, newStatus, post.id]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Order cancelled and plate stock released successfully.' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
