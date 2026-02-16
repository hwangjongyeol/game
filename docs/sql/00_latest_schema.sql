-- AutoGame Latest Schema (Single Source of Truth)
-- Version: 2026-02-16
-- 목적: 신규 DB(빈 스키마)에 최신 구조를 한 번에 생성
-- 주의: 기존 운영 데이터가 있는 DB에는 백업 후 적용하세요.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_accounts_login_id UNIQUE (login_id)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_id VARCHAR(100) NOT NULL,
    account_id BIGINT NOT NULL,
    nickname VARCHAR(30) NOT NULL,
    class_id VARCHAR(20) NOT NULL DEFAULT 'knight',
    level INT NOT NULL DEFAULT 1,
    exp BIGINT NOT NULL DEFAULT 0,
    power_score BIGINT NOT NULL DEFAULT 0,
    last_logout_at DATETIME NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_external_id UNIQUE (external_id),
    CONSTRAINT fk_users_account FOREIGN KEY (account_id) REFERENCES accounts (id)
);

CREATE TABLE account_social_links (
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

CREATE TABLE wallets (
    user_id BIGINT PRIMARY KEY,
    gold BIGINT NOT NULL DEFAULT 0,
    gem BIGINT NOT NULL DEFAULT 0,
    energy INT NOT NULL DEFAULT 100,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE economy_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    currency_type VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NULL,
    balance_after BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_economy_transactions_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE ranking_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    season_id VARCHAR(30) NOT NULL,
    user_id BIGINT NOT NULL,
    rank_no INT NOT NULL,
    score BIGINT NOT NULL,
    captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ranking_snapshots_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE user_character_stats (
    user_id BIGINT PRIMARY KEY,
    attack_value BIGINT NOT NULL DEFAULT 20,
    defense_value BIGINT NOT NULL DEFAULT 10,
    max_hp_value BIGINT NOT NULL DEFAULT 200,
    max_mp_value BIGINT NOT NULL DEFAULT 80,
    attack_level INT NOT NULL DEFAULT 1,
    defense_level INT NOT NULL DEFAULT 1,
    hp_level INT NOT NULL DEFAULT 1,
    mp_level INT NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_character_stats_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE daily_quest_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quest_date DATE NOT NULL,
    dungeon_kill_count INT NOT NULL DEFAULT 0,
    gold_earned BIGINT NOT NULL DEFAULT 0,
    stat_upgrade_count INT NOT NULL DEFAULT 0,
    claimed_mask BIGINT NOT NULL DEFAULT 0,
    reward_claimed_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_quest_progress_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_daily_quest_user_date UNIQUE (user_id, quest_date)
);

CREATE TABLE user_dungeon_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    dungeon_id VARCHAR(40) NOT NULL,
    current_wave INT NOT NULL DEFAULT 1,
    max_unlocked_wave INT NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_dungeon_progress_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_user_dungeon UNIQUE (user_id, dungeon_id)
);

CREATE TABLE user_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    item_id VARCHAR(80) NOT NULL,
    item_name VARCHAR(120) NOT NULL,
    quantity BIGINT NOT NULL DEFAULT 0,
    upgrade_level INT NOT NULL DEFAULT 0,
    quality VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    attack_bonus INT NOT NULL DEFAULT 0,
    defense_bonus INT NOT NULL DEFAULT 0,
    hp_bonus INT NOT NULL DEFAULT 0,
    mp_bonus INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_items_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_user_items_user_item UNIQUE (user_id, item_id)
);

CREATE TABLE user_equipment (
    user_id BIGINT PRIMARY KEY,
    weapon_item_id VARCHAR(80) NULL,
    armor_item_id VARCHAR(80) NULL,
    accessory_item_id VARCHAR(80) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_equipment_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE user_equipment_presets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    preset_name VARCHAR(40) NOT NULL,
    weapon_item_id VARCHAR(80) NULL,
    armor_item_id VARCHAR(80) NULL,
    accessory_item_id VARCHAR(80) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_equipment_presets_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_user_preset UNIQUE (user_id, preset_name)
);

CREATE TABLE item_masters (
    item_id VARCHAR(80) PRIMARY KEY,
    item_name VARCHAR(120) NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    equip_slot VARCHAR(20) NULL,
    required_class_id VARCHAR(20) NULL,
    quality VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    attack_bonus INT NOT NULL DEFAULT 0,
    defense_bonus INT NOT NULL DEFAULT 0,
    hp_bonus INT NOT NULL DEFAULT 0,
    mp_bonus INT NOT NULL DEFAULT 0,
    upgrade_gold_base BIGINT NOT NULL DEFAULT 150,
    upgrade_attack_step INT NOT NULL DEFAULT 0,
    upgrade_defense_step INT NOT NULL DEFAULT 0,
    upgrade_hp_step INT NOT NULL DEFAULT 0,
    upgrade_mp_step INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255) NOT NULL DEFAULT '',
    description VARCHAR(255) NOT NULL DEFAULT '',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE monster_masters (
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

CREATE TABLE monster_drop_tables (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    monster_id VARCHAR(80) NOT NULL,
    item_id VARCHAR(80) NOT NULL,
    drop_chance DECIMAL(6,5) NOT NULL,
    min_quantity INT NOT NULL DEFAULT 1,
    max_quantity INT NOT NULL DEFAULT 1,
    is_equipment_drop TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_monster_drop_item FOREIGN KEY (item_id) REFERENCES item_masters (item_id),
    CONSTRAINT fk_monster_drop_monster FOREIGN KEY (monster_id) REFERENCES monster_masters (monster_id),
    CONSTRAINT uk_monster_item UNIQUE (monster_id, item_id)
);

CREATE TABLE wave_settings (
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

CREATE TABLE companion_masters (
    companion_id VARCHAR(40) PRIMARY KEY,
    companion_name VARCHAR(80) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    class_id VARCHAR(20) NOT NULL,
    base_attack INT NOT NULL,
    base_defense INT NOT NULL,
    base_hp INT NOT NULL,
    base_mp INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    recruit_weight INT NOT NULL DEFAULT 100,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_companions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    companion_id VARCHAR(40) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    copies INT NOT NULL DEFAULT 1,
    slot_no INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_companions_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_user_companions_master FOREIGN KEY (companion_id) REFERENCES companion_masters (companion_id),
    CONSTRAINT uk_user_companion UNIQUE (user_id, companion_id)
);

CREATE INDEX idx_users_nickname ON users (nickname);
CREATE INDEX idx_users_account_deleted ON users (account_id, is_deleted);
CREATE INDEX idx_economy_user_created ON economy_transactions (user_id, created_at DESC);
CREATE INDEX idx_economy_reason_created ON economy_transactions (reason_code, created_at DESC);
CREATE INDEX idx_economy_currency_type ON economy_transactions (currency_type);
CREATE INDEX idx_ranking_season_rank ON ranking_snapshots (season_id, rank_no);
CREATE INDEX idx_ranking_user ON ranking_snapshots (user_id);
CREATE INDEX idx_user_character_stats_attack_level ON user_character_stats (attack_level);
CREATE INDEX idx_user_character_stats_defense_level ON user_character_stats (defense_level);
CREATE INDEX idx_daily_quest_date ON daily_quest_progress (quest_date);
CREATE INDEX idx_daily_quest_gold_earned ON daily_quest_progress (gold_earned);
CREATE INDEX idx_daily_quest_upgrade_count ON daily_quest_progress (stat_upgrade_count);
CREATE INDEX idx_user_dungeon_progress_wave ON user_dungeon_progress (dungeon_id, current_wave);
CREATE INDEX idx_user_items_user ON user_items (user_id);
CREATE INDEX idx_user_items_item ON user_items (item_id);
CREATE INDEX idx_user_equipment_weapon ON user_equipment (weapon_item_id);
CREATE INDEX idx_user_equipment_armor ON user_equipment (armor_item_id);
CREATE INDEX idx_user_equipment_accessory ON user_equipment (accessory_item_id);
CREATE INDEX idx_user_equipment_presets_user ON user_equipment_presets (user_id);
CREATE INDEX idx_item_masters_type_active ON item_masters (item_type, is_active);
CREATE INDEX idx_monster_masters_active ON monster_masters (is_active);
CREATE INDEX idx_monster_drop_monster ON monster_drop_tables (monster_id);
CREATE INDEX idx_monster_drop_item ON monster_drop_tables (item_id);
CREATE INDEX idx_wave_settings_dungeon ON wave_settings (dungeon_id, wave_no);
CREATE INDEX idx_companion_masters_active ON companion_masters (is_active);
CREATE INDEX idx_companion_masters_class_grade ON companion_masters (class_id, grade);
CREATE INDEX idx_user_companions_user_slot ON user_companions (user_id, slot_no);
CREATE INDEX idx_user_companions_user_companion ON user_companions (user_id, companion_id);

INSERT INTO item_masters (
    item_id, item_name, item_type, equip_slot, required_class_id, quality,
    attack_bonus, defense_bonus, hp_bonus, mp_bonus,
    upgrade_gold_base, upgrade_attack_step, upgrade_defense_step, upgrade_hp_step, upgrade_mp_step,
    image_url, description, is_active
) VALUES
    ('slime-gel', 'Slime Gel', 'MATERIAL', NULL, NULL, 'NORMAL', 0, 0, 0, 0, 0, 0, 0, 0, 0, '/items/slime-gel.png', '끈적한 슬라임 부산물', 1),
    ('minor-potion', 'Minor Potion', 'CONSUMABLE', NULL, NULL, 'NORMAL', 0, 0, 0, 0, 0, 0, 0, 0, 0, '/items/minor-potion.png', '소량의 HP/MP 회복 물약', 1),
    ('goblin-coin', 'Goblin Coin', 'MATERIAL', NULL, NULL, 'NORMAL', 0, 0, 0, 0, 0, 0, 0, 0, 0, '/items/goblin-coin.png', '고블린 왕국 화폐', 1),
    ('bone-fragment', 'Bone Fragment', 'MATERIAL', NULL, NULL, 'NORMAL', 0, 0, 0, 0, 0, 0, 0, 0, 0, '/items/bone-fragment.png', '고대 뼈 조각', 1),
    ('ancient-core', 'Ancient Core', 'MATERIAL', NULL, NULL, 'RARE', 0, 0, 0, 0, 0, 0, 0, 0, 0, '/items/ancient-core.png', '고대 에너지가 담긴 코어', 1),
    ('rusty-dagger', 'Rusty Dagger', 'EQUIPMENT', 'weapon', 'ranger', 'RARE', 6, 0, 0, 0, 150, 2, 0, 0, 0, '/items/rusty-dagger.png', '녹슨 단검', 1),
    ('iron-helm', 'Iron Helm', 'EQUIPMENT', 'armor', 'knight', 'EPIC', 0, 3, 70, 0, 150, 0, 1, 12, 0, '/items/iron-helm.png', '철제 투구', 1),
    ('hunter-ring', 'Hunter Ring', 'EQUIPMENT', 'accessory', 'ranger', 'LEGEND', 6, 0, 0, 35, 150, 2, 0, 0, 10, '/items/hunter-ring.png', '헌터의 반지', 1),
    ('flame-sword', 'Flame Sword', 'EQUIPMENT', 'weapon', 'knight', 'LEGEND', 14, 0, 0, 0, 150, 3, 0, 0, 0, '/items/flame-sword.png', '불꽃의 검', 1),
    ('guardian-charm', 'Guardian Charm', 'EQUIPMENT', 'accessory', 'mage', 'EPIC', 0, 5, 20, 0, 150, 0, 1, 8, 0, '/items/guardian-charm.png', '수호 부적', 1)
ON DUPLICATE KEY UPDATE
    item_name = VALUES(item_name),
    item_type = VALUES(item_type),
    equip_slot = VALUES(equip_slot),
    required_class_id = VALUES(required_class_id),
    quality = VALUES(quality),
    attack_bonus = VALUES(attack_bonus),
    defense_bonus = VALUES(defense_bonus),
    hp_bonus = VALUES(hp_bonus),
    mp_bonus = VALUES(mp_bonus),
    upgrade_gold_base = VALUES(upgrade_gold_base),
    upgrade_attack_step = VALUES(upgrade_attack_step),
    upgrade_defense_step = VALUES(upgrade_defense_step),
    upgrade_hp_step = VALUES(upgrade_hp_step),
    upgrade_mp_step = VALUES(upgrade_mp_step),
    image_url = VALUES(image_url),
    description = VALUES(description),
    is_active = VALUES(is_active);

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

INSERT INTO monster_drop_tables (
    monster_id, item_id, drop_chance, min_quantity, max_quantity, is_equipment_drop
) VALUES
    ('slime-green', 'slime-gel', 0.70000, 1, 1, 0),
    ('slime-green', 'minor-potion', 0.20000, 1, 1, 0),
    ('goblin-guard', 'goblin-coin', 0.65000, 1, 1, 0),
    ('goblin-guard', 'rusty-dagger', 0.15000, 1, 1, 1),
    ('goblin-guard', 'iron-helm', 0.08000, 1, 1, 1),
    ('skeleton-warrior', 'bone-fragment', 0.80000, 1, 1, 0),
    ('skeleton-warrior', 'ancient-core', 0.12000, 1, 1, 0),
    ('skeleton-warrior', 'hunter-ring', 0.07000, 1, 1, 1),
    ('skeleton-warrior', 'flame-sword', 0.04000, 1, 1, 1),
    ('skeleton-warrior', 'guardian-charm', 0.05000, 1, 1, 1)
ON DUPLICATE KEY UPDATE
    drop_chance = VALUES(drop_chance),
    min_quantity = VALUES(min_quantity),
    max_quantity = VALUES(max_quantity),
    is_equipment_drop = VALUES(is_equipment_drop);

INSERT INTO companion_masters (
    companion_id, companion_name, grade, class_id,
    base_attack, base_defense, base_hp, base_mp,
    image_url, recruit_weight, is_active
) VALUES
    ('knight-s1', 'Iron Shield', 'COMMON', 'knight', 6, 5, 55, 8, '/companions/knight-s1.png', 120, 1),
    ('knight-s2', 'Stone Guard', 'COMMON', 'knight', 7, 6, 60, 6, '/companions/knight-s2.png', 120, 1),
    ('knight-s3', 'Royal Spear', 'RARE', 'knight', 11, 8, 85, 10, '/companions/knight-s3.png', 90, 1),
    ('knight-s4', 'Bastion', 'RARE', 'knight', 12, 9, 95, 12, '/companions/knight-s4.png', 85, 1),
    ('knight-s5', 'Crimson Aegis', 'EPIC', 'knight', 18, 12, 130, 16, '/companions/knight-s5.png', 50, 1),
    ('knight-s6', 'Paladin Rex', 'LEGEND', 'knight', 26, 16, 185, 22, '/companions/knight-s6.png', 20, 1),
    ('mage-s1', 'Spark Adept', 'COMMON', 'mage', 8, 3, 42, 20, '/companions/mage-s1.png', 120, 1),
    ('mage-s2', 'Rune Student', 'COMMON', 'mage', 9, 3, 45, 24, '/companions/mage-s2.png', 120, 1),
    ('mage-s3', 'Arc Scholar', 'RARE', 'mage', 13, 4, 62, 30, '/companions/mage-s3.png', 90, 1),
    ('mage-s4', 'Aether Witch', 'RARE', 'mage', 14, 5, 66, 34, '/companions/mage-s4.png', 85, 1),
    ('mage-s5', 'Storm Oracle', 'EPIC', 'mage', 21, 6, 92, 48, '/companions/mage-s5.png', 50, 1),
    ('mage-s6', 'Void Empress', 'LEGEND', 'mage', 30, 8, 128, 64, '/companions/mage-s6.png', 20, 1),
    ('ranger-s1', 'Forest Scout', 'COMMON', 'ranger', 8, 4, 46, 14, '/companions/ranger-s1.png', 120, 1),
    ('ranger-s2', 'Longbow Kid', 'COMMON', 'ranger', 9, 4, 50, 16, '/companions/ranger-s2.png', 120, 1),
    ('ranger-s3', 'Hawk Archer', 'RARE', 'ranger', 14, 6, 72, 22, '/companions/ranger-s3.png', 90, 1),
    ('ranger-s4', 'Wind Sniper', 'RARE', 'ranger', 15, 6, 76, 24, '/companions/ranger-s4.png', 85, 1),
    ('ranger-s5', 'Moon Ranger', 'EPIC', 'ranger', 22, 8, 104, 30, '/companions/ranger-s5.png', 50, 1),
    ('ranger-s6', 'Sky Hunter', 'LEGEND', 'ranger', 32, 10, 146, 40, '/companions/ranger-s6.png', 20, 1),
    ('hybrid-s1', 'Mercenary Ace', 'EPIC', 'knight', 20, 10, 110, 20, '/companions/hybrid-s1.png', 45, 1),
    ('hybrid-s2', 'Myth Twin', 'LEGEND', 'mage', 34, 12, 160, 58, '/companions/hybrid-s2.png', 18, 1)
ON DUPLICATE KEY UPDATE
    companion_name = VALUES(companion_name),
    grade = VALUES(grade),
    class_id = VALUES(class_id),
    base_attack = VALUES(base_attack),
    base_defense = VALUES(base_defense),
    base_hp = VALUES(base_hp),
    base_mp = VALUES(base_mp),
    image_url = VALUES(image_url),
    recruit_weight = VALUES(recruit_weight),
    is_active = VALUES(is_active);

SET FOREIGN_KEY_CHECKS = 1;
