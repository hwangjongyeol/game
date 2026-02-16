-- Add user equipment table

CREATE TABLE user_equipment (
    user_id BIGINT PRIMARY KEY,
    weapon_item_id VARCHAR(80) NULL,
    armor_item_id VARCHAR(80) NULL,
    accessory_item_id VARCHAR(80) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_equipment_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_user_equipment_weapon ON user_equipment (weapon_item_id);
CREATE INDEX idx_user_equipment_armor ON user_equipment (armor_item_id);
CREATE INDEX idx_user_equipment_accessory ON user_equipment (accessory_item_id);
