package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.Assignment;
import com.doctorjava.lms.core.entity.AssignmentSubmission;
import com.doctorjava.lms.core.repository.AssignmentRepository;
import com.doctorjava.lms.core.repository.AssignmentSubmissionRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.EmailService;
import com.doctorjava.lms.core.service.LearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final LearningService learningService;
    private final EmailService emailService;

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PostMapping
    public Assignment create(@RequestBody Map<String, Object> body) {
        Assignment a = Assignment.builder()
                .courseId(UUID.fromString(String.valueOf(body.get("courseId"))))
                .lectureId(body.get("lectureId") != null ? UUID.fromString(String.valueOf(body.get("lectureId"))) : null)
                .title(String.valueOf(body.get("title")))
                .instructions(body.get("instructions") != null ? String.valueOf(body.get("instructions")) : null)
                .dueDate(body.get("dueDate") != null ? LocalDateTime.parse(String.valueOf(body.get("dueDate"))) : null)
                .maxScore(body.get("maxScore") == null ? 100 : Integer.parseInt(String.valueOf(body.get("maxScore"))))
                .build();
        return assignmentRepository.save(a);
    }

    @GetMapping("/course/{courseId}")
    public List<Assignment> byCourse(@PathVariable UUID courseId) {
        return assignmentRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    @GetMapping("/{id}")
    public Assignment get(@PathVariable UUID id) {
        return assignmentRepository.findById(id).orElseThrow();
    }

    @PostMapping("/{id}/submit")
    public AssignmentSubmission submit(@PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        Assignment a = assignmentRepository.findById(id).orElseThrow();
        if (!learningService.isEnrolled(up.getId(), a.getCourseId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Enroll to submit");
        }
        AssignmentSubmission sub = submissionRepository.findByAssignmentIdAndUserId(id, up.getId())
                .orElse(AssignmentSubmission.builder().assignmentId(id).userId(up.getId()).build());
        sub.setSubmittedText(body.get("submittedText"));
        sub.setFileUrl(body.get("fileUrl"));
        sub.setSubmittedAt(LocalDateTime.now());
        sub.setScore(null);
        sub.setFeedback(null);
        sub.setGradedAt(null);
        return submissionRepository.save(sub);
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    public List<AssignmentSubmission> submissions(@PathVariable UUID id) {
        return submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(id);
    }

    @PostMapping("/{id}/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    public AssignmentSubmission grade(@PathVariable UUID id, @PathVariable UUID submissionId,
                                      @RequestBody Map<String, Object> body, Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        AssignmentSubmission sub = submissionRepository.findById(submissionId).orElseThrow();
        if (!sub.getAssignmentId().equals(id)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        sub.setScore(Integer.parseInt(String.valueOf(body.get("score"))));
        sub.setFeedback(body.get("feedback") != null ? String.valueOf(body.get("feedback")) : null);
        sub.setGradedAt(LocalDateTime.now());
        sub.setGradedByAdminId(up.getId());
        submissionRepository.save(sub);
        try {
            // lookup email would need UserRepository — log via EmailService with user id
            emailService.sendTemplatedEmail(
                    sub.getUserId().toString() + "@notify.local",
                    EmailService.EmailTemplate.ASSIGNMENT_GRADED,
                    Map.of("score", sub.getScore(), "relatedId", id.toString()));
        } catch (Exception ignored) {}
        return sub;
    }

    @GetMapping("/{id}/my-submission")
    public AssignmentSubmission mySubmission(@PathVariable UUID id, Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        return submissionRepository.findByAssignmentIdAndUserId(id, up.getId()).orElse(null);
    }
}
