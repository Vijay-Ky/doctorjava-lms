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

/** AUTH-001: deactivated account cannot use a pre-existing JWT. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class DeactivatedUserAccessTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;

    User activeUser;
    String tokenWhileActive;

    @BeforeEach
    void seed() {
        activeUser = users.findByEmail("deact-user@test.local");
        if (activeUser == null) {
            activeUser = User.builder()
                    .username("deact-user")
                    .email("deact-user@test.local")
                    .password(encoder.encode("TestPass123!"))
                    .role(UserRole.USER)
                    .isActive(true)
                    .build();
            activeUser = users.save(activeUser);
        } else {
            activeUser.setIsActive(true);
            activeUser = users.save(activeUser);
        }
        UserPrincipal p = UserPrincipal.create(activeUser);
        tokenWhileActive = jwtUtils.generateJwtToken(
                new UsernamePasswordAuthenticationToken(p, null, p.getAuthorities()));
    }

    @Test
    void activeToken_works() throws Exception {
        mockMvc.perform(get("/api/users/" + activeUser.getId())
                        .header("Authorization", "Bearer " + tokenWhileActive))
                .andExpect(status().isOk());
    }

    @Test
    void afterDeactivate_sameToken_unauthorized() throws Exception {
        activeUser.setIsActive(false);
        users.save(activeUser);

        mockMvc.perform(get("/api/users/" + activeUser.getId())
                        .header("Authorization", "Bearer " + tokenWhileActive))
                .andExpect(status().isUnauthorized());
    }
}
