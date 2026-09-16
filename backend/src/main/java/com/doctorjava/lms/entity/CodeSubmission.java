package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "code_submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodeSubmission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coding_attempt_id")
    private CodingAttempt codingAttempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_question_id")
    private CodingAttemptQuestion attemptQuestion;

    @Column(nullable = false, length = 30)
    private String language;

    @Column(name = "source_code", columnDefinition = "LONGTEXT", nullable = false)
    private String sourceCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private Status status = Status.PENDING;

    /** true = graded Submit against all cases; false = Run against samples only */
    @Column(name = "is_final", nullable = false)
    private boolean isFinal;

    @Column(name = "test_cases_passed")
    private Integer testCasesPassed;

    @Column(name = "test_cases_total")
    private Integer testCasesTotal;

    @Column(name = "runtime_ms")
    private Integer runtimeMs;

    @Column(name = "memory_kb")
    private Integer memoryKb;

    @Column(name = "awarded_marks", precision = 10, scale = 2)
    private BigDecimal awardedMarks;

    @Column(name = "compile_error", columnDefinition = "LONGTEXT")
    private String compileError;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "codeSubmission", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CodeSubmissionResult> results = new ArrayList<>();

    public enum Status {
        PENDING, RUNNING, ACCEPTED, WRONG_ANSWER,
        TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED,
        RUNTIME_ERROR, COMPILE_ERROR
    }
}
