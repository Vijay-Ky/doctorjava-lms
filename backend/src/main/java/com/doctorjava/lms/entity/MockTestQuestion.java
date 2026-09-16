package com.doctorjava.lms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="mock_test_questions", uniqueConstraints=@UniqueConstraint(columnNames={"mock_test_id","question_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MockTestQuestion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="mock_test_id") private MockTest mockTest;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="question_id") private Question question;
    @Column(name="display_order",nullable=false) private Integer displayOrder;
}
