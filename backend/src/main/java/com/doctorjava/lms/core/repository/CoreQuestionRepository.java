package com.doctorjava.lms.core.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Questions;

public interface CoreQuestionRepository extends JpaRepository<Questions, UUID> {

    List<Questions> findByCourse(Course course);
}
