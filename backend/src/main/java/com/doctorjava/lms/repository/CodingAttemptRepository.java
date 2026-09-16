package com.doctorjava.lms.repository;

import com.doctorjava.lms.entity.CodingAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CodingAttemptRepository extends JpaRepository<CodingAttempt, Long> {
    Optional<CodingAttempt> findByIdAndStudentKey(Long id, String studentKey);

    List<CodingAttempt> findByStudentKeyOrderByStartedAtDesc(String studentKey);

    @Query("SELECT a FROM CodingAttempt a LEFT JOIN FETCH a.questions WHERE a.id = :id AND a.studentKey = :studentKey")
    Optional<CodingAttempt> findByIdAndStudentKeyWithQuestions(@Param("id") Long id, @Param("studentKey") String studentKey);
}
