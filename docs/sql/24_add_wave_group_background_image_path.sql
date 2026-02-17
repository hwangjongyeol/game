-- 24. Add background image path for wave group scaling

ALTER TABLE wave_group_scalings
    ADD COLUMN background_image_path VARCHAR(255) NULL AFTER reward_gem_multiplier;

UPDATE wave_group_scalings
SET background_image_path = CASE wave_group_no
    WHEN 1 THEN '/dungeons/dungeon-1.png'
    WHEN 2 THEN '/dungeons/dungeon-2.png'
    WHEN 3 THEN '/dungeons/dungeon-3.png'
    WHEN 4 THEN '/dungeons/dungeon-4.png'
    ELSE background_image_path
END
WHERE dungeon_id = 'dungeon1';
