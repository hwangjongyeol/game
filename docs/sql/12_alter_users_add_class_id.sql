-- Persist character class per user

ALTER TABLE users
    ADD COLUMN class_id VARCHAR(20) NOT NULL DEFAULT 'knight' AFTER nickname;
