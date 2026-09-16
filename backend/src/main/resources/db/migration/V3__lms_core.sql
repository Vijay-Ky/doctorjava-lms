CREATE TABLE lms_users (
  id BINARY(16) PRIMARY KEY,
  username VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(40),
  role VARCHAR(30) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  dob VARCHAR(30),
  gender VARCHAR(30),
  location VARCHAR(150),
  profession VARCHAR(120),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  profile_image LONGBLOB,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NULL
);

CREATE TABLE lms_courses (
  course_id BINARY(16) PRIMARY KEY,
  course_name VARCHAR(200) NOT NULL,
  price INT NOT NULL DEFAULT 0,
  instructor VARCHAR(150),
  description TEXT,
  p_link VARCHAR(1000),
  y_link VARCHAR(1000)
);

CREATE TABLE lms_learning (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  course_id BINARY(16) NOT NULL,
  CONSTRAINT fk_lms_learning_user FOREIGN KEY(user_id) REFERENCES lms_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lms_learning_course FOREIGN KEY(course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE,
  UNIQUE KEY uk_lms_learning_user_course(user_id, course_id)
);

CREATE TABLE lms_progress (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  course_id BINARY(16) NOT NULL,
  played_time FLOAT NOT NULL DEFAULT 0,
  duration FLOAT NOT NULL DEFAULT 0,
  CONSTRAINT fk_lms_progress_user FOREIGN KEY(user_id) REFERENCES lms_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lms_progress_course FOREIGN KEY(course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE,
  UNIQUE KEY uk_lms_progress_user_course(user_id, course_id)
);

CREATE TABLE lms_assessments (
  id BINARY(16) PRIMARY KEY,
  course_id BINARY(16) NOT NULL,
  user_id BINARY(16) NOT NULL,
  marks INT NOT NULL,
  CONSTRAINT fk_lms_assessment_course FOREIGN KEY(course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE,
  CONSTRAINT fk_lms_assessment_user FOREIGN KEY(user_id) REFERENCES lms_users(id) ON DELETE CASCADE
);

CREATE TABLE lms_course_questions (
  id BINARY(16) PRIMARY KEY,
  question VARCHAR(2000) NOT NULL,
  option1 VARCHAR(1000) NOT NULL,
  option2 VARCHAR(1000) NOT NULL,
  option3 VARCHAR(1000) NOT NULL,
  option4 VARCHAR(1000) NOT NULL,
  answer VARCHAR(1000) NOT NULL,
  course_id BINARY(16) NOT NULL,
  CONSTRAINT fk_lms_question_course FOREIGN KEY(course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE
);

CREATE TABLE lms_discussions (
  id BINARY(16) PRIMARY KEY,
  course_id BINARY(16) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  time DATETIME NOT NULL,
  CONSTRAINT fk_lms_discussion_course FOREIGN KEY(course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE
);

CREATE TABLE lms_feedbacks (
  id BINARY(16) PRIMARY KEY,
  course_id BINARY(16) NOT NULL,
  comment TEXT NOT NULL,
  CONSTRAINT fk_lms_feedback_course FOREIGN KEY(course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE
);
