package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.*;
import com.doctorjava.lms.core.repository.*;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.LearningService;
import com.doctorjava.lms.core.service.LectureAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/curriculum")
@RequiredArgsConstructor
public class CurriculumController {

    private final CourseRepository courseRepository;
    private final CourseSectionRepository sectionRepository;
    private final CourseLectureRepository lectureRepository;
    private final LearningService learningService;
    private final LectureAccessService accessService;
    private final LiveClassRepository liveClassRepository;

    private static final String SIGN_SECRET = System.getenv().getOrDefault("CONTENT_SIGN_SECRET", "doctor-java-content-sign-local");

    @GetMapping("/course/{courseId}")
    public List<Map<String, Object>> getForStudent(@PathVariable UUID courseId, Authentication auth) {
        UUID userId = null;
        boolean enrolled = false;
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            userId = up.getId();
            enrolled = learningService.isEnrolled(up.getId(), courseId);
        }
        List<CourseSection> sections = sectionRepository.findByCourseIdOrdered(courseId);
        List<Map<String, Object>> out = new ArrayList<>();
        for (CourseSection s : sections) {
            List<Map<String, Object>> lectures = new ArrayList<>();
            List<CourseLecture> ordered = new ArrayList<>(s.getLectures() != null ? s.getLectures() : List.of());
            ordered.sort(Comparator.comparingInt(CourseLecture::getSortOrder));
            for (CourseLecture l : ordered) {
                var access = accessService.evaluate(l, userId, enrolled);
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("id", l.getId());
                lm.put("title", l.getTitle());
                lm.put("durationMinutes", l.getDurationMinutes());
                lm.put("preview", l.isPreview());
                lm.put("sortOrder", l.getSortOrder());
                lm.put("contentType", l.getContentType() != null ? l.getContentType() : "VIDEO");
                lm.put("unlockType", l.getUnlockType());
                lm.put("locked", access.locked());
                lm.put("lockReason", access.lockReason());
                lm.put("unlocksAt", access.unlocksAt());
                // Never expose permanent URL when locked; when allowed, expose tokenized endpoint only
                if (access.allowed()) {
                    lm.put("contentUrl", null); // client must call /lectures/{id}/content-url
                    lm.put("hasContent", l.resolvedContentUrl() != null || (l.getTextContent() != null && !l.getTextContent().isBlank()));
                    if ("TEXT".equals(l.getContentType()) && l.getTextContent() != null) {
                        lm.put("textContent", l.getTextContent());
                    }
                } else {
                    lm.put("hasContent", false);
                }
                lectures.add(lm);
            }
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("id", s.getId());
            sm.put("title", s.getTitle());
            sm.put("sortOrder", s.getSortOrder());
            sm.put("lectures", lectures);
            out.add(sm);
        }
        return out;
    }

    /**
     * Access-checked content URL. Returns a short-lived signed token URL for the real asset.
     * Client-side watermark should still overlay name/email on VIDEO players.
     */
    @GetMapping("/lectures/{id}/content-url")
    public Map<String, Object> contentUrl(@PathVariable UUID id, Authentication auth) {
        CourseLecture l = lectureRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        UUID userId = null;
        boolean enrolled = false;
        UUID courseId = l.getSection() != null && l.getSection().getCourse() != null
                ? l.getSection().getCourse().getCourse_id() : null;
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            userId = up.getId();
            if (courseId != null) enrolled = learningService.isEnrolled(up.getId(), courseId);
        }
        var access = accessService.evaluate(l, userId, enrolled);
        if (!access.allowed()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, access.lockReason() != null ? access.lockReason() : "Locked");
        }
        String raw = l.resolvedContentUrl();
        if (raw == null || raw.isBlank()) {
            if ("TEXT".equals(l.getContentType())) {
                return Map.of("contentType", "TEXT", "textContent", l.getTextContent() != null ? l.getTextContent() : "");
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No content");
        }
        long exp = Instant.now().getEpochSecond() + 900; // 15 min
        String sig = hmac(id + ":" + exp);
        return Map.of(
                "contentType", l.getContentType() != null ? l.getContentType() : "VIDEO",
                "url", raw,
                "expiresAt", exp,
                "token", sig,
                "subtitleUrl", l.getSubtitleUrl() != null ? l.getSubtitleUrl() : "",
                "watermarkNote", "Client should overlay viewer name/email on VIDEO — deterrent only, not DRM"
        );
    }

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SIGN_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] out = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : out) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PostMapping("/sections")
    public CourseSection createSection(@RequestBody Map<String, Object> body) {
        UUID courseId = UUID.fromString(String.valueOf(body.get("courseId")));
        Course course = courseRepository.findById(courseId).orElseThrow();
        CourseSection s = CourseSection.builder()
                .course(course)
                .title(String.valueOf(body.get("title")))
                .sortOrder(body.get("sortOrder") == null ? 0 : Integer.parseInt(String.valueOf(body.get("sortOrder"))))
                .build();
        return sectionRepository.save(s);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PutMapping("/sections/{id}")
    public CourseSection updateSection(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        CourseSection s = sectionRepository.findById(id).orElseThrow();
        if (body.get("title") != null) s.setTitle(String.valueOf(body.get("title")));
        if (body.get("sortOrder") != null) s.setSortOrder(Integer.parseInt(String.valueOf(body.get("sortOrder"))));
        return sectionRepository.save(s);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @DeleteMapping("/sections/{id}")
    public void deleteSection(@PathVariable UUID id) {
        sectionRepository.deleteById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PostMapping("/lectures")
    public CourseLecture createLecture(@RequestBody Map<String, Object> body, Authentication auth) {
        UUID sectionId = UUID.fromString(String.valueOf(body.get("sectionId")));
        CourseSection section = sectionRepository.findById(sectionId).orElseThrow();
        assertCanEditCourse(section.getCourse().getCourse_id(), auth);
        String contentType = String.valueOf(body.getOrDefault("contentType", "VIDEO"));
        String contentUrl = body.get("contentUrl") != null ? String.valueOf(body.get("contentUrl"))
                : (body.get("videoUrl") != null ? String.valueOf(body.get("videoUrl")) : null);
        CourseLecture l = CourseLecture.builder()
                .section(section)
                .title(String.valueOf(body.get("title")))
                .durationMinutes(body.get("durationMinutes") == null ? 5 : Integer.parseInt(String.valueOf(body.get("durationMinutes"))))
                .videoUrl(contentUrl)
                .contentUrl(contentUrl)
                .contentType(contentType)
                .textContent(body.get("textContent") != null ? String.valueOf(body.get("textContent")) : null)
                .subtitleUrl(body.get("subtitleUrl") != null ? String.valueOf(body.get("subtitleUrl")) : null)
                .unlockType(String.valueOf(body.getOrDefault("unlockType", "IMMEDIATE")))
                .unlockValue(body.get("unlockValue") != null ? String.valueOf(body.get("unlockValue")) : null)
                .preview(Boolean.parseBoolean(String.valueOf(body.getOrDefault("preview", false))))
                .sortOrder(body.get("sortOrder") == null ? 0 : Integer.parseInt(String.valueOf(body.get("sortOrder"))))
                .build();
        return lectureRepository.save(l);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PutMapping("/lectures/{id}")
    public CourseLecture updateLecture(@PathVariable UUID id, @RequestBody Map<String, Object> body, Authentication auth) {
        CourseLecture l = lectureRepository.findById(id).orElseThrow();
        assertCanEditCourse(l.getSection().getCourse().getCourse_id(), auth);
        if (body.get("title") != null) l.setTitle(String.valueOf(body.get("title")));
        if (body.get("durationMinutes") != null) l.setDurationMinutes(Integer.parseInt(String.valueOf(body.get("durationMinutes"))));
        if (body.get("contentUrl") != null) {
            l.setContentUrl(String.valueOf(body.get("contentUrl")));
            l.setVideoUrl(String.valueOf(body.get("contentUrl")));
        }
        if (body.get("videoUrl") != null) {
            l.setVideoUrl(String.valueOf(body.get("videoUrl")));
            if (l.getContentUrl() == null) l.setContentUrl(String.valueOf(body.get("videoUrl")));
        }
        if (body.get("contentType") != null) l.setContentType(String.valueOf(body.get("contentType")));
        if (body.get("textContent") != null) l.setTextContent(String.valueOf(body.get("textContent")));
        if (body.get("subtitleUrl") != null) l.setSubtitleUrl(String.valueOf(body.get("subtitleUrl")));
        if (body.get("unlockType") != null) l.setUnlockType(String.valueOf(body.get("unlockType")));
        if (body.containsKey("unlockValue")) l.setUnlockValue(body.get("unlockValue") == null ? null : String.valueOf(body.get("unlockValue")));
        if (body.get("preview") != null) l.setPreview(Boolean.parseBoolean(String.valueOf(body.get("preview"))));
        if (body.get("sortOrder") != null) l.setSortOrder(Integer.parseInt(String.valueOf(body.get("sortOrder"))));
        return lectureRepository.save(l);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @DeleteMapping("/lectures/{id}")
    public void deleteLecture(@PathVariable UUID id, Authentication auth) {
        CourseLecture l = lectureRepository.findById(id).orElseThrow();
        assertCanEditCourse(l.getSection().getCourse().getCourse_id(), auth);
        lectureRepository.deleteById(id);
    }

    private void assertCanEditCourse(UUID courseId, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        boolean admin = up.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (admin) return;
        var course = courseRepository.findById(courseId).orElseThrow();
        if (course.getInstructorUserId() == null || !course.getInstructorUserId().equals(up.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your course");
        }
    }

    // ---- Live classes ----
    @GetMapping("/course/{courseId}/live")
    public List<LiveClass> listLive(@PathVariable UUID courseId) {
        return liveClassRepository.findByCourseIdOrderByScheduledStartAsc(courseId);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PostMapping("/live")
    public LiveClass createLive(@RequestBody Map<String, Object> body) {
        LiveClass lc = LiveClass.builder()
                .courseId(UUID.fromString(String.valueOf(body.get("courseId"))))
                .lectureId(body.get("lectureId") != null ? UUID.fromString(String.valueOf(body.get("lectureId"))) : null)
                .title(String.valueOf(body.get("title")))
                .scheduledStart(java.time.LocalDateTime.parse(String.valueOf(body.get("scheduledStart"))))
                .durationMinutes(body.get("durationMinutes") == null ? 60 : Integer.parseInt(String.valueOf(body.get("durationMinutes"))))
                .meetingUrl(String.valueOf(body.get("meetingUrl")))
                .status("SCHEDULED")
                .build();
        return liveClassRepository.save(lc);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    @PutMapping("/live/{id}")
    public LiveClass updateLive(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        LiveClass lc = liveClassRepository.findById(id).orElseThrow();
        if (body.get("title") != null) lc.setTitle(String.valueOf(body.get("title")));
        if (body.get("scheduledStart") != null) lc.setScheduledStart(java.time.LocalDateTime.parse(String.valueOf(body.get("scheduledStart"))));
        if (body.get("meetingUrl") != null) lc.setMeetingUrl(String.valueOf(body.get("meetingUrl")));
        if (body.get("status") != null) lc.setStatus(String.valueOf(body.get("status")));
        if (body.get("durationMinutes") != null) lc.setDurationMinutes(Integer.parseInt(String.valueOf(body.get("durationMinutes"))));
        return liveClassRepository.save(lc);
    }
}
