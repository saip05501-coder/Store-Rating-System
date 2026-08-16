'use strict';

/**
 * Global error handler — must be the LAST middleware registered in app.js.
 * Catches errors forwarded via next(err).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Operational errors (thrown intentionally from services)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  // MySQL duplicate-entry error (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with that value already exists.',
    });
  }

  // Unknown / programming errors — don't leak details in production
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error.'
        : err.message,
  });
};

/**
 * AppError
 * Custom error class for operational errors.
 * Use this to throw predictable errors from service layer.
 *
 * throw new AppError('User not found', 404)
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
