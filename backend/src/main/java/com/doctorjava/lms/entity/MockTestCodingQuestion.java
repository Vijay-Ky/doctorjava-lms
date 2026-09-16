package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "mock_test_coding_questions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"mock_test_id", "coding_question_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MockTestCodingQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mock_test_id")
    private MockTest mockTest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coding_question_id")
    private CodingQuestion codingQuestion;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    /** Override marks for this test; null = use question.marks */
    @Column(precision = 7, scale = 2)
    private BigDecimal marks;
}
