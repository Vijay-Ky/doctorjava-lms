package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="attempt_answers", uniqueConstraints=@UniqueConstraint(columnNames={"attempt_id","attempt_question_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttemptAnswer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="attempt_id") private TestAttempt attempt;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="attempt_question_id") private AttemptQuestion attemptQuestion;
    @Column(name="selected_option_id") private Long selectedOptionId;
    @Column(name="selected_option_key",length=1) private String selectedOptionKey;
    @Column(name="marked_for_review",nullable=false) private boolean markedForReview;
    @Column(nullable=false) private boolean visited;
    @Column(name="time_spent_seconds",nullable=false) private Long timeSpentSeconds;
}
