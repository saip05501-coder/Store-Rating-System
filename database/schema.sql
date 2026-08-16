-- ============================================================
--  Store Rating Management System — Database Schema
--  Database: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS store_rating_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE store_rating_system;

-- ============================================================
--  TABLE 1: USERS
--  Stores all platform users (System Admin, Store Owner, Normal User)
-- ============================================================
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

-- ============================================================
--  TABLE 2: STORES
--  Stores registered store profiles
-- ============================================================
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
  INDEX idx_stores_address (address(100)),
  CONSTRAINT fk_stores_owner
    FOREIGN KEY (owner_id) REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  TABLE 3: RATINGS
--  Stores user-submitted ratings for stores (1 to 5 stars)
-- ============================================================
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

-- ============================================================
--  TABLE 4: AUDIT LOGS
--  Append-only audit trail recording system and admin operations
-- ============================================================
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

-- ============================================================
--  SEED DATA: Default Admin Account
--  Email    : admin@storerating.com
--  Password : Admin@1234 (bcrypt hash)
-- ============================================================
INSERT IGNORE INTO users (name, email, password, role)
VALUES (
  'System Administrator Account',
  'admin@storerating.com',
  '$2a$12$qVkFoiCq0aUZTOJnhEqRHenOYb2X6eQ7kR5EUq4kFzO.Fz5eJWxKS',
  'admin'
);

-- ============================================================
--  VIEW: STORE RATINGS SUMMARY
--  Summarizes stores with owner name, total rating count, and avg rating
-- ============================================================
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



