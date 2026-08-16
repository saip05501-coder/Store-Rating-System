'use strict';

const { pool } = require('../config/db');
const { PAGINATION } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler');

const getRatingByUserAndStore = async (userId, storeId) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.user_id, r.store_id, r.rating, r.created_at, r.updated_at,
            s.name AS store_name
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.user_id = ? AND r.store_id = ?`,
    [userId, storeId]
  );
  return rows[0] || null;
};

/**
 * Submit a new rating for a store (Normal user only).
 */
const createRating = async (userId, storeId, ratingValue) => {
  const [storeRows] = await pool.query(
    'SELECT id FROM stores WHERE id = ? LIMIT 1',
    [storeId]
  );
  if (storeRows.length === 0) {
    throw new AppError('Store not found.', 404);
  }

  const [existing] = await pool.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
    [userId, storeId]
  );
  if (existing.length > 0) {
    throw new AppError('You have already rated this store.', 409);
  }

  await pool.query(
    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
    [userId, storeId, ratingValue]
  );

  return getRatingByUserAndStore(userId, storeId);
};

/**
 * Modify an existing rating for a store (Normal user only).
 */
const updateRating = async (userId, storeId, ratingValue) => {
  const [storeRows] = await pool.query(
    'SELECT id FROM stores WHERE id = ? LIMIT 1',
    [storeId]
  );
  if (storeRows.length === 0) {
    throw new AppError('Store not found.', 404);
  }

  const [existing] = await pool.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
    [userId, storeId]
  );
  if (existing.length === 0) {
    throw new AppError('You have not rated this store yet.', 404);
  }

  await pool.query(
    'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
    [ratingValue, userId, storeId]
  );

  return getRatingByUserAndStore(userId, storeId);
};

/**
 * Upsert rating (create if new, update if existing).
 */
const submitOrUpdateRating = async (userId, storeId, ratingValue) => {
  const [storeRows] = await pool.query(
    'SELECT id FROM stores WHERE id = ? LIMIT 1',
    [storeId]
  );
  if (storeRows.length === 0) {
    throw new AppError('Store not found.', 404);
  }

  await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
    [userId, storeId, ratingValue]
  );

  return getRatingByUserAndStore(userId, storeId);
};


/**
 * Get ratings submitted by the current user.
 */
const getUserRatings = async (userId, { page, limit }) => {
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM ratings WHERE user_id = ?',
    [userId]
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT r.id, r.store_id, s.name AS store_name, s.address AS store_address,
            r.rating, r.created_at, r.updated_at
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE r.user_id = ?
     ORDER BY r.updated_at DESC
     LIMIT ? OFFSET ?`,
    [userId, l, offset]
  );

  return { rows, total, page: p, limit: l };
};

/**
 * Get ratings for a store (Store owner or Admin).
 */
const getStoreRatings = async (storeId, { page, limit, requester }) => {
  const normalizedStoreId = Number(storeId);

  if (!Number.isSafeInteger(normalizedStoreId) || normalizedStoreId < 1) {
    throw new AppError('A valid store ID is required.', 400);
  }

  const [storeRows] = await pool.query(
    'SELECT id, owner_id FROM stores WHERE id = ? LIMIT 1',
    [normalizedStoreId]
  );

  if (storeRows.length === 0) {
    throw new AppError('Store not found.', 404);
  }

  // Owners may view ratings only for stores assigned to their account. Admins
  // retain platform-wide access.
  if (requester?.role === 'owner' && storeRows[0].owner_id !== requester.id) {
    throw new AppError('You can only view ratings for your own stores.', 403);
  }

  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM ratings WHERE store_id = ?',
    [normalizedStoreId]
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT r.id, r.user_id, u.name AS user_name, u.email AS user_email,
            r.rating, r.created_at, r.updated_at
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [normalizedStoreId, l, offset]
  );

  return { rows, total, page: p, limit: l };
};

module.exports = { createRating, updateRating, submitOrUpdateRating, getUserRatings, getStoreRatings };

