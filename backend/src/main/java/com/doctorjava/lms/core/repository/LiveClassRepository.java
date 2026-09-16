package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.LiveClass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.*;
public interface LiveClassRepository extends JpaRepository<LiveClass, UUID> {
    List<LiveClass> findByCourseIdOrderByScheduledStartAsc(UUID courseId);
    List<LiveClass> findByReminderSentFalseAndScheduledStartBetween(LocalDateTime from, LocalDateTime to);
}
