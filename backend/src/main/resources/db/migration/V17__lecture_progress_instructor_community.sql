CREATE TABLE IF NOT EXISTS lms_lecture_progress (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  lecture_id BINARY(16) NOT NULL,
  course_id BINARY(16) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
  watched_seconds INT NULL,
  completed_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_lecture (user_id, lecture_id),
  INDEX idx_lp_course_user (course_id, user_id),
  INDEX idx_lp_lecture (lecture_id),
  CONSTRAINT fk_lp_user FOREIGN KEY (user_id) REFERENCES lms_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lp_lecture FOREIGN KEY (lecture_id) REFERENCES lms_course_lectures(id) ON DELETE CASCADE,
  CONSTRAINT fk_lp_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE
);

ALTER TABLE lms_courses
  ADD COLUMN instructor_user_id BINARY(16) NULL,
  ADD INDEX idx_courses_instructor (instructor_user_id);

CREATE TABLE IF NOT EXISTS lms_community_posts (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  course_id BINARY(16) NULL,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_community_created (created_at),
  INDEX idx_community_course (course_id),
  CONSTRAINT fk_comm_user FOREIGN KEY (user_id) REFERENCES lms_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lms_community_replies (
  id BINARY(16) PRIMARY KEY,
  post_id BINARY(16) NOT NULL,
  user_id BINARY(16) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reply_post FOREIGN KEY (post_id) REFERENCES lms_community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_user FOREIGN KEY (user_id) REFERENCES lms_users(id) ON DELETE CASCADE
);
