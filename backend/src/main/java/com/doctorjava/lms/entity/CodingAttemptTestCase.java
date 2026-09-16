package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "coding_attempt_test_cases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodingAttemptTestCase {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_question_id")
    private CodingAttemptQuestion attemptQuestion;

    @Column(name = "source_test_case_id")
    private Long sourceTestCaseId;

    @Column(name = "input_data", columnDefinition = "LONGTEXT", nullable = false)
    private String input;

    @Column(name = "expected_output", columnDefinition = "LONGTEXT", nullable = false)
    private String expectedOutput;

    @Column(name = "is_sample", nullable = false)
    private boolean sample;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weight = BigDecimal.ONE;
}
