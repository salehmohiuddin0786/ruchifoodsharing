const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

// All admin routes require authentication and at least ADMIN role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/metrics
 * Overview dashboard for platform administration
 */
router.get('/metrics', async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query(`SELECT COUNT(*) as totalUsers FROM users`);
    const [[{ totalCustomers }]] = await db.query(
      `SELECT COUNT(DISTINCT ur.user_id) as totalCustomers FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = 'CUSTOMER'`
    );
    const [[{ totalCooks }]] = await db.query(
      `SELECT COUNT(DISTINCT ur.user_id) as totalCooks FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name IN ('COOK', 'COOK_DONOR')`
    );
    const [[{ totalDonors }]] = await db.query(
      `SELECT COUNT(DISTINCT ur.user_id) as totalDonors FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name IN ('DONOR', 'COOK_DONOR')`
    );
    const [[{ activeFoodPosts }]] = await db.query(`SELECT COUNT(*) as activeFoodPosts FROM food_posts WHERE status = 'ACTIVE'`);
    const [[{ activeDonations }]] = await db.query(`SELECT COUNT(*) as activeDonations FROM food_donations WHERE status = 'AVAILABLE'`);
    const [[{ totalOrders }]] = await db.query(`SELECT COUNT(*) as totalOrders FROM food_orders`);
    const [[{ pendingReports }]] = await db.query(`SELECT COUNT(*) as pendingReports FROM reports WHERE status = 'pending'`);
    const [[{ totalAdmins }]] = await db.query(
      `SELECT COUNT(DISTINCT ur.user_id) as totalAdmins FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name IN ('ADMIN', 'SUPER_ADMIN')`
    );

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalCustomers,
        totalCooks,
        totalDonors,
        totalAdmins,
        activeFoodPosts,
        activeDonations,
        totalOrders,
        pendingReports,
      },
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/customers
 * List all registered customers with profile details
 */
router.get('/users/customers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             cp.default_delivery_address, cp.area, cp.dietary_preference, cp.notification_radius_km,
             (SELECT COUNT(*) FROM food_orders fo WHERE fo.customer_id = u.id) as order_count,
             (SELECT COUNT(*) FROM reservations res WHERE res.claimant_id = u.id) as reservation_count
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id AND r.name = 'CUSTOMER'
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, customers: rows });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/cooks
 * List all cooks with FSSAI verification status, rating, and active post count
 */
router.get('/users/cooks', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             pp.business_name, pp.partner_type, pp.fssai_number, pp.kitchen_address, pp.area,
             pp.rating, pp.verification_status, pp.total_orders_served,
             (SELECT COUNT(*) FROM food_posts fp WHERE fp.cook_id = u.id AND fp.status = 'ACTIVE') as active_posts
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id AND r.name IN ('COOK', 'COOK_DONOR')
      LEFT JOIN partner_profiles pp ON u.id = pp.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, cooks: rows });
  } catch (error) {
    console.error('Fetch cooks error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/users/cooks/:id/verify
 * Update FSSAI verification status of a cook
 */
router.put('/users/cooks/:id/verify', async (req, res) => {
  try {
    const { verificationStatus } = req.body; // 'VERIFIED', 'REJECTED', 'PENDING'
    await db.query(
      `UPDATE partner_profiles SET verification_status = ? WHERE user_id = ?`,
      [verificationStatus || 'VERIFIED', req.params.id]
    );

    // Create audit log
    await db.query(
      `INSERT INTO audit_logs (actor_id, action, portal, target_type, target_id, metadata)
       VALUES (?, 'VERIFY_COOK', 'ADMIN', 'USER', ?, ?)`,
      [req.user.id, req.params.id, JSON.stringify({ status: verificationStatus })]
    );

    res.json({ success: true, message: `Cook verification status updated to ${verificationStatus}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/donors
 * List all food donors with donation statistics
 */
router.get('/users/donors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             pp.business_name, pp.partner_type, pp.kitchen_address, pp.area, pp.verification_status,
             (SELECT COUNT(*) FROM food_donations fd WHERE fd.donor_id = u.id) as total_donations,
             (SELECT COUNT(*) FROM food_donations fd WHERE fd.donor_id = u.id AND fd.status = 'AVAILABLE') as active_donations
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id AND r.name IN ('DONOR', 'COOK_DONOR')
      LEFT JOIN partner_profiles pp ON u.id = pp.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, donors: rows });
  } catch (error) {
    console.error('Fetch donors error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/admins
 * List all admin accounts
 */
router.get('/users/admins', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             GROUP_CONCAT(r.name) as roles,
             ap.department, ap.permissions, ap.created_by_superadmin_id
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id AND r.name IN ('ADMIN', 'SUPER_ADMIN')
      LEFT JOIN admin_profiles ap ON u.id = ap.user_id
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `);
    res.json({ success: true, admins: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users/create-admin
 * Super Admin creates an authorized Admin account (Cannot be done publicly)
 */
router.post('/users/create-admin', requireSuperAdmin, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { name, email, phone, password, department = 'Operations', permissions = 'VIEW_REPORTS,MODERATE_POSTS' } = req.body;

    if (!name || !email || !password) {
      connection.release();
      return res.status(400).json({ error: 'Name, email, and initial password are required.' });
    }

    // Check duplicate
    const [existing] = await connection.query(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    await connection.beginTransaction();

    const newAdminId = `usr_admin_${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await connection.query(
      `INSERT INTO users (id, name, email, phone, password_hash, status, is_email_verified)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1)`,
      [newAdminId, name, email, phone || null, passwordHash]
    );

    // Fetch ADMIN role id
    const [roleRows] = await connection.query(`SELECT id FROM roles WHERE name = 'ADMIN'`);
    const adminRoleId = roleRows[0]?.id || 2;

    await connection.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [newAdminId, adminRoleId]
    );

    await connection.query(
      `INSERT INTO admin_profiles (user_id, department, permissions, created_by_superadmin_id)
       VALUES (?, ?, ?, ?)`,
      [newAdminId, department, permissions, req.user.id]
    );

    // Log in audit table
    await connection.query(
      `INSERT INTO audit_logs (actor_id, action, portal, target_type, target_id, metadata)
       VALUES (?, 'CREATE_ADMIN', 'ADMIN', 'USER', ?, ?)`,
      [req.user.id, newAdminId, JSON.stringify({ email, department, permissions })]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: `Admin account for '${name}' (${email}) successfully created.`,
      admin: { id: newAdminId, name, email, department, permissions },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Create admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/users/:id/toggle-status
 * Ban or unban any user
 */
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const [users] = await db.query(`SELECT status, name FROM users WHERE id = ?`, [req.params.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const newStatus = users[0].status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await db.query(`UPDATE users SET status = ? WHERE id = ?`, [newStatus, req.params.id]);

    await db.query(
      `INSERT INTO audit_logs (actor_id, action, portal, target_type, target_id, metadata)
       VALUES (?, 'TOGGLE_USER_STATUS', 'ADMIN', 'USER', ?, ?)`,
      [req.user.id, req.params.id, JSON.stringify({ newStatus })]
    );

    res.json({ success: true, status: newStatus, message: `User account is now ${newStatus}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/food/posts
 * All food posts with cook details and slot information
 */
router.get('/food/posts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT fp.*, u.name as cook_name, u.email as cook_email, u.phone as cook_phone,
             pp.business_name, pp.fssai_number, pp.kitchen_address
      FROM food_posts fp
      JOIN users u ON fp.cook_id = u.id
      LEFT JOIN partner_profiles pp ON fp.cook_id = pp.user_id
      ORDER BY fp.created_at DESC
    `);
    res.json({ success: true, posts: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/food/posts/:id/toggle-pause
 * Emergency pause / unpause a food post
 */
router.put('/food/posts/:id/toggle-pause', async (req, res) => {
  try {
    const [posts] = await db.query(`SELECT status, dish_name FROM food_posts WHERE id = ?`, [req.params.id]);
    if (posts.length === 0) return res.status(404).json({ error: 'Food post not found.' });

    const currentStatus = posts[0].status;
    const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';

    await db.query(`UPDATE food_posts SET status = ? WHERE id = ?`, [newStatus, req.params.id]);

    await db.query(
      `INSERT INTO audit_logs (actor_id, action, portal, target_type, target_id, metadata)
       VALUES (?, 'TOGGLE_POST_PAUSE', 'ADMIN', 'FOOD_POST', ?, ?)`,
      [req.user.id, req.params.id, JSON.stringify({ currentStatus, newStatus })]
    );

    res.json({ success: true, status: newStatus, message: `Post is now ${newStatus}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/food/donations
 * All free food donation listings
 */
router.get('/food/donations', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT fd.*, u.name as donor_name, u.email as donor_email, u.phone as donor_phone,
             pp.business_name
      FROM food_donations fd
      JOIN users u ON fd.donor_id = u.id
      LEFT JOIN partner_profiles pp ON fd.donor_id = pp.user_id
      ORDER BY fd.created_at DESC
    `);
    res.json({ success: true, donations: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/orders
 * All orders across the entire platform
 */
router.get('/orders', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT fo.*, 
             fp.dish_name, fp.category, fp.dietary,
             cook.name as cook_name,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM food_orders fo
      JOIN food_posts fp ON fo.post_id = fp.id
      JOIN users cook ON fp.cook_id = cook.id
      JOIN users u ON fo.customer_id = u.id
      ORDER BY fo.created_at DESC
    `);
    res.json({ success: true, orders: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/reports
 */
router.get('/reports', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM reports ORDER BY created_at DESC`);
    res.json({ success: true, reports: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/reports/:id/resolve
 */
router.put('/reports/:id/resolve', async (req, res) => {
  try {
    const { adminNotes } = req.body;
    await db.query(
      `UPDATE reports SET status = 'resolved', admin_notes = ? WHERE id = ?`,
      [adminNotes || 'Reviewed and resolved by platform administrator', req.params.id]
    );

    await db.query(
      `INSERT INTO audit_logs (actor_id, action, portal, target_type, target_id, metadata)
       VALUES (?, 'RESOLVE_REPORT', 'ADMIN', 'REPORT', ?, ?)`,
      [req.user.id, req.params.id, JSON.stringify({ adminNotes: adminNotes || 'Resolved' })]
    );

    res.json({ success: true, message: 'Report marked as resolved.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/audit-logs
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT al.*, u.name as actor_name, u.email as actor_email
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, logs: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
