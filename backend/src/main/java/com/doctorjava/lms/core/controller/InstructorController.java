package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.repository.CourseRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/instructor")
@RequiredArgsConstructor
public class InstructorController {

    private final CourseRepository courseRepository;

    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    public List<Course> myCourses(Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        boolean admin = up.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (admin) return courseRepository.findAll();
        return courseRepository.findByInstructorUserId(up.getId());
    }
}
