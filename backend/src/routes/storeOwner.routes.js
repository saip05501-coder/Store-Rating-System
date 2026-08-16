'use strict';

const express = require('express');
const { query } = require('express-validator');
const storeOwnerController = require('../controllers/storeOwner.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Require authenticated STORE OWNER
router.use(authenticate, authorize(ROLES.OWNER, ROLES.STORE_OWNER));

/**
 * GET /api/store-owner/dashboard
 * Return owner store stats and user ratings list
 */
router.get('/dashboard', storeOwnerController.getDashboard);

/**
 * GET /api/store-owner/ratings
 * Return ratings for the authenticated owner's store
 */
router.get(
  '/ratings',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  storeOwnerController.getRatings
);

module.exports = router;
