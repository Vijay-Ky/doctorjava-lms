package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_lecture_progress")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LectureProgress {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(name="user_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID userId;
    @Column(name="lecture_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID lectureId;
    @Column(name="course_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID courseId;
    @Column(nullable=false, length=20)
    private String status = "NOT_STARTED"; // NOT_STARTED, IN_PROGRESS, COMPLETED
    @Column(name="watched_seconds")
    private Integer watchedSeconds;
    @Column(name="completed_at")
    private LocalDateTime completedAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    @PrePersist @PreUpdate void touch(){ updatedAt = LocalDateTime.now(); }
}
