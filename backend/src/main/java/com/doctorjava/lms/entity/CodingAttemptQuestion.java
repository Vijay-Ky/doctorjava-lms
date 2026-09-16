package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "coding_attempt_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodingAttemptQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coding_attempt_id")
    private CodingAttempt codingAttempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coding_question_id")
    private CodingQuestion codingQuestion;

    @Column(name = "question_order", nullable = false)
    private int questionOrder;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(name = "problem_statement_markdown", columnDefinition = "LONGTEXT", nullable = false)
    private String problemStatementMarkdown;

    @Column(name = "constraints_text", columnDefinition = "TEXT")
    private String constraintsText;

    @Column(name = "input_format", columnDefinition = "TEXT")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "TEXT")
    private String outputFormat;

    @Column(name = "time_limit_ms", nullable = false)
    private Integer timeLimitMs;

    @Column(name = "memory_limit_kb", nullable = false)
    private Integer memoryLimitKb;

    @Column(name = "allowed_languages", nullable = false, length = 200)
    private String allowedLanguages;

    @Column(nullable = false, precision = 7, scale = 2)
    private BigDecimal marks;

    @Column(name = "partial_credit_allowed", nullable = false)
    private boolean partialCreditAllowed;

    @OneToMany(mappedBy = "attemptQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<CodingAttemptTestCase> testCases = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "coding_attempt_templates",
            joinColumns = @JoinColumn(name = "attempt_question_id"))
    @MapKeyColumn(name = "language")
    @Column(name = "starter_code", columnDefinition = "LONGTEXT", nullable = false)
    @Builder.Default
    private Map<String, String> starterCode = new HashMap<>();
}
