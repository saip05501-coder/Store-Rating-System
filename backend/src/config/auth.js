'use strict';

module.exports = {
  JWT_SECRET:     process.env.JWT_SECRET     || 'fallback_dev_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS:  parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
};
