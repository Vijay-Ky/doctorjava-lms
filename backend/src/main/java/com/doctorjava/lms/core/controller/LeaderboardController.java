package com.doctorjava.lms.core.controller;
import com.doctorjava.lms.entity.TestAttempt;
import com.doctorjava.lms.core.entity.Assessment;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.repository.AssessmentRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.repository.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/leaderboard") @RequiredArgsConstructor
public class LeaderboardController {
    private final AttemptRepository attempts;
    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    private String displayName(String studentKey) {
        if (studentKey == null || studentKey.isBlank()) return "Anonymous";
        try {
            UUID id = UUID.fromString(studentKey);
            return userRepository.findById(id)
                    .map(u -> {
                        // GAP-012: public endpoint — username only, never email/phone
                        if (u.getUsername() != null && !u.getUsername().isBlank()) return u.getUsername();
                        return "Learner";
                    })
                    .orElse(studentKey.substring(0, Math.min(8, studentKey.length())) + "…");
        } catch (Exception e) {
            return studentKey.length() > 12 ? studentKey.substring(0, 8) + "…" : studentKey;
        }
    }

    @GetMapping("/overall")
    public List<Map<String,Object>> overall(@RequestParam(defaultValue="20") int limit) {
        Map<String, List<Double>> byUser = new HashMap<>();
        for (TestAttempt a : attempts.findAll()) {
            if (a.getPercentage() == null || a.getStatus() == TestAttempt.Status.IN_PROGRESS) continue;
            byUser.computeIfAbsent(a.getStudentKey(), k -> new ArrayList<>()).add(a.getPercentage().doubleValue());
        }
        return byUser.entrySet().stream()
            .map(e -> {
                double avg = e.getValue().stream().mapToDouble(d->d).average().orElse(0);
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("studentKey", e.getKey());
                m.put("learnerName", displayName(e.getKey()));
                m.put("averageScorePercent", Math.round(avg));
                m.put("attempts", e.getValue().size());
                return m;
            })
            .sorted((a,b) -> Double.compare(((Number)b.get("averageScorePercent")).doubleValue(), ((Number)a.get("averageScorePercent")).doubleValue()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    @GetMapping("/mock-tests/{testId}")
    public List<Map<String,Object>> byTest(@PathVariable Long testId, @RequestParam(defaultValue="20") int limit) {
        return attempts.findAll().stream()
            .filter(a -> a.getMockTest()!=null && a.getMockTest().getId().equals(testId) && a.getPercentage()!=null)
            .sorted((a,b) -> b.getPercentage().compareTo(a.getPercentage()))
            .limit(limit)
            .map(a -> {
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("studentKey", a.getStudentKey());
                m.put("learnerName", displayName(a.getStudentKey()));
                m.put("scorePercent", a.getPercentage());
                m.put("attemptedAt", a.getSubmittedAt());
                return m;
            })
            .collect(Collectors.toList());
    }

    /** Course-scoped: from lms_assessments (not mock-test attempts) */
    @GetMapping("/course/{courseId}")
    public List<Map<String,Object>> byCourse(@PathVariable java.util.UUID courseId, @RequestParam(defaultValue="20") int limit) {
        Map<String, List<Integer>> byUser = new HashMap<>();
        Map<String, String> names = new HashMap<>();
        for (Assessment a : assessmentRepository.findAll()) {
            if (a.getCourse() == null || !courseId.equals(a.getCourse().getCourse_id())) continue;
            String key = a.getUser() != null ? a.getUser().getId().toString() : "unknown";
            byUser.computeIfAbsent(key, k -> new ArrayList<>()).add(a.getMarks());
            if (a.getUser() != null) {
                // PII-001: reuse displayName — never derive from email
                names.put(key, displayName(key));
            }
        }
        return byUser.entrySet().stream()
            .map(e -> {
                double avg = e.getValue().stream().mapToInt(i->i).average().orElse(0);
                int best = e.getValue().stream().mapToInt(i->i).max().orElse(0);
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("userId", e.getKey());
                m.put("learnerName", names.getOrDefault(e.getKey(), displayName(e.getKey())));
                m.put("averageMarks", Math.round(avg));
                m.put("bestMarks", best);
                m.put("attempts", e.getValue().size());
                return m;
            })
            .sorted((a,b) -> Integer.compare((Integer)b.get("bestMarks"), (Integer)a.get("bestMarks")))
            .limit(limit)
            .collect(Collectors.toList());
    }
}
