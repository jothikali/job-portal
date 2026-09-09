-- ─── Feature migrations v2 ────────────────────────────────────────────────────
-- Run once against your MySQL database (Aiven or local)

-- 1. Job Alerts — candidates subscribe to keywords/categories
CREATE TABLE IF NOT EXISTS job_alerts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    keyword     VARCHAR(255) NOT NULL,
    category    VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_alert (user_id, keyword)
);

-- 2. Withdrawal reason on applications
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS withdrawal_reason VARCHAR(255) NULL DEFAULT NULL;

-- 3. Job expiry — closing date on jobs
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS closing_date DATE NULL DEFAULT NULL;

-- 4. Bell notifications for candidates
CREATE TABLE IF NOT EXISTS notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    message     VARCHAR(500) NOT NULL,
    job_id      INT,
    is_read     TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_unread (user_id, is_read)
);
