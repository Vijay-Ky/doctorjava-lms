package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Entity @Table(name="test_attempts") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestAttempt {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="attempt_code",nullable=false,unique=true,length=60) private String attemptCode;
    @ManyToOne(fetch=FetchType.LAZY,optional=true) @JoinColumn(name="mock_test_id") private MockTest mockTest;
    @Column(name="student_key",nullable=false,length=100) private String studentKey;
    @Column(name="practice_title",length=200) private String practiceTitle;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Status status;
    @Column(name="started_at",nullable=false) private LocalDateTime startedAt;
    @Column(name="expires_at",nullable=false) private LocalDateTime expiresAt;
    @Column(name="submitted_at") private LocalDateTime submittedAt;
    @Column(name="time_taken_seconds") private Long timeTakenSeconds;
    @Column(precision=10,scale=2) private BigDecimal score;
    @Column(name="max_score",precision=10,scale=2) private BigDecimal maxScore;
    @Column(precision=6,scale=2) private BigDecimal percentage;
    @Column(name="correct_count") private Integer correctCount;
    @Column(name="incorrect_count") private Integer incorrectCount;
    @Column(name="unanswered_count") private Integer unansweredCount;
    @OneToMany(mappedBy="attempt",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("questionOrder ASC")
    @Builder.Default
    private List<AttemptQuestion> questions = new ArrayList<>();
    public enum Status { IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED }
}
