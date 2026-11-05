const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'ruchi_secure_jwt_secret_hyderabad_2026';

/**
 * Authentication Middleware: Validates JWT access token
 */
async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.ruchi_token) {
      token = req.cookies.ruchi_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user with roles from MySQL
    const [userRows] = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.status, u.is_email_verified, u.is_phone_verified
       FROM users u WHERE u.id = ?`,
      [decoded.id]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    const user = userRows[0];
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Fetch user roles
    const [roleRows] = await db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );

    user.roles = roleRows.map((r) => r.name);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

/**
 * RBAC Middleware: Require Admin / Super Admin
 */
function requireAdmin(req, res, next) {
  if (!req.user || (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPER_ADMIN'))) {
    return res.status(403).json({
      error: 'Access denied: You must be an authorized Administrator to access this endpoint.',
    });
  }
  next();
}

/**
 * RBAC Middleware: Require Super Admin Only
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.roles.includes('SUPER_ADMIN')) {
    return res.status(403).json({
      error: 'Access denied: Super Admin privileges required.',
    });
  }
  next();
}

/**
 * RBAC Middleware: Require Partner (Cook, Donor, or Cook_Donor)
 */
function requirePartner(req, res, next) {
  const isPartner =
    req.user &&
    (req.user.roles.includes('COOK') ||
      req.user.roles.includes('DONOR') ||
      req.user.roles.includes('COOK_DONOR'));

  if (!isPartner) {
    return res.status(403).json({
      error: 'Access denied: This endpoint is reserved for registered Home Cooks and Food Donors.',
    });
  }
  next();
}

/**
 * RBAC Middleware: Require Customer
 */
function requireCustomer(req, res, next) {
  if (!req.user || !req.user.roles.includes('CUSTOMER')) {
    return res.status(403).json({
      error: 'Access denied: Customer account required.',
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  requireSuperAdmin,
  requirePartner,
  requireCustomer,
};
