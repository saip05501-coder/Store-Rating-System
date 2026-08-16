'use strict';

const { error } = require('../utils/response');

/**
 * Role-based authorization middleware factory.
 * @param {...string} allowedRoles - List of permitted roles (e.g. 'ADMIN', 'USER', 'OWNER')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return error(res, 'Access denied. User role not determined.', 403);
    }

    let userRole = String(req.user.role).toUpperCase();
    if (userRole === 'STORE_OWNER') userRole = 'OWNER';

    const normalizedAllowedRoles = allowedRoles.map((r) => {
      let roleStr = String(r).toUpperCase();
      if (roleStr === 'STORE_OWNER') return 'OWNER';
      return roleStr;
    });

    if (!normalizedAllowedRoles.includes(userRole)) {
      return error(
        res,
        'Forbidden. You do not have permission to perform this action.',
        403
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
module.exports.authorize = authorizeRoles;
module.exports.authorizeRoles = authorizeRoles;
