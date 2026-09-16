package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "coding_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodingAttempt {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_code", nullable = false, unique = true, length = 60)
    private String attemptCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mock_test_id")
    private MockTest mockTest;

    @Column(name = "student_key", nullable = false, length = 100)
    private String studentKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_taken_seconds")
    private Long timeTakenSeconds;

    @Column(precision = 10, scale = 2)
    private BigDecimal score;

    @Column(name = "max_score", precision = 10, scale = 2)
    private BigDecimal maxScore;

    @Column(precision = 6, scale = 2)
    private BigDecimal percentage;

    @OneToMany(mappedBy = "codingAttempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("questionOrder ASC")
    @Builder.Default
    private List<CodingAttemptQuestion> questions = new ArrayList<>();

    public enum Status { IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED }
}
