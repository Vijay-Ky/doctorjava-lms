package com.doctorjava.lms.core.entity;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name="lms_courses")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Course {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "course_id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID course_id;

    @JsonProperty("course_name")
    private String course_name;

    private int price;

    private String instructor;

    @Column(name = "instructor_user_id", columnDefinition = "BINARY(16)")
    private UUID instructorUserId;

    private String description;

    private String p_link;

    private String y_link;

    @Column(length = 30)
    private String level; // Beginner, Intermediate, All Levels

    @Column(length = 40)
    private String language = "English";

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(name = "what_you_learn", columnDefinition = "TEXT")
    private String whatYouLearn;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "is_published")
    private Boolean published = true;

    @Column(name = "total_lectures")
    private Integer totalLectures;

    @Column(name = "total_duration_minutes")
    private Integer totalDurationMinutes;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<Feedback> feedbacks;
    
    @OneToMany(mappedBy = "course")
    @JsonIgnore
    private List<Questions> questions;
}
