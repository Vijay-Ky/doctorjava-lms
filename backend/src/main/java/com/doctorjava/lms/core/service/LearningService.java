package com.doctorjava.lms.core.service;

import com.doctorjava.lms.core.dto.EnrollRequest;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Learning;
import com.doctorjava.lms.core.entity.Progress;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.repository.CourseRepository;
import com.doctorjava.lms.core.repository.LearningRepository;
import com.doctorjava.lms.core.repository.ProgressRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class LearningService {

    private final LearningRepository learningRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public List<Course> getLearningCourses(UUID userId) {
        UUID resolved = SecurityUtils.resolveUserId(userId);
        SecurityUtils.requireOwnerOrAdmin(resolved);

        List<Learning> learnings = learningRepository.findByUserId(resolved);
        List<Course> learningCourses = new ArrayList<>();
        for (Learning learning : learnings) {
            if (learning.getCourse() != null) {
                learningCourses.add(learning.getCourse());
            }
        }
        return learningCourses;
    }

    /** Admin-only full enrollment list */
    public List<Learning> getEnrollments() {
        if (!SecurityUtils.isAdmin()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Admin only");
        }
        return learningRepository.findAll();
    }

    public String enrollCourse(EnrollRequest enrollRequest) {
        UUID userId = SecurityUtils.resolveUserId(enrollRequest.getUserId());
        SecurityUtils.requireOwnerOrAdmin(userId);

        User user = userRepository.findById(userId).orElse(null);
        Course course = courseRepository.findById(enrollRequest.getCourseId()).orElse(null);

        if (user != null && course != null) {
            // PAY-002: only allow direct free enrollment when course price is 0.
            // Paid courses must go through PaymentService (Razorpay/Stripe/mock in local only).
            if (course.getPrice() > 0) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.PAYMENT_REQUIRED,
                        "This is a paid course. Complete checkout via /api/payments before enrollment.");
            }

            Learning existingLearning = learningRepository.findByUserAndCourse(user, course);
            if (existingLearning != null) {
                return "Course already enrolled";
            }

            Progress progress = new Progress();
            progress.setUser(user);
            progress.setCourse(course);
            progressRepository.save(progress);

            Learning learning = new Learning();
            learning.setUser(user);
            learning.setCourse(course);
            learningRepository.save(learning);

            return "Enrolled successfully";
        }
        return "User or course not found";
    }

    @Transactional
    public void enrollCourseByIds(UUID userId, UUID courseId) {
        // Internal (payment) path — caller already authenticated as owner
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        if (learningRepository.findByUserAndCourse(user, course) != null) return;
        Progress progress = new Progress();
        progress.setUser(user);
        progress.setCourse(course);
        progressRepository.save(progress);
        Learning learning = new Learning();
        learning.setUser(user);
        learning.setCourse(course);
        learningRepository.save(learning);
    }


    public boolean isEnrolled(UUID userId, UUID courseId) {
        if (userId == null || courseId == null) return false;
        User user = userRepository.findById(userId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);
        if (user == null || course == null) return false;
        return learningRepository.findByUserAndCourse(user, course) != null;
    }

    public void unenrollCourse(UUID learningId) {
        Learning learning = learningRepository.findById(learningId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Enrollment not found"));
        UUID ownerId = learning.getUser() != null ? learning.getUser().getId() : null;
        SecurityUtils.requireOwnerOrAdmin(ownerId);
        learningRepository.delete(learning);
    }
}
