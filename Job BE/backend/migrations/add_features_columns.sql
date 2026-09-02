-- ─── Migration: Add status_history + aptitude_score to applications ──────────
-- Run once against your MySQL database

-- 1. Status audit log column (JSON stored as TEXT for compatibility)
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS status_history TEXT NULL DEFAULT NULL;

-- 2. Aptitude score (already may exist — ADD IF NOT EXISTS is safe)
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS aptitude_score INT NULL DEFAULT NULL;

-- 3. Required skills column on jobs table (for skills match % calculation)
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS required_skills TEXT NULL DEFAULT NULL;

-- ─── Optional: seed required_skills for existing jobs ─────────────────────────
-- UPDATE jobs SET required_skills = 'React,JavaScript,CSS,HTML' WHERE id = 1;
-- UPDATE jobs SET required_skills = 'Node.js,Express,MySQL,REST API' WHERE id = 2;
