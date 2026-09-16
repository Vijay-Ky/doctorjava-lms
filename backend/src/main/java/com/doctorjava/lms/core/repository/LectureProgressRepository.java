package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.LectureProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface LectureProgressRepository extends JpaRepository<LectureProgress, UUID> {
    Optional<LectureProgress> findByUserIdAndLectureId(UUID userId, UUID lectureId);
    List<LectureProgress> findByUserIdAndCourseId(UUID userId, UUID courseId);
    List<LectureProgress> findByCourseId(UUID courseId);
    long countByLectureIdAndStatus(UUID lectureId, String status);
    long countByLectureId(UUID lectureId);
}
