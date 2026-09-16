package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="attempt_question_options") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttemptQuestionOption {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="attempt_question_id") private AttemptQuestion attemptQuestion;
    @Column(name="original_option_id") private Long originalOptionId;
    @Column(name="option_key",nullable=false,length=1) private String optionKey;
    @Column(name="option_text",nullable=false,columnDefinition="LONGTEXT") private String optionText;
    @Column(name="display_order",nullable=false) private Integer displayOrder;
}
