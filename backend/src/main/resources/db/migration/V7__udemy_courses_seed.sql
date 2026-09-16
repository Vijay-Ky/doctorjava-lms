-- V7: Udemy-style seed — extra courses, curriculum, 100 MCQs, mock tests

CREATE TABLE IF NOT EXISTS lms_course_sections (
  id BINARY(16) PRIMARY KEY,
  course_id BINARY(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lms_course_lectures (
  id BINARY(16) PRIMARY KEY,
  section_id BINARY(16) NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 5,
  video_url VARCHAR(500),
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_lecture_section FOREIGN KEY (section_id) REFERENCES lms_course_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'Complete Java Masterclass 2026', 2999, 'Doctor Java Technologies', 'Learn Core Java from scratch to advanced — OOP, Collections, Multithreading, Streams and interview patterns.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=eIrMbAQSU34'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='Complete Java Masterclass 2026');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'Spring Boot REST API Developer', 3499, 'Doctor Java Technologies', 'Build production REST APIs with Spring Boot, JPA, Validation, Security basics and Postman testing.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=9SGDpanrc8U'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='Spring Boot REST API Developer');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'Java Full Stack with React', 4999, 'Doctor Java Technologies', 'End-to-end full stack: Java, Spring Boot backend + React frontend + MySQL deployment mindset.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=Golyizv9W8q'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='Java Full Stack with React');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'SQL for Developers', 1499, 'Doctor Java Technologies', 'Master SELECT, JOINs, aggregation, indexes and interview SQL problems with practical examples.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=HXV3zeQKqGY'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='SQL for Developers');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'React.js Fundamentals', 1999, 'Doctor Java Technologies', 'Components, hooks, state, effects and building interactive UIs with modern React.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=bMknfKXIFA8'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='React.js Fundamentals');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'Java Placement Crash Course', 2499, 'Doctor Java Technologies', 'Focused prep for coding rounds, Java MCQs, and core CS topics for campus and lateral hiring.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=UmnCZFKIaUw'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='Java Placement Crash Course');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'Spring Security & JWT', 2799, 'Doctor Java Technologies', 'Secure APIs with Spring Security, JWT authentication, roles and protected routes.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=oZUb372z6h8'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='Spring Security & JWT');

INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
SELECT UUID_TO_BIN(UUID()), 'Microservices with Spring Cloud', 3999, 'Doctor Java Technologies', 'Service discovery, API gateway concepts, inter-service communication and cloud-ready design.', 'https://www.doctorjava.tech', 'https://www.youtube.com/watch?v=y8IuEYJaXZc'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM lms_courses WHERE course_name='Microservices with Spring Cloud');

-- section 0 for Complete Java Masterclass 2026
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for Complete Java Masterclass 2026
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for Complete Java Masterclass 2026
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for Complete Java Masterclass 2026
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for Spring Boot REST API Developer
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for Spring Boot REST API Developer
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for Spring Boot REST API Developer
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for Spring Boot REST API Developer
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for Java Full Stack with React
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for Java Full Stack with React
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for Java Full Stack with React
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for Java Full Stack with React
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for SQL for Developers
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for SQL for Developers
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for SQL for Developers
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for SQL for Developers
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for React.js Fundamentals
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for React.js Fundamentals
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for React.js Fundamentals
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for React.js Fundamentals
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for Java Placement Crash Course
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for Java Placement Crash Course
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for Java Placement Crash Course
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for Java Placement Crash Course
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for Spring Security & JWT
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for Spring Security & JWT
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for Spring Security & JWT
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for Spring Security & JWT
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

-- section 0 for Microservices with Spring Cloud
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Getting Started', 0
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Getting Started');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Welcome & course overview', 8, c.y_link, TRUE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Welcome & course overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'How to use this course', 11, c.y_link, TRUE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='How to use this course');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Setup development environment', 14, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Setup development environment');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Project structure walkthrough', 17, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Getting Started'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Project structure walkthrough');

-- section 1 for Microservices with Spring Cloud
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Core Concepts', 1
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Core Concepts');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Foundations', 9, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Foundations');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Hands-on demo', 12, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Hands-on demo');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Common pitfalls', 15, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Common pitfalls');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Quiz checkpoint', 18, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Core Concepts'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Quiz checkpoint');

-- section 2 for Microservices with Spring Cloud
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Intermediate', 2
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Intermediate');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Real-world patterns', 10, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Real-world patterns');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 1', 13, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 1');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Mini project part 2', 16, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Mini project part 2');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Code review tips', 19, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Intermediate'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Code review tips');

-- section 3 for Microservices with Spring Cloud
INSERT INTO lms_course_sections(id, course_id, title, sort_order)
SELECT UUID_TO_BIN(UUID()), c.course_id, 'Advanced & Projects', 3
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_sections s WHERE s.course_id=c.course_id AND s.title='Advanced & Projects');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Capstone overview', 11, c.y_link, FALSE, 0
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Capstone overview');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Build the feature', 14, c.y_link, FALSE, 1
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Build the feature');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Testing strategy', 17, c.y_link, FALSE, 2
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Testing strategy');

INSERT INTO lms_course_lectures(id, section_id, title, duration_minutes, video_url, is_preview, sort_order)
SELECT UUID_TO_BIN(UUID()), s.id, 'Deploy & next steps', 20, c.y_link, FALSE, 3
FROM lms_courses c JOIN lms_course_sections s ON s.course_id=c.course_id AND s.title='Advanced & Projects'
WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_lectures l WHERE l.section_id=s.id AND l.title='Deploy & next steps');

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which keyword is used to inherit a class in Java?', 'extends', 'implements', 'inherits', 'super', 'extends', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which keyword is used to inherit a class in Java?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'What is the size of int in Java?', '2 bytes', '4 bytes', '8 bytes', 'Depends on OS', '4 bytes', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='What is the size of int in Java?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which collection does not allow duplicates?', 'ArrayList', 'LinkedList', 'HashSet', 'Vector', 'HashSet', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which collection does not allow duplicates?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Default value of boolean in Java?', 'true', 'false', 'null', '0', 'false', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Default value of boolean in Java?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which method is entry point of a Java program?', 'start()', 'main()', 'run()', 'init()', 'main()', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which method is entry point of a Java program?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'String in Java is?', 'mutable', 'immutable', 'primitive', 'interface', 'immutable', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='String in Java is?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which access modifier is most restrictive?', 'public', 'protected', 'private', 'default', 'private', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which access modifier is most restrictive?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Interface methods in Java are by default?', 'private', 'protected', 'public abstract', 'final', 'public abstract', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Interface methods in Java are by default?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which exception is checked?', 'NullPointerException', 'IOException', 'ArithmeticException', 'ArrayIndexOutOfBoundsException', 'IOException', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which exception is checked?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'HashMap allows how many null keys?', '0', '1', 'Many', 'None of these', '1', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='HashMap allows how many null keys?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'What does JVM stand for?', 'Java Variable Machine', 'Java Virtual Machine', 'Java Verified Module', 'Joint Virtual Method', 'Java Virtual Machine', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='What does JVM stand for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which loop is guaranteed to execute at least once?', 'for', 'while', 'do-while', 'foreach', 'do-while', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which loop is guaranteed to execute at least once?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'super keyword is used to?', 'Call parent constructor', 'Create object', 'Delete object', 'Import package', 'Call parent constructor', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='super keyword is used to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Array index starts from?', '1', '0', '-1', 'Depends', '0', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Array index starts from?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which is not a Java feature?', 'Object-oriented', 'Platform independent', 'Pointer arithmetic', 'Robust', 'Pointer arithmetic', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which is not a Java feature?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'final class cannot be?', 'Instantiated', 'Extended', 'Imported', 'Serialized', 'Extended', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='final class cannot be?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which package contains Scanner?', 'java.io', 'java.util', 'java.lang', 'java.net', 'java.util', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which package contains Scanner?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Autoboxing converts?', 'Object to primitive', 'Primitive to object', 'String to int', 'Array to List', 'Primitive to object', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Autoboxing converts?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which is thread-safe?', 'ArrayList', 'HashMap', 'Vector', 'LinkedList', 'Vector', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which is thread-safe?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'equals() is defined in?', 'Object', 'String', 'Comparable', 'System', 'Object', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='equals() is defined in?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which keyword prevents method overriding?', 'static', 'final', 'abstract', 'native', 'final', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which keyword prevents method overriding?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Garbage collection is controlled by?', 'Programmer', 'JVM', 'OS', 'Compiler', 'JVM', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Garbage collection is controlled by?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'What is polymorphism?', 'Many forms', 'Single form', 'No form', 'Data hiding', 'Many forms', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='What is polymorphism?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Abstract class can have?', 'Only abstract methods', 'Only concrete methods', 'Both', 'Neither', 'Both', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Abstract class can have?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which operator is used for instanceof?', 'instanceof', 'typeof', 'is', 'isa', 'instanceof', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which operator is used for instanceof?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Default capacity of ArrayList?', '5', '10', '16', '0', '10', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Default capacity of ArrayList?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which map maintains insertion order?', 'HashMap', 'TreeMap', 'LinkedHashMap', 'Hashtable', 'LinkedHashMap', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which map maintains insertion order?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Runnable has how many methods?', '0', '1', '2', '3', '1', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Runnable has how many methods?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Checked exceptions must be?', 'Ignored', 'Handled or declared', 'Runtime only', 'Never thrown', 'Handled or declared', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Checked exceptions must be?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'StringBuilder is?', 'Synchronized', 'Not synchronized', 'Immutable', 'Interface', 'Not synchronized', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='StringBuilder is?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which is valid identifier?', '2var', '_var', 'var-name', 'class', '_var', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which is valid identifier?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'byte range is?', '-128 to 127', '0 to 255', '-256 to 255', '0 to 127', '-128 to 127', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='byte range is?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'What is encapsulation?', 'Binding data and methods', 'Inheritance', 'Multiple forms', 'Abstraction only', 'Binding data and methods', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='What is encapsulation?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'this keyword refers to?', 'Current object', 'Parent object', 'Static context', 'Null', 'Current object', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='this keyword refers to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which collection is sorted?', 'HashSet', 'TreeSet', 'LinkedHashSet', 'ArrayList', 'TreeSet', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which collection is sorted?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'volatile keyword is related to?', 'Serialization', 'Multithreading visibility', 'Inheritance', 'Generics', 'Multithreading visibility', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='volatile keyword is related to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Java supports multiple inheritance of?', 'Classes', 'Interfaces', 'Both', 'Neither', 'Interfaces', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Java supports multiple inheritance of?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'What is marker interface?', 'Interface with methods', 'Interface with no methods', 'Abstract class', 'Enum', 'Interface with no methods', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='What is marker interface?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Optional was introduced in?', 'Java 7', 'Java 8', 'Java 9', 'Java 11', 'Java 8', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Optional was introduced in?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Stream API is in package?', 'java.io', 'java.util.stream', 'java.lang', 'java.net', 'java.util.stream', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Stream API is in package?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which annotation marks a Spring Boot application?', '@SpringBootApplication', '@EnableAutoConfiguration', '@Configuration', '@Component', '@SpringBootApplication', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which annotation marks a Spring Boot application?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@RestController is combination of?', '@Controller + @ResponseBody', '@Service + @Repository', '@Entity + @Table', '@Bean + @Component', '@Controller + @ResponseBody', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@RestController is combination of?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Default embedded server in Spring Boot?', 'Jetty', 'Tomcat', 'Undertow', 'Netty', 'Tomcat', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Default embedded server in Spring Boot?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Autowired is used for?', 'Injection', 'Serialization', 'Logging', 'Testing only', 'Injection', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Autowired is used for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'JPA stands for?', 'Java Persistence API', 'Java Package API', 'JSON Persistence API', 'Java Process API', 'Java Persistence API', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='JPA stands for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Entity maps to?', 'Table', 'Column', 'Database', 'Schema only', 'Table', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Entity maps to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@GetMapping handles?', 'POST', 'GET', 'PUT', 'DELETE', 'GET', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@GetMapping handles?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'application.properties is used for?', 'Configuration', 'Code generation', 'UI', 'Compilation', 'Configuration', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='application.properties is used for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Transactional belongs to?', 'Spring TX', 'Spring Web', 'Spring Security', 'Spring Batch', 'Spring TX', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Transactional belongs to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which starter for web apps?', 'spring-boot-starter-web', 'spring-boot-starter-data', 'spring-boot-starter-test', 'spring-boot-starter-mail', 'spring-boot-starter-web', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which starter for web apps?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@PathVariable extracts?', 'Query params', 'Path segments', 'Headers', 'Body', 'Path segments', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@PathVariable extracts?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@RequestBody binds?', 'JSON body to object', 'Path to string', 'Header to map', 'Cookie', 'JSON body to object', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@RequestBody binds?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Spring Security default login form?', 'Yes in older setups', 'Never', 'Only OAuth', 'Only JWT', 'Yes in older setups', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Spring Security default login form?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Repository is stereotype for?', 'DAO/persistence', 'Controller', 'Config', 'View', 'DAO/persistence', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Repository is stereotype for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Flyway is used for?', 'DB migrations', 'Caching', 'Messaging', 'UI', 'DB migrations', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Flyway is used for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Scheduled enables?', 'Cron jobs', 'REST', 'JPA', 'Security', 'Cron jobs', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Scheduled enables?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'ResponseEntity is used to?', 'Return HTTP status + body', 'Connect DB', 'Parse XML', 'Log', 'Return HTTP status + body', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='ResponseEntity is used to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Valid triggers?', 'Bean validation', 'Security', 'Cache', 'Async', 'Bean validation', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Valid triggers?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Microservices often use?', 'Monolith only', 'API Gateway', 'No network', 'Single DB mandatory', 'API Gateway', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Microservices often use?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@FeignClient is for?', 'Declarative REST client', 'JPA', 'Security filter', 'Thymeleaf', 'Declarative REST client', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@FeignClient is for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Actuator provides?', 'Production metrics/endpoints', 'UI themes', 'Compiler', 'ORM only', 'Production metrics/endpoints', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Actuator provides?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Profile selects?', 'Environment config', 'Database vendor only', 'Port', 'Theme', 'Environment config', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Profile selects?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'DTO is used to?', 'Transfer data between layers', 'Replace Entity always', 'Store in DB only', 'Compile code', 'Transfer data between layers', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='DTO is used to?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), '@Query is from?', 'Spring Data JPA', 'Spring MVC', 'Spring Security', 'Spring Cloud', 'Spring Data JPA', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='@Query is from?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'CORS is configured for?', 'Cross-origin requests', 'SQL injection', 'Logging', 'Build', 'Cross-origin requests', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='CORS is configured for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'SQL stands for?', 'Structured Query Language', 'Simple Query Language', 'Standard Question Language', 'Server Query List', 'Structured Query Language', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='SQL stands for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which clause filters rows?', 'WHERE', 'HAVING', 'GROUP BY', 'ORDER BY', 'WHERE', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which clause filters rows?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which clause filters groups?', 'WHERE', 'HAVING', 'JOIN', 'SELECT', 'HAVING', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which clause filters groups?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'PRIMARY KEY implies?', 'Unique + not null', 'Only unique', 'Only not null', 'Foreign key', 'Unique + not null', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='PRIMARY KEY implies?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'INNER JOIN returns?', 'Matching rows', 'All left rows', 'All right rows', 'Cartesian only', 'Matching rows', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='INNER JOIN returns?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'LEFT JOIN returns?', 'All left + matching right', 'Only matches', 'All right', 'None', 'All left + matching right', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='LEFT JOIN returns?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'COUNT(*) counts?', 'All rows', 'Non-null only', 'Distinct only', 'Columns', 'All rows', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='COUNT(*) counts?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which is aggregate?', 'SUM', 'WHERE', 'JOIN', 'AS', 'SUM', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Which is aggregate?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'DELETE without WHERE?', 'Deletes all rows', 'Error', 'Deletes one', 'Truncates schema', 'Deletes all rows', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='DELETE without WHERE?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'INDEX improves?', 'Read performance', 'Always write speed', 'Security', 'Network', 'Read performance', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='INDEX improves?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'FOREIGN KEY references?', 'Another table key', 'Index only', 'View', 'Trigger', 'Another table key', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='FOREIGN KEY references?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'NORMALIZATION reduces?', 'Redundancy', 'Security', 'Speed always', 'Backups', 'Redundancy', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='NORMALIZATION reduces?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'UNION requires?', 'Same columns count/types', 'Same table', 'Primary key', 'Index', 'Same columns count/types', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='UNION requires?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'TRUNCATE is?', 'DDL (mostly)', 'Always DML', 'DCL', 'TCL only', 'DDL (mostly)', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='TRUNCATE is?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'NULL means?', 'Unknown/missing', '0', 'Empty string', 'False', 'Unknown/missing', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='NULL means?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'ORDER BY default?', 'ASC', 'DESC', 'Random', 'None', 'ASC', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='ORDER BY default?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'DISTINCT removes?', 'Duplicate rows', 'Nulls', 'Indexes', 'Joins', 'Duplicate rows', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='DISTINCT removes?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'BETWEEN is inclusive?', 'Yes for boundaries', 'No', 'Only left', 'Only right', 'Yes for boundaries', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='BETWEEN is inclusive?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'LIKE ''%a'' matches?', 'Ends with a', 'Starts with a', 'Contains only a', 'Exactly a', 'Ends with a', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='LIKE ''%a'' matches?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'COMMIT does?', 'Save transaction', 'Undo', 'Lock table forever', 'Drop DB', 'Save transaction', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='COMMIT does?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'React is a?', 'UI library', 'Database', 'OS', 'Server', 'UI library', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='React is a?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Hooks were introduced in?', 'React 15', 'React 16.8', 'React 17', 'React 18', 'React 16.8', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Hooks were introduced in?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'useState returns?', 'State and setter', 'Only state', 'Only setter', 'Ref', 'State and setter', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='useState returns?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'useEffect runs?', 'After render by default', 'Before compile', 'Only once ever forced', 'On server only', 'After render by default', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='useEffect runs?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'JSX stands for?', 'JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'Java Server XML', 'JavaScript XML', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='JSX stands for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Keys help React with?', 'List reconciliation', 'Styling', 'Routing', 'API calls', 'List reconciliation', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Keys help React with?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Props are?', 'Read-only inputs', 'Mutable state', 'Global store', 'CSS only', 'Read-only inputs', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Props are?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Virtual DOM is?', 'In-memory UI representation', 'Real browser DOM only', 'Database', 'Network layer', 'In-memory UI representation', c.course_id
FROM lms_courses c WHERE c.course_name='React.js Fundamentals'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Virtual DOM is?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Next.js is for?', 'React framework', 'Database', 'JVM', 'Linux', 'React framework', c.course_id
FROM lms_courses c WHERE c.course_name='Java Placement Crash Course'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='Next.js is for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'HTTP 404 means?', 'Not Found', 'OK', 'Unauthorized', 'Server Error', 'Not Found', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Security & JWT'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='HTTP 404 means?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'HTTP 200 means?', 'OK', 'Created', 'Redirect', 'Error', 'OK', c.course_id
FROM lms_courses c WHERE c.course_name='Microservices with Spring Cloud'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='HTTP 200 means?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'REST uses?', 'Stateless HTTP APIs', 'Only SOAP', 'FTP only', 'SMTP', 'Stateless HTTP APIs', c.course_id
FROM lms_courses c WHERE c.course_name='Complete Java Masterclass 2026'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='REST uses?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'JSON is?', 'Data format', 'Database', 'Language', 'Protocol only', 'Data format', c.course_id
FROM lms_courses c WHERE c.course_name='Spring Boot REST API Developer'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='JSON is?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'CSS Flexbox is for?', 'Layout', 'Database', 'Auth', 'Build', 'Layout', c.course_id
FROM lms_courses c WHERE c.course_name='Java Full Stack with React'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='CSS Flexbox is for?' AND q.course_id=c.course_id);

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'npm is?', 'Package manager', 'Compiler', 'Browser', 'OS', 'Package manager', c.course_id
FROM lms_courses c WHERE c.course_name='SQL for Developers'
AND NOT EXISTS (SELECT 1 FROM lms_course_questions q WHERE q.question='npm is?' AND q.course_id=c.course_id);

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q001','TECHNICAL_MCQ',s.id,t.id,'EASY','Which keyword is used to inherit a class in Java?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q001') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','extends',1,true FROM questions q WHERE q.question_code='SEED-Q001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','implements',2,false FROM questions q WHERE q.question_code='SEED-Q001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','inherits',3,false FROM questions q WHERE q.question_code='SEED-Q001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','super',4,false FROM questions q WHERE q.question_code='SEED-Q001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q002','TECHNICAL_MCQ',s.id,t.id,'EASY','What is the size of int in Java?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q002') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','2 bytes',1,false FROM questions q WHERE q.question_code='SEED-Q002'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','4 bytes',2,true FROM questions q WHERE q.question_code='SEED-Q002'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','8 bytes',3,false FROM questions q WHERE q.question_code='SEED-Q002'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Depends on OS',4,false FROM questions q WHERE q.question_code='SEED-Q002'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q003','TECHNICAL_MCQ',s.id,t.id,'EASY','Which collection does not allow duplicates?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q003') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','ArrayList',1,false FROM questions q WHERE q.question_code='SEED-Q003'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','LinkedList',2,false FROM questions q WHERE q.question_code='SEED-Q003'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','HashSet',3,true FROM questions q WHERE q.question_code='SEED-Q003'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Vector',4,false FROM questions q WHERE q.question_code='SEED-Q003'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q004','TECHNICAL_MCQ',s.id,t.id,'EASY','Default value of boolean in Java?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q004') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','true',1,false FROM questions q WHERE q.question_code='SEED-Q004'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','false',2,true FROM questions q WHERE q.question_code='SEED-Q004'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','null',3,false FROM questions q WHERE q.question_code='SEED-Q004'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','0',4,false FROM questions q WHERE q.question_code='SEED-Q004'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q005','TECHNICAL_MCQ',s.id,t.id,'EASY','Which method is entry point of a Java program?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q005') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','start()',1,false FROM questions q WHERE q.question_code='SEED-Q005'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','main()',2,true FROM questions q WHERE q.question_code='SEED-Q005'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','run()',3,false FROM questions q WHERE q.question_code='SEED-Q005'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','init()',4,false FROM questions q WHERE q.question_code='SEED-Q005'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q006','TECHNICAL_MCQ',s.id,t.id,'EASY','String in Java is?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q006') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','mutable',1,false FROM questions q WHERE q.question_code='SEED-Q006'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','immutable',2,true FROM questions q WHERE q.question_code='SEED-Q006'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','primitive',3,false FROM questions q WHERE q.question_code='SEED-Q006'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','interface',4,false FROM questions q WHERE q.question_code='SEED-Q006'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q007','TECHNICAL_MCQ',s.id,t.id,'EASY','Which access modifier is most restrictive?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q007') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','public',1,false FROM questions q WHERE q.question_code='SEED-Q007'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','protected',2,false FROM questions q WHERE q.question_code='SEED-Q007'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','private',3,true FROM questions q WHERE q.question_code='SEED-Q007'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','default',4,false FROM questions q WHERE q.question_code='SEED-Q007'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q008','TECHNICAL_MCQ',s.id,t.id,'EASY','Interface methods in Java are by default?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q008') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','private',1,false FROM questions q WHERE q.question_code='SEED-Q008'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','protected',2,false FROM questions q WHERE q.question_code='SEED-Q008'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','public abstract',3,true FROM questions q WHERE q.question_code='SEED-Q008'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','final',4,false FROM questions q WHERE q.question_code='SEED-Q008'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q009','TECHNICAL_MCQ',s.id,t.id,'EASY','Which exception is checked?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q009') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','NullPointerException',1,false FROM questions q WHERE q.question_code='SEED-Q009'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','IOException',2,true FROM questions q WHERE q.question_code='SEED-Q009'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','ArithmeticException',3,false FROM questions q WHERE q.question_code='SEED-Q009'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','ArrayIndexOutOfBoundsException',4,false FROM questions q WHERE q.question_code='SEED-Q009'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q010','TECHNICAL_MCQ',s.id,t.id,'EASY','HashMap allows how many null keys?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q010') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','0',1,false FROM questions q WHERE q.question_code='SEED-Q010'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','1',2,true FROM questions q WHERE q.question_code='SEED-Q010'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Many',3,false FROM questions q WHERE q.question_code='SEED-Q010'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','None of these',4,false FROM questions q WHERE q.question_code='SEED-Q010'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q011','TECHNICAL_MCQ',s.id,t.id,'EASY','What does JVM stand for?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q011') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Java Variable Machine',1,false FROM questions q WHERE q.question_code='SEED-Q011'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Java Virtual Machine',2,true FROM questions q WHERE q.question_code='SEED-Q011'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Java Verified Module',3,false FROM questions q WHERE q.question_code='SEED-Q011'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Joint Virtual Method',4,false FROM questions q WHERE q.question_code='SEED-Q011'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q012','TECHNICAL_MCQ',s.id,t.id,'EASY','Which loop is guaranteed to execute at least once?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q012') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','for',1,false FROM questions q WHERE q.question_code='SEED-Q012'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','while',2,false FROM questions q WHERE q.question_code='SEED-Q012'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','do-while',3,true FROM questions q WHERE q.question_code='SEED-Q012'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','foreach',4,false FROM questions q WHERE q.question_code='SEED-Q012'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q013','TECHNICAL_MCQ',s.id,t.id,'EASY','super keyword is used to?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q013') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Call parent constructor',1,true FROM questions q WHERE q.question_code='SEED-Q013'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Create object',2,false FROM questions q WHERE q.question_code='SEED-Q013'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Delete object',3,false FROM questions q WHERE q.question_code='SEED-Q013'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Import package',4,false FROM questions q WHERE q.question_code='SEED-Q013'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q014','TECHNICAL_MCQ',s.id,t.id,'EASY','Array index starts from?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q014') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','1',1,false FROM questions q WHERE q.question_code='SEED-Q014'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','0',2,true FROM questions q WHERE q.question_code='SEED-Q014'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','-1',3,false FROM questions q WHERE q.question_code='SEED-Q014'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Depends',4,false FROM questions q WHERE q.question_code='SEED-Q014'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q015','TECHNICAL_MCQ',s.id,t.id,'EASY','Which is not a Java feature?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q015') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Object-oriented',1,false FROM questions q WHERE q.question_code='SEED-Q015'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Platform independent',2,false FROM questions q WHERE q.question_code='SEED-Q015'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Pointer arithmetic',3,true FROM questions q WHERE q.question_code='SEED-Q015'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Robust',4,false FROM questions q WHERE q.question_code='SEED-Q015'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q016','TECHNICAL_MCQ',s.id,t.id,'EASY','final class cannot be?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q016') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Instantiated',1,false FROM questions q WHERE q.question_code='SEED-Q016'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Extended',2,true FROM questions q WHERE q.question_code='SEED-Q016'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Imported',3,false FROM questions q WHERE q.question_code='SEED-Q016'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Serialized',4,false FROM questions q WHERE q.question_code='SEED-Q016'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q017','TECHNICAL_MCQ',s.id,t.id,'EASY','Which package contains Scanner?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q017') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','java.io',1,false FROM questions q WHERE q.question_code='SEED-Q017'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','java.util',2,true FROM questions q WHERE q.question_code='SEED-Q017'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','java.lang',3,false FROM questions q WHERE q.question_code='SEED-Q017'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','java.net',4,false FROM questions q WHERE q.question_code='SEED-Q017'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q018','TECHNICAL_MCQ',s.id,t.id,'EASY','Autoboxing converts?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q018') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Object to primitive',1,false FROM questions q WHERE q.question_code='SEED-Q018'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Primitive to object',2,true FROM questions q WHERE q.question_code='SEED-Q018'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','String to int',3,false FROM questions q WHERE q.question_code='SEED-Q018'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Array to List',4,false FROM questions q WHERE q.question_code='SEED-Q018'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q019','TECHNICAL_MCQ',s.id,t.id,'EASY','Which is thread-safe?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q019') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','ArrayList',1,false FROM questions q WHERE q.question_code='SEED-Q019'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','HashMap',2,false FROM questions q WHERE q.question_code='SEED-Q019'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Vector',3,true FROM questions q WHERE q.question_code='SEED-Q019'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','LinkedList',4,false FROM questions q WHERE q.question_code='SEED-Q019'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q020','TECHNICAL_MCQ',s.id,t.id,'EASY','equals() is defined in?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q020') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Object',1,true FROM questions q WHERE q.question_code='SEED-Q020'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','String',2,false FROM questions q WHERE q.question_code='SEED-Q020'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Comparable',3,false FROM questions q WHERE q.question_code='SEED-Q020'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','System',4,false FROM questions q WHERE q.question_code='SEED-Q020'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q021','TECHNICAL_MCQ',s.id,t.id,'EASY','Which keyword prevents method overriding?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q021') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','static',1,false FROM questions q WHERE q.question_code='SEED-Q021'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','final',2,true FROM questions q WHERE q.question_code='SEED-Q021'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','abstract',3,false FROM questions q WHERE q.question_code='SEED-Q021'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','native',4,false FROM questions q WHERE q.question_code='SEED-Q021'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q022','TECHNICAL_MCQ',s.id,t.id,'EASY','Garbage collection is controlled by?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q022') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Programmer',1,false FROM questions q WHERE q.question_code='SEED-Q022'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','JVM',2,true FROM questions q WHERE q.question_code='SEED-Q022'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','OS',3,false FROM questions q WHERE q.question_code='SEED-Q022'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Compiler',4,false FROM questions q WHERE q.question_code='SEED-Q022'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q023','TECHNICAL_MCQ',s.id,t.id,'EASY','What is polymorphism?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q023') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Many forms',1,true FROM questions q WHERE q.question_code='SEED-Q023'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Single form',2,false FROM questions q WHERE q.question_code='SEED-Q023'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','No form',3,false FROM questions q WHERE q.question_code='SEED-Q023'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Data hiding',4,false FROM questions q WHERE q.question_code='SEED-Q023'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q024','TECHNICAL_MCQ',s.id,t.id,'EASY','Abstract class can have?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q024') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Only abstract methods',1,false FROM questions q WHERE q.question_code='SEED-Q024'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Only concrete methods',2,false FROM questions q WHERE q.question_code='SEED-Q024'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Both',3,true FROM questions q WHERE q.question_code='SEED-Q024'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Neither',4,false FROM questions q WHERE q.question_code='SEED-Q024'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q025','TECHNICAL_MCQ',s.id,t.id,'EASY','Which operator is used for instanceof?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q025') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','instanceof',1,true FROM questions q WHERE q.question_code='SEED-Q025'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','typeof',2,false FROM questions q WHERE q.question_code='SEED-Q025'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','is',3,false FROM questions q WHERE q.question_code='SEED-Q025'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','isa',4,false FROM questions q WHERE q.question_code='SEED-Q025'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q026','TECHNICAL_MCQ',s.id,t.id,'EASY','Default capacity of ArrayList?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q026') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','5',1,false FROM questions q WHERE q.question_code='SEED-Q026'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','10',2,true FROM questions q WHERE q.question_code='SEED-Q026'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','16',3,false FROM questions q WHERE q.question_code='SEED-Q026'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','0',4,false FROM questions q WHERE q.question_code='SEED-Q026'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q027','TECHNICAL_MCQ',s.id,t.id,'EASY','Which map maintains insertion order?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q027') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','HashMap',1,false FROM questions q WHERE q.question_code='SEED-Q027'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','TreeMap',2,false FROM questions q WHERE q.question_code='SEED-Q027'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','LinkedHashMap',3,true FROM questions q WHERE q.question_code='SEED-Q027'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Hashtable',4,false FROM questions q WHERE q.question_code='SEED-Q027'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q028','TECHNICAL_MCQ',s.id,t.id,'EASY','Runnable has how many methods?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q028') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','0',1,false FROM questions q WHERE q.question_code='SEED-Q028'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','1',2,true FROM questions q WHERE q.question_code='SEED-Q028'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','2',3,false FROM questions q WHERE q.question_code='SEED-Q028'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','3',4,false FROM questions q WHERE q.question_code='SEED-Q028'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q029','TECHNICAL_MCQ',s.id,t.id,'EASY','Checked exceptions must be?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q029') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Ignored',1,false FROM questions q WHERE q.question_code='SEED-Q029'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Handled or declared',2,true FROM questions q WHERE q.question_code='SEED-Q029'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Runtime only',3,false FROM questions q WHERE q.question_code='SEED-Q029'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Never thrown',4,false FROM questions q WHERE q.question_code='SEED-Q029'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SEED-Q030','TECHNICAL_MCQ',s.id,t.id,'EASY','StringBuilder is?',NULL,NULL,'Refer core concepts.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id
WHERE s.name='Java' AND t.name='OOP'
AND NOT EXISTS (SELECT 1 FROM questions WHERE question_code='SEED-Q030') LIMIT 1;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','Synchronized',1,false FROM questions q WHERE q.question_code='SEED-Q030'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='A');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','Not synchronized',2,true FROM questions q WHERE q.question_code='SEED-Q030'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='B');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','Immutable',3,false FROM questions q WHERE q.question_code='SEED-Q030'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='C');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','Interface',4,false FROM questions q WHERE q.question_code='SEED-Q030'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id AND o.option_key='D');

INSERT INTO mock_tests(test_code,title,description,subject_id,difficulty,duration_minutes,total_questions,marks_per_question,negative_marks,pass_percentage,published,instructions,created_at,updated_at)
SELECT 'JAVA-MOCK-002','Java Fundamentals Mock','30-question style practice set for Java basics',s.id,'MEDIUM',45,10,1.00,0.25,60.00,true,'Answer all questions. Negative marking applies.',NOW(),NOW() FROM subjects s WHERE s.name='Java'
AND NOT EXISTS (SELECT 1 FROM mock_tests WHERE test_code='JAVA-MOCK-002');

INSERT INTO mock_tests(test_code,title,description,subject_id,difficulty,duration_minutes,total_questions,marks_per_question,negative_marks,pass_percentage,published,instructions,created_at,updated_at)
SELECT 'SPRING-MOCK-001','Spring Boot Basics Mock','Quick mock on Spring Boot annotations and REST',s.id,'MEDIUM',30,8,1.00,0.25,60.00,true,'Single attempt recommended.',NOW(),NOW() FROM subjects s WHERE s.name='Spring Boot'
AND NOT EXISTS (SELECT 1 FROM mock_tests WHERE test_code='SPRING-MOCK-001');

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,1 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q001' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,2 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q002' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,3 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q003' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,4 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q004' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,5 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q005' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,6 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q006' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,7 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q007' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,8 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q008' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,9 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q009' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);

INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,10 FROM mock_tests mt JOIN questions q ON q.question_code='SEED-Q010' WHERE mt.test_code='JAVA-MOCK-002'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions mq WHERE mq.mock_test_id=mt.id AND mq.question_id=q.id);
