-- Admin: monster master and wave setting tables
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS monster_masters (
    monster_id VARCHAR(80) PRIMARY KEY,
    monster_name VARCHAR(120) NOT NULL,
    max_hp INT NOT NULL,
    max_mp INT NOT NULL,
    attack INT NOT NULL,
    defense INT NOT NULL,
    reward_gold INT NOT NULL,
    reward_gem INT NOT NULL,
    reward_exp INT NOT NULL,
    reward_score INT NOT NULL,
    sprite_key VARCHAR(50) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wave_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dungeon_id VARCHAR(40) NOT NULL,
    wave_no INT NOT NULL,
    monster_id VARCHAR(80) NOT NULL,
    monster_count INT NOT NULL DEFAULT 1,
    hp_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    mp_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    attack_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    defense_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    reward_gold_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    reward_gem_multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wave_settings_monster FOREIGN KEY (monster_id) REFERENCES monster_masters (monster_id),
    CONSTRAINT uk_wave_settings_unique UNIQUE (dungeon_id, wave_no)
);

CREATE INDEX idx_monster_masters_active ON monster_masters (is_active);
CREATE INDEX idx_wave_settings_dungeon ON wave_settings (dungeon_id, wave_no);

INSERT INTO monster_masters (
    monster_id, monster_name, max_hp, max_mp, attack, defense,
    reward_gold, reward_gem, reward_exp, reward_score, sprite_key, is_active
) VALUES
    ('slime-green', 'Green Slime', 170, 40, 16, 5, 45, 1, 35, 12, 'slime', 1),
    ('goblin-guard', 'Goblin Guard', 210, 50, 20, 8, 65, 1, 50, 20, 'goblin', 1),
    ('skeleton-warrior', 'Skeleton Warrior', 260, 70, 24, 10, 95, 2, 75, 30, 'skeleton', 1)
ON DUPLICATE KEY UPDATE
    monster_name = VALUES(monster_name),
    max_hp = VALUES(max_hp),
    max_mp = VALUES(max_mp),
    attack = VALUES(attack),
    defense = VALUES(defense),
    reward_gold = VALUES(reward_gold),
    reward_gem = VALUES(reward_gem),
    reward_exp = VALUES(reward_exp),
    reward_score = VALUES(reward_score),
    sprite_key = VALUES(sprite_key),
    is_active = VALUES(is_active);

INSERT INTO wave_settings (
    dungeon_id, wave_no, monster_id, monster_count,
    hp_multiplier, mp_multiplier, attack_multiplier, defense_multiplier,
    reward_gold_multiplier, reward_gem_multiplier, is_active
) VALUES
    ('dungeon1', 1, 'slime-green', 2, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1),
    ('dungeon1', 2, 'goblin-guard', 2, 1.0500, 1.0000, 1.0500, 1.0200, 1.0200, 1.0000, 1),
    ('dungeon1', 3, 'skeleton-warrior', 3, 1.1000, 1.0500, 1.1000, 1.0500, 1.0500, 1.0200, 1)
ON DUPLICATE KEY UPDATE
    monster_id = VALUES(monster_id),
    monster_count = VALUES(monster_count),
    hp_multiplier = VALUES(hp_multiplier),
    mp_multiplier = VALUES(mp_multiplier),
    attack_multiplier = VALUES(attack_multiplier),
    defense_multiplier = VALUES(defense_multiplier),
    reward_gold_multiplier = VALUES(reward_gold_multiplier),
    reward_gem_multiplier = VALUES(reward_gem_multiplier),
    is_active = VALUES(is_active);
