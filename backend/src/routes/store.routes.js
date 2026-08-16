'use strict';

const express = require('express');
const { body, query, param } = require('express-validator');

const storeController = require('../controllers/store.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// GET /api/stores — List/search stores (accessible by all authenticated users)
router.get(
  '/',
  authenticate,
  [
    query('sortBy')
      .optional()
      .isIn(['name', 'rating', 'created_at'])
      .withMessage('sortBy must be one of: name, rating, created_at'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('sortOrder must be ASC or DESC'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100.'),
    validate,
  ],
  storeController.getStores
);

// GET /api/stores/stats — Platform rating totals (Admin only)
router.get('/stats', authenticate, authorize(ROLES.ADMIN), storeController.getPlatformStats);

// GET /api/stores/:id — Get store details (accessible by all authenticated users)
router.get('/:id', authenticate, storeController.getStoreById);

// POST /api/stores — Add store (Admin only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('Store name must be between 2 and 120 characters.'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid store email address.'),
    body('address')
      .trim()
      .isLength({ min: 5, max: 400 })
      .withMessage('Store address must be between 5 and 400 characters.'),
    body('owner_id')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('owner_id must be a valid positive integer user ID.'),
    validate,
  ],
  storeController.createStore
);

// PUT /api/stores/:id — Update store (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('Store name must be between 2 and 120 characters.'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid store email address.'),
    body('address')
      .optional()
      .trim()
      .isLength({ min: 5, max: 400 })
      .withMessage('Store address must be between 5 and 400 characters.'),
    body('owner_id')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('owner_id must be a valid positive integer user ID.'),
    validate,
  ],
  storeController.updateStore
);

// DELETE /api/stores/:id — Delete store (Admin only)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), storeController.deleteStore);

// POST /api/stores/:storeId/ratings — Submit rating (Normal user only)
const ratingController = require('../controllers/rating.controller');
router.post(
  '/:storeId/ratings',
  authenticate,
  authorize(ROLES.USER),
  [
    param('storeId').isInt({ min: 1 }).withMessage('storeId must be a positive integer.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
    validate,
  ],
  ratingController.createRatingForStore
);

// PUT /api/stores/:storeId/ratings — Modify rating (Normal user only)
router.put(
  '/:storeId/ratings',
  authenticate,
  authorize(ROLES.USER),
  [
    param('storeId').isInt({ min: 1 }).withMessage('storeId must be a positive integer.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
    validate,
  ],
  ratingController.updateRatingForStore
);

module.exports = router;

