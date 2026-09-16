package com.doctorjava.lms.repository;
import com.doctorjava.lms.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AttemptRepository extends JpaRepository<TestAttempt,Long>{
 Optional<TestAttempt> findByIdAndStudentKey(Long id,String studentKey);
 List<TestAttempt> findByStudentKeyOrderByStartedAtDesc(String studentKey);
}
