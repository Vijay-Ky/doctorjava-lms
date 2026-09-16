package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="question_options", uniqueConstraints=@UniqueConstraint(columnNames={"question_id","option_key"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionOption {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="question_id")
    private Question question;
    @Column(name="option_key", nullable=false, length=1) private String optionKey;
    @Column(name="option_text", nullable=false, columnDefinition="LONGTEXT") private String optionText;
    @Column(name="display_order", nullable=false) private Integer displayOrder;
    @Column(name="is_correct", nullable=false) private boolean correct;
}
