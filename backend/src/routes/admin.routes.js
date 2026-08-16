'use strict';

const express = require('express');
const { body, query, param } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All admin routes require ADMIN authorization
router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * GET /api/admin/dashboard
 * Return platform statistics: totalUsers, totalStores, totalRatings
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * GET /api/admin/users
 * Filterable and sortable user list
 */
router.get(
  '/users',
  [
    query('role')
      .optional()
      .trim(),
    query('name').optional().trim(),
    query('email').optional().trim(),
    query('address').optional().trim(),
    query('sortBy')
      .optional()
      .isIn(['name', 'email', 'address', 'role', 'created_at'])
      .withMessage('sortBy must be one of: name, email, address, role, created_at'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('sortOrder must be ASC or DESC'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  adminController.getUsers
);

/**
 * GET /api/admin/users/:id
 * User details with store summary if owner
 */
router.get(
  '/users/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.'),
    validate,
  ],
  adminController.getUserById
);

/**
 * POST /api/admin/users
 * Admin creates user with specified role (USER, ADMIN, STORE_OWNER)
 */
router.post(
  '/users',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ min: 2, max: 60 })
      .withMessage('Name must be between 2 and 60 characters.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .notEmpty()
      .withMessage('Password is required.')
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
    body('address')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address cannot exceed 400 characters.'),
    body('role')
      .optional()
      .trim()
      .custom((val) => {
        const normalized = String(val).toUpperCase();
        if (!['ADMIN', 'USER', 'STORE_OWNER', 'OWNER'].includes(normalized)) {
          throw new Error('Role must be ADMIN, USER, or STORE_OWNER.');
        }
        return true;
      }),
    validate,
  ],
  adminController.createUser
);

/**
 * GET /api/admin/stores
 * Filterable and sortable store list
 */
router.get(
  '/stores',
  [
    query('name').optional().trim(),
    query('email').optional().trim(),
    query('address').optional().trim(),
    query('sortBy')
      .optional()
      .isIn(['name', 'email', 'address', 'rating', 'created_at'])
      .withMessage('sortBy must be one of: name, email, address, rating, created_at'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('sortOrder must be ASC or DESC'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  adminController.getStores
);

/**
 * POST /api/admin/stores
 * Create a new store connected to owner_id
 */
router.post(
  '/stores',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Store name is required.')
      .isLength({ min: 2, max: 120 })
      .withMessage('Store name must be between 2 and 120 characters.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Store email is required.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid store email address.'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Store address is required.')
      .isLength({ min: 5, max: 400 })
      .withMessage('Store address must be between 5 and 400 characters.'),
    body('owner_id')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('owner_id must be a valid positive integer.'),
    validate,
  ],
  adminController.createStore
);

const auditController = require('../controllers/audit.controller');

/**
 * GET /api/admin/audit-logs
 * Filterable, searchable, and paginated audit trail logs
 */
router.get(
  '/audit-logs',
  [
    query('search').optional().trim(),
    query('action').optional().trim(),
    query('entityType').optional().trim(),
    query('userId').optional().trim(),
    query('status').optional().isIn(['SUCCESS', 'FAILED', 'success', 'failed']),
    query('startDate').optional().trim(),
    query('endDate').optional().trim(),
    query('sortBy')
      .optional()
      .isIn(['id', 'created_at', 'action', 'entity_type', 'status', 'user_id'])
      .withMessage('sortBy must be one of: id, created_at, action, entity_type, status, user_id'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc'])
      .withMessage('sortOrder must be ASC or DESC'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  auditController.getAuditLogs
);

/**
 * GET /api/admin/audit-logs/stats
 * Overview statistics of audit activity
 */
router.get('/audit-logs/stats', auditController.getAuditStats);

module.exports = router;

