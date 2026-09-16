package com.doctorjava.lms.core.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorjava.lms.core.entity.Assessment;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.User;

public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    List<Assessment> findByUserAndCourse(User user, Course course);

	List<Assessment> findByUser(User user);
}
