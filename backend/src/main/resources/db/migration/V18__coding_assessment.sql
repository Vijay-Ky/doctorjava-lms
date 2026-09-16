-- HackerRank-style coding assessment tables (additive; existing MCQ mock tests untouched)

CREATE TABLE IF NOT EXISTS coding_questions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_code   VARCHAR(50)  NOT NULL UNIQUE,
    title           VARCHAR(300) NOT NULL,
    problem_statement_markdown LONGTEXT NOT NULL,
    subject_id      BIGINT       NOT NULL,
    topic_id        BIGINT       NULL,
    difficulty      VARCHAR(20)  NOT NULL,
    constraints_text TEXT        NULL,
    input_format    TEXT         NULL,
    output_format   TEXT         NULL,
    time_limit_ms   INT          NOT NULL DEFAULT 2000,
    memory_limit_kb INT          NOT NULL DEFAULT 262144,
    allowed_languages VARCHAR(200) NOT NULL DEFAULT 'JAVA',
    marks           DECIMAL(7,2) NOT NULL DEFAULT 100.00,
    partial_credit_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    created_by      BIGINT       NULL,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    CONSTRAINT fk_cq_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_cq_topic   FOREIGN KEY (topic_id)   REFERENCES topics(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coding_question_templates (
    coding_question_id BIGINT       NOT NULL,
    language           VARCHAR(30)  NOT NULL,
    starter_code       LONGTEXT     NOT NULL,
    reference_solution LONGTEXT     NULL,
    PRIMARY KEY (coding_question_id, language),
    CONSTRAINT fk_cqt_question FOREIGN KEY (coding_question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coding_question_test_cases (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_question_id  BIGINT       NOT NULL,
    input_data          LONGTEXT     NOT NULL,
    expected_output     LONGTEXT     NOT NULL,
    is_sample           BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order       INT          NOT NULL DEFAULT 0,
    weight              DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    CONSTRAINT fk_cqtc_question FOREIGN KEY (coding_question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mock_test_coding_questions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    mock_test_id        BIGINT       NOT NULL,
    coding_question_id  BIGINT       NOT NULL,
    display_order       INT          NOT NULL DEFAULT 1,
    marks               DECIMAL(7,2) NULL,
    CONSTRAINT fk_mtcq_test     FOREIGN KEY (mock_test_id)       REFERENCES mock_tests(id) ON DELETE CASCADE,
    CONSTRAINT fk_mtcq_question FOREIGN KEY (coding_question_id) REFERENCES coding_questions(id),
    UNIQUE KEY uq_mtcq (mock_test_id, coding_question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- test_type on mock_tests: MCQ (existing) or CODING
ALTER TABLE mock_tests
    ADD COLUMN test_type VARCHAR(20) NOT NULL DEFAULT 'MCQ' AFTER test_code;

CREATE TABLE IF NOT EXISTS coding_attempts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_code    VARCHAR(60)  NOT NULL UNIQUE,
    mock_test_id    BIGINT       NOT NULL,
    student_key     VARCHAR(100) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS',
    started_at      DATETIME(6)  NOT NULL,
    expires_at      DATETIME(6)  NOT NULL,
    submitted_at    DATETIME(6)  NULL,
    time_taken_seconds BIGINT    NULL,
    score           DECIMAL(10,2) NULL,
    max_score       DECIMAL(10,2) NULL,
    percentage      DECIMAL(6,2)  NULL,
    CONSTRAINT fk_ca_test FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coding_attempt_questions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_attempt_id   BIGINT       NOT NULL,
    coding_question_id  BIGINT       NOT NULL,
    question_order      INT          NOT NULL,
    -- snapshot fields (immune to bank edits)
    title               VARCHAR(300) NOT NULL,
    problem_statement_markdown LONGTEXT NOT NULL,
    constraints_text    TEXT         NULL,
    input_format        TEXT         NULL,
    output_format       TEXT         NULL,
    time_limit_ms       INT          NOT NULL,
    memory_limit_kb     INT          NOT NULL,
    allowed_languages   VARCHAR(200) NOT NULL,
    marks               DECIMAL(7,2) NOT NULL,
    partial_credit_allowed BOOLEAN   NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_caq_attempt  FOREIGN KEY (coding_attempt_id)  REFERENCES coding_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_caq_question FOREIGN KEY (coding_question_id) REFERENCES coding_questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coding_attempt_templates (
    attempt_question_id BIGINT      NOT NULL,
    language            VARCHAR(30) NOT NULL,
    starter_code        LONGTEXT    NOT NULL,
    PRIMARY KEY (attempt_question_id, language),
    CONSTRAINT fk_cat_aq FOREIGN KEY (attempt_question_id) REFERENCES coding_attempt_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coding_attempt_test_cases (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_question_id BIGINT       NOT NULL,
    source_test_case_id BIGINT       NULL,
    input_data          LONGTEXT     NOT NULL,
    expected_output     LONGTEXT     NOT NULL,
    is_sample           BOOLEAN      NOT NULL DEFAULT FALSE,
    display_order       INT          NOT NULL DEFAULT 0,
    weight              DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    CONSTRAINT fk_catc_aq FOREIGN KEY (attempt_question_id) REFERENCES coding_attempt_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS code_submissions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_attempt_id   BIGINT       NOT NULL,
    attempt_question_id BIGINT       NOT NULL,
    language            VARCHAR(30)  NOT NULL,
    source_code         LONGTEXT     NOT NULL,
    status              VARCHAR(40)  NOT NULL DEFAULT 'PENDING',
    is_final            BOOLEAN      NOT NULL DEFAULT FALSE,
    test_cases_passed   INT          NULL,
    test_cases_total    INT          NULL,
    runtime_ms          INT          NULL,
    memory_kb           INT          NULL,
    awarded_marks       DECIMAL(10,2) NULL,
    compile_error       LONGTEXT     NULL,
    submitted_at        DATETIME(6)  NOT NULL,
    CONSTRAINT fk_cs_attempt FOREIGN KEY (coding_attempt_id)   REFERENCES coding_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_aq      FOREIGN KEY (attempt_question_id) REFERENCES coding_attempt_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS code_submission_results (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_submission_id  BIGINT       NOT NULL,
    attempt_test_case_id BIGINT      NOT NULL,
    passed              BOOLEAN      NOT NULL DEFAULT FALSE,
    actual_output       LONGTEXT     NULL,
    stderr              LONGTEXT     NULL,
    runtime_ms          INT          NULL,
    memory_kb           INT          NULL,
    CONSTRAINT fk_csr_sub FOREIGN KEY (code_submission_id) REFERENCES code_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_csr_tc  FOREIGN KEY (attempt_test_case_id) REFERENCES coding_attempt_test_cases(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_cq_status ON coding_questions(status);
CREATE INDEX idx_cs_attempt ON code_submissions(coding_attempt_id);
CREATE INDEX idx_ca_student ON coding_attempts(student_key);
