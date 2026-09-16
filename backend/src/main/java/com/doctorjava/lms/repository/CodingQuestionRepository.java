package com.doctorjava.lms.repository;

import com.doctorjava.lms.entity.CodingQuestion;
import com.doctorjava.lms.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CodingQuestionRepository extends JpaRepository<CodingQuestion, Long> {
    Optional<CodingQuestion> findByQuestionCode(String questionCode);

    List<CodingQuestion> findByStatusOrderByUpdatedAtDesc(Question.QuestionStatus status);

    @Query("SELECT DISTINCT cq FROM CodingQuestion cq LEFT JOIN FETCH cq.testCases LEFT JOIN FETCH cq.templates WHERE cq.id = :id")
    Optional<CodingQuestion> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT cq FROM CodingQuestion cq WHERE cq.status = 'PUBLISHED' ORDER BY cq.updatedAt DESC")
    List<CodingQuestion> findAllPublished();
}
