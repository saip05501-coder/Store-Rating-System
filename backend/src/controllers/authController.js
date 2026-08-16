'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth');
const { success, error } = require('../utils/response');
const { recordAuditLog } = require('../services/audit.service');
const { getClientIp, getUserAgent } = require('../utils/requestUtils');

/**
 * POST /api/auth/register
 * Registration for Normal Users.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      return error(res, 'Email address is already registered.', 409);
    }

    // Hash password with bcrypt
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(password, rounds);

    // Normal User registration defaults to 'user' role
    const role = 'user';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, role]
    );

    const userId = result.insertId;

    // Retrieve created user without returning password hash
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Audit log entry
    await recordAuditLog({
      userId,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: userId,
      description: `New user registered: ${name} (${email})`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { role: 'user', email, address: address || null },
    });

    return success(res, rows[0], 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register-owner
 * Store Owner registration gated by a server-side OWNER_INVITE_CODE.
 * Creates a user row (role = 'owner') and a linked store row in one transaction.
 * Role is NEVER taken from req.body — it is always assigned server-side.
 */
const registerOwner = async (req, res, next) => {
  try {
    const {
      name, email, password, address,
      storeName, storeAddress, storeEmail,
      ownerInviteCode,
    } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    // --- Server-side invite code validation ---
    const expectedCode = process.env.OWNER_INVITE_CODE;
    if (!expectedCode) {
      return error(res, 'Owner registration is not configured on this server.', 500);
    }
    if (!ownerInviteCode || ownerInviteCode.trim() !== expectedCode.trim()) {
      await recordAuditLog({
        userId: null,
        action: 'OWNER_REGISTRATION_FAILED',
        entityType: 'AUTH',
        entityId: null,
        description: `Invalid owner invite code provided during registration for ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED',
        details: { attemptedEmail: email, storeName },
      });
      return error(res, 'Invalid owner invite code.', 403);
    }

    // Check duplicate user email
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existingUser.length > 0) {
      return error(res, 'An account with this email already exists.', 409);
    }

    // Check duplicate store email
    const [existingStore] = await pool.query(
      'SELECT id FROM stores WHERE email = ? LIMIT 1',
      [storeEmail]
    );
    if (existingStore.length > 0) {
      return error(res, 'A store with this email already exists.', 409);
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(password, rounds);

    let ownerId;
    let storeId;

    // Execute user + store creation in a transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Create owner user — role hard-coded to 'owner'
      const [userResult] = await conn.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address || null, 'owner']
      );
      ownerId = userResult.insertId;

      // Create linked store
      const [storeResult] = await conn.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [storeName, storeEmail, storeAddress, ownerId]
      );
      storeId = storeResult.insertId;

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    // Fetch the safe user profile (no password)
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [ownerId]
    );

    // Audit log entries
    await recordAuditLog({
      userId: ownerId,
      action: 'STORE_OWNER_REGISTERED',
      entityType: 'USER',
      entityId: ownerId,
      description: `Store owner registered: ${name} (${email}) with store ${storeName}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { ownerId, storeId, storeName, storeEmail },
    });

    await recordAuditLog({
      userId: ownerId,
      action: 'STORE_CREATED',
      entityType: 'STORE',
      entityId: storeId,
      description: `Store registered by owner: ${storeName}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { storeId, storeName, storeEmail, ownerId },
    });

    return success(res, rows[0], 'Store owner account created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register-admin
 * Administrator registration gated by a server-side ADMIN_SECRET_CODE.
 * Role is NEVER taken from req.body — always assigned server-side as 'admin'.
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, adminSecretCode } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    // --- Server-side secret code validation ---
    const expectedCode = process.env.ADMIN_SECRET_CODE;
    if (!expectedCode) {
      return error(res, 'Admin registration is not configured on this server.', 500);
    }
    if (!adminSecretCode || adminSecretCode.trim() !== expectedCode.trim()) {
      await recordAuditLog({
        userId: null,
        action: 'ADMIN_REGISTRATION_FAILED',
        entityType: 'AUTH',
        entityId: null,
        description: `Invalid admin secret code attempt for email ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED',
        details: { attemptedEmail: email },
      });
      return error(res, 'Invalid administrator secret code.', 403);
    }

    // Check duplicate email
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return error(res, 'An account with this email already exists.', 409);
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(password, rounds);

    // Create admin user — role hard-coded to 'admin'
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );

    const adminId = result.insertId;

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [adminId]
    );

    // Audit log
    await recordAuditLog({
      userId: adminId,
      action: 'ADMIN_REGISTERED',
      entityType: 'USER',
      entityId: adminId,
      description: `New administrator account registered: ${name} (${email})`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { adminId, name, email, role: 'admin' },
    });

    return success(res, rows[0], 'Administrator account created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Login for all three roles (ADMIN, USER, OWNER).
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      await recordAuditLog({
        userId: null,
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        entityId: null,
        description: `Failed login attempt — account not found for email: ${email}`,
        ipAddress,
        userAgent,
        status: 'FAILED',
        details: { attemptedEmail: email },
      });
      return error(res, 'Invalid email or password.', 401);
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failAction = user.role === 'admin' ? 'ADMIN_LOGIN_FAILED' : 'LOGIN_FAILED';
      await recordAuditLog({
        userId: user.id,
        action: failAction,
        entityType: 'AUTH',
        entityId: user.id,
        description: `Failed login attempt — incorrect password for ${user.email} (${user.role})`,
        ipAddress,
        userAgent,
        status: 'FAILED',
        details: { email: user.email, role: user.role },
      });
      return error(res, 'Invalid email or password.', 401);
    }

    // Never hardcode secrets - use process.env.JWT_SECRET (or config fallback)
    const secret = process.env.JWT_SECRET || JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN || '7d';

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    // Exclude password hash from response
    const { password: _pw, ...safeUser } = user;

    // Audit log successful login
    const loginAction = user.role === 'admin' ? 'ADMIN_LOGIN_SUCCESS' : `${user.role.toUpperCase()}_LOGIN_SUCCESS`;
    await recordAuditLog({
      userId: user.id,
      action: loginAction,
      entityType: 'AUTH',
      entityId: user.id,
      description: `${user.role === 'admin' ? 'Administrator' : user.role} logged in: ${user.email}`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { role: user.role, email: user.email },
    });

    return success(res, { token, user: safeUser }, 'Login successful', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Fetch authenticated user profile.
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return error(res, 'User not found.', 404);
    }

    return success(res, rows[0], 'User profile retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/change-password
 * Change password for currently authenticated user.
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const [rows] = await pool.query('SELECT id, email, role, password FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return error(res, 'User not found.', 404);

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      await recordAuditLog({
        userId,
        action: 'PASSWORD_CHANGE_FAILED',
        entityType: 'AUTH',
        entityId: userId,
        description: `Failed password change attempt for user ${rows[0].email} — incorrect current password`,
        ipAddress,
        userAgent,
        status: 'FAILED',
        details: { email: rows[0].email, role: rows[0].role },
      });
      return error(res, 'Current password is incorrect.', 400);
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS || '12', 10);
    const newHash = await bcrypt.hash(newPassword, rounds);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);

    await recordAuditLog({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'AUTH',
      entityId: userId,
      description: `User ${rows[0].email} successfully changed password`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { email: rows[0].email, role: rows[0].role },
    });

    return success(res, null, 'Password updated successfully.', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Logout endpoint.
 */
const logout = async (req, res) => {
  if (req.user && req.user.id) {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const logoutAction = req.user.role === 'admin' ? 'ADMIN_LOGOUT' : 'USER_LOGOUT';

    await recordAuditLog({
      userId: req.user.id,
      action: logoutAction,
      entityType: 'AUTH',
      entityId: req.user.id,
      description: `User session logged out: ${req.user.email} (${req.user.role})`,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: { email: req.user.email, role: req.user.role },
    });
  }

  return success(res, null, 'Logged out successfully.', 200);
};

module.exports = {
  register,
  registerOwner,
  registerAdmin,
  login,
  getMe,
  changePassword,
  logout,
};


