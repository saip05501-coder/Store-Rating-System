'use strict';

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { BCRYPT_ROUNDS } = require('../config/auth');
const { PAGINATION } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get a single user by ID (no password).
 */
const getUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  if (rows.length === 0) throw new AppError('User not found.', 404);
  const user = rows[0];

  if (user.role === 'owner') {
    const [ratingRows] = await pool.query(
      `SELECT COUNT(r.id) AS rating_count, COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?`,
      [user.id]
    );
    user.store_rating_summary = ratingRows[0];
  }

  return user;
};

const createUser = async ({ name, email, password, address, role }) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) throw new AppError('Email address is already registered.', 409);

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, address || null, role]
  );
  return getUserById(result.insertId);
};

/**
 * List all users (admin only).
 * Supports: search by name/email, filter by role, pagination.
 */
const listUsers = async ({ search = '', role = '', page, limit }) => {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (role) {
    where += ' AND role = ?';
    params.push(role);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT id, name, email, address, role, created_at FROM users ${where}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, l, offset]
  );

  return { rows, total, page: p, limit: l };
};

/**
 * Get a store owner's dashboard stats.
 * Returns: stores they own + average ratings.
 */
const getOwnerDashboard = async (ownerId) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.email, s.address,
            COUNT(r.id) AS rating_count,
            COALESCE(AVG(r.rating), 0) AS avg_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [ownerId]
  );
  return rows;
};

/**
 * Update own profile: name, address, and/or password.
 */
const updateProfile = async (userId, { name, address, currentPassword, newPassword }) => {
  const [rows] = await pool.query(
    'SELECT id, password FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found.', 404);

  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    params.push(address);
  }
  if (newPassword) {
    if (!currentPassword) {
      throw new AppError('Current password is required to set a new password.', 400);
    }
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) throw new AppError('Current password is incorrect.', 400);
    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    updates.push('password = ?');
    params.push(hashed);
  }

  if (updates.length === 0) throw new AppError('No fields to update.', 400);

  params.push(userId);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  return getUserById(userId);
};

module.exports = { getUserById, createUser, listUsers, getOwnerDashboard, updateProfile };
