package com.doctorjava.lms.repository;

import com.doctorjava.lms.entity.CodeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, Long> {
    Optional<CodeSubmission> findById(Long id);

    @Query("SELECT s FROM CodeSubmission s LEFT JOIN FETCH s.results WHERE s.id = :id")
    Optional<CodeSubmission> findByIdWithResults(@Param("id") Long id);

    List<CodeSubmission> findByCodingAttemptIdAndAttemptQuestionIdAndIsFinalTrueOrderBySubmittedAtDesc(
            Long attemptId, Long attemptQuestionId);

    List<CodeSubmission> findByCodingAttemptIdOrderBySubmittedAtDesc(Long attemptId);
}
