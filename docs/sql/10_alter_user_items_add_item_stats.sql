-- Extend user_items with quality/stat columns for equipment items

ALTER TABLE user_items
    ADD COLUMN quality VARCHAR(20) NOT NULL DEFAULT 'NORMAL' AFTER upgrade_level,
    ADD COLUMN attack_bonus INT NOT NULL DEFAULT 0 AFTER quality,
    ADD COLUMN defense_bonus INT NOT NULL DEFAULT 0 AFTER attack_bonus,
    ADD COLUMN hp_bonus INT NOT NULL DEFAULT 0 AFTER defense_bonus,
    ADD COLUMN mp_bonus INT NOT NULL DEFAULT 0 AFTER hp_bonus;
