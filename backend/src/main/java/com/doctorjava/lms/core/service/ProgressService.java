package com.doctorjava.lms.core.service;

import com.doctorjava.lms.core.dto.ProgressRequest;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Progress;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.repository.CourseRepository;
import com.doctorjava.lms.core.repository.ProgressRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public ResponseEntity<String> updateProgress(ProgressRequest request) {
        // Never trust client-supplied userId — force principal (admins may act on behalf)
        UUID userId = SecurityUtils.resolveUserId(request.getUserId());
        SecurityUtils.requireOwnerOrAdmin(userId);

        UUID courseId = request.getCourseId();
        float playedTime = request.getPlayedTime();
        float duration = request.getDuration();

        // GAP-010: reject negative; clamp playedTime to duration when duration is known
        if (playedTime < 0 || duration < 0) {
            return ResponseEntity.badRequest().body("playedTime and duration must be non-negative");
        }

        User user = userRepository.findById(userId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);

        if (user != null && course != null) {
            Progress progress = progressRepository.findByUserAndCourse(user, course);
            if (progress != null && (playedTime >= progress.getPlayedTime() || progress.getDuration() <= 0)) {
                float effectiveDuration = duration > 0 ? duration : progress.getDuration();
                if (effectiveDuration > 0 && playedTime > effectiveDuration) {
                    playedTime = effectiveDuration;
                }
                progress.setPlayedTime(playedTime);
                if (duration > 0) {
                    progress.setDuration(duration);
                }
                progressRepository.save(progress);
                return ResponseEntity.ok("success");
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Invalid playedTime");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User or course not found");
    }

    public float getProgress(UUID userId, UUID courseId) {
        UUID resolved = SecurityUtils.resolveUserId(userId);
        SecurityUtils.requireOwnerOrAdmin(resolved);

        User user = userRepository.findById(resolved).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);

        if (user != null && course != null) {
            Progress progress = progressRepository.findByUserAndCourse(user, course);
            return progress != null ? progress.getPlayedTime() : 0f;
        }
        return 0;
    }

    public ResponseEntity<String> updateDuration(ProgressRequest request) {
        UUID userId = SecurityUtils.resolveUserId(request.getUserId());
        SecurityUtils.requireOwnerOrAdmin(userId);

        UUID courseId = request.getCourseId();
        float duration = request.getDuration();

        User user = userRepository.findById(userId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);

        if (user != null && course != null) {
            Progress progress = progressRepository.findByUserAndCourse(user, course);
            if (progress != null) {
                progress.setDuration(duration);
                progressRepository.save(progress);
                return ResponseEntity.ok("success");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Progress not found");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User or course not found");
    }
}
