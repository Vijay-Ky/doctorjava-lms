INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which OOP principle allows a class to acquire properties and behavior from another class?', 'Encapsulation', 'Inheritance', 'Abstraction', 'Polymorphism', 'Inheritance', course_id
FROM lms_courses WHERE course_name='Java Full Stack Development';

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which annotation is commonly used to mark a Spring Boot REST controller?', '@Entity', '@RestController', '@Service', '@Repository', '@RestController', course_id
FROM lms_courses WHERE course_name='Spring Boot & Microservices';

INSERT INTO lms_course_questions(id, question, option1, option2, option3, option4, answer, course_id)
SELECT UUID_TO_BIN(UUID()), 'Which SQL clause is used to filter grouped results?', 'WHERE', 'ORDER BY', 'HAVING', 'GROUP BY', 'HAVING', course_id
FROM lms_courses WHERE course_name='Java Placement Preparation';
