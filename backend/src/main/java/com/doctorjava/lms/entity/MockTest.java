package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="mock_tests") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MockTest {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="test_code", nullable=false, unique=true, length=50) private String testCode;
    @Enumerated(EnumType.STRING) @Column(name="test_type", nullable=false, length=20)
    @Builder.Default private TestType testType = TestType.MCQ;
    @Column(nullable=false, length=200) private String title;
    @Column(columnDefinition="TEXT") private String description;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="subject_id") private Subject subject;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Question.Difficulty difficulty;
    @Column(name="duration_minutes", nullable=false) private Integer durationMinutes;
    @Column(name="total_questions", nullable=false) private Integer totalQuestions;
    @Column(name="marks_per_question", precision=7,scale=2,nullable=false) private BigDecimal marksPerQuestion;
    @Column(name="negative_marks", precision=7,scale=2,nullable=false) private BigDecimal negativeMarks;
    @Column(nullable=false) private Integer passPercentage;
    @Column(nullable=false) private boolean published;
    @Column(columnDefinition="LONGTEXT") private String instructions;
    @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt;
    @OneToMany(mappedBy="mockTest", cascade=CascadeType.ALL, orphanRemoval=true) @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<MockTestQuestion> questions = new ArrayList<>();
    @OneToMany(mappedBy="mockTest", cascade=CascadeType.ALL, orphanRemoval=true) @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<MockTestCodingQuestion> codingQuestions = new ArrayList<>();
    public enum TestType { MCQ, CODING }
}
