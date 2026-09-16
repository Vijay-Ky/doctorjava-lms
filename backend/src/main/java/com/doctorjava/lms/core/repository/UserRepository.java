package com.doctorjava.lms.core.repository;

import com.doctorjava.lms.core.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorjava.lms.core.entity.User;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

	User findByEmail(String email);

    boolean existsByRole(UserRole role);

}
