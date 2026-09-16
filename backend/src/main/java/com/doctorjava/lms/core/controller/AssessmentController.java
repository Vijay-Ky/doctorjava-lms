package com.doctorjava.lms.core.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.doctorjava.lms.core.entity.Assessment;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.security.SecurityUtils;
import com.doctorjava.lms.core.service.AssessmentService;
import com.doctorjava.lms.core.service.CourseService;
import com.doctorjava.lms.core.service.UserService;

/**
 * GAP-003: All paths that take {@code userId} enforce owner-or-admin so a student
 * cannot read or write another student's assessment records.
 */
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByUserAndCourse(
            @PathVariable UUID userId,
            @PathVariable UUID courseId
    ) {
        SecurityUtils.requireOwnerOrAdmin(userId);
        User user = userService.getUserById(userId);
        Course course = courseService.getCourseById(courseId);

        List<Assessment> assessments = assessmentService.getAssessmentsByUserAndCourse(user, course);
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/performance/{userId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByUser(@PathVariable UUID userId) {
        SecurityUtils.requireOwnerOrAdmin(userId);
        User user = userService.getUserById(userId);
        return assessmentService.getAssessmentByUser(user);
    }

    @PostMapping("/add/{userId}/{courseId}")
    public ResponseEntity<Assessment> addAssessmentWithMarks(
            @PathVariable UUID userId,
            @PathVariable UUID courseId,
            @RequestBody Assessment assessment) {
        SecurityUtils.requireOwnerOrAdmin(userId);
        User user = userService.getUserById(userId);
        Course course = courseService.getCourseById(courseId);
        return assessmentService.saveAssessment(user, course, assessment);
    }
}
