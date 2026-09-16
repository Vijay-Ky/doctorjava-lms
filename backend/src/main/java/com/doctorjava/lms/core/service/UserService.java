package com.doctorjava.lms.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.enums.UserRole;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.SecurityUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageService profileImageService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    /**
     * Public signup — role is ALWAYS USER. Never trust client-supplied role.
     */
    public User createUser(com.doctorjava.lms.core.dto.RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()) != null) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .mobileNumber(req.getMobileNumber())
                .profession(req.getProfession())
                .location(req.getLocation())
                .dob(req.getDob())
                .gender(req.getGender())
                .linkedin_url(req.getLinkedin_url())
                .github_url(req.getGithub_url())
                .role(UserRole.USER)  // forced — ignore any client role attempt
                .isActive(true)
                .build();
        if (req.getReferredBy() != null && !req.getReferredBy().isBlank()) {
            try {
                java.util.UUID refId = java.util.UUID.fromString(req.getReferredBy().trim());
                if (userRepository.existsById(refId)) {
                    user.setReferredByUserId(refId);
                }
            } catch (Exception ignored) {}
        }
        User saved = userRepository.save(user);
        // GAP-008: never allow self-referral
        if (saved.getReferredByUserId() != null && saved.getReferredByUserId().equals(saved.getId())) {
            saved.setReferredByUserId(null);
            saved = userRepository.save(saved);
        }
        return saved;
    }

    /** Super-admin / admin: create user with explicit role */
    @Transactional
    public User adminCreateUser(String username, String email, String password, String mobile,
                                UserRole role) {
        if (userRepository.findByEmail(email) != null) {
            throw new IllegalArgumentException("Email is already registered");
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .mobileNumber(mobile)
                .role(role != null ? role : UserRole.USER)
                .isActive(true)
                .build();
        return userRepository.save(user);
    }

    @Transactional
    public User updateRole(UUID id, UserRole role) {
        // GAP-006: only SUPER_ADMIN may assign ADMIN or SUPER_ADMIN
        if (role == UserRole.ADMIN || role == UserRole.SUPER_ADMIN) {
            if (!SecurityUtils.isSuperAdmin()) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN,
                        "Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles");
            }
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public User setActive(UUID id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(active);
        return userRepository.save(user);
    }

    public void updateUserProfile(MultipartFile file, UUID id) throws IOException {
        SecurityUtils.requireOwnerOrAdmin(id);
        User user = getUserById(id);
        if (user == null) return;
        byte[] safe = profileImageService.process(file);
        user.setProfileImage(safe);
        userRepository.save(user);
    }

    public User updateUser(UUID id, User updatedUser) {
        SecurityUtils.requireOwnerOrAdmin(id);
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            existingUser.setUsername(updatedUser.getUsername());
            // GAP-007: email change must remain unique
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank()
                    && !updatedUser.getEmail().equalsIgnoreCase(existingUser.getEmail())) {
                User conflict = userRepository.findByEmail(updatedUser.getEmail());
                if (conflict != null && !conflict.getId().equals(id)) {
                    throw new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.CONFLICT,
                            "Email is already registered");
                }
                existingUser.setEmail(updatedUser.getEmail());
            }
            existingUser.setDob(updatedUser.getDob());
            existingUser.setMobileNumber(updatedUser.getMobileNumber());
            existingUser.setGender(updatedUser.getGender());
            existingUser.setLocation(updatedUser.getLocation());
            existingUser.setProfession(updatedUser.getProfession());
            existingUser.setLinkedin_url(updatedUser.getLinkedin_url());
            existingUser.setGithub_url(updatedUser.getGithub_url());
            return userRepository.save(existingUser);
        }
        return null;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void deleteUser(UUID id) {
        if (!SecurityUtils.isAdmin()) {
            SecurityUtils.requireOwnerOrAdmin(id);
        }
        userRepository.deleteById(id);
    }

    public User getUserByIdSecure(UUID id) {
        SecurityUtils.requireOwnerOrAdmin(id);
        return getUserById(id);
    }

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    public void assertNotLocked(User user) {
        if (user != null && user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Account temporarily locked. Try again after " + user.getLockedUntil());
        }
    }

    @Transactional
    public void recordFailedLogin(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) return;
        int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
            org.slf4j.LoggerFactory.getLogger(UserService.class)
                    .warn("Account locked after {} failed logins: {}", attempts, email);
        }
        userRepository.save(user);
    }

    @Transactional
    public void resetFailedLogin(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) return;
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

}
