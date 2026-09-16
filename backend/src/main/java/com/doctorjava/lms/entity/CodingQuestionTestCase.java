package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "coding_question_test_cases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodingQuestionTestCase {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coding_question_id")
    private CodingQuestion codingQuestion;

    @Column(name = "input_data", columnDefinition = "LONGTEXT", nullable = false)
    private String input;

    @Column(name = "expected_output", columnDefinition = "LONGTEXT", nullable = false)
    private String expectedOutput;

    @Column(name = "is_sample", nullable = false)
    @Builder.Default
    private boolean sample = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weight = BigDecimal.ONE;
}
