-- 21. Expand wave settings to 100-pattern cycle + per-wave-group scaling

ALTER TABLE wave_settings
    ADD COLUMN slot_no INT NOT NULL DEFAULT 1 AFTER wave_no;

ALTER TABLE wave_settings
    DROP INDEX uk_wave_settings_unique;

ALTER TABLE wave_settings
    ADD CONSTRAINT uk_wave_settings_unique UNIQUE (dungeon_id, wave_no, slot_no);

DROP INDEX idx_wave_settings_dungeon ON wave_settings;
CREATE INDEX idx_wave_settings_dungeon ON wave_settings (dungeon_id, wave_no, slot_no);

CREATE TABLE IF NOT EXISTS wave_group_scalings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dungeon_id VARCHAR(40) NOT NULL,
    wave_group_no INT NOT NULL,
    hp_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    mp_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    attack_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    defense_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    reward_gold_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    reward_gem_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    background_image_path VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_wave_group_scalings_unique UNIQUE (dungeon_id, wave_group_no)
);

CREATE INDEX idx_wave_group_scalings_dungeon ON wave_group_scalings (dungeon_id, wave_group_no);

INSERT INTO wave_group_scalings (
    dungeon_id, wave_group_no,
    hp_multiplier, mp_multiplier, attack_multiplier, defense_multiplier,
    reward_gold_multiplier, reward_gem_multiplier, background_image_path, is_active
) VALUES
    ('dungeon1', 1, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, '/dungeons/dungeon-1.png', 1),
    ('dungeon1', 2, 1.1200, 1.0400, 1.1000, 1.0800, 1.0500, 1.0200, '/dungeons/dungeon-2.png', 1)
ON DUPLICATE KEY UPDATE
    hp_multiplier = VALUES(hp_multiplier),
    mp_multiplier = VALUES(mp_multiplier),
    attack_multiplier = VALUES(attack_multiplier),
    defense_multiplier = VALUES(defense_multiplier),
    reward_gold_multiplier = VALUES(reward_gold_multiplier),
    reward_gem_multiplier = VALUES(reward_gem_multiplier),
    background_image_path = VALUES(background_image_path),
    is_active = VALUES(is_active);
