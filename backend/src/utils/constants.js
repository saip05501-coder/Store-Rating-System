'use strict';

const ROLES = Object.freeze({
  ADMIN: 'admin',
  OWNER: 'owner',
  STORE_OWNER: 'owner',
  USER:  'user',
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
});

const RATING = Object.freeze({
  MIN: 1,
  MAX: 5,
});

module.exports = { ROLES, PAGINATION, RATING };

