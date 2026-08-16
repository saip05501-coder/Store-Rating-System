'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting Database Seeding & Setup...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server.');

    const dbName = process.env.DB_NAME || 'store_rating_system';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✅ Database \`${dbName}\` selected.`);

    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
        name        VARCHAR(60)       NOT NULL,
        email       VARCHAR(255)      NOT NULL,
        password    VARCHAR(255)      NOT NULL,
        address     VARCHAR(400)      DEFAULT NULL,
        role        ENUM('admin', 'owner', 'user') NOT NULL DEFAULT 'user',
        created_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email),
        INDEX idx_users_role (role),
        INDEX idx_users_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Stores Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
        name        VARCHAR(120)      NOT NULL,
        email       VARCHAR(255)      NOT NULL,
        address     VARCHAR(400)      NOT NULL,
        owner_id    INT UNSIGNED      DEFAULT NULL,
        created_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_stores_email (email),
        INDEX idx_stores_owner (owner_id),
        INDEX idx_stores_name (name),
        CONSTRAINT fk_stores_owner
          FOREIGN KEY (owner_id) REFERENCES users (id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Ratings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
        user_id     INT UNSIGNED      NOT NULL,
        store_id    INT UNSIGNED      NOT NULL,
        rating      TINYINT UNSIGNED  NOT NULL,
        created_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_ratings_user_store (user_id, store_id),
        INDEX idx_ratings_store (store_id),
        INDEX idx_ratings_user (user_id),
        CONSTRAINT fk_ratings_user
          FOREIGN KEY (user_id) REFERENCES users (id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT fk_ratings_store
          FOREIGN KEY (store_id) REFERENCES stores (id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT chk_rating_value CHECK (rating BETWEEN 1 AND 5)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Audit Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
        user_id     INT UNSIGNED      DEFAULT NULL,
        action      VARCHAR(60)       NOT NULL,
        entity_type VARCHAR(40)       NOT NULL,
        entity_id   INT UNSIGNED      DEFAULT NULL,
        description VARCHAR(500)      NOT NULL,
        ip_address  VARCHAR(45)       DEFAULT NULL,
        user_agent  VARCHAR(255)      DEFAULT NULL,
        status      ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
        details     JSON              DEFAULT NULL,
        created_at  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_audit_user_id (user_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_entity (entity_type, entity_id),
        INDEX idx_audit_created_at (created_at),
        INDEX idx_audit_status (status),
        CONSTRAINT fk_audit_user
          FOREIGN KEY (user_id) REFERENCES users (id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create View
    await connection.query(`
      CREATE OR REPLACE VIEW store_ratings_summary AS
      SELECT 
        s.id AS store_id,
        s.name AS store_name,
        s.email AS store_email,
        s.address AS store_address,
        s.owner_id,
        u.name AS owner_name,
        COUNT(r.id) AS rating_count,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        s.created_at,
        s.updated_at
      FROM stores s
      LEFT JOIN users u ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name, s.created_at, s.updated_at;
    `);

    console.log('✅ Tables and view created/verified.');

    // 6. Seed Users
    const rounds = 10;
    const adminPasswordHash = await bcrypt.hash('Admin@1234', rounds);
    const ownerPasswordHash = await bcrypt.hash('Owner@1234', rounds);
    const userPasswordHash  = await bcrypt.hash('User@1234', rounds);

    const seedUsers = [
      { name: 'System Administrator Account', email: 'admin@storerating.com', password: adminPasswordHash, address: '100 HQ Boulevard, Tech Park', role: 'admin' },
      { name: 'Store Owner Account User', email: 'owner@storerating.com', password: ownerPasswordHash, address: '200 Retail Way, Commerce City', role: 'owner' },
      { name: 'Normal User Johnathan Doe', email: 'user1@storerating.com', password: userPasswordHash, address: '300 Residential St, Suburbia', role: 'user' }
    ];

    for (const u of seedUsers) {
      await connection.query(`
        INSERT INTO users (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), role = VALUES(role);
      `, [u.name, u.email, u.password, u.address, u.role]);
    }
    console.log('✅ Seed users created.');

    // Get admin ID
    const [adminRows] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', ['admin@storerating.com']);
    const adminId = adminRows[0]?.id;

    // Get owner ID
    const [ownerRows] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', ['owner@storerating.com']);
    const ownerId = ownerRows[0]?.id;

    // Get user ID
    const [userRows] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', ['user1@storerating.com']);
    const userId = userRows[0]?.id;

    // 7. Seed Stores
    const seedStores = [
      { name: 'Apex Electronics Superstore', email: 'contact@apexelectronics.com', address: '458 Market Street, Downtown, Suite 100', owner_id: ownerId },
      { name: 'Boutique Fashion Emporium', email: 'info@boutiquefashion.com', address: '12 Luxury Avenue, Fashion District', owner_id: null }
    ];

    for (const s of seedStores) {
      await connection.query(`
        INSERT INTO stores (name, email, address, owner_id)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), owner_id = VALUES(owner_id);
      `, [s.name, s.email, s.address, s.owner_id]);
    }
    console.log('✅ Seed stores created.');

    // Get store ID
    const [storeRows] = await connection.query('SELECT id FROM stores WHERE email = ? LIMIT 1', ['contact@apexelectronics.com']);
    const storeId = storeRows[0]?.id;

    // 8. Seed Rating
    if (userId && storeId) {
      await connection.query(`
        INSERT INTO ratings (user_id, store_id, rating)
        VALUES (?, ?, 5)
        ON DUPLICATE KEY UPDATE rating = 5;
      `, [userId, storeId]);
      console.log('✅ Seed rating created.');
    }

    // 9. Seed Sample Audit Trail
    if (adminId) {
      const sampleAuditLogs = [
        {
          user_id: adminId,
          action: 'ADMIN_LOGIN_SUCCESS',
          entity_type: 'AUTH',
          entity_id: adminId,
          description: 'Administrator logged into the management portal',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
          status: 'SUCCESS',
          details: JSON.stringify({ method: 'PASSWORD_AUTH', role: 'admin' }),
        },
        {
          user_id: adminId,
          action: 'STORE_CREATED',
          entity_type: 'STORE',
          entity_id: storeId || 1,
          description: 'Administrator registered new store: Apex Electronics Superstore',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
          status: 'SUCCESS',
          details: JSON.stringify({ storeName: 'Apex Electronics Superstore', owner_id: ownerId }),
        },
      ];

      for (const log of sampleAuditLogs) {
        await connection.query(`
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent, status, details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [log.user_id, log.action, log.entity_type, log.entity_id, log.description, log.ip_address, log.user_agent, log.status, log.details]);
      }
      console.log('✅ Sample audit logs seeded.');
    }

    console.log('\n🎉 Database setup and seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
