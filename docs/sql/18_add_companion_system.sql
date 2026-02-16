-- Companion system
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS companion_masters (
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

CREATE TABLE IF NOT EXISTS user_companions (
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

CREATE INDEX idx_user_companions_user_slot ON user_companions (user_id, slot_no);
CREATE INDEX idx_companion_masters_active ON companion_masters (is_active);

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
