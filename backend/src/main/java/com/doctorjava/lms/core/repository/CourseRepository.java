package com.doctorjava.lms.core.repository;

import com.doctorjava.lms.core.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

import java.util.List;
import java.util.UUID;
public interface CourseRepository extends JpaRepository<Course, UUID> {

    @Query("""
        SELECT c FROM Course c
        WHERE (:q IS NULL OR :q = '' OR
               LOWER(c.course_name) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%')) OR
               LOWER(c.instructor) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:minPrice IS NULL OR c.price >= :minPrice)
          AND (:maxPrice IS NULL OR c.price <= :maxPrice)
        """)
    Page<Course> search(
            @Param("q") String q,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            Pageable pageable);

    List<Course> findByInstructorUserId(UUID instructorUserId);
}
