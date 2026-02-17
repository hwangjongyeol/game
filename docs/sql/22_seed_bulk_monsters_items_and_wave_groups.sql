-- 22. Bulk seed: 100 monsters + 100 equipment + 10 more wave group scalings
-- Prerequisite:
--   - 20_add_character_class_masters.sql
--   - 21_alter_wave_settings_add_slot_and_group_scalings.sql
-- Compatible with MySQL 5.7+/MariaDB (no CTE)

-- Build sequence 1..100
DROP TEMPORARY TABLE IF EXISTS tmp_seq_100;
CREATE TEMPORARY TABLE tmp_seq_100 (
    n INT PRIMARY KEY
);

INSERT INTO tmp_seq_100 (n)
SELECT ones.n + (tens.n * 10) + 1 AS n
FROM
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
     SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
     SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
ORDER BY n;

-- ---------------------------------------------------------------------------
-- A) monster_masters: 100 rows
-- ---------------------------------------------------------------------------
INSERT INTO monster_masters (
    monster_id,
    monster_name,
    max_hp,
    max_mp,
    attack,
    defense,
    reward_gold,
    reward_gem,
    reward_exp,
    reward_score,
    sprite_key,
    is_active
)
SELECT
    CONCAT('bulk-monster-', LPAD(n, 3, '0')) AS monster_id,
    CONCAT('Bulk Monster ', LPAD(n, 3, '0')) AS monster_name,
    180 + (n * 22) AS max_hp,
    40 + (n * 2) AS max_mp,
    16 + (n * 2) AS attack,
    5 + FLOOR(n / 3) AS defense,
    50 + (n * 6) AS reward_gold,
    FLOOR((n - 1) / 20) + 1 AS reward_gem,
    40 + (n * 5) AS reward_exp,
    15 + (n * 3) AS reward_score,
    CASE MOD(n, 3)
        WHEN 1 THEN 'slime'
        WHEN 2 THEN 'orc'
        ELSE 'dragon'
    END AS sprite_key,
    1 AS is_active
FROM tmp_seq_100
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

-- ---------------------------------------------------------------------------
-- B) item_masters: 100 EQUIPMENT rows
-- ---------------------------------------------------------------------------
INSERT INTO item_masters (
    item_id,
    item_name,
    item_type,
    equip_slot,
    required_class_id,
    quality,
    attack_bonus,
    defense_bonus,
    hp_bonus,
    mp_bonus,
    upgrade_gold_base,
    upgrade_attack_step,
    upgrade_defense_step,
    upgrade_hp_step,
    upgrade_mp_step,
    image_url,
    description,
    is_active
)
SELECT
    CONCAT('bulk-equip-', LPAD(n, 3, '0')) AS item_id,
    CONCAT('Bulk Equipment ', LPAD(n, 3, '0')) AS item_name,
    'EQUIPMENT' AS item_type,
    CASE MOD(n, 3)
        WHEN 1 THEN 'weapon'
        WHEN 2 THEN 'armor'
        ELSE 'accessory'
    END AS equip_slot,
    CASE MOD(n, 3)
        WHEN 1 THEN 'knight'
        WHEN 2 THEN 'mage'
        ELSE 'ranger'
    END AS required_class_id,
    CASE
        WHEN n <= 40 THEN 'NORMAL'
        WHEN n <= 70 THEN 'RARE'
        WHEN n <= 90 THEN 'EPIC'
        ELSE 'LEGEND'
    END AS quality,
    CASE
        WHEN MOD(n, 3) = 1 THEN 10 + FLOOR(n * 0.8)
        WHEN MOD(n, 3) = 2 THEN 2 + FLOOR(n * 0.15)
        ELSE 4 + FLOOR(n * 0.3)
    END AS attack_bonus,
    CASE
        WHEN MOD(n, 3) = 1 THEN 1 + FLOOR(n * 0.2)
        WHEN MOD(n, 3) = 2 THEN 8 + FLOOR(n * 0.7)
        ELSE 3 + FLOOR(n * 0.35)
    END AS defense_bonus,
    CASE
        WHEN MOD(n, 3) = 1 THEN 20 + (n * 2)
        WHEN MOD(n, 3) = 2 THEN 90 + (n * 7)
        ELSE 45 + (n * 4)
    END AS hp_bonus,
    CASE
        WHEN MOD(n, 3) = 1 THEN 8 + FLOOR(n * 0.4)
        WHEN MOD(n, 3) = 2 THEN 16 + FLOOR(n * 0.5)
        ELSE 40 + FLOOR(n * 1.4)
    END AS mp_bonus,
    180 + (n * 12) AS upgrade_gold_base,
    CASE WHEN MOD(n, 3) = 1 THEN 3 ELSE 1 END AS upgrade_attack_step,
    CASE WHEN MOD(n, 3) = 2 THEN 3 ELSE 1 END AS upgrade_defense_step,
    CASE WHEN MOD(n, 3) = 2 THEN 14 ELSE 6 END AS upgrade_hp_step,
    CASE WHEN MOD(n, 3) = 0 THEN 12 ELSE 5 END AS upgrade_mp_step,
    CONCAT('/items/bulk-equip-', LPAD(n, 3, '0'), '.png') AS image_url,
    CONCAT('Bulk generated equipment #', LPAD(n, 3, '0')) AS description,
    1 AS is_active
FROM tmp_seq_100
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

-- ---------------------------------------------------------------------------
-- C) wave_group_scalings: add 10 more groups (3~12)
-- ---------------------------------------------------------------------------
INSERT INTO wave_group_scalings (
    dungeon_id,
    wave_group_no,
    hp_multiplier,
    mp_multiplier,
    attack_multiplier,
    defense_multiplier,
    reward_gold_multiplier,
    reward_gem_multiplier,
    is_active
)
SELECT
    'dungeon1' AS dungeon_id,
    g.wave_group_no,
    ROUND(1.0 + ((g.wave_group_no - 1) * 0.08), 4) AS hp_multiplier,
    ROUND(1.0 + ((g.wave_group_no - 1) * 0.03), 4) AS mp_multiplier,
    ROUND(1.0 + ((g.wave_group_no - 1) * 0.07), 4) AS attack_multiplier,
    ROUND(1.0 + ((g.wave_group_no - 1) * 0.06), 4) AS defense_multiplier,
    ROUND(1.0 + ((g.wave_group_no - 1) * 0.05), 4) AS reward_gold_multiplier,
    ROUND(1.0 + ((g.wave_group_no - 1) * 0.03), 4) AS reward_gem_multiplier,
    1 AS is_active
FROM (
    SELECT 3 AS wave_group_no UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10 UNION ALL
    SELECT 11 UNION ALL
    SELECT 12
) g
ON DUPLICATE KEY UPDATE
    hp_multiplier = VALUES(hp_multiplier),
    mp_multiplier = VALUES(mp_multiplier),
    attack_multiplier = VALUES(attack_multiplier),
    defense_multiplier = VALUES(defense_multiplier),
    reward_gold_multiplier = VALUES(reward_gold_multiplier),
    reward_gem_multiplier = VALUES(reward_gem_multiplier),
    is_active = VALUES(is_active);

DROP TEMPORARY TABLE IF EXISTS tmp_seq_100;
