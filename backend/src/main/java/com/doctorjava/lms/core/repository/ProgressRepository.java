package com.doctorjava.lms.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Progress;
import com.doctorjava.lms.core.entity.User;

import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {

	Progress findByUserAndCourse(User user, Course course);
}
