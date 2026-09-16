package com.doctorjava.lms.core.repository;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseSectionRepository extends JpaRepository<CourseSection, UUID> {
    List<CourseSection> findByCourseOrderBySortOrderAsc(Course course);

    @Query("SELECT s FROM CourseSection s WHERE s.course.course_id = :courseId ORDER BY s.sortOrder ASC")
    List<CourseSection> findByCourseIdOrdered(@Param("courseId") UUID courseId);
}
