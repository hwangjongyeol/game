-- Add class restriction column for equipment items.
-- Safe to re-run.

SET @sql = (
    SELECT IF(
        EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'item_masters'
              AND column_name = 'required_class_id'
        ),
        'SELECT 1',
        'ALTER TABLE item_masters ADD COLUMN required_class_id VARCHAR(20) NULL AFTER equip_slot'
    )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Example class restrictions for existing equipment rows
UPDATE item_masters SET required_class_id = 'knight' WHERE item_id IN ('flame-sword', 'iron-helm');
UPDATE item_masters SET required_class_id = 'ranger' WHERE item_id IN ('rusty-dagger', 'hunter-ring');
UPDATE item_masters SET required_class_id = 'mage' WHERE item_id IN ('guardian-charm');
