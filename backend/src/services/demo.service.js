'use strict';

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { BCRYPT_ROUNDS } = require('../config/auth');

const DEMO_PASSWORD = 'Demo@1234';

const ensureUser = async ({ name, email, address, role, passwordHash }) => {
  await pool.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), role = VALUES(role)`,
    [name, email, passwordHash, address, role]
  );
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0].id;
};

const loadDemoData = async () => {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const people = [
    { name: 'Alexandra Morgan Bennett', email: 'demo.owner.bennett@example.com', address: '18 Orchard Lane, Mumbai', role: 'owner' },
    { name: 'Christopher James Wilson', email: 'demo.owner.wilson@example.com', address: '44 Lake View Road, Pune', role: 'owner' },
    { name: 'Priyanka Sharma Kulkarni', email: 'demo.user.priyanka@example.com', address: '9 Park Street, Mumbai', role: 'user' },
    { name: 'Rohan Mehta Deshmukh', email: 'demo.user.rohan@example.com', address: '22 River Road, Pune', role: 'user' },
    { name: 'Samantha Grace Thompson', email: 'demo.user.samantha@example.com', address: '71 Market Lane, Bengaluru', role: 'user' },
  ];

  const ids = {};
  for (const person of people) ids[person.email] = await ensureUser({ ...person, passwordHash });

  const stores = [
    { name: 'The Green Basket Market', email: 'demo.greenbasket@example.com', address: '12 Orchard Lane, Mumbai', owner: 'demo.owner.bennett@example.com' },
    { name: 'Harbour Coffee Roasters', email: 'demo.harbourcoffee@example.com', address: '8 Seaside Drive, Mumbai', owner: 'demo.owner.bennett@example.com' },
    { name: 'Willow Book and Home', email: 'demo.willow@example.com', address: '42 Lake View Road, Pune', owner: 'demo.owner.wilson@example.com' },
    { name: 'Sunrise Artisan Bakery', email: 'demo.sunrise@example.com', address: '5 River Road, Pune', owner: 'demo.owner.wilson@example.com' },
  ];

  const storeIds = {};
  for (const store of stores) {
    await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), owner_id = VALUES(owner_id)`,
      [store.name, store.email, store.address, ids[store.owner]]
    );
    const [rows] = await pool.query('SELECT id FROM stores WHERE email = ? LIMIT 1', [store.email]);
    storeIds[store.email] = rows[0].id;
  }

  const ratings = [
    ['demo.user.priyanka@example.com', 'demo.greenbasket@example.com', 5],
    ['demo.user.priyanka@example.com', 'demo.harbourcoffee@example.com', 4],
    ['demo.user.rohan@example.com', 'demo.greenbasket@example.com', 4],
    ['demo.user.rohan@example.com', 'demo.willow@example.com', 5],
    ['demo.user.samantha@example.com', 'demo.harbourcoffee@example.com', 5],
    ['demo.user.samantha@example.com', 'demo.sunrise@example.com', 4],
  ];
  for (const [userEmail, storeEmail, rating] of ratings) {
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [ids[userEmail], storeIds[storeEmail], rating]
    );
  }

  return { users: people.length, stores: stores.length, ratings: ratings.length, credentials: { email: 'demo.user.priyanka@example.com', password: DEMO_PASSWORD } };
};

module.exports = { loadDemoData };
