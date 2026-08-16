'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const { error } = require('../utils/response');

/**
 * Authentication middleware.
 * Verifies Bearer JWT from Authorization header.
 * Attaches decoded payload (id, email, role) to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token has expired. Please log in again.', 401);
    }
    return error(res, 'Invalid token.', 401);
  }
};

module.exports = authenticateToken;
module.exports.authenticate = authenticateToken;
module.exports.authenticateToken = authenticateToken;
