package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_question_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(CodingQuestionTemplate.PK.class)
public class CodingQuestionTemplate {

    @Id
    @Column(name = "coding_question_id")
    private Long codingQuestionId;

    @Id
    @Column(name = "language", length = 30)
    private String language;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_question_id", insertable = false, updatable = false)
    private CodingQuestion codingQuestion;

    @Column(name = "starter_code", columnDefinition = "LONGTEXT", nullable = false)
    private String starterCode;

    @Column(name = "reference_solution", columnDefinition = "LONGTEXT")
    private String referenceSolution;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PK implements java.io.Serializable {
        private Long codingQuestionId;
        private String language;
    }
}
