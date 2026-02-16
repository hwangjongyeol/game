-- Add item upgrade level column

ALTER TABLE user_items
    ADD COLUMN upgrade_level INT NOT NULL DEFAULT 0 AFTER quantity;
