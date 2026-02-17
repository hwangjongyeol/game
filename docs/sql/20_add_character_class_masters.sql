-- 20. Add character class masters table (dynamic class management)

CREATE TABLE IF NOT EXISTS character_class_masters (
    class_id VARCHAR(20) PRIMARY KEY,
    class_name VARCHAR(60) NOT NULL,
    base_attack INT NOT NULL DEFAULT 20,
    base_defense INT NOT NULL DEFAULT 10,
    base_hp INT NOT NULL DEFAULT 200,
    base_mp INT NOT NULL DEFAULT 80,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_masters_active ON character_class_masters (is_active);

INSERT INTO character_class_masters (
    class_id, class_name, base_attack, base_defense, base_hp, base_mp, is_active
) VALUES
    ('knight', 'Knight', 26, 10, 240, 70, 1),
    ('mage', 'Mage', 30, 5, 180, 120, 1),
    ('ranger', 'Ranger', 28, 7, 210, 90, 1)
ON DUPLICATE KEY UPDATE
    class_name = VALUES(class_name),
    base_attack = VALUES(base_attack),
    base_defense = VALUES(base_defense),
    base_hp = VALUES(base_hp),
    base_mp = VALUES(base_mp),
    is_active = VALUES(is_active);
