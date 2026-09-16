CREATE TABLE IF NOT EXISTS lms_assignments (
  id BINARY(16) PRIMARY KEY,
  course_id BINARY(16) NOT NULL,
  lecture_id BINARY(16) NULL,
  title VARCHAR(200) NOT NULL,
  instructions LONGTEXT,
  due_date DATETIME NULL,
  max_score INT NOT NULL DEFAULT 100,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assign_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lms_assignment_submissions (
  id BINARY(16) PRIMARY KEY,
  assignment_id BINARY(16) NOT NULL,
  user_id BINARY(16) NOT NULL,
  submitted_text LONGTEXT NULL,
  file_url VARCHAR(1000) NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  score INT NULL,
  feedback LONGTEXT NULL,
  graded_at DATETIME NULL,
  graded_by_admin_id BINARY(16) NULL,
  CONSTRAINT fk_sub_assign FOREIGN KEY (assignment_id) REFERENCES lms_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES lms_users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_assign_user (assignment_id, user_id)
);
