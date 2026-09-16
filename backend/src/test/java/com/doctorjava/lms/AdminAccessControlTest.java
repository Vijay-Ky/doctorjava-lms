package com.doctorjava.lms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Asserts admin practice APIs reject unauthenticated callers (401/403).
 * Requires DB; run with: SPRING_PROFILES_ACTIVE=local ./mvnw test -Dtest=AdminAccessControlTest
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AdminAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminMockTests_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/mock-tests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminQuestions_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/questions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminMockTests_post_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/admin/mock-tests")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void practiceTests_public_ok() throws Exception {
        mockMvc.perform(get("/api/v1/practice/tests"))
                .andExpect(status().isOk());
    }
}
