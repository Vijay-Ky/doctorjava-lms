-- OAuth identity fields on users
ALTER TABLE lms_users
  ADD COLUMN auth_provider VARCHAR(30) NULL,
  ADD COLUMN provider_user_id VARCHAR(120) NULL,
  ADD COLUMN whatsapp_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN email_opt_in_marketing BOOLEAN NOT NULL DEFAULT TRUE;

-- Notifications
CREATE TABLE IF NOT EXISTS lms_notifications (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES lms_users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
);

-- Admin announcements (broadcast source)
CREATE TABLE IF NOT EXISTS lms_announcements (
  id BINARY(16) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  created_by BINARY(16),
  send_email BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enrollment access origin
ALTER TABLE lms_learning
  ADD COLUMN access_type VARCHAR(20) NOT NULL DEFAULT 'PAID',
  ADD COLUMN granted_by_admin_id BINARY(16) NULL,
  ADD COLUMN enrolled_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP;

-- Pending grants for emails not yet registered
CREATE TABLE IF NOT EXISTS lms_pending_course_grants (
  id BINARY(16) PRIMARY KEY,
  email VARCHAR(180) NOT NULL,
  course_id BINARY(16) NOT NULL,
  granted_by_admin_id BINARY(16),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pending_grant_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE,
  INDEX idx_pending_grant_email (email)
);
