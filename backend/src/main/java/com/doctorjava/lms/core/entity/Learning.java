package com.doctorjava.lms.core.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="lms_learning")
public class Learning {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "access_type", length = 20)
    private String accessType = "PAID";

    @Column(name = "granted_by_admin_id", columnDefinition = "BINARY(16)")
    private UUID grantedByAdminId;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @PrePersist
    void onEnroll() {
        if (enrolledAt == null) enrolledAt = LocalDateTime.now();
        if (accessType == null) accessType = "PAID";
    }
}

