package com.doctorjava.lms.core.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.CourseSection;
import com.doctorjava.lms.core.repository.CourseSectionRepository;
import com.doctorjava.lms.core.service.CourseService;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseSectionRepository sectionRepository;

    @GetMapping
    public Object getAllCourses(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            HttpServletRequest request) {
        boolean noQuery = request.getQueryString() == null || request.getQueryString().isBlank();
        if (noQuery) {
            return courseService.getAllCourses();
        }
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 12;
        String sortVal = sort != null ? sort : "course_name,asc";
        String[] sortParts = sortVal.split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        String prop = sortParts[0].equals("price") ? "price" : "course_name";
        Pageable pageable = PageRequest.of(Math.max(0, pageNum), Math.min(Math.max(1, pageSize), 50), Sort.by(dir, prop));
        Page<Course> result = courseService.searchCourses(q, minPrice, maxPrice, pageable);
        return Map.of(
                "content", result.getContent(),
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages()
        );
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable UUID id) {
        return courseService.getCourseById(id);
    }

    @GetMapping("/{id}/curriculum")
    public List<CourseSection> getCurriculum(@PathVariable UUID id) {
        return sectionRepository.findByCourseIdOrdered(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable UUID id, @RequestBody Course updatedCourse) {
        return courseService.updateCourse(id, updatedCourse);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
    }
}
