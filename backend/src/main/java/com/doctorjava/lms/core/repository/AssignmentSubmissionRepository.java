package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {
    List<AssignmentSubmission> findByAssignmentIdOrderBySubmittedAtDesc(UUID assignmentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndUserId(UUID assignmentId, UUID userId);
    List<AssignmentSubmission> findByAssignmentIdAndScoreIsNull(UUID assignmentId);
}
