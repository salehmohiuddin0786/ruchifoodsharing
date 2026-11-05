const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requirePartner, requireAdmin } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// ========================================================
// 1. CUSTOMER & PUBLIC ENDPOINTS
// ========================================================

/**
 * GET /api/curry-rice/items
 * Browse available Curry & Rice marketplace items
 */
router.get('/items', async (req, res) => {
  try {
    const { category, dietary, orderType, search, area } = req.query;

    let sql = `
      SELECT cri.*,
             u.name as cook_name, u.avatar as cook_avatar,
             pp.business_name, pp.fssai_number, pp.rating as cook_rating, pp.verification_status
      FROM curry_rice_items cri
      JOIN users u ON cri.cook_id = u.id
      LEFT JOIN partner_profiles pp ON cri.cook_id = pp.user_id
      WHERE cri.status = 'ACTIVE'
    `;
    const params = [];

    if (category && category !== 'ALL') {
      sql += ` AND cri.category = ?`;
      params.push(category);
    }
    if (dietary && dietary !== 'ALL') {
      sql += ` AND cri.dietary = ?`;
      params.push(dietary);
    }
    if (orderType && orderType !== 'ALL') {
      sql += ` AND (cri.order_type = ? OR cri.order_type = 'BOTH')`;
      params.push(orderType);
    }
    if (area && area !== 'ALL') {
      sql += ` AND cri.area = ?`;
      params.push(area);
    }
    if (search) {
      sql += ` AND (cri.name LIKE ? OR cri.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY cri.is_sold_out ASC, cri.created_at DESC`;

    const [items] = await db.query(sql, params);
    res.json({ success: true, items });
  } catch (error) {
    console.error('Curry-Rice fetch items error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/curry-rice/items/:id
 * Single item details
 */
router.get('/items/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cri.*,
              u.name as cook_name, u.avatar as cook_avatar, u.phone as cook_phone,
              pp.business_name, pp.fssai_number, pp.rating as cook_rating, pp.verification_status, pp.bio as cook_bio
       FROM curry_rice_items cri
       JOIN users u ON cri.cook_id = u.id
       LEFT JOIN partner_profiles pp ON cri.cook_id = pp.user_id
       WHERE cri.id = ? AND cri.status != 'ARCHIVED'`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    res.json({ success: true, item: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/curry-rice/orders
 * Atomic transaction multi-item cart checkout
 */
router.post('/orders', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      items,
      fulfillmentType = 'PICKUP',
      deliveryAddress = '',
      orderType = 'INSTANT',
      scheduledTime = null,
      customerNote = '',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Your cart is empty. Please select food items.' });
    }

    await connection.beginTransaction();

    const itemDetails = [];
    let subtotal = 0;
    let cookId = null;

    // 1. Lock and validate each item with FOR UPDATE
    for (const cItem of items) {
      const qty = parseInt(cItem.quantity, 10);
      if (!qty || qty < 1) {
        throw new Error('Invalid item quantity.');
      }

      const [rows] = await connection.query(
        `SELECT id, cook_id, name, category, serving_size, price, stock_quantity, is_sold_out, status, area, pickup_address
         FROM curry_rice_items
         WHERE id = ? FOR UPDATE`,
        [cItem.itemId || cItem.id]
      );

      if (rows.length === 0 || rows[0].status !== 'ACTIVE') {
        throw new Error(`Item ${cItem.name || cItem.itemId} is no longer available.`);
      }

      const itm = rows[0];

      if (itm.is_sold_out || itm.stock_quantity < qty) {
        throw new Error(
          `Insufficient stock for "${itm.name}". Available: ${itm.stock_quantity}, Requested: ${qty}.`
        );
      }

      if (!cookId) {
        cookId = itm.cook_id;
      }

      const lineTotal = parseFloat(itm.price) * qty;
      subtotal += lineTotal;

      itemDetails.push({
        ...itm,
        requestedQty: qty,
        lineTotal,
      });
    }

    // 2. Decrement stock atomically
    for (const itm of itemDetails) {
      const remainingStock = itm.stock_quantity - itm.requestedQty;
      const isSoldOut = remainingStock <= 0 ? 1 : 0;

      await connection.query(
        `UPDATE curry_rice_items 
         SET stock_quantity = ?, is_sold_out = ? 
         WHERE id = ?`,
        [remainingStock, isSoldOut, itm.id]
      );
    }

    // 3. Create the Marketplace Order
    const orderId = `cr_ord_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const orderNumber = `RUCHI-CR-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryFee = fulfillmentType === 'DELIVERY' ? 35.00 : 0.00;
    const totalAmount = subtotal + deliveryFee;

    await connection.query(
      `INSERT INTO marketplace_orders (
        id, order_number, customer_id, cook_id, total_amount, items_count,
        status, order_type, scheduled_time, fulfillment_type, delivery_address,
        delivery_fee, customer_name, customer_phone, customer_note
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderNumber,
        req.user.id,
        cookId,
        totalAmount,
        itemDetails.length,
        orderType,
        scheduledTime ? new Date(scheduledTime) : null,
        fulfillmentType,
        deliveryAddress || null,
        deliveryFee,
        req.user.name,
        req.user.phone || '+91 98000 00000',
        customerNote || null,
      ]
    );

    // 4. Create Order Line Items
    for (const itm of itemDetails) {
      const lineId = `cr_itm_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      await connection.query(
        `INSERT INTO marketplace_order_items (
          id, order_id, item_id, item_name, item_category, serving_size, unit_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lineId,
          orderId,
          itm.id,
          itm.name,
          itm.category,
          itm.serving_size,
          itm.price,
          itm.requestedQty,
          itm.lineTotal,
        ]
      );
    }

    // 5. Send Notification to Cook
    const notifId = `notif_${Date.now()}`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'ORDER')`,
      [
        notifId,
        cookId,
        `New Curry & Rice Order #${orderNumber}`,
        `Customer ${req.user.name} ordered ${itemDetails.length} items (Total: ₹${totalAmount.toFixed(2)}).`,
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Curry & Rice order placed successfully!',
      orderId,
      orderNumber,
      totalAmount,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Order checkout error:', error);
    res.status(400).json({ error: error.message || 'Failed to place order.' });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/curry-rice/orders/my-orders
 * Customer order history with line items
 */
router.get('/orders/my-orders', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT mo.*,
              u.name as cook_name, u.phone as cook_phone,
              pp.business_name, pp.kitchen_address, pp.area as cook_area
       FROM marketplace_orders mo
       JOIN users u ON mo.cook_id = u.id
       LEFT JOIN partner_profiles pp ON mo.cook_id = pp.user_id
       WHERE mo.customer_id = ?
       ORDER BY mo.created_at DESC`,
      [req.user.id]
    );

    // Fetch line items for each order
    for (const ord of orders) {
      const [items] = await db.query(
        `SELECT * FROM marketplace_order_items WHERE order_id = ?`,
        [ord.id]
      );
      ord.items = items;
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/curry-rice/orders/:id
 * Customer single order tracking
 */
router.get('/orders/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT mo.*,
              u.name as cook_name, u.phone as cook_phone,
              pp.business_name, pp.kitchen_address, pp.area as cook_area
       FROM marketplace_orders mo
       JOIN users u ON mo.cook_id = u.id
       LEFT JOIN partner_profiles pp ON mo.cook_id = pp.user_id
       WHERE mo.id = ? AND (mo.customer_id = ? OR mo.cook_id = ?)`,
      [req.params.id, req.user.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = orders[0];
    const [items] = await db.query(
      `SELECT * FROM marketplace_order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ========================================================
// 2. PARTNER / COOK SELLER ENDPOINTS
// ========================================================

/**
 * GET /api/curry-rice/partner/items
 * List partner's curry and rice items
 */
router.get('/partner/items', authenticate, requirePartner, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT cri.*,
              (SELECT COUNT(*) FROM marketplace_order_items moi WHERE moi.item_id = cri.id) as total_sold_count
       FROM curry_rice_items cri
       WHERE cri.cook_id = ? AND cri.status != 'ARCHIVED'
       ORDER BY cri.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/curry-rice/partner/items
 * Create new curry & rice listing
 */
router.post('/partner/items', authenticate, requirePartner, async (req, res) => {
  try {
    const {
      name,
      description = '',
      category,
      dietary = 'VEG',
      price,
      servingSize,
      stockQuantity = 10,
      isAvailableDaily = true,
      orderType = 'INSTANT',
      prepTimeMinutes = 25,
      pickupTimeWindow = '12:00 PM - 3:30 PM & 7:00 PM - 10:00 PM',
      pickupAddress = '',
      area = 'Banjara Hills',
      imageUrl = '',
    } = req.body;

    if (!name || !category || !price || !servingSize) {
      return res.status(400).json({ error: 'Name, category, price, and serving size are required.' });
    }

    const validCategories = ['CURRY', 'RICE', 'CURRY_RICE', 'DAILY_MEALS'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Category must be CURRY, RICE, CURRY_RICE, or DAILY_MEALS.' });
    }

    const id = `cr_item_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    await db.query(
      `INSERT INTO curry_rice_items (
        id, cook_id, name, description, category, dietary,
        price, serving_size, stock_quantity, is_available_daily,
        is_sold_out, order_type, prep_time_minutes, pickup_time_window,
        pickup_address, area, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        id,
        req.user.id,
        name,
        description,
        category,
        dietary,
        parseFloat(price),
        servingSize,
        parseInt(stockQuantity, 10) || 10,
        isAvailableDaily ? 1 : 0,
        orderType,
        parseInt(prepTimeMinutes, 10) || 20,
        pickupTimeWindow,
        pickupAddress || 'Kitchen Address, Hyderabad',
        area,
        imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
      ]
    );

    // Trigger Platform-wide Real-Time Notification: NEW_DISH (Sound: DISH_CHIME)
    notificationService
      .broadcastEvent({
        eventType: 'NEW_DISH',
        sourceId: id,
        createdBy: req.user.id,
        title: '🍽️ New Dish Available!',
        message: `A new dish, ${name}, has just been added. Check it out!`,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        targetUrl: `/curry-rice/${id}`,
        payload: {
          dishId: id,
          dishName: name,
          price: parseFloat(price),
          servingSize,
          dietary,
          stockQuantity,
          imageUrl,
        },
      })
      .catch((err) => console.error('[Notifications] Failed to broadcast new dish event:', err.message));

    res.status(201).json({
      success: true,
      message: 'Curry & Rice marketplace item listed successfully!',
      itemId: id,
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/curry-rice/partner/items/:id
 * Update listing, adjust inventory, toggle sold out
 */
router.put('/partner/items/:id', authenticate, requirePartner, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      dietary,
      price,
      servingSize,
      stockQuantity,
      isAvailableDaily,
      isSoldOut,
      orderType,
      prepTimeMinutes,
      pickupTimeWindow,
      pickupAddress,
      area,
      imageUrl,
      status,
    } = req.body;

    const [existing] = await db.query(
      `SELECT * FROM curry_rice_items WHERE id = ? AND cook_id = ?`,
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item not found or unauthorized.' });
    }

    await db.query(
      `UPDATE curry_rice_items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        dietary = COALESCE(?, dietary),
        price = COALESCE(?, price),
        serving_size = COALESCE(?, serving_size),
        stock_quantity = COALESCE(?, stock_quantity),
        is_available_daily = COALESCE(?, is_available_daily),
        is_sold_out = COALESCE(?, is_sold_out),
        order_type = COALESCE(?, order_type),
        prep_time_minutes = COALESCE(?, prep_time_minutes),
        pickup_time_window = COALESCE(?, pickup_time_window),
        pickup_address = COALESCE(?, pickup_address),
        area = COALESCE(?, area),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status)
       WHERE id = ? AND cook_id = ?`,
      [
        name,
        description,
        category,
        dietary,
        price !== undefined ? parseFloat(price) : null,
        servingSize,
        stockQuantity !== undefined ? parseInt(stockQuantity, 10) : null,
        isAvailableDaily !== undefined ? (isAvailableDaily ? 1 : 0) : null,
        isSoldOut !== undefined ? (isSoldOut ? 1 : 0) : null,
        orderType,
        prepTimeMinutes !== undefined ? parseInt(prepTimeMinutes, 10) : null,
        pickupTimeWindow,
        pickupAddress,
        area,
        imageUrl,
        status,
        req.params.id,
        req.user.id,
      ]
    );

    res.json({ success: true, message: 'Item updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/curry-rice/partner/items/:id
 * Archive item
 */
router.delete('/partner/items/:id', authenticate, requirePartner, async (req, res) => {
  try {
    await db.query(
      `UPDATE curry_rice_items SET status = 'ARCHIVED' WHERE id = ? AND cook_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Item archived.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/curry-rice/partner/orders
 * Incoming orders for the cook
 */
router.get('/partner/orders', authenticate, requirePartner, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT mo.*
       FROM marketplace_orders mo
       WHERE mo.cook_id = ?
       ORDER BY mo.created_at DESC`,
      [req.user.id]
    );

    for (const ord of orders) {
      const [items] = await db.query(
        `SELECT * FROM marketplace_order_items WHERE order_id = ?`,
        [ord.id]
      );
      ord.items = items;
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/curry-rice/partner/orders/:id/status
 * Partner order status management: ACCEPTED, REJECTED, PREPARING, READY_FOR_PICKUP, COMPLETED
 */
router.put('/partner/orders/:id/status', authenticate, requirePartner, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      connection.release();
      return res.status(400).json({ error: `Invalid status. Valid options: ${validStatuses.join(', ')}` });
    }

    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT * FROM marketplace_orders WHERE id = ? AND cook_id = ? FOR UPDATE`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      throw new Error('Order not found or unauthorized.');
    }

    const order = orders[0];

    // If order was rejected, restore stock
    if (status === 'REJECTED' && order.status !== 'REJECTED') {
      const [items] = await connection.query(
        `SELECT item_id, quantity FROM marketplace_order_items WHERE order_id = ?`,
        [order.id]
      );
      for (const itm of items) {
        await connection.query(
          `UPDATE curry_rice_items 
           SET stock_quantity = stock_quantity + ?, is_sold_out = 0 
           WHERE id = ?`,
          [itm.quantity, itm.item_id]
        );
      }
    }

    await connection.query(
      `UPDATE marketplace_orders 
       SET status = ?, rejection_reason = COALESCE(?, rejection_reason) 
       WHERE id = ?`,
      [status, rejectionReason || null, order.id]
    );

    // Notify customer
    const notifId = `notif_${Date.now()}`;
    let notifTitle = `Order #${order.order_number} Update`;
    let notifMsg = `Your order status is now: ${status.replace(/_/g, ' ')}.`;
    if (status === 'ACCEPTED') notifMsg = `The cook accepted your order #${order.order_number}!`;
    if (status === 'PREPARING') notifMsg = `Your food is being freshly prepared in the kitchen.`;
    if (status === 'READY_FOR_PICKUP') notifMsg = `Your Curry & Rice order is packed and ready for collection!`;
    if (status === 'COMPLETED') notifMsg = `Order completed. Thank you for dining with RUCHI!`;
    if (status === 'REJECTED') notifMsg = `Order was rejected by cook. Reason: ${rejectionReason || 'Chef unavailable'}.`;

    await connection.query(
      `INSERT INTO notifications (id, user_id, title, message, type)
       VALUES (?, ?, ?, ?, 'ORDER')`,
      [notifId, order.customer_id, notifTitle, notifMsg]
    );

    await connection.commit();
    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});


// ========================================================
// 3. ADMIN PLATFORM MANAGEMENT ENDPOINTS
// ========================================================

/**
 * GET /api/curry-rice/admin/items
 * All platform listings
 */
router.get('/admin/items', authenticate, requireAdmin, async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT cri.*,
              u.name as cook_name, u.email as cook_email, u.phone as cook_phone,
              pp.business_name
       FROM curry_rice_items cri
       JOIN users u ON cri.cook_id = u.id
       LEFT JOIN partner_profiles pp ON cri.cook_id = pp.user_id
       ORDER BY cri.created_at DESC`
    );
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/curry-rice/admin/items/:id/status
 * Admin toggle item status (ACTIVE, INACTIVE, ARCHIVED)
 */
router.put('/admin/items/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, isSoldOut } = req.body;
    await db.query(
      `UPDATE curry_rice_items SET
        status = COALESCE(?, status),
        is_sold_out = COALESCE(?, is_sold_out)
       WHERE id = ?`,
      [status, isSoldOut !== undefined ? (isSoldOut ? 1 : 0) : null, req.params.id]
    );
    res.json({ success: true, message: 'Item status updated by platform administrator.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/curry-rice/admin/orders
 * All marketplace orders platform-wide
 */
router.get('/admin/orders', authenticate, requireAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT mo.*,
              cu.name as customer_name, cu.email as customer_email,
              ck.name as cook_name, ck.phone as cook_phone,
              pp.business_name
       FROM marketplace_orders mo
       JOIN users cu ON mo.customer_id = cu.id
       JOIN users ck ON mo.cook_id = ck.id
       LEFT JOIN partner_profiles pp ON mo.cook_id = pp.user_id
       ORDER BY mo.created_at DESC`
    );

    for (const ord of orders) {
      const [items] = await db.query(
        `SELECT * FROM marketplace_order_items WHERE order_id = ?`,
        [ord.id]
      );
      ord.items = items;
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/curry-rice/admin/analytics
 * Marketplace sales reports and inventory breakdown
 */
router.get('/admin/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[{ totalListings }]] = await db.query(`SELECT COUNT(*) as totalListings FROM curry_rice_items WHERE status = 'ACTIVE'`);
    const [[{ totalOrders, grossRevenue }]] = await db.query(
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount), 0) as grossRevenue
       FROM marketplace_orders
       WHERE status NOT IN ('CANCELLED', 'REJECTED')`
    );

    // Sales by Category
    const [categorySales] = await db.query(
      `SELECT moi.item_category, COUNT(moi.id) as order_count, SUM(moi.total_price) as category_revenue
       FROM marketplace_order_items moi
       JOIN marketplace_orders mo ON moi.order_id = mo.id
       WHERE mo.status NOT IN ('CANCELLED', 'REJECTED')
       GROUP BY moi.item_category`
    );

    // Instant vs Advance orders
    const [orderTypeBreakdown] = await db.query(
      `SELECT order_type, COUNT(*) as count, SUM(total_amount) as revenue
       FROM marketplace_orders
       GROUP BY order_type`
    );

    res.json({
      success: true,
      analytics: {
        totalListings,
        totalOrders,
        grossRevenue,
        categorySales,
        orderTypeBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
