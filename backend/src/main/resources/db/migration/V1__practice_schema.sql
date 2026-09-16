CREATE TABLE subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE topics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  subject_id BIGINT NOT NULL,
  CONSTRAINT fk_topic_subject FOREIGN KEY(subject_id) REFERENCES subjects(id)
);
CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(30) NOT NULL,
  subject_id BIGINT NOT NULL,
  topic_id BIGINT NOT NULL,
  subtopic VARCHAR(150),
  difficulty VARCHAR(20) NOT NULL,
  question_text LONGTEXT,
  code_content LONGTEXT,
  code_language VARCHAR(50),
  explanation LONGTEXT NOT NULL,
  marks DECIMAL(7,2) NOT NULL,
  negative_marks DECIMAL(7,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  version INT NOT NULL,
  created_by BIGINT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_question_subject FOREIGN KEY(subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_question_topic FOREIGN KEY(topic_id) REFERENCES topics(id),
  INDEX idx_question_status(status), INDEX idx_question_type(type), INDEX idx_question_topic(topic_id)
);
CREATE TABLE question_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_key VARCHAR(1) NOT NULL,
  option_text LONGTEXT NOT NULL,
  display_order INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  CONSTRAINT fk_option_question FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_question_option(question_id, option_key)
);
CREATE TABLE mock_tests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  test_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  subject_id BIGINT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  marks_per_question DECIMAL(7,2) NOT NULL,
  negative_marks DECIMAL(7,2) NOT NULL,
  pass_percentage INT NOT NULL,
  published BOOLEAN NOT NULL,
  instructions LONGTEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_test_subject FOREIGN KEY(subject_id) REFERENCES subjects(id)
);
CREATE TABLE mock_test_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mock_test_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  display_order INT NOT NULL,
  CONSTRAINT fk_mtq_test FOREIGN KEY(mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
  CONSTRAINT fk_mtq_question FOREIGN KEY(question_id) REFERENCES questions(id),
  UNIQUE KEY uk_test_question(mock_test_id, question_id)
);
CREATE TABLE test_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_code VARCHAR(60) NOT NULL UNIQUE,
  mock_test_id BIGINT NOT NULL,
  student_key VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  time_taken_seconds BIGINT NULL,
  score DECIMAL(10,2) NULL,
  max_score DECIMAL(10,2) NULL,
  percentage DECIMAL(6,2) NULL,
  correct_count INT NULL,
  incorrect_count INT NULL,
  unanswered_count INT NULL,
  CONSTRAINT fk_attempt_test FOREIGN KEY(mock_test_id) REFERENCES mock_tests(id)
);
CREATE TABLE attempt_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL,
  original_question_id BIGINT NOT NULL,
  question_order INT NOT NULL,
  question_type VARCHAR(30) NOT NULL,
  question_text LONGTEXT,
  code_content LONGTEXT,
  code_language VARCHAR(50),
  topic_name VARCHAR(120) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  marks DECIMAL(7,2) NOT NULL,
  negative_marks DECIMAL(7,2) NOT NULL,
  explanation LONGTEXT NOT NULL,
  CONSTRAINT fk_attempt_question_attempt FOREIGN KEY(attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE
);
CREATE TABLE attempt_question_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_question_id BIGINT NOT NULL,
  original_option_id BIGINT NOT NULL,
  option_key VARCHAR(1) NOT NULL,
  option_text LONGTEXT NOT NULL,
  display_order INT NOT NULL,
  CONSTRAINT fk_attempt_option_question FOREIGN KEY(attempt_question_id) REFERENCES attempt_questions(id) ON DELETE CASCADE
);
CREATE TABLE attempt_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL,
  attempt_question_id BIGINT NOT NULL,
  selected_option_id BIGINT NULL,
  selected_option_key VARCHAR(1) NULL,
  marked_for_review BOOLEAN NOT NULL,
  visited BOOLEAN NOT NULL,
  time_spent_seconds BIGINT NOT NULL,
  CONSTRAINT fk_answer_attempt FOREIGN KEY(attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_question FOREIGN KEY(attempt_question_id) REFERENCES attempt_questions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_attempt_answer(attempt_id, attempt_question_id)
);
