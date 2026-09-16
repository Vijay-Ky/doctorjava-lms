package com.doctorjava.lms.repository;
import com.doctorjava.lms.entity.Question;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface QuestionRepository extends JpaRepository<Question,Long>{
 Page<Question> findAllByOrderByUpdatedAtDesc(Pageable pageable);
 Page<Question> findByQuestionCodeContainingIgnoreCaseOrQuestionTextContainingIgnoreCaseOrderByUpdatedAtDesc(String code,String text,Pageable pageable);
 List<Question> findByStatusOrderByIdAsc(Question.QuestionStatus status);
 boolean existsByQuestionCode(String questionCode);
 List<Question> findByTopicIdAndStatusOrderByIdAsc(Long topicId, Question.QuestionStatus status);
 @Query("SELECT q.topic.id, COUNT(q) FROM Question q WHERE q.status = :status GROUP BY q.topic.id")
 List<Object[]> countPublishedByTopic(@Param("status") Question.QuestionStatus status);
}
