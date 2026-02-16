-- Add claimed mask for multi daily quest rewards (up to 64 quests)

ALTER TABLE daily_quest_progress
    ADD COLUMN claimed_mask BIGINT NOT NULL DEFAULT 0 AFTER stat_upgrade_count;
