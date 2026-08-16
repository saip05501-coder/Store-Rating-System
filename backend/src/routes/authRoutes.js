'use strict';

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/auth/register
 * Public registration for normal users.
 */
router.post(
  '/register',
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
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
    body('address')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address cannot exceed 400 characters.'),
    validate,
  ],
  authController.register
);

/**
 * POST /api/auth/register-owner
 * Store Owner registration — requires valid OWNER_INVITE_CODE validated server-side.
 * Creates user (role = owner) + linked store in a single transaction.
 */
router.post(
  '/register-owner',
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
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
    body('address')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 400 })
      .withMessage('Address cannot exceed 400 characters.'),
    body('storeName')
      .trim()
      .notEmpty()
      .withMessage('Store name is required.')
      .isLength({ min: 2, max: 120 })
      .withMessage('Store name must be between 2 and 120 characters.'),
    body('storeEmail')
      .trim()
      .notEmpty()
      .withMessage('Store email is required.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid store email address.'),
    body('storeAddress')
      .trim()
      .notEmpty()
      .withMessage('Store address is required.')
      .isLength({ min: 5, max: 400 })
      .withMessage('Store address must be between 5 and 400 characters.'),
    body('ownerInviteCode')
      .notEmpty()
      .withMessage('Owner invite code is required.'),
    validate,
  ],
  authController.registerOwner
);

/**
 * POST /api/auth/register-admin
 * Administrator registration — requires valid ADMIN_SECRET_CODE validated server-side.
 * Creates user with role = admin. Secret code is never exposed to the frontend.
 */
router.post(
  '/register-admin',
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
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
    body('adminSecretCode')
      .notEmpty()
      .withMessage('Administrator secret code is required.'),
    validate,
  ],
  authController.registerAdmin
);

/**
 * POST /api/auth/login
 * User login endpoint for all roles.
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validate,
  ],
  authController.login
);

/**
 * GET /api/auth/me
 * Retrieve profile of currently authenticated user.
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * POST /api/auth/change-password
 * Change password for authenticated user.
 */
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required.')
      .isLength({ min: 8, max: 16 })
      .withMessage('New password must be between 8 and 16 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
    validate,
  ],
  authController.changePassword
);

/**
 * POST /api/auth/logout
 * Logout endpoint.
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;

