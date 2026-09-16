package com.doctorjava.lms.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "lms_course_lectures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseLecture {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnore
    private CourseSection section;

    private String title;

    @Column(name = "duration_minutes")
    private int durationMinutes;

    /** Legacy column — prefer contentUrl */
    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "content_type", length = 30)
    private String contentType = "VIDEO"; // VIDEO, PDF, AUDIO, TEXT, DOWNLOAD, LIVE_CLASS, ASSIGNMENT

    @Column(name = "content_url", length = 1000)
    private String contentUrl;

    @Column(name = "text_content", columnDefinition = "LONGTEXT")
    private String textContent;

    @Column(name = "subtitle_url", length = 1000)
    private String subtitleUrl;

    @Column(name = "unlock_type", length = 40)
    private String unlockType = "IMMEDIATE"; // IMMEDIATE, SCHEDULED_DATE, AFTER_PREVIOUS_LECTURE, DAYS_AFTER_ENROLLMENT

    @Column(name = "unlock_value", length = 64)
    private String unlockValue;

    @Column(name = "is_preview")
    private boolean preview;

    @Column(name = "sort_order")
    private int sortOrder;

    public String resolvedContentUrl() {
        if (contentUrl != null && !contentUrl.isBlank()) return contentUrl;
        return videoUrl;
    }
}
