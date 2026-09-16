package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "code_submission_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodeSubmissionResult {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "code_submission_id")
    private CodeSubmission codeSubmission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_test_case_id")
    private CodingAttemptTestCase attemptTestCase;

    @Column(nullable = false)
    private boolean passed;

    @Column(name = "actual_output", columnDefinition = "LONGTEXT")
    private String actualOutput;

    @Column(columnDefinition = "LONGTEXT")
    private String stderr;

    @Column(name = "runtime_ms")
    private Integer runtimeMs;

    @Column(name = "memory_kb")
    private Integer memoryKb;
}
