package com.doctorjava.lms.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorjava.lms.core.entity.Feedback;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
}
