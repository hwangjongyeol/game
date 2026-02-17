-- 23. Seed wave_settings for 100 pattern waves (1-1 ~ 10-10), 3 monster slots each
-- Prerequisite:
--   - 21_alter_wave_settings_add_slot_and_group_scalings.sql
--   - 22_seed_bulk_monsters_items_and_wave_groups.sql (bulk-monster-001~100)

DROP TEMPORARY TABLE IF EXISTS tmp_wave_no_100;
CREATE TEMPORARY TABLE tmp_wave_no_100 (
    wave_no INT PRIMARY KEY
);

INSERT INTO tmp_wave_no_100 (wave_no)
SELECT ones.n + (tens.n * 10) + 1 AS wave_no
FROM
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
     SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
     SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) tens
ORDER BY wave_no;

DROP TEMPORARY TABLE IF EXISTS tmp_slot_no_3;
CREATE TEMPORARY TABLE tmp_slot_no_3 (
    slot_no INT PRIMARY KEY
);

INSERT INTO tmp_slot_no_3 (slot_no) VALUES (1), (2), (3);

DELETE FROM wave_settings
WHERE dungeon_id = 'dungeon1'
  AND wave_no BETWEEN 1 AND 100;

INSERT INTO wave_settings (
    dungeon_id,
    wave_no,
    slot_no,
    monster_id,
    monster_count,
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
    w.wave_no,
    s.slot_no,
    CONCAT(
        'bulk-monster-',
        LPAD((((w.wave_no - 1) * 3 + s.slot_no - 1) % 100) + 1, 3, '0')
    ) AS monster_id,
    CASE
        WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 1 -- boss sub-wave
        ELSE CASE s.slot_no
            WHEN 1 THEN 2
            WHEN 2 THEN 2
            ELSE 1
        END
    END AS monster_count,
    ROUND(
        1.0000
        + ((w.wave_no - 1) * 0.0120)
        + ((s.slot_no - 1) * 0.0250)
        + CASE WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 0.2200 ELSE 0.0000 END
    , 4) AS hp_multiplier,
    ROUND(
        1.0000
        + ((w.wave_no - 1) * 0.0040)
        + ((s.slot_no - 1) * 0.0100)
        + CASE WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 0.0800 ELSE 0.0000 END
    , 4) AS mp_multiplier,
    ROUND(
        1.0000
        + ((w.wave_no - 1) * 0.0100)
        + ((s.slot_no - 1) * 0.0180)
        + CASE WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 0.1800 ELSE 0.0000 END
    , 4) AS attack_multiplier,
    ROUND(
        1.0000
        + ((w.wave_no - 1) * 0.0090)
        + ((s.slot_no - 1) * 0.0160)
        + CASE WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 0.1400 ELSE 0.0000 END
    , 4) AS defense_multiplier,
    ROUND(
        1.0000
        + ((w.wave_no - 1) * 0.0080)
        + ((s.slot_no - 1) * 0.0100)
        + CASE WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 0.1200 ELSE 0.0000 END
    , 4) AS reward_gold_multiplier,
    ROUND(
        1.0000
        + ((w.wave_no - 1) * 0.0030)
        + ((s.slot_no - 1) * 0.0060)
        + CASE WHEN ((w.wave_no - 1) % 10) + 1 = 10 THEN 0.0500 ELSE 0.0000 END
    , 4) AS reward_gem_multiplier,
    1 AS is_active
FROM tmp_wave_no_100 w
CROSS JOIN tmp_slot_no_3 s;

DROP TEMPORARY TABLE IF EXISTS tmp_slot_no_3;
DROP TEMPORARY TABLE IF EXISTS tmp_wave_no_100;
