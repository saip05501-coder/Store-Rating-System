-- ============================================================
--  Migration 001: Create Audit Logs Table
--  Purpose: Append-only audit trail recording system and admin operations
-- ============================================================

USE store_rating_system;

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
