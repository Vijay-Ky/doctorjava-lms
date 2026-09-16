package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="attempt_questions") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttemptQuestion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="attempt_id") private TestAttempt attempt;
    @Column(name="original_question_id",nullable=false) private Long originalQuestionId;
    @Column(name="question_order",nullable=false) private Integer questionOrder;
    @Column(name="question_type",nullable=false,length=30) private String questionType;
    @Column(name="question_text",columnDefinition="LONGTEXT") private String questionText;
    @Column(name="code_content",columnDefinition="LONGTEXT") private String codeContent;
    @Column(name="code_language",length=50) private String codeLanguage;
    @Column(name="topic_name",nullable=false,length=120) private String topicName;
    @Column(name="difficulty",nullable=false,length=20) private String difficulty;
    @Column(name="marks",precision=7,scale=2,nullable=false) private java.math.BigDecimal marks;
    @Column(name="negative_marks",precision=7,scale=2,nullable=false) private java.math.BigDecimal negativeMarks;
    @Column(name="explanation",columnDefinition="LONGTEXT") private String explanation;
    @OneToMany(mappedBy="attemptQuestion",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("displayOrder ASC")
    @Builder.Default
    private java.util.List<AttemptQuestionOption> options = new java.util.ArrayList<>();
}
