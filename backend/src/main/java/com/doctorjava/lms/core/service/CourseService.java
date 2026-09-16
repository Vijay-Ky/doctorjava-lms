package com.doctorjava.lms.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.repository.CourseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Page<Course> searchCourses(String q, Integer minPrice, Integer maxPrice, Pageable pageable) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return courseRepository.search(query, minPrice, maxPrice, pageable);
    }

    public Course getCourseById(UUID id) {
        return courseRepository.findById(id).orElse(null);
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Course updateCourse(UUID id, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(id).orElse(null);
        if (existingCourse != null) {
            existingCourse.setCourse_name(updatedCourse.getCourse_name());
            existingCourse.setDescription(updatedCourse.getDescription());
            existingCourse.setP_link(updatedCourse.getP_link());
            existingCourse.setPrice(updatedCourse.getPrice());
            existingCourse.setInstructor(updatedCourse.getInstructor());
            existingCourse.setY_link(updatedCourse.getY_link());
            if (updatedCourse.getLevel() != null) existingCourse.setLevel(updatedCourse.getLevel());
            if (updatedCourse.getLanguage() != null) existingCourse.setLanguage(updatedCourse.getLanguage());
            if (updatedCourse.getThumbnailUrl() != null) existingCourse.setThumbnailUrl(updatedCourse.getThumbnailUrl());
            if (updatedCourse.getWhatYouLearn() != null) existingCourse.setWhatYouLearn(updatedCourse.getWhatYouLearn());
            if (updatedCourse.getRequirements() != null) existingCourse.setRequirements(updatedCourse.getRequirements());
            if (updatedCourse.getPublished() != null) existingCourse.setPublished(updatedCourse.getPublished());
            return courseRepository.save(existingCourse);
        }
        return null;
    }

    public void deleteCourse(UUID id) {
        courseRepository.deleteById(id);
    }
}
