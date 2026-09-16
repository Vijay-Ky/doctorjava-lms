package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByCourseIdOrderByCreatedAtDesc(UUID courseId);
    Optional<Assignment> findByLectureId(UUID lectureId);
}
