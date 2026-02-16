-- Item master + monster drop table
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS item_masters (
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

CREATE TABLE IF NOT EXISTS monster_drop_tables (
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
    CONSTRAINT uk_monster_item UNIQUE (monster_id, item_id)
);

CREATE INDEX idx_item_masters_type_active ON item_masters (item_type, is_active);
CREATE INDEX idx_monster_drop_monster ON monster_drop_tables (monster_id);
CREATE INDEX idx_monster_drop_item ON monster_drop_tables (item_id);

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
