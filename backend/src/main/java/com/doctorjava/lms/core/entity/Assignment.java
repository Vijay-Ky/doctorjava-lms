package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_assignments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Assignment {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(name="course_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID courseId;
    @Column(name="lecture_id", columnDefinition="BINARY(16)")
    private UUID lectureId;
    private String title;
    @Column(columnDefinition="LONGTEXT")
    private String instructions;
    @Column(name="due_date")
    private LocalDateTime dueDate;
    @Column(name="max_score")
    private int maxScore = 100;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @PrePersist void pre(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
}
