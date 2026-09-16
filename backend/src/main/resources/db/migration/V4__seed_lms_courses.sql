INSERT INTO lms_courses(course_id, course_name, price, instructor, description, p_link, y_link)
VALUES
(UUID_TO_BIN(UUID()), 'Java Full Stack Development', 24999, 'Doctor Java Technologies', 'Placement-focused Java Full Stack program covering Core Java, Spring Boot, REST APIs, React and MySQL.', 'https://www.doctorjava.tech', 'https://www.youtube.com/@doctorjavatechnologies'),
(UUID_TO_BIN(UUID()), 'Spring Boot & Microservices', 14999, 'Doctor Java Technologies', 'Build production-ready backend systems with Spring Boot, JPA, REST, security and microservices concepts.', 'https://www.doctorjava.tech', 'https://www.youtube.com/@doctorjavatechnologies'),
(UUID_TO_BIN(UUID()), 'Java Placement Preparation', 9999, 'Doctor Java Technologies', 'Structured practice for Java interviews, coding, SQL and technical assessments.', 'https://www.doctorjava.tech', 'https://www.youtube.com/@doctorjavatechnologies');
