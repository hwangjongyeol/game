-- AutoGame initial schema

CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    login_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_accounts_login_id UNIQUE (login_id)
);

CREATE TABLE account_social_links (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_account_social_links_account FOREIGN KEY (account_id) REFERENCES accounts (id),
    CONSTRAINT uk_account_social_provider_user UNIQUE (provider, provider_user_id),
    CONSTRAINT uk_account_social_account_provider UNIQUE (account_id, provider)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_id VARCHAR(100) NOT NULL,
    account_id BIGINT NOT NULL,
    nickname VARCHAR(30) NOT NULL,
    class_id VARCHAR(20) NOT NULL DEFAULT 'knight',
    level INT NOT NULL DEFAULT 1,
    exp BIGINT NOT NULL DEFAULT 0,
    power_score BIGINT NOT NULL DEFAULT 0,
    last_logout_at DATETIME NULL,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_external_id UNIQUE (external_id),
    CONSTRAINT fk_users_account FOREIGN KEY (account_id) REFERENCES accounts (id)
);

CREATE INDEX idx_users_nickname ON users (nickname);
CREATE INDEX idx_users_account_deleted ON users (account_id, is_deleted);

CREATE TABLE wallets (
    user_id BIGINT PRIMARY KEY,
    gold BIGINT NOT NULL DEFAULT 0,
    gem BIGINT NOT NULL DEFAULT 0,
    energy INT NOT NULL DEFAULT 100,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE economy_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    currency_type VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    reason_code VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NULL,
    balance_after BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_economy_transactions_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_economy_user_created ON economy_transactions (user_id, created_at DESC);
CREATE INDEX idx_economy_reason_created ON economy_transactions (reason_code, created_at DESC);
CREATE INDEX idx_economy_currency_type ON economy_transactions (currency_type);

CREATE TABLE ranking_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    season_id VARCHAR(30) NOT NULL,
    user_id BIGINT NOT NULL,
    rank_no INT NOT NULL,
    score BIGINT NOT NULL,
    captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ranking_snapshots_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_ranking_season_rank ON ranking_snapshots (season_id, rank_no);
CREATE INDEX idx_ranking_user ON ranking_snapshots (user_id);
