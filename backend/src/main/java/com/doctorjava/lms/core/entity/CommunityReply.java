package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_community_replies")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityReply {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(name="post_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID postId;
    @Column(name="user_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID userId;
    @Column(columnDefinition="TEXT")
    private String body;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @PrePersist void pre(){ if(createdAt==null) createdAt=LocalDateTime.now(); }
}
