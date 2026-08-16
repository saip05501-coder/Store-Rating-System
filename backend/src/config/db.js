'use strict';

// Re-export database configuration from database.js
const { pool, testConnection } = require('./database');

module.exports = { pool, testConnection };
