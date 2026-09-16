ALTER TABLE lms_course_lectures
  ADD COLUMN content_type VARCHAR(30) NOT NULL DEFAULT 'VIDEO',
  ADD COLUMN content_url VARCHAR(1000) NULL,
  ADD COLUMN text_content LONGTEXT NULL,
  ADD COLUMN subtitle_url VARCHAR(1000) NULL,
  ADD COLUMN unlock_type VARCHAR(40) NOT NULL DEFAULT 'IMMEDIATE',
  ADD COLUMN unlock_value VARCHAR(64) NULL;

-- Backfill content_url from existing video_url
UPDATE lms_course_lectures SET content_url = video_url WHERE video_url IS NOT NULL AND (content_url IS NULL OR content_url = '');

CREATE TABLE IF NOT EXISTS lms_live_classes (
  id BINARY(16) PRIMARY KEY,
  course_id BINARY(16) NOT NULL,
  lecture_id BINARY(16) NULL,
  title VARCHAR(200) NOT NULL,
  scheduled_start DATETIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  meeting_url VARCHAR(1000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_live_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE,
  INDEX idx_live_start (scheduled_start)
);
