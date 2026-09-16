-- Udemy-style course metadata (additive)
ALTER TABLE lms_courses
    ADD COLUMN level VARCHAR(30) NULL,
    ADD COLUMN language VARCHAR(40) NULL DEFAULT 'English',
    ADD COLUMN thumbnail_url VARCHAR(1000) NULL,
    ADD COLUMN what_you_learn TEXT NULL,
    ADD COLUMN requirements TEXT NULL,
    ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN total_lectures INT NULL DEFAULT 0,
    ADD COLUMN total_duration_minutes INT NULL DEFAULT 0;
