package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "coding_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CodingQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_code", nullable = false, unique = true, length = 50)
    private String questionCode;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(name = "problem_statement_markdown", columnDefinition = "LONGTEXT", nullable = false)
    private String problemStatementMarkdown;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Question.Difficulty difficulty;

    @Column(name = "constraints_text", columnDefinition = "TEXT")
    private String constraintsText;

    @Column(name = "input_format", columnDefinition = "TEXT")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "TEXT")
    private String outputFormat;

    @Column(name = "time_limit_ms", nullable = false)
    @Builder.Default
    private Integer timeLimitMs = 2000;

    @Column(name = "memory_limit_kb", nullable = false)
    @Builder.Default
    private Integer memoryLimitKb = 262144;

    /** Comma-separated e.g. JAVA — primary language for Doctor Java LMS */
    @Column(name = "allowed_languages", nullable = false, length = 200)
    @Builder.Default
    private String allowedLanguages = "JAVA";

    @Column(nullable = false, precision = 7, scale = 2)
    @Builder.Default
    private BigDecimal marks = new BigDecimal("100.00");

    @Column(name = "partial_credit_allowed", nullable = false)
    @Builder.Default
    private boolean partialCreditAllowed = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Question.QuestionStatus status = Question.QuestionStatus.DRAFT;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "codingQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<CodingQuestionTestCase> testCases = new ArrayList<>();

    @OneToMany(mappedBy = "codingQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CodingQuestionTemplate> templates = new ArrayList<>();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (questionCode == null || questionCode.isBlank()) {
            questionCode = "CQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public List<String> allowedLanguageList() {
        if (allowedLanguages == null || allowedLanguages.isBlank()) return List.of("JAVA");
        return Arrays.stream(allowedLanguages.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public Optional<CodingQuestionTemplate> templateFor(String language) {
        return templates.stream()
                .filter(t -> language != null && language.equalsIgnoreCase(t.getLanguage()))
                .findFirst();
    }
}
