package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "questions") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name="question_code", nullable=false, unique=true, length=50)
    private String questionCode;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=30)
    private QuestionType type;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="subject_id")
    private Subject subject;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="topic_id")
    private Topic topic;
    @Column(length=150) private String subtopic;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20)
    private Difficulty difficulty;
    @Column(name="question_text", columnDefinition="LONGTEXT") private String questionText;
    @Column(name="code_content", columnDefinition="LONGTEXT") private String codeContent;
    @Column(name="code_language", length=50) private String codeLanguage;
    @Column(columnDefinition="LONGTEXT") private String explanation;
    @Column(precision=7, scale=2, nullable=false) private BigDecimal marks;
    @Column(name="negative_marks", precision=7, scale=2, nullable=false) private BigDecimal negativeMarks;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20)
    private QuestionStatus status;
    @Column(nullable=false) private Integer version;
    @Column(name="created_by") private Long createdBy;
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt;
    @OneToMany(mappedBy="question", cascade=CascadeType.ALL, orphanRemoval=true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<QuestionOption> options = new ArrayList<>();

    public enum QuestionType { CODE_OUTPUT, TECHNICAL_MCQ }
    public enum Difficulty { EASY, MEDIUM, HARD }
    public enum QuestionStatus { DRAFT, PUBLISHED, ARCHIVED }
}
