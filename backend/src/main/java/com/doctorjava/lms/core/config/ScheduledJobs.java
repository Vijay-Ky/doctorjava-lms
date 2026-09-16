package com.doctorjava.lms.core.config;

import com.doctorjava.lms.core.entity.LiveClass;
import com.doctorjava.lms.core.repository.LiveClassRepository;
import com.doctorjava.lms.core.repository.PaymentRepository;
import com.doctorjava.lms.core.repository.CourseRepository;
import com.doctorjava.lms.core.entity.Payment;
import com.doctorjava.lms.core.entity.Course;
import org.springframework.beans.factory.annotation.Value;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.service.EmailService;
import com.doctorjava.lms.core.service.LearningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class ScheduledJobs {

    private final LiveClassRepository liveClassRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final LearningService learningService;
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;

    @Value("${app.payments.abandoned-hours:24}")
    private int abandonedHours;

    /** Live class reminders ~1h before start */
    @Scheduled(fixedRate = 300000) // every 5 min
    public void liveClassReminders() {
        LocalDateTime from = LocalDateTime.now().plusMinutes(50);
        LocalDateTime to = LocalDateTime.now().plusMinutes(70);
        List<LiveClass> upcoming = liveClassRepository.findByReminderSentFalseAndScheduledStartBetween(from, to);
        for (LiveClass lc : upcoming) {
            log.info("Live class reminder due: {}", lc.getTitle());
            // Fan-out to enrolled users would need enrollment list — log template send marker
            emailService.sendTemplatedEmail(
                    "enrolled@notify.local",
                    EmailService.EmailTemplate.LIVE_CLASS_REMINDER,
                    Map.of("title", lc.getTitle(), "relatedId", lc.getId().toString()));
            lc.setReminderSent(true);
            liveClassRepository.save(lc);
        }
    }

    /** Abandoned checkout: CREATED payments older than threshold, not yet reminded */
    @Scheduled(fixedRate = 900000) // 15 min
    public void abandonedCheckoutNudges() {
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusHours(abandonedHours);
        for (Payment p : paymentRepository.findAll()) {
            if (!"CREATED".equalsIgnoreCase(p.getStatus())) continue;
            if (p.getAbandonedReminderSentAt() != null) continue;
            if (p.getCreatedAt() == null || p.getCreatedAt().isAfter(cutoff)) continue;
            // re-check status
            if (!"CREATED".equalsIgnoreCase(p.getStatus())) continue;
            var user = userRepository.findById(p.getUserId()).orElse(null);
            var course = courseRepository.findById(p.getCourseId()).orElse(null);
            String email = user != null ? user.getEmail() : null;
            if (email != null) {
                emailService.sendTemplatedEmail(email, EmailService.EmailTemplate.ABANDONED_CHECKOUT,
                        Map.of(
                                "courseName", course != null ? course.getCourse_name() : "your course",
                                "relatedId", p.getCourseId().toString(),
                                "link", "/course/" + p.getCourseId()
                        ));
            }
            p.setAbandonedReminderSentAt(java.time.LocalDateTime.now());
            paymentRepository.save(p);
            log.info("Abandoned checkout reminder for payment {}", p.getId());
        }
    }
}

