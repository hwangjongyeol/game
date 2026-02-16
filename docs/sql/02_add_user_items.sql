-- Add user inventory table

CREATE TABLE user_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    item_id VARCHAR(80) NOT NULL,
    item_name VARCHAR(120) NOT NULL,
    quantity BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_items_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_user_items_user_item UNIQUE (user_id, item_id)
);

CREATE INDEX idx_user_items_user ON user_items (user_id);
CREATE INDEX idx_user_items_item ON user_items (item_id);
