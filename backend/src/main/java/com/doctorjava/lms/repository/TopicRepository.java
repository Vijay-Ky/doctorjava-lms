package com.doctorjava.lms.repository;
import com.doctorjava.lms.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;
public interface TopicRepository extends JpaRepository<Topic,Long>{
 List<Topic> findBySubjectIdOrderByNameAsc(Long subjectId);
 Optional<Topic> findByNameIgnoreCaseAndSubjectId(String name,Long subjectId);
 @Query("SELECT t FROM Topic t JOIN FETCH t.subject")
 List<Topic> findAllWithSubject();
}
