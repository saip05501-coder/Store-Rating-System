'use strict';

const authenticate = require('./authMiddleware');
const authorize = require('./roleMiddleware');

module.exports = {
  authenticate,
  authorize,
  authenticateToken: authenticate,
  authorizeRoles: authorize,
};
