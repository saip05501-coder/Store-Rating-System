'use strict';

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { BCRYPT_ROUNDS } = require('../config/auth');
const { PAGINATION } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get system-wide platform statistics for the Admin Dashboard.
 * Returns: { totalUsers, totalStores, totalRatings }
 */
const getAdminDashboardStats = async () => {
  const [[usersCount]] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [[storesCount]] = await pool.query('SELECT COUNT(*) AS total FROM stores');
  const [[ratingsCount]] = await pool.query('SELECT COUNT(*) AS total FROM ratings');

  return {
    totalUsers: usersCount.total,
    totalStores: storesCount.total,
    totalRatings: ratingsCount.total,
  };
};

/**
 * Get users list with filtering (name, email, address, role), sorting, and pagination.
 */
const listAdminUsers = async ({ search = '', name = '', email = '', address = '', role = '', sortBy = 'name', sortOrder = 'ASC', page, limit }) => {
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
  if (name) {
    where += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    where += ' AND email LIKE ?';
    params.push(`%${email}%`);
  }
  if (address) {
    where += ' AND address LIKE ?';
    params.push(`%${address}%`);
  }
  if (role) {
    let normalizedRole = role.toLowerCase();
    if (normalizedRole === 'store_owner') normalizedRole = 'owner';
    where += ' AND role = ?';
    params.push(normalizedRole);
  }

  const allowedSortFields = {
    name: 'name',
    email: 'email',
    address: 'address',
    role: 'role',
    created_at: 'created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 'name';
  const order = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT id, name, email, address, role, created_at, updated_at FROM users ${where}
     ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`,
    [...params, l, offset]
  );

  return { rows, total, page: p, limit: l };
};

/**
 * Get detailed info for a single user (no password).
 * If user is a store owner, includes store rating summary.
 */
const getAdminUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  if (rows.length === 0) throw new AppError('User not found.', 404);
  const user = rows[0];

  if (user.role === 'owner') {
    const [ratingRows] = await pool.query(
      `SELECT s.id AS store_id, s.name AS store_name, COUNT(r.id) AS rating_count, COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id, s.name`,
      [user.id]
    );
    user.store_rating_summary = ratingRows.length > 0 ? ratingRows[0] : { rating_count: 0, average_rating: 0 };
  }

  return user;
};

/**
 * Admin creates a new User, Admin, or Store Owner.
 */
const createAdminUser = async ({ name, email, password, address, role }) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) throw new AppError('Email address is already registered.', 409);

  let targetRole = (role || 'user').toLowerCase();
  if (targetRole === 'store_owner') targetRole = 'owner';

  if (!['admin', 'owner', 'user'].includes(targetRole)) {
    throw new AppError('Invalid user role specified.', 400);
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(password, rounds);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, address || null, targetRole]
  );

  return getAdminUserById(result.insertId);
};

/**
 * Get stores list for Admin with filtering (name, email, address), sorting (name, email, address, rating, created_at), and pagination.
 */
const listAdminStores = async ({ search = '', name = '', email = '', address = '', sortBy = 'name', sortOrder = 'ASC', page, limit }) => {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (store_name LIKE ? OR store_address LIKE ? OR store_email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (name) {
    where += ' AND store_name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    where += ' AND store_email LIKE ?';
    params.push(`%${email}%`);
  }
  if (address) {
    where += ' AND store_address LIKE ?';
    params.push(`%${address}%`);
  }

  const allowedSortFields = {
    name: 'store_name',
    email: 'store_email',
    address: 'store_address',
    rating: 'avg_rating',
    created_at: 'created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 'store_name';
  const order = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM store_ratings_summary ${where}`,
    params
  );
  const total = countRows[0].total;

  const query = `
    SELECT store_id AS id, store_name AS name, store_email AS email,
           store_address AS address, owner_id, owner_name,
           rating_count, ROUND(avg_rating, 1) AS avg_rating, created_at
    FROM store_ratings_summary
    ${where}
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(query, [...params, l, offset]);

  return { rows, total, page: p, limit: l };
};

/**
 * Admin creates a new Store linked to owner_id.
 */
const createAdminStore = async ({ name, email, address, owner_id = null }) => {
  const [existing] = await pool.query('SELECT id FROM stores WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    throw new AppError('A store with this email address already exists.', 409);
  }

  if (owner_id) {
    const [ownerRows] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'owner' LIMIT 1",
      [owner_id]
    );
    if (ownerRows.length === 0) {
      throw new AppError('Specified owner_id does not exist or user is not a store owner.', 400);
    }
  }

  const [result] = await pool.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address, owner_id || null]
  );

  const [storeRows] = await pool.query(
    `SELECT store_id AS id, store_name AS name, store_email AS email,
            store_address AS address, owner_id, owner_name,
            rating_count, ROUND(avg_rating, 1) AS avg_rating, created_at
     FROM store_ratings_summary WHERE store_id = ?`,
    [result.insertId]
  );

  return storeRows[0];
};

module.exports = {
  getAdminDashboardStats,
  listAdminUsers,
  getAdminUserById,
  createAdminUser,
  listAdminStores,
  createAdminStore,
};
