package com.doctorjava.lms.core.security;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Shared ownership checks for instructor-scoped mutations.
 * Admins always pass; instructors only for courses they own.
 */
@Component("courseOwnership")
@RequiredArgsConstructor
public class CourseOwnership {

    private final CourseRepository courseRepository;

    public boolean isOwnerOrAdmin(UUID courseId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal up)) {
            return false;
        }
        boolean admin = up.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (admin) return true;
        Course c = courseRepository.findById(courseId).orElse(null);
        if (c == null) return false;
        return c.getInstructorUserId() != null && c.getInstructorUserId().equals(up.getId());
    }

    public boolean isOwnerOrAdminForLecture(UUID lectureId, Authentication authentication,
                                            com.doctorjava.lms.core.repository.CourseLectureRepository lectures) {
        var lec = lectures.findById(lectureId).orElse(null);
        if (lec == null || lec.getSection() == null || lec.getSection().getCourse() == null) return false;
        return isOwnerOrAdmin(lec.getSection().getCourse().getCourse_id(), authentication);
    }
}
