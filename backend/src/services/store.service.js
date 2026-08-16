'use strict';

const { pool } = require('../config/db');
const { PAGINATION } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create a store (admin only).
 */
const createStore = async ({ name, email, address, owner_id = null }) => {
  // Check if store email exists
  const [existing] = await pool.query(
    'SELECT id FROM stores WHERE email = ? LIMIT 1',
    [email]
  );
  if (existing.length > 0) {
    throw new AppError('A store with this email already exists.', 409);
  }

  // If owner_id provided, verify user exists and is an owner
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

  return getStoreById(result.insertId);
};

/**
 * List stores with search, sort, and pagination.
 */
const listStores = async ({ search = '', sortBy = 'name', sortOrder = 'ASC', page, limit, userId = null }) => {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (store_name LIKE ? OR store_address LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const allowedSortFields = {
    name: 'store_name',
    rating: 'avg_rating',
    created_at: 'created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 'store_name';
  const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM store_ratings_summary ${where}`,
    params
  );
  const total = countRows[0].total;

  let userRatingJoin = '';
  let userRatingSelect = 'NULL AS user_submitted_rating';
  const queryParams = [...params];

  if (userId) {
    userRatingSelect = 'ur.rating AS user_submitted_rating';
    userRatingJoin = 'LEFT JOIN ratings ur ON ur.store_id = s.store_id AND ur.user_id = ?';
    queryParams.unshift(userId);
  }

  const query = `
    SELECT s.store_id AS id, s.store_name AS name, s.store_email AS email,
           s.store_address AS address, s.owner_id, s.owner_name,
           s.rating_count, ROUND(s.avg_rating, 1) AS avg_rating,
           s.created_at, ${userRatingSelect}
    FROM store_ratings_summary s
    ${userRatingJoin}
    ${where}
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `;

  queryParams.push(l, offset);

  const [rows] = await pool.query(query, queryParams);

  return { rows, total, page: p, limit: l };
};

/**
 * Return platform-wide rating totals for the administrator dashboard.
 */
const getPlatformStats = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total_ratings,
            COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating
     FROM ratings`
  );

  return rows[0];
};

/**
 * Get store details by ID.
 */
const getStoreById = async (id, userId = null) => {
  let userRatingSelect = 'NULL AS user_submitted_rating';
  let userRatingJoin = '';
  const params = [id];

  if (userId) {
    userRatingSelect = 'ur.rating AS user_submitted_rating';
    userRatingJoin = 'LEFT JOIN ratings ur ON ur.store_id = s.store_id AND ur.user_id = ?';
    params.unshift(userId);
  }

  const [rows] = await pool.query(
    `SELECT s.store_id AS id, s.store_name AS name, s.store_email AS email,
            s.store_address AS address, s.owner_id, s.owner_name,
            s.rating_count, ROUND(s.avg_rating, 1) AS avg_rating,
            s.created_at, s.updated_at, ${userRatingSelect}
     FROM store_ratings_summary s
     ${userRatingJoin}
     WHERE s.store_id = ?`,
    params
  );

  if (rows.length === 0) throw new AppError('Store not found.', 404);
  return rows[0];
};

/**
 * Update store (admin only).
 */
const updateStore = async (id, { name, email, address, owner_id }) => {
  const store = await getStoreById(id);

  if (email && email !== store.email) {
    const [existing] = await pool.query(
      'SELECT id FROM stores WHERE email = ? AND id != ? LIMIT 1',
      [email, id]
    );
    if (existing.length > 0) {
      throw new AppError('A store with this email already exists.', 409);
    }
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

  const updates = [];
  const params = [];

  if (name) { updates.push('name = ?'); params.push(name); }
  if (email) { updates.push('email = ?'); params.push(email); }
  if (address) { updates.push('address = ?'); params.push(address); }
  if (owner_id !== undefined) { updates.push('owner_id = ?'); params.push(owner_id || null); }

  if (updates.length === 0) throw new AppError('No fields to update.', 400);

  params.push(id);
  await pool.query(`UPDATE stores SET ${updates.join(', ')} WHERE id = ?`, params);

  return getStoreById(id);
};

/**
 * Delete store (admin only).
 */
const deleteStore = async (id) => {
  const store = await getStoreById(id);
  await pool.query('DELETE FROM stores WHERE id = ?', [id]);
  return { id: store.id, message: 'Store deleted successfully.' };
};

module.exports = {
  createStore,
  listStores,
  getPlatformStats,
  getStoreById,
  updateStore,
  deleteStore,
};
