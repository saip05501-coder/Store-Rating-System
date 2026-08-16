'use strict';

const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * validate
 * Place this middleware AFTER your express-validator chain.
 * If any validation errors exist it returns 422 immediately.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(
      res,
      'Validation failed.',
      400,
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }

  next();
};

module.exports = { validate };
