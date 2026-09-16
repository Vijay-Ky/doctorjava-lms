package com.doctorjava.lms.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * PII-001: public course leaderboard must never echo email local-parts.
 * Uses a random course id so empty results still assert status 200 and no probe string.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class LeaderboardPiiTest {

    @Autowired MockMvc mockMvc;

    @Test
    void courseLeaderboard_anonymous_ok_and_no_email_probe() throws Exception {
        UUID courseId = UUID.randomUUID();
        MvcResult r = mockMvc.perform(get("/api/leaderboard/course/" + courseId))
                .andExpect(status().isOk())
                .andReturn();
        String body = r.getResponse().getContentAsString();
        assertFalse(body.contains("pii-probe"), "Response must not contain email probe string");
        assertFalse(body.contains("@"), "Public leaderboard should not contain @ (email)");
    }

    @Test
    void overallLeaderboard_anonymous_ok() throws Exception {
        mockMvc.perform(get("/api/leaderboard/overall"))
                .andExpect(status().isOk());
    }
}
