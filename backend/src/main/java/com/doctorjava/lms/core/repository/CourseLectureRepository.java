package com.doctorjava.lms.core.repository;

import com.doctorjava.lms.core.entity.CourseLecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseLectureRepository extends JpaRepository<CourseLecture, UUID> {}
