'use strict';

const express = require('express');
const { body, param, query } = require('express-validator');
const ratingController = require('../controllers/rating.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// POST /api/ratings — Submit or modify rating (Normal user only)
router.post(
  '/',
  authorize(ROLES.USER),
  [
    body('store_id')
      .isInt({ min: 1 })
      .withMessage('store_id must be a positive integer.'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5.'),
    validate,
  ],
  ratingController.submitRating
);

// GET /api/ratings/my — Get ratings submitted by current user
router.get(
  '/my',
  authorize(ROLES.USER),
  [
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
  ratingController.getMyRatings
);

// GET /api/ratings/store/:storeId — Get ratings for a store (Store owner or Admin)
router.get(
  '/store/:storeId',
  authorize(ROLES.OWNER, ROLES.ADMIN),
  [
    param('storeId')
      .isInt({ min: 1 })
      .withMessage('storeId must be a positive integer.'),
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
  ratingController.getStoreRatings
);

module.exports = router;
