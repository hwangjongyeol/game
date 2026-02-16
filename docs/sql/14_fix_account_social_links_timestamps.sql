-- Fix for account_social_links timestamp columns used by JPA entity validation.
-- Safe to re-run.

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
