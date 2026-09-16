package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_live_classes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LiveClass {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(name="course_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID courseId;
    @Column(name="lecture_id", columnDefinition="BINARY(16)")
    private UUID lectureId;
    private String title;
    @Column(name="scheduled_start", nullable=false)
    private LocalDateTime scheduledStart;
    @Column(name="duration_minutes")
    private int durationMinutes = 60;
    @Column(name="meeting_url", length=1000, nullable=false)
    private String meetingUrl;
    private String status = "SCHEDULED"; // SCHEDULED, LIVE, ENDED
    @Column(name="reminder_sent")
    private boolean reminderSent;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @PrePersist void pre(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
}
