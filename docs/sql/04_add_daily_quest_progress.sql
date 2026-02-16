-- Add daily quest progress table

CREATE TABLE daily_quest_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quest_date DATE NOT NULL,
    dungeon_kill_count INT NOT NULL DEFAULT 0,
    reward_claimed_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_quest_progress_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_daily_quest_user_date UNIQUE (user_id, quest_date)
);

CREATE INDEX idx_daily_quest_date ON daily_quest_progress (quest_date);
