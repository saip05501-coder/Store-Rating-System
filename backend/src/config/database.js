'use strict';

const mysql = require('mysql2/promise');

// Read MySQL connection configuration from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  charset: 'utf8mb4',
});

/**
 * Health check helper to verify database connectivity.
 * Executes a simple `SELECT 1` ping.
 * @returns {Promise<{connected: boolean, message: string, timestamp: string}>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return {
      connected: true,
      message: 'MySQL connection established successfully.',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    return {
      connected: false,
      message: `MySQL connection failed: ${err.message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = { pool, testConnection };
