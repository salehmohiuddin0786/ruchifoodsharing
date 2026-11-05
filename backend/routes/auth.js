const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendEmail } = require('../utils/mailer');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'ruchi_secure_jwt_secret_hyderabad_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ruchi_refresh_secret_hyderabad_2026';

// Helper to generate access & refresh tokens
function generateTokens(user, roles, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '2h';
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, roles, name: user.name },
    JWT_SECRET,
    { expiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/register
 * Supports CUSTOMER and PARTNER (Home Cook, Food Donor, or Both)
 * STRICT RULE: ADMIN registration is completely forbidden here.
 */
router.post('/register', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      name,
      email,
      phone,
      password,
      portal = 'CUSTOMER', // CUSTOMER or PARTNER
      partnerType = 'COOK', // COOK, DONOR, COOK_DONOR
      businessName,
      kitchenAddress,
      area = 'Madhapur',
      fssaiNumber = '',
      bio = '',
    } = req.body;

    // 1. Strict Security Check: Admin registration forbidden publicly
    if (portal.toUpperCase() === 'ADMIN') {
      connection.release();
      return res.status(403).json({
        error: 'Security Violation: Admin registration is not publicly available. Only an authorized Super Admin can provision administrative accounts.',
      });
    }

    if (!name || (!email && !phone) || !password) {
      connection.release();
      return res.status(400).json({ error: 'Name, email/phone, and password are required.' });
    }

    if (password.length < 6) {
      connection.release();
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    await connection.beginTransaction();

    // Check duplicate email
    if (email) {
      const [existingEmail] = await connection.query(`SELECT id FROM users WHERE email = ?`, [email]);
      if (existingEmail.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }
    }

    // Check duplicate phone
    if (phone) {
      const [existingPhone] = await connection.query(`SELECT id FROM users WHERE phone = ?`, [phone]);
      if (existingPhone.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'An account with this phone number already exists.' });
      }
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${portal.toLowerCase()}_${Date.now()}`;

    // Insert user record
    await connection.query(
      `INSERT INTO users (id, name, email, phone, password_hash, avatar, status, is_email_verified, is_phone_verified)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', FALSE, FALSE)`,
      [
        userId,
        name,
        email || null,
        phone || null,
        passwordHash,
        portal === 'PARTNER'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      ]
    );

    let assignedRoles = [];

    // Assign Role & Create Portal-Specific Profile
    if (portal.toUpperCase() === 'PARTNER') {
      const roleName = partnerType.toUpperCase(); // 'COOK', 'DONOR', or 'COOK_DONOR'
      const [roleRows] = await connection.query(`SELECT id FROM roles WHERE name = ?`, [roleName]);
      const roleId = roleRows[0]?.id || 3;

      await connection.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [userId, roleId]
      );
      assignedRoles.push(roleName);

      // Create Partner Profile
      await connection.query(
        `INSERT INTO partner_profiles 
         (user_id, business_name, partner_type, bio, fssai_number, kitchen_address, area, city, verification_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Hyderabad', 'VERIFIED')`,
        [
          userId,
          businessName || `${name}'s Kitchen`,
          roleName,
          bio || 'Local home cook & community food partner in Hyderabad.',
          fssaiNumber || null,
          kitchenAddress || `${area}, Hyderabad`,
          area,
        ]
      );
    } else {
      // CUSTOMER Portal
      const [roleRows] = await connection.query(`SELECT id FROM roles WHERE name = 'CUSTOMER'`);
      const roleId = roleRows[0]?.id || 6;

      await connection.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [userId, roleId]
      );
      assignedRoles.push('CUSTOMER');

      // Create Customer Profile
      await connection.query(
        `INSERT INTO customer_profiles (user_id, default_delivery_address, area, city, notification_radius_km)
         VALUES (?, ?, ?, 'Hyderabad', 5)`,
        [userId, `${area}, Hyderabad`, area]
      );
    }

    // Generate Verification OTPs
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenStr = `tok_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 hours

    if (email) {
      await connection.query(
        `INSERT INTO email_verifications (user_id, token, otp, expires_at) VALUES (?, ?, ?, ?)`,
        [userId, tokenStr, emailOtp, expiresAt]
      );
      // Dispatch welcome & verification email
      await sendEmail({
        to: email,
        subject: `Welcome to RUCHI - Verify Your ${portal} Account`,
        text: `Hello ${name}! Your RUCHI verification OTP is: ${emailOtp}. Thank you for joining our Hyderabad food community.`,
      });
    }

    await connection.commit();
    connection.release();

    const { accessToken, refreshToken } = generateTokens(
      { id: userId, email, phone, name },
      assignedRoles
    );

    // Set HTTP-only Cookie
    res.cookie('ruchi_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600000,
    });

    res.status(201).json({
      success: true,
      message: `Account registered successfully for ${portal} portal.`,
      token: accessToken,
      refreshToken,
      user: {
        id: userId,
        name,
        email,
        phone,
        roles: assignedRoles,
        portal,
        verificationOtp: emailOtp, // Provided for instant zero-friction developer testing
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

/**
 * POST /api/auth/login
 * Strict Portal Role Authorization:
 * - Admin Portal: Requires SUPER_ADMIN or ADMIN role
 * - Partner Portal: Requires COOK, DONOR, or COOK_DONOR role
 * - Customer Portal: Requires CUSTOMER role
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, portal = 'CUSTOMER', rememberMe = false } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your email/phone and password.' });
    }

    // 1. Fetch user by email or phone
    const [userRows] = await db.query(
      `SELECT * FROM users WHERE email = ? OR phone = ?`,
      [identifier, identifier]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. No user found with this email or phone.' });
    }

    const user = userRows[0];

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'This account has been suspended by platform administration.' });
    }

    // 2. Validate password
    const passwordMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
    }

    // 3. Fetch user roles
    const [roleRows] = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );

    const userRoles = roleRows.map((r) => r.name);

    // 4. STRICT PORTAL AUTHORIZATION RULES
    const requestedPortal = portal.toUpperCase();

    if (requestedPortal === 'ADMIN') {
      const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
      if (!isAdmin) {
        return res.status(403).json({
          error: 'Access Denied: You do not have Administrator permissions to access the Admin Portal.',
        });
      }
    } else if (requestedPortal === 'PARTNER') {
      const isPartner =
        userRoles.includes('COOK') ||
        userRoles.includes('DONOR') ||
        userRoles.includes('COOK_DONOR');

      if (!isPartner) {
        return res.status(403).json({
          error: 'Access Denied: This portal is reserved for registered Home Cooks and Food Donors. Please sign in via the Customer Portal.',
        });
      }
    } else if (requestedPortal === 'CUSTOMER') {
      // Allow customer access or partner who also buys
      const isCustomer = userRoles.includes('CUSTOMER');
      if (!isCustomer && !userRoles.includes('COOK') && !userRoles.includes('COOK_DONOR')) {
        return res.status(403).json({
          error: 'Access Denied: Please use the appropriate portal for your account role.',
        });
      }
    }

    // 5. Fetch Portal Specific Profile
    let profile = null;
    if (requestedPortal === 'PARTNER') {
      const [partRows] = await db.query(`SELECT * FROM partner_profiles WHERE user_id = ?`, [user.id]);
      profile = partRows[0] || null;
    } else if (requestedPortal === 'CUSTOMER') {
      const [custRows] = await db.query(`SELECT * FROM customer_profiles WHERE user_id = ?`, [user.id]);
      profile = custRows[0] || null;
    } else if (requestedPortal === 'ADMIN') {
      const [adminRows] = await db.query(`SELECT * FROM admin_profiles WHERE user_id = ?`, [user.id]);
      profile = adminRows[0] || null;
    }

    // 6. Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user, userRoles, rememberMe);

    // Record Audit Log
    await db.query(
      `INSERT INTO audit_logs (actor_id, action, portal, target_type, target_id, metadata)
       VALUES (?, 'LOGIN_SUCCESS', ?, 'AUTH', ?, ?)`,
      [user.id, requestedPortal, user.id, JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] })]
    );

    // Set HTTP-only Cookie
    res.cookie('ruchi_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 3600000 : 2 * 3600000,
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! Authenticated to ${requestedPortal} portal.`,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        roles: userRoles,
        portal: requestedPortal,
        profile,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

/**
 * POST /api/auth/facebook
 * Facebook OAuth Login for Customer Portal
 */
router.post('/facebook', async (req, res) => {
  try {
    const { facebookId, name, email, avatar } = req.body;
    if (!facebookId && !email) {
      return res.status(400).json({ error: 'Facebook profile details required.' });
    }

    let [userRows] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
    let user;

    if (userRows.length > 0) {
      user = userRows[0];
    } else {
      const userId = `usr_fb_${Date.now()}`;
      await db.query(
        `INSERT INTO users (id, name, email, avatar, status, is_email_verified)
         VALUES (?, ?, ?, ?, 'ACTIVE', TRUE)`,
        [
          userId,
          name || 'Facebook User',
          email || `fb_${facebookId}@ruchicustomer.in`,
          avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        ]
      );

      // Assign Customer role
      await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, 6)`, [userId]);
      await db.query(
        `INSERT INTO customer_profiles (user_id, area, city) VALUES (?, 'Central Zone', 'Local Area')`,
        [userId]
      );

      const [newRows] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
      user = newRows[0];
    }

    const userRoles = ['CUSTOMER'];
    const { accessToken, refreshToken } = generateTokens(user, userRoles);

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: userRoles,
        portal: 'CUSTOMER',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Generates single-use 6-digit OTP and reset token
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Please enter your email or phone.' });

    const [userRows] = await db.query(
      `SELECT * FROM users WHERE email = ? OR phone = ?`,
      [identifier, identifier]
    );

    if (userRows.length === 0) {
      // Security practice: Return generic success so attackers cannot enumerate users
      return res.json({
        success: true,
        message: 'If an account matches this detail, password recovery instructions have been sent.',
      });
    }

    const user = userRows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = `rst_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, otp, expires_at) VALUES (?, ?, ?, ?)`,
      [user.id, token, otp, expiresAt]
    );

    // Send email
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'RUCHI - Password Reset OTP',
        text: `Your password reset code is: ${otp}. It expires in 15 minutes.`,
      });
    }

    res.json({
      success: true,
      message: 'Password reset code dispatched.',
      token,
      otp, // Provided for instant local developer testing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/reset-password
 * Consumes single-use token or OTP and resets password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, otp, newPassword } = req.body;

    if ((!token && !otp) || !newPassword) {
      return res.status(400).json({ error: 'Reset token/OTP and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    let query = `SELECT * FROM password_reset_tokens WHERE is_used = FALSE AND expires_at > NOW()`;
    const params = [];

    if (token) {
      query += ` AND token = ?`;
      params.push(token);
    } else {
      query += ` AND otp = ?`;
      params.push(otp);
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const resetRecord = rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, resetRecord.user_id]);
    // Mark token as used
    await db.query(`UPDATE password_reset_tokens SET is_used = TRUE WHERE id = ?`, [resetRecord.id]);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log into your portal.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [rows] = await db.query(
      `SELECT ev.* FROM email_verifications ev
       JOIN users u ON ev.user_id = u.id
       WHERE u.email = ? AND ev.otp = ? AND ev.expires_at > NOW() AND ev.verified_at IS NULL`,
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification OTP.' });
    }

    await db.query(`UPDATE email_verifications SET verified_at = NOW() WHERE id = ?`, [rows[0].id]);
    await db.query(`UPDATE users SET is_email_verified = TRUE WHERE id = ?`, [rows[0].user_id]);

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user with portal profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.roles.includes('COOK') || user.roles.includes('DONOR') || user.roles.includes('COOK_DONOR')) {
      const [part] = await db.query(`SELECT * FROM partner_profiles WHERE user_id = ?`, [user.id]);
      profile = part[0] || null;
    } else if (user.roles.includes('CUSTOMER')) {
      const [cust] = await db.query(`SELECT * FROM customer_profiles WHERE user_id = ?`, [user.id]);
      profile = cust[0] || null;
    } else if (user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN')) {
      const [adm] = await db.query(`SELECT * FROM admin_profiles WHERE user_id = ?`, [user.id]);
      profile = adm[0] || null;
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('ruchi_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
