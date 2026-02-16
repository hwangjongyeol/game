-- Extend daily quest progress for multi-target quests

ALTER TABLE daily_quest_progress
    ADD COLUMN gold_earned BIGINT NOT NULL DEFAULT 0 AFTER dungeon_kill_count,
    ADD COLUMN stat_upgrade_count INT NOT NULL DEFAULT 0 AFTER gold_earned;

CREATE INDEX idx_daily_quest_gold_earned ON daily_quest_progress (gold_earned);
CREATE INDEX idx_daily_quest_upgrade_count ON daily_quest_progress (stat_upgrade_count);
