'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth');
const { AppError } = require('../middleware/errorHandler');

/**
 * Register a new user.
 * @param {object} userData - { name, email, password, address, role }
 * @returns {object} created user (no password)
 */
const register = async ({ name, email, password, address = null, role = 'user' }) => {
  // Check if email already exists
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  if (existing.length > 0) {
    throw new AppError('Email address is already registered.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, address, role]
  );

  const userId = result.insertId;

  const [rows] = await pool.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  return rows[0];
};

/**
 * Login: verify credentials, return signed JWT + user info.
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, user: object }}
 */
const login = async (email, password) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, password, address, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  if (rows.length === 0) {
    throw new AppError('Invalid email or password.', 401);
  }

  const user = rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Return user without hashed password
  const { password: _pw, ...safeUser } = user;

  return { token, user: safeUser };
};

module.exports = { register, login };
