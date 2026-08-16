'use strict';

/** Standardised success envelope */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/** Standardised error envelope */
const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

/** Paginated list envelope */
const paginated = (res, { rows, total, page, limit }, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data: {
      rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

module.exports = { success, error, paginated };
