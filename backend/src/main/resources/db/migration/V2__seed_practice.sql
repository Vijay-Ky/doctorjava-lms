INSERT INTO subjects(name) VALUES ('Java'),('Spring Boot'),('SQL'),('React'),('Python');
INSERT INTO topics(name,subject_id) SELECT 'OOP',id FROM subjects WHERE name='Java';
INSERT INTO topics(name,subject_id) SELECT 'Collections',id FROM subjects WHERE name='Java';
INSERT INTO topics(name,subject_id) SELECT 'Operators',id FROM subjects WHERE name='Java';
INSERT INTO topics(name,subject_id) SELECT 'Exception Handling',id FROM subjects WHERE name='Java';
INSERT INTO topics(name,subject_id) SELECT 'Annotations',id FROM subjects WHERE name='Spring Boot';
INSERT INTO topics(name,subject_id) SELECT 'REST APIs',id FROM subjects WHERE name='Spring Boot';
INSERT INTO topics(name,subject_id) SELECT 'Joins',id FROM subjects WHERE name='SQL';
INSERT INTO topics(name,subject_id) SELECT 'Hooks',id FROM subjects WHERE name='React';
INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'JAVA-Q001','TECHNICAL_MCQ',s.id,t.id,'EASY','Which collection does not allow duplicate elements?',NULL,NULL,'HashSet implements Set and does not permit duplicate elements.',1.00,0.25,'PUBLISHED',1,NOW(),NOW() FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.name='Collections' WHERE s.name='Java';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'A','ArrayList',1,false FROM questions q WHERE q.question_code='JAVA-Q001';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'B','HashSet',2,true FROM questions q WHERE q.question_code='JAVA-Q001';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'C','LinkedList',3,false FROM questions q WHERE q.question_code='JAVA-Q001';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'D','Vector',4,false FROM questions q WHERE q.question_code='JAVA-Q001';
INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'JAVA-Q002','CODE_OUTPUT',s.id,t.id,'EASY',NULL,'public class Main {\n    public static void main(String[] args) {\n        int x = 5;\n        System.out.println(x++);\n    }\n}','java','The post-increment operator returns the current value before incrementing it.',1.00,0.25,'PUBLISHED',1,NOW(),NOW() FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.name='Operators' WHERE s.name='Java';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'A','4',1,false FROM questions q WHERE q.question_code='JAVA-Q002';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'B','5',2,true FROM questions q WHERE q.question_code='JAVA-Q002';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'C','6',3,false FROM questions q WHERE q.question_code='JAVA-Q002';
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct) SELECT q.id,'D','Compilation Error',4,false FROM questions q WHERE q.question_code='JAVA-Q002';
INSERT INTO mock_tests(test_code,title,description,subject_id,difficulty,duration_minutes,total_questions,marks_per_question,negative_marks,pass_percentage,published,instructions,created_at,updated_at)
SELECT 'JAVA-MOCK-001','Core Java Starter Mock Test','Practice core Java questions and program-output problems.',id,'EASY',10,2,1.00,0.25,60,true,'Select one correct answer for every question. Wrong answers carry -0.25 marks. The test will use the configured timer.',NOW(),NOW() FROM subjects WHERE name='Java';
INSERT INTO mock_test_questions(mock_test_id,question_id,display_order) SELECT mt.id,q.id,1 FROM mock_tests mt JOIN questions q ON q.question_code='JAVA-Q001' WHERE mt.test_code='JAVA-MOCK-001';
INSERT INTO mock_test_questions(mock_test_id,question_id,display_order) SELECT mt.id,q.id,2 FROM mock_tests mt JOIN questions q ON q.question_code='JAVA-Q002' WHERE mt.test_code='JAVA-MOCK-001';
