'use strict';

const { pool } = require('../config/db');
const { PAGINATION } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get dashboard information for the authenticated store owner.
 * Determines the store automatically via owner_id = req.user.id.
 */
const getStoreOwnerDashboard = async (ownerId) => {
  // Find store owned by this user
  const [storeRows] = await pool.query(
    `SELECT s.id, s.name, s.email, s.address, s.created_at,
            COUNT(r.id) AS rating_count,
            COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = ?
     GROUP BY s.id, s.name, s.email, s.address, s.created_at`,
    [ownerId]
  );

  if (storeRows.length === 0) {
    return {
      hasStore: false,
      store: null,
      message: 'No store is currently associated with your store owner account.',
      ratings: [],
    };
  }

  const store = storeRows[0];

  // Fetch submitted ratings for this store
  const [ratings] = await pool.query(
    `SELECT r.id, r.rating, r.created_at, r.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ORDER BY r.created_at DESC`,
    [store.id]
  );

  return {
    hasStore: true,
    store,
    ratings,
  };
};

/**
 * Get paginated ratings list submitted for the authenticated store owner's store.
 */
const getStoreOwnerRatings = async (ownerId, { page, limit }) => {
  const [storeRows] = await pool.query(
    'SELECT id FROM stores WHERE owner_id = ? LIMIT 1',
    [ownerId]
  );

  if (storeRows.length === 0) {
    return { rows: [], total: 0, page: 1, limit: PAGINATION.DEFAULT_LIMIT };
  }

  const storeId = storeRows[0].id;
  const p = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const l = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (p - 1) * l;

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM ratings WHERE store_id = ?',
    [storeId]
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.created_at, r.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.address AS user_address
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [storeId, l, offset]
  );

  return { rows, total, page: p, limit: l };
};

module.exports = {
  getStoreOwnerDashboard,
  getStoreOwnerRatings,
};
