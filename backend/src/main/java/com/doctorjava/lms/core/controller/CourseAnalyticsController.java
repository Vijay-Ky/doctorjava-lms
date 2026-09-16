package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.*;
import com.doctorjava.lms.core.repository.*;
import com.doctorjava.lms.core.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/analytics/courses")
@RequiredArgsConstructor
public class CourseAnalyticsController {

    private final LearningRepository learningRepository;
    private final ProgressRepository progressRepository;
    private final AssessmentRepository assessmentRepository;
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final CourseLectureRepository lectureRepository;
    private final CourseSectionRepository sectionRepository;
    private final LectureProgressRepository lectureProgressRepository;
    private final UserRepository userRepository;

    private static final double PASS = 60.0;

    @GetMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    public Map<String, Object> analytics(@PathVariable UUID courseId, Authentication auth) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        boolean admin = up.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
        if (!admin && (course.getInstructorUserId() == null || !course.getInstructorUserId().equals(up.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your course");
        }

        List<Learning> allLearning = learningRepository.findAll().stream()
                .filter(l -> l.getCourse() != null && courseId.equals(l.getCourse().getCourse_id()))
                .toList();
        LocalDateTime d30 = LocalDateTime.now().minusDays(30);
        long last30 = allLearning.stream()
                .filter(l -> l.getEnrolledAt() != null && l.getEnrolledAt().isAfter(d30))
                .count();

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            long c = allLearning.stream()
                    .filter(l -> l.getEnrolledAt() != null && l.getEnrolledAt().toLocalDate().equals(d))
                    .count();
            trend.add(Map.of("date", d.toString(), "count", c));
        }

        // completion from course-level progress + lecture progress
        List<Progress> progresses = progressRepository.findAll().stream()
                .filter(p -> p.getCourse() != null && courseId.equals(p.getCourse().getCourse_id()))
                .toList();
        double avgPct = 0;
        int[] buckets = new int[4];
        for (Progress p : progresses) {
            float dur = p.getDuration() > 0 ? p.getDuration() : 1f;
            double pct = Math.min(100, (p.getPlayedTime() / dur) * 100.0);
            avgPct += pct;
            if (pct < 25) buckets[0]++;
            else if (pct < 50) buckets[1]++;
            else if (pct < 75) buckets[2]++;
            else buckets[3]++;
        }
        if (!progresses.isEmpty()) avgPct /= progresses.size();

        List<Assessment> assessments = assessmentRepository.findAll().stream()
                .filter(a -> a.getCourse() != null && courseId.equals(a.getCourse().getCourse_id()))
                .toList();
        double marksSum = assessments.stream().mapToDouble(Assessment::getMarks).sum();
        long pass = assessments.stream().filter(a -> a.getMarks() >= PASS).count();

        long revenue = paymentRepository.findAll().stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()) && courseId.equals(p.getCourseId()))
                .mapToLong(Payment::getAmount)
                .sum();
        long couponRedeemed = paymentRepository.findAll().stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()) && courseId.equals(p.getCourseId()) && p.getCouponId() != null)
                .count();

        // drop-off by lecture
        List<Map<String, Object>> dropOff = new ArrayList<>();
        for (CourseSection s : sectionRepository.findByCourseIdOrdered(courseId)) {
            for (CourseLecture lec : s.getLectures()) {
                long reached = lectureProgressRepository.countByLectureId(lec.getId());
                long completed = lectureProgressRepository.countByLectureIdAndStatus(lec.getId(), "COMPLETED");
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("lectureId", lec.getId().toString());
                m.put("title", lec.getTitle());
                m.put("reachedCount", reached);
                m.put("completedCount", completed);
                dropOff.add(m);
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("enrollments", Map.of("total", allLearning.size(), "last30Days", last30, "trend", trend));
        out.put("completion", Map.of(
                "averagePercent", Math.round(avgPct),
                "distribution", List.of(
                        Map.of("bucket", "0-25%", "count", buckets[0]),
                        Map.of("bucket", "25-50%", "count", buckets[1]),
                        Map.of("bucket", "50-75%", "count", buckets[2]),
                        Map.of("bucket", "75-100%", "count", buckets[3])
                )));
        out.put("assessment", Map.of(
                "averageMarks", assessments.isEmpty() ? 0 : Math.round(marksSum / assessments.size()),
                "passRatePercent", assessments.isEmpty() ? 0 : Math.round(100.0 * pass / assessments.size()),
                "attempts", assessments.size()));
        out.put("revenue", Map.of("totalPaise", revenue, "couponsRedeemed", couponRedeemed));
        out.put("dropOffByLecture", dropOff);
        return out;
    }
}
