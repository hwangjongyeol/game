-- Add dungeon progress table

CREATE TABLE user_dungeon_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    dungeon_id VARCHAR(40) NOT NULL,
    current_wave INT NOT NULL DEFAULT 1,
    max_unlocked_wave INT NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_dungeon_progress_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_user_dungeon UNIQUE (user_id, dungeon_id)
);

CREATE INDEX idx_user_dungeon_progress_wave ON user_dungeon_progress (dungeon_id, current_wave);
