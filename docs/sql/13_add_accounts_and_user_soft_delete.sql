-- Idempotent migration: account hierarchy + user soft delete
-- Safe to re-run on partially migrated DBs.

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_accounts_login_id UNIQUE (login_id)
);

CREATE TABLE IF NOT EXISTS account_social_links (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_account_social_links_account FOREIGN KEY (account_id) REFERENCES accounts (id),
    CONSTRAINT uk_account_social_provider_user UNIQUE (provider, provider_user_id),
    CONSTRAINT uk_account_social_account_provider UNIQUE (account_id, provider)
);

-- Keep compatibility for already-created table that has linked_at only
SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'account_social_links'
              AND column_name = 'created_at'
        ),
        'SELECT 1',
        'ALTER TABLE account_social_links ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER provider_user_id'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'account_social_links'
              AND column_name = 'updated_at'
        ),
        'SELECT 1',
        'ALTER TABLE account_social_links ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'account_social_links'
              AND column_name = 'linked_at'
        ),
        'UPDATE account_social_links SET created_at = linked_at WHERE linked_at IS NOT NULL',
        'SELECT 1'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Legacy fallback account for existing users
INSERT INTO accounts (login_id, password_hash)
SELECT 'legacy-migration', '$2a$10$Qj9QKDf2f8x2l8zjNw2W6eea4V4vQ3Q6HfE2s5uU6PjYxjv6l1WlK'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE login_id = 'legacy-migration');

SET @legacy_account_id = (SELECT id FROM accounts WHERE login_id = 'legacy-migration' LIMIT 1);

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'account_id'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN account_id BIGINT NULL AFTER external_id'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'class_id'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN class_id VARCHAR(20) NOT NULL DEFAULT ''knight'' AFTER nickname'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_deleted'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 AFTER last_logout_at'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'deleted_at'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL AFTER is_deleted'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill account_id and enforce NOT NULL
UPDATE users SET account_id = @legacy_account_id WHERE account_id IS NULL;
UPDATE users u
LEFT JOIN accounts a ON a.id = u.account_id
SET u.account_id = @legacy_account_id
WHERE a.id IS NULL;
ALTER TABLE users MODIFY COLUMN account_id BIGINT NOT NULL;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_schema = DATABASE()
              AND table_name = 'users'
              AND constraint_name = 'fk_users_account'
              AND constraint_type = 'FOREIGN KEY'
        ),
        'SELECT 1',
        'ALTER TABLE users ADD CONSTRAINT fk_users_account FOREIGN KEY (account_id) REFERENCES accounts (id)'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = 'users'
              AND index_name = 'idx_users_account_deleted'
        ),
        'SELECT 1',
        'CREATE INDEX idx_users_account_deleted ON users (account_id, is_deleted)'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
