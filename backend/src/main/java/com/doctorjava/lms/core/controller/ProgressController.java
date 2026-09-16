package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.dto.ProgressRequest;
import com.doctorjava.lms.core.entity.CourseLecture;
import com.doctorjava.lms.core.entity.LectureProgress;
import com.doctorjava.lms.core.repository.CourseLectureRepository;
import com.doctorjava.lms.core.repository.LectureProgressRepository;
import com.doctorjava.lms.core.security.SecurityUtils;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final LectureProgressRepository lectureProgressRepository;
    private final CourseLectureRepository lectureRepository;

    @GetMapping("/{userId}/{courseId}")
    public float getProgress(@PathVariable UUID userId, @PathVariable UUID courseId) {
        SecurityUtils.requireOwnerOrAdmin(userId);
        return progressService.getProgress(userId, courseId);
    }

    @PutMapping("/update-progress")
    public ResponseEntity<String> updateProgress(@RequestBody ProgressRequest request) {
        return progressService.updateProgress(request);
    }

    @PutMapping("/update-duration")
    public ResponseEntity<String> updateDuration(@RequestBody ProgressRequest request) {
        return progressService.updateDuration(request);
    }

    @PostMapping("/lecture/{lectureId}")
    public LectureProgress reportLecture(@PathVariable UUID lectureId, @RequestBody Map<String, Object> body,
                                         Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        CourseLecture lec = lectureRepository.findById(lectureId).orElseThrow();
        UUID courseId = lec.getSection().getCourse().getCourse_id();
        LectureProgress lp = lectureProgressRepository.findByUserIdAndLectureId(up.getId(), lectureId)
                .orElse(LectureProgress.builder().userId(up.getId()).lectureId(lectureId).courseId(courseId)
                        .status("NOT_STARTED").build());
        String status = body.get("status") != null ? String.valueOf(body.get("status")) : "IN_PROGRESS";
        lp.setStatus(status);
        if (body.get("watchedSeconds") != null) {
            lp.setWatchedSeconds(Integer.parseInt(String.valueOf(body.get("watchedSeconds"))));
        }
        if ("COMPLETED".equalsIgnoreCase(status)) {
            lp.setCompletedAt(LocalDateTime.now());
        }
        return lectureProgressRepository.save(lp);
    }

    @GetMapping("/course/{courseId}/lectures")
    public List<LectureProgress> courseLectures(@PathVariable UUID courseId, Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        return lectureProgressRepository.findByUserIdAndCourseId(up.getId(), courseId);
    }
}
