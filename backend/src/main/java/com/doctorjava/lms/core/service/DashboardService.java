package com.doctorjava.lms.core.service;

import com.doctorjava.lms.core.entity.*;
import com.doctorjava.lms.core.repository.*;
import com.doctorjava.lms.entity.TestAttempt;
import com.doctorjava.lms.repository.AttemptRepository;
import com.doctorjava.lms.repository.MockTestRepository;
import com.doctorjava.lms.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final LearningRepository learningRepository;
    private final ProgressRepository progressRepository;
    private final AssessmentRepository assessmentRepository;
    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final MockTestRepository mockTestRepository;

    private static final double PASS_THRESHOLD = 60.0;

    @Transactional(readOnly = true)
    public Map<String, Object> userDashboard(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Learning> learnings = learningRepository.findByUserId(userId);
        if (learnings == null) learnings = List.of();

        int enrolled = learnings.size();
        int completed = 0;
        double progressSum = 0;
        List<Map<String, Object>> continueLearning = new ArrayList<>();

        for (Learning l : learnings) {
            Course c = l.getCourse();
            if (c == null) continue;
            Progress p = progressRepository.findByUserAndCourse(user, c);
            float played = p != null ? p.getPlayedTime() : 0f;
            float duration = p != null && p.getDuration() > 0 ? p.getDuration() : 1f;
            double pct = Math.min(100, (played / duration) * 100.0);
            progressSum += pct;
            if (pct >= 95) completed++;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("courseId", c.getCourse_id().toString());
            row.put("courseName", c.getCourse_name());
            row.put("progressPercent", Math.round(pct));
            row.put("lastAccessedAt", null);
            continueLearning.add(row);
        }
        continueLearning.sort((a, b) -> Long.compare(((Number) b.get("progressPercent")).longValue(), ((Number) a.get("progressPercent")).longValue()));

        List<Assessment> assessments = assessmentRepository.findByUser(user);
        List<Map<String, Object>> recentAssessments = new ArrayList<>();
        double assessSum = 0;
        int assessCount = 0;
        if (assessments != null) {
            assessments.stream().limit(5).forEach(a -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("courseId", a.getCourse() != null ? a.getCourse().getCourse_id().toString() : null);
                m.put("courseName", a.getCourse() != null ? a.getCourse().getCourse_name() : "");
                m.put("marks", a.getMarks());
                m.put("attemptedAt", null);
                recentAssessments.add(m);
            });
            for (Assessment a : assessments) {
                assessSum += a.getMarks();
                assessCount++;
            }
        }

        List<TestAttempt> attempts = attemptRepository.findByStudentKeyOrderByStartedAtDesc(userId.toString());
        List<Map<String, Object>> recentMocks = new ArrayList<>();
        double mockSum = 0;
        int mockCount = 0;
        Set<String> topics = new HashSet<>();
        for (TestAttempt a : attempts) {
            if (a.getStatus() == TestAttempt.Status.IN_PROGRESS) continue;
            if (mockCount < 5) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("testId", a.getMockTest() != null ? a.getMockTest().getId() : null);
                m.put("title", a.getPracticeTitle() != null ? a.getPracticeTitle()
                        : (a.getMockTest() != null ? a.getMockTest().getTitle() : "Practice"));
                m.put("scorePercent", a.getPercentage() != null ? a.getPercentage().doubleValue() : 0);
                m.put("attemptedAt", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : a.getStartedAt().toString());
                recentMocks.add(m);
            }
            if (a.getPercentage() != null) {
                mockSum += a.getPercentage().doubleValue();
                mockCount++;
            }
        }

        List<Map<String, Object>> recommended = new ArrayList<>();
        courseRepository.findAll().stream().limit(4).forEach(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseId", c.getCourse_id().toString());
            m.put("courseName", c.getCourse_name());
            recommended.add(m);
        });

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("name", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole() != null ? user.getRole().name() : "USER");
        profile.put("avatarUrl", null);

        Map<String, Object> practiceStats = new LinkedHashMap<>();
        practiceStats.put("totalAttempts", attempts.size());
        practiceStats.put("averageScorePercent", mockCount == 0 ? 0 : Math.round(mockSum / mockCount));
        practiceStats.put("topicsAttempted", topics.size());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("profile", profile);
        out.put("enrolledCoursesCount", enrolled);
        out.put("completedCoursesCount", completed);
        out.put("overallProgressPercent", enrolled == 0 ? 0 : Math.round(progressSum / enrolled));
        out.put("certificatesEarned", completed);
        out.put("continueLearning", continueLearning);
        out.put("recentAssessments", recentAssessments);
        out.put("recentMockTests", recentMocks);
        out.put("practiceStats", practiceStats);
        out.put("upcomingOrRecommended", recommended);
        out.put("averageAssessmentScore", assessCount == 0 ? 0 : Math.round(assessSum / assessCount));
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> adminSummary() {
        long users = userRepository.count();
        long courses = courseRepository.count();
        long publishedQ = questionRepository.findByStatusOrderByIdAsc(
                com.doctorjava.lms.entity.Question.QuestionStatus.PUBLISHED).size();
        long draftQ = questionRepository.findByStatusOrderByIdAsc(
                com.doctorjava.lms.entity.Question.QuestionStatus.DRAFT).size();
        long mocks = mockTestRepository.count();

        long enrollTotal = learningRepository.count();
        LocalDateTime d7 = LocalDateTime.now().minusDays(7);
        LocalDateTime d30 = LocalDateTime.now().minusDays(30);

        List<Payment> payments = paymentRepository.findAll();
        long totalPaise = 0, last30Paise = 0, razor = 0, stripe = 0;
        for (Payment p : payments) {
            if (!"PAID".equalsIgnoreCase(p.getStatus())) continue;
            int amt = p.getAmount(); // primitive int on Payment
            totalPaise += amt;
            if (p.getCreatedAt() != null && p.getCreatedAt().isAfter(d30)) last30Paise += amt;
            if ("RAZORPAY".equalsIgnoreCase(p.getProvider())) razor += amt;
            if ("STRIPE".equalsIgnoreCase(p.getProvider())) stripe += amt;
        }

        List<Assessment> allAssess = assessmentRepository.findAll();
        int pass = 0;
        double scoreSum = 0;
        for (Assessment a : allAssess) {
            scoreSum += a.getMarks();
            if (a.getMarks() >= PASS_THRESHOLD) pass++;
        }

        List<TestAttempt> allAttempts = attemptRepository.findAll();
        Map<Long, long[]> attemptByTest = new HashMap<>();
        for (TestAttempt a : allAttempts) {
            if (a.getMockTest() == null) continue;
            long id = a.getMockTest().getId();
            attemptByTest.computeIfAbsent(id, k -> new long[]{0});
            attemptByTest.get(id)[0]++;
        }
        List<Map<String, Object>> mostAttempted = new ArrayList<>();
        attemptByTest.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(5)
                .forEach(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("testId", e.getKey());
                    mockTestRepository.findById(e.getKey()).ifPresent(t -> m.put("title", t.getTitle()));
                    m.put("attempts", e.getValue()[0]);
                    mostAttempted.add(m);
                });

        List<Map<String, Object>> recentSignups = new ArrayList<>();
        userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(8)
                .forEach(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("userId", u.getId().toString());
                    m.put("name", u.getUsername());
                    m.put("email", u.getEmail());
                    m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
                    recentSignups.add(m);
                });

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", d.toString());
            m.put("count", 0); // enrolled_at may be null on old rows
            trend.add(m);
        }

        Map<String, Object> totals = Map.of(
                "users", users, "courses", courses,
                "publishedQuestions", publishedQ, "draftQuestions", draftQ, "mockTests", mocks);
        Map<String, Object> enrollments = new LinkedHashMap<>();
        enrollments.put("total", enrollTotal);
        enrollments.put("last7Days", 0);
        enrollments.put("last30Days", 0);
        enrollments.put("trend", trend);

        Map<String, Object> revenue = new LinkedHashMap<>();
        revenue.put("totalPaise", totalPaise);
        revenue.put("last30DaysPaise", last30Paise);
        revenue.put("byPaymentProvider", Map.of("razorpay", razor, "stripe", stripe));

        Map<String, Object> assessments = new LinkedHashMap<>();
        assessments.put("totalAttempts", allAssess.size());
        assessments.put("passRatePercent", allAssess.isEmpty() ? 0 : Math.round(100.0 * pass / allAssess.size()));
        assessments.put("averageScorePercent", allAssess.isEmpty() ? 0 : Math.round(scoreSum / allAssess.size()));

        Map<String, Object> mockTests = new LinkedHashMap<>();
        mockTests.put("totalAttempts", allAttempts.size());
        mockTests.put("mostAttempted", mostAttempted);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totals", totals);
        out.put("enrollments", enrollments);
        out.put("revenue", revenue);
        out.put("assessments", assessments);
        out.put("mockTests", mockTests);
        out.put("recentSignups", recentSignups);
        out.put("recentEnrollments", List.of());
        return out;
    }
}
