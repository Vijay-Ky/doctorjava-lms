
ALTER TABLE test_attempts MODIFY mock_test_id BIGINT NULL;
ALTER TABLE test_attempts ADD COLUMN practice_title VARCHAR(200) NULL;

-- Extra questions per topic (idempotent-ish via codes)
INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'JAVA-OOP-001','TECHNICAL_MCQ',s.id,t.id,'EASY','Which keyword is used to inherit a class in Java?',NULL,NULL,'extends is used for class inheritance.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.name='OOP' WHERE s.name='Java'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_code='JAVA-OOP-001');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','implements',1,false FROM questions q WHERE q.question_code='JAVA-OOP-001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id);
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','extends',2,true FROM questions q WHERE q.question_code='JAVA-OOP-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<2;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','inherits',3,false FROM questions q WHERE q.question_code='JAVA-OOP-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<3;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','super',4,false FROM questions q WHERE q.question_code='JAVA-OOP-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<4;

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'JAVA-EXC-001','TECHNICAL_MCQ',s.id,t.id,'MEDIUM','Which is a checked exception in Java?',NULL,NULL,'IOException is a checked exception.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.name='Exception Handling' WHERE s.name='Java'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_code='JAVA-EXC-001');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','NullPointerException',1,false FROM questions q WHERE q.question_code='JAVA-EXC-001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id);
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','IOException',2,true FROM questions q WHERE q.question_code='JAVA-EXC-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<2;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','ArithmeticException',3,false FROM questions q WHERE q.question_code='JAVA-EXC-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<3;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','ArrayIndexOutOfBoundsException',4,false FROM questions q WHERE q.question_code='JAVA-EXC-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<4;

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'SQL-JOIN-001','TECHNICAL_MCQ',s.id,t.id,'EASY','Which JOIN returns only matching rows from both tables?',NULL,NULL,'INNER JOIN returns matching rows only.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.name='Joins' WHERE s.name='SQL'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_code='SQL-JOIN-001');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','LEFT JOIN',1,false FROM questions q WHERE q.question_code='SQL-JOIN-001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id);
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','INNER JOIN',2,true FROM questions q WHERE q.question_code='SQL-JOIN-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<2;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','FULL OUTER JOIN',3,false FROM questions q WHERE q.question_code='SQL-JOIN-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<3;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','CROSS JOIN',4,false FROM questions q WHERE q.question_code='SQL-JOIN-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<4;

INSERT INTO questions(question_code,type,subject_id,topic_id,difficulty,question_text,code_content,code_language,explanation,marks,negative_marks,status,version,created_at,updated_at)
SELECT 'REACT-HOOK-001','TECHNICAL_MCQ',s.id,t.id,'EASY','Which hook is used for side effects in React?',NULL,NULL,'useEffect runs side effects after render.',1.00,0.25,'PUBLISHED',1,NOW(),NOW()
FROM subjects s JOIN topics t ON t.subject_id=s.id AND t.name='Hooks' WHERE s.name='React'
AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.question_code='REACT-HOOK-001');
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'A','useState',1,false FROM questions q WHERE q.question_code='REACT-HOOK-001'
AND NOT EXISTS (SELECT 1 FROM question_options o WHERE o.question_id=q.id);
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'B','useEffect',2,true FROM questions q WHERE q.question_code='REACT-HOOK-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<2;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'C','useMemo',3,false FROM questions q WHERE q.question_code='REACT-HOOK-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<3;
INSERT INTO question_options(question_id,option_key,option_text,display_order,is_correct)
SELECT q.id,'D','useRef',4,false FROM questions q WHERE q.question_code='REACT-HOOK-001'
AND (SELECT COUNT(*) FROM question_options o WHERE o.question_id=q.id)<4;

-- Mock tests per subject (if missing)
INSERT INTO mock_tests(test_code,title,description,subject_id,difficulty,duration_minutes,total_questions,marks_per_question,negative_marks,pass_percentage,published,instructions,created_at,updated_at)
SELECT 'SQL-MOCK-001','SQL Joins Quick Mock','Practice INNER/OUTER joins and query patterns',s.id,'EASY',15,1,1.00,0.25,50,true,'Answer all questions. Negative marking applies.',NOW(),NOW()
FROM subjects s WHERE s.name='SQL'
AND NOT EXISTS (SELECT 1 FROM mock_tests mt WHERE mt.test_code='SQL-MOCK-001');
INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,1 FROM mock_tests mt JOIN questions q ON q.question_code='SQL-JOIN-001' WHERE mt.test_code='SQL-MOCK-001'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions m WHERE m.mock_test_id=mt.id AND m.question_id=q.id);

INSERT INTO mock_tests(test_code,title,description,subject_id,difficulty,duration_minutes,total_questions,marks_per_question,negative_marks,pass_percentage,published,instructions,created_at,updated_at)
SELECT 'REACT-MOCK-001','React Hooks Mock','Practice useState, useEffect and common hooks',s.id,'EASY',15,1,1.00,0.25,50,true,'Answer all questions.',NOW(),NOW()
FROM subjects s WHERE s.name='React'
AND NOT EXISTS (SELECT 1 FROM mock_tests mt WHERE mt.test_code='REACT-MOCK-001');
INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,1 FROM mock_tests mt JOIN questions q ON q.question_code='REACT-HOOK-001' WHERE mt.test_code='REACT-MOCK-001'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions m WHERE m.mock_test_id=mt.id AND m.question_id=q.id);

INSERT INTO mock_tests(test_code,title,description,subject_id,difficulty,duration_minutes,total_questions,marks_per_question,negative_marks,pass_percentage,published,instructions,created_at,updated_at)
SELECT 'JAVA-OOP-MOCK','Java OOP Topic Mock','Focused MCQs on OOP concepts',s.id,'EASY',20,1,1.00,0.25,50,true,'Topic practice test.',NOW(),NOW()
FROM subjects s WHERE s.name='Java'
AND NOT EXISTS (SELECT 1 FROM mock_tests mt WHERE mt.test_code='JAVA-OOP-MOCK');
INSERT INTO mock_test_questions(mock_test_id,question_id,display_order)
SELECT mt.id,q.id,1 FROM mock_tests mt JOIN questions q ON q.question_code='JAVA-OOP-001' WHERE mt.test_code='JAVA-OOP-MOCK'
AND NOT EXISTS (SELECT 1 FROM mock_test_questions m WHERE m.mock_test_id=mt.id AND m.question_id=q.id);
