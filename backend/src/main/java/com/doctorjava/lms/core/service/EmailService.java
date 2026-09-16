package com.doctorjava.lms.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * SMTP-backed email sender. Configure MAIL_* env vars. Logs every attempt to lms_email_log.
 * Safe no-op when mail is not configured.
 */
@Service
@Slf4j
public class EmailService {

    public enum EmailTemplate {
        WELCOME, ENROLLMENT, ASSESSMENT_RESULT, CERTIFICATE, PROGRESS_NUDGE, PASSWORD_RESET, ANNOUNCEMENT, COURSE_GRANT, ASSIGNMENT_GRADED, LIVE_CLASS_REMINDER, ABANDONED_CHECKOUT
    }

    private final JavaMailSender mailSender; // may be null if starter not configured
    private final JdbcTemplate jdbc;

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    public EmailService(JdbcTemplate jdbc, org.springframework.beans.factory.ObjectProvider<JavaMailSender> mail) {
        this.jdbc = jdbc;
        this.mailSender = mail.getIfAvailable();
    }

    public void sendTemplatedEmail(String toEmail, EmailTemplate template, Map<String, Object> vars) {
        String subject = switch (template) {
            case WELCOME -> "Welcome to Doctor Java";
            case ENROLLMENT -> "Enrollment confirmed";
            case ASSESSMENT_RESULT -> "Your assessment result";
            case CERTIFICATE -> "Your certificate is ready";
            case PROGRESS_NUDGE -> "Continue your learning";
            case PASSWORD_RESET -> "Reset your password";
            case ANNOUNCEMENT -> String.valueOf(vars.getOrDefault("title", "Announcement"));
            case COURSE_GRANT -> "You've been given course access";
            case ASSIGNMENT_GRADED -> "Your assignment has been graded";
            case LIVE_CLASS_REMINDER -> "Live class starting soon";
            case ABANDONED_CHECKOUT -> "Complete your enrollment";
        };
        String body = buildBody(template, vars);
        String status = "FAILED";
        String err = null;
        try {
            if (enabled && mailSender != null && from != null && !from.isBlank()) {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(from);
                msg.setTo(toEmail);
                msg.setSubject(subject);
                msg.setText(body);
                mailSender.send(msg);
                status = "SENT";
            } else {
                log.info("Email (disabled/dev) to={} template={} subject={}", toEmail, template, subject);
                status = "SKIPPED";
            }
        } catch (Exception e) {
            err = e.getMessage();
            log.warn("Email send failed: {}", err);
        }
        try {
            UUID id = UUID.randomUUID();
            jdbc.update("INSERT INTO lms_email_log (id, recipient, template_type, status, related_entity_id, error_message, created_at) VALUES (?,?,?,?,?,?,NOW())",
                    uuidBytes(id), toEmail, template.name(), status,
                    vars.get("relatedId") != null ? vars.get("relatedId").toString() : null, err);
        } catch (Exception e) {
            log.debug("email log insert skipped: {}", e.getMessage());
        }
    }

    private String buildBody(EmailTemplate t, Map<String, Object> vars) {
        return "Doctor Java LMS\n\n" + t.name() + "\n" + vars.toString() + "\n\n— Doctor Java Technologies";
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
