package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_assignment_submissions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignmentSubmission {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(name="assignment_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID assignmentId;
    @Column(name="user_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID userId;
    @Column(name="submitted_text", columnDefinition="LONGTEXT")
    private String submittedText;
    @Column(name="file_url", length=1000)
    private String fileUrl;
    @Column(name="submitted_at")
    private LocalDateTime submittedAt;
    private Integer score;
    @Column(columnDefinition="LONGTEXT")
    private String feedback;
    @Column(name="graded_at")
    private LocalDateTime gradedAt;
    @Column(name="graded_by_admin_id", columnDefinition="BINARY(16)")
    private UUID gradedByAdminId;
    @PrePersist void pre(){ if(submittedAt==null) submittedAt=LocalDateTime.now(); }
}
