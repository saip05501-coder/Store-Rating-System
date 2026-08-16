'use strict';

const express = require('express');
const { testConnection } = require('../config/database');
const authRoutes = require('./authRoutes');
const userRoutes = require('./user.routes');
const storeRoutes = require('./store.routes');
const ratingRoutes = require('./rating.routes');
const adminRoutes = require('./admin.routes');
const storeOwnerRoutes = require('./storeOwner.routes');
const demoRoutes = require('./demo.routes');

const router = express.Router();


router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/store-owner', storeOwnerRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/demo', demoRoutes);


/**
 * GET /api
 * A small discovery endpoint for opening the API URL directly in a browser.
 */
router.get('/', (req, res) => {
  const apiBase = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

  return res.json({
    success: true,
    message: 'Store Rating API is running.',
    documentation: {
      health: `${apiBase}/health`,
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        currentUser: 'GET /api/auth/me',
      },
      resources: {
        users: 'GET /api/users',
        stores: 'GET /api/stores',
        platformStats: 'GET /api/stores/stats',
        ratings: 'GET /api/ratings/my',
      },
    },
  });
});

/**
 * GET /api/health
 * Health check endpoint verifying Express server status and MySQL pool connectivity.
 */
router.get('/health', async (req, res) => {
  const dbHealth = await testConnection();

  const statusCode = dbHealth.connected ? 200 : 503;

  return res.status(statusCode).json({
    status: dbHealth.connected ? 'OK' : 'ERROR',
    server: 'Express.js is running',
    database: {
      status: dbHealth.connected ? 'Connected' : 'Disconnected',
      details: dbHealth.message,
    },
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;
