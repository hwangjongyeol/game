-- 19. Add admin balance profiles and item upgrade tiers

CREATE TABLE IF NOT EXISTS item_upgrade_tiers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id VARCHAR(80) NOT NULL,
    upgrade_level INT NOT NULL,
    upgrade_gold_cost BIGINT NOT NULL DEFAULT 0,
    attack_bonus INT NOT NULL DEFAULT 0,
    defense_bonus INT NOT NULL DEFAULT 0,
    hp_bonus INT NOT NULL DEFAULT 0,
    mp_bonus INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_upgrade_tiers_item FOREIGN KEY (item_id) REFERENCES item_masters (item_id),
    CONSTRAINT uk_item_upgrade_tiers UNIQUE (item_id, upgrade_level)
);

CREATE INDEX idx_item_upgrade_tiers_item_level ON item_upgrade_tiers (item_id, upgrade_level);

CREATE TABLE IF NOT EXISTS admin_balance_profiles (
    profile_id VARCHAR(80) PRIMARY KEY,
    profile_name VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    profile_json LONGTEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_balance_profiles_active_updated ON admin_balance_profiles (is_active, updated_at DESC);

INSERT INTO admin_balance_profiles (profile_id, profile_name, description, profile_json, is_active)
VALUES ('default', 'default', 'runtime balance profile', '{}', 1)
ON DUPLICATE KEY UPDATE
    profile_name = VALUES(profile_name),
    description = VALUES(description),
    profile_json = VALUES(profile_json),
    is_active = VALUES(is_active);
