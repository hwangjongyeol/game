-- Add character stat table for upgrade system

CREATE TABLE user_character_stats (
    user_id BIGINT PRIMARY KEY,
    attack_value BIGINT NOT NULL DEFAULT 20,
    defense_value BIGINT NOT NULL DEFAULT 10,
    max_hp_value BIGINT NOT NULL DEFAULT 200,
    max_mp_value BIGINT NOT NULL DEFAULT 80,
    attack_level INT NOT NULL DEFAULT 1,
    defense_level INT NOT NULL DEFAULT 1,
    hp_level INT NOT NULL DEFAULT 1,
    mp_level INT NOT NULL DEFAULT 1,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_character_stats_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_user_character_stats_attack_level ON user_character_stats (attack_level);
CREATE INDEX idx_user_character_stats_defense_level ON user_character_stats (defense_level);
