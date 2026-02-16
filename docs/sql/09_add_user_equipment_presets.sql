-- Add user equipment presets table

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

CREATE INDEX idx_user_equipment_presets_user ON user_equipment_presets (user_id);
