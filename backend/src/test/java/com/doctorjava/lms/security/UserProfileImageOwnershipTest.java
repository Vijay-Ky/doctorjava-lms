package com.doctorjava.lms.security;

import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.enums.UserRole;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.security.util.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** IDOR-001: non-owner cannot fetch another user's profile image. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class UserProfileImageOwnershipTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;

    User owner;
    User other;
    User admin;
    String ownerToken;
    String otherToken;
    String adminToken;

    @BeforeEach
    void seed() {
        owner = ensure("img-owner@test.local", UserRole.USER, new byte[]{1, 2, 3, 4});
        other = ensure("img-other@test.local", UserRole.USER, null);
        admin = ensure("img-admin@test.local", UserRole.ADMIN, null);
        ownerToken = token(owner);
        otherToken = token(other);
        adminToken = token(admin);
    }

    private User ensure(String email, UserRole role, byte[] image) {
        User u = users.findByEmail(email);
        if (u == null) {
            u = User.builder().username(email.split("@")[0]).email(email)
                    .password(encoder.encode("TestPass123!")).role(role).isActive(true).build();
        }
        u.setRole(role);
        u.setIsActive(true);
        if (image != null) u.setProfileImage(image);
        return users.save(u);
    }

    private String token(User u) {
        UserPrincipal p = UserPrincipal.create(u);
        return jwtUtils.generateJwtToken(new UsernamePasswordAuthenticationToken(p, null, p.getAuthorities()));
    }

    @Test
    void nonOwner_gets403() throws Exception {
        mockMvc.perform(get("/api/users/" + owner.getId() + "/profile-image")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void owner_gets200() throws Exception {
        mockMvc.perform(get("/api/users/" + owner.getId() + "/profile-image")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk());
    }

    @Test
    void admin_gets200() throws Exception {
        mockMvc.perform(get("/api/users/" + owner.getId() + "/profile-image")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
