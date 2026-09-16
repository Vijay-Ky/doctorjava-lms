package com.doctorjava.lms.core.repository;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Discussion;

public interface DiscussionRepository extends JpaRepository<Discussion, UUID> {

    List<Discussion> findByCourse(Course course);
}
