package com.doctorjava.lms.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Learning;
import com.doctorjava.lms.core.entity.User;

import java.util.List;
import java.util.UUID;

public interface LearningRepository extends JpaRepository<Learning, UUID> {
	Learning findByUserAndCourse(User user, Course course);

	@Query("SELECT l FROM Learning l JOIN FETCH l.course WHERE l.user.id = :userId")
	List<Learning> findByUserId(@Param("userId") UUID userId);
}
