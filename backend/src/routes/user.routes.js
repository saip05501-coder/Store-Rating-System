'use strict';

const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticate);

// GET /api/users/profile — Get current user's profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile — Update current user's profile
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage('Name must be between 2 and 60 characters.'),
    body('address')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address cannot exceed 400 characters.'),
    body('newPassword')
      .optional()
      .isLength({ min: 8, max: 16 })
      .withMessage('Password must be between 8 and 16 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
    validate,
  ],
  userController.updateProfile
);

// GET /api/users/owner-dashboard — Get store owner's dashboard stats
router.get('/owner-dashboard', authorize(ROLES.OWNER, ROLES.ADMIN), userController.getOwnerDashboard);

// POST /api/users - Create normal users, store owners, or administrators (Admin only)
router.post(
  '/',
  authorize(ROLES.ADMIN),
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters.'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters.').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.').matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character.'),
    body('address').optional({ nullable: true }).trim().isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters.'),
    body('role').isIn(['admin', 'owner', 'user']).withMessage('Role must be admin, owner, or user.'),
    validate,
  ],
  userController.createUser
);

// GET /api/users — List all users (Admin only)
router.get(
  '/',
  authorize(ROLES.ADMIN),
  [
    query('role')
      .optional()
      .isIn(['admin', 'owner', 'user'])
      .withMessage('Invalid role filter.'),
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
  userController.getUsers
);

// GET /api/users/:id — Get user details by ID (Admin only)
router.get('/:id', authorize(ROLES.ADMIN), userController.getUserById);

module.exports = router;
