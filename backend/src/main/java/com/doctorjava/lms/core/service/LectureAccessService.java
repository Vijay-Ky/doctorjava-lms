package com.doctorjava.lms.core.service;

import com.doctorjava.lms.core.entity.*;
import com.doctorjava.lms.core.repository.CourseLectureRepository;
import com.doctorjava.lms.core.repository.LearningRepository;
import com.doctorjava.lms.core.repository.ProgressRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LectureAccessService {

    private final LearningRepository learningRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseLectureRepository lectureRepository;
    private final com.doctorjava.lms.core.repository.LectureProgressRepository lectureProgressRepository;

    public record AccessResult(boolean allowed, boolean locked, String lockReason, LocalDateTime unlocksAt) {}

    public AccessResult evaluate(CourseLecture lecture, UUID userId, boolean enrolled) {
        if (lecture.isPreview()) {
            return new AccessResult(true, false, null, null);
        }
        if (!enrolled || userId == null) {
            return new AccessResult(false, true, "Enroll to unlock this lecture", null);
        }
        String type = lecture.getUnlockType() == null ? "IMMEDIATE" : lecture.getUnlockType();
        switch (type) {
            case "IMMEDIATE" -> {
                return new AccessResult(true, false, null, null);
            }
            case "SCHEDULED_DATE" -> {
                try {
                    LocalDateTime when = LocalDateTime.parse(lecture.getUnlockValue());
                    if (LocalDateTime.now().isBefore(when)) {
                        return new AccessResult(false, true, "Unlocks on " + when, when);
                    }
                } catch (Exception e) {
                    try {
                        LocalDate d = LocalDate.parse(lecture.getUnlockValue());
                        LocalDateTime when = d.atStartOfDay();
                        if (LocalDateTime.now().isBefore(when)) {
                            return new AccessResult(false, true, "Unlocks on " + d, when);
                        }
                    } catch (Exception ignored) {}
                }
                return new AccessResult(true, false, null, null);
            }
            case "DAYS_AFTER_ENROLLMENT" -> {
                int days = 0;
                try { days = Integer.parseInt(lecture.getUnlockValue()); } catch (Exception ignored) {}
                Learning learning = null;
                User user = userRepository.findById(userId).orElse(null);
                Course course = lecture.getSection() != null ? lecture.getSection().getCourse() : null;
                if (user != null && course != null) {
                    learning = learningRepository.findByUserAndCourse(user, course);
                }
                LocalDateTime enrolledAt = learning != null && learning.getEnrolledAt() != null
                        ? learning.getEnrolledAt() : LocalDateTime.now().minusDays(365);
                LocalDateTime unlocks = enrolledAt.plusDays(days);
                if (LocalDateTime.now().isBefore(unlocks)) {
                    return new AccessResult(false, true, "Unlocks " + days + " days after enrollment", unlocks);
                }
                return new AccessResult(true, false, null, null);
            }
            case "AFTER_PREVIOUS_LECTURE" -> {
                if (lecture.getSection() == null) return new AccessResult(true, false, null, null);
                List<CourseLecture> siblings = new ArrayList<>(lecture.getSection().getLectures() != null ? lecture.getSection().getLectures() : List.of());
                siblings.sort(Comparator.comparingInt(CourseLecture::getSortOrder));
                CourseLecture prev = null;
                for (CourseLecture l : siblings) {
                    if (l.getId().equals(lecture.getId())) break;
                    prev = l;
                }
                if (prev == null) return new AccessResult(true, false, null, null);
                var prevProg = lectureProgressRepository.findByUserIdAndLectureId(userId, prev.getId());
                boolean done = prevProg.isPresent() && "COMPLETED".equalsIgnoreCase(prevProg.get().getStatus());
                if (!done) {
                    return new AccessResult(false, true, "Complete the previous lecture to unlock", null);
                }
                return new AccessResult(true, false, null, null);
            }
            default -> {
                return new AccessResult(true, false, null, null);
            }
        }
    }
}
