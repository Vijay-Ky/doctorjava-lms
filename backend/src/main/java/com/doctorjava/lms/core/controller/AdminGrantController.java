package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.*;
import com.doctorjava.lms.core.repository.*;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.LearningService;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminGrantController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningRepository learningRepository;
    private final LearningService learningService;
    private final NotificationRepository notificationRepository;
    private final JdbcTemplate jdbc;

    @PostMapping("/{courseId}/grant-access")
    public Map<String, Object> grant(@PathVariable UUID courseId, @RequestBody Map<String, String> body,
                                     Authentication auth) {
        String email = body.get("email");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email required");
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        UUID adminId = ((UserPrincipal) auth.getPrincipal()).getId();

        User user = userRepository.findByEmail(email.trim());
        if (user == null) {
            // pending grant
            UUID id = UUID.randomUUID();
            jdbc.update(
                "INSERT INTO lms_pending_course_grants (id, email, course_id, granted_by_admin_id, created_at) VALUES (?,?,?,?,?)",
                ps -> {
                    ps.setBytes(1, uuidBytes(id));
                    ps.setString(2, email.trim().toLowerCase());
                    ps.setBytes(3, uuidBytes(courseId));
                    ps.setBytes(4, uuidBytes(adminId));
                    ps.setObject(5, LocalDateTime.now());
                });
            return Map.of("status", "PENDING", "message", "User not registered yet — access will apply on signup", "email", email);
        }

        Learning existing = learningRepository.findByUserAndCourse(user, course);
        if (existing == null) {
            learningService.enrollCourseByIds(user.getId(), courseId);
            existing = learningRepository.findByUserAndCourse(user, course);
        }
        if (existing != null) {
            existing.setAccessType("ADMIN_GRANTED");
            existing.setGrantedByAdminId(adminId);
            existing.setEnrolledAt(LocalDateTime.now());
            learningRepository.save(existing);
        }
        notificationRepository.save(Notification.builder()
                .userId(user.getId())
                .title("Course access granted")
                .body("You have been given access to: " + course.getCourse_name())
                .link("/course/" + courseId)
                .read(false)
                .build());
        return Map.of("status", "GRANTED", "userId", user.getId().toString(), "courseId", courseId.toString());
    }

    @GetMapping("/{courseId}/grants")
    public List<Map<String, Object>> listGrants(@PathVariable UUID courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Learning l : learningRepository.findAll()) {
            if (l.getCourse() == null || !l.getCourse().getCourse_id().equals(courseId)) continue;
            if (!"ADMIN_GRANTED".equals(l.getAccessType())) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("learningId", l.getId().toString());
            m.put("userId", l.getUser() != null ? l.getUser().getId().toString() : null);
            m.put("email", l.getUser() != null ? l.getUser().getEmail() : null);
            m.put("name", l.getUser() != null ? l.getUser().getUsername() : null);
            m.put("accessType", l.getAccessType());
            out.add(m);
        }
        return out;
    }

    @DeleteMapping("/{courseId}/grants/{userId}")
    public Map<String, String> revoke(@PathVariable UUID courseId, @PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        Learning l = learningRepository.findByUserAndCourse(user, course);
        if (l != null && "ADMIN_GRANTED".equals(l.getAccessType())) {
            learningRepository.delete(l);
            return Map.of("status", "REVOKED");
        }
        return Map.of("status", "NOT_FOUND");
    }

    private static byte[] uuidBytes(UUID u) {
        long m = u.getMostSignificantBits();
        long l = u.getLeastSignificantBits();
        byte[] b = new byte[16];
        for (int i = 0; i < 8; i++) b[i] = (byte) (m >>> (8 * (7 - i)));
        for (int i = 8; i < 16; i++) b[i] = (byte) (l >>> (8 * (15 - i)));
        return b;
    }
}
