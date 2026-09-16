package com.doctorjava.lms.security;

import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.enums.UserRole;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.security.util.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.EnumMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * GAP-011 — SecurityConfig route matrix as executable tests.
 *
 * 1) Unauthenticated: PUBLIC must not 401; PROTECTED must 401.
 * 2) Role-positive: USER / INSTRUCTOR / ADMIN / SUPER_ADMIN with real JWTs
 *    — ALLOWED → not 401/403; DENIED → 403 (or 401 if filter rejects).
 *
 * Keep in sync with SecurityConfig.java and docs/ROUTE_ROLE_MATRIX.md.
 *
 * Run: ./mvnw test -Dtest=FullRouteRoleMatrixTest
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class FullRouteRoleMatrixTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private final Map<UserRole, String> tokens = new EnumMap<>(UserRole.class);

    @BeforeEach
    void seedUsersAndTokens() {
        tokens.put(UserRole.USER, tokenFor(ensureUser("matrix-user@test.local", UserRole.USER)));
        tokens.put(UserRole.INSTRUCTOR, tokenFor(ensureUser("matrix-instructor@test.local", UserRole.INSTRUCTOR)));
        tokens.put(UserRole.ADMIN, tokenFor(ensureUser("matrix-admin@test.local", UserRole.ADMIN)));
        tokens.put(UserRole.SUPER_ADMIN, tokenFor(ensureUser("matrix-super@test.local", UserRole.SUPER_ADMIN)));
    }

    private User ensureUser(String email, UserRole role) {
        User u = userRepository.findByEmail(email);
        if (u == null) {
            u = User.builder()
                    .username(email.split("@")[0])
                    .email(email)
                    .password(passwordEncoder.encode("TestPass123!"))
                    .role(role)
                    .isActive(true)
                    .build();
            u = userRepository.save(u);
        } else if (u.getRole() != role) {
            u.setRole(role);
            u = userRepository.save(u);
        }
        return u;
    }

    private String tokenFor(User user) {
        UserPrincipal principal = UserPrincipal.create(user);
        var auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        return jwtUtils.generateJwtToken(auth);
    }

    // -------------------------------------------------------------------------
    // Unauthenticated matrix
    // -------------------------------------------------------------------------

    enum AnonAccess { PUBLIC, PROTECTED }

    static Stream<Arguments> anonymousMatrix() {
        return Stream.of(
                Arguments.of("OPTIONS", HttpMethod.OPTIONS, "/api/courses", AnonAccess.PUBLIC),
                Arguments.of("POST login", HttpMethod.POST, "/api/auth/login", AnonAccess.PUBLIC),
                Arguments.of("POST register", HttpMethod.POST, "/api/auth/register", AnonAccess.PUBLIC),
                Arguments.of("GET session", HttpMethod.GET, "/api/auth/session", AnonAccess.PUBLIC),
                Arguments.of("GET health", HttpMethod.GET, "/actuator/health", AnonAccess.PUBLIC),
                Arguments.of("GET courses", HttpMethod.GET, "/api/courses", AnonAccess.PUBLIC),
                Arguments.of("GET curriculum/course", HttpMethod.GET, "/api/curriculum/course/00000000-0000-0000-0000-000000000001", AnonAccess.PUBLIC),
                Arguments.of("GET practice tests", HttpMethod.GET, "/api/v1/practice/tests", AnonAccess.PUBLIC),
                Arguments.of("GET coding tests", HttpMethod.GET, "/api/v1/practice/coding-tests", AnonAccess.PUBLIC),
                Arguments.of("GET catalog", HttpMethod.GET, "/api/v1/catalog/subjects", AnonAccess.PUBLIC),
                Arguments.of("POST webhook", HttpMethod.POST, "/api/payments/webhook/razorpay", AnonAccess.PUBLIC),
                Arguments.of("GET community", HttpMethod.GET, "/api/community/posts", AnonAccess.PUBLIC),
                Arguments.of("GET leaderboard", HttpMethod.GET, "/api/leaderboard/overall", AnonAccess.PUBLIC),

                Arguments.of("POST practice attempt", HttpMethod.POST, "/api/v1/practice/tests/1/attempts", AnonAccess.PROTECTED),
                Arguments.of("GET admin mock-tests", HttpMethod.GET, "/api/v1/admin/mock-tests", AnonAccess.PROTECTED),
                Arguments.of("POST courses", HttpMethod.POST, "/api/courses", AnonAccess.PROTECTED),
                Arguments.of("GET assessments", HttpMethod.GET, "/api/assessments/performance/00000000-0000-0000-0000-000000000001", AnonAccess.PROTECTED),
                Arguments.of("POST learning", HttpMethod.POST, "/api/learning", AnonAccess.PROTECTED),
                Arguments.of("GET dashboard admin", HttpMethod.GET, "/api/dashboard/admin/summary", AnonAccess.PROTECTED),
                Arguments.of("POST community", HttpMethod.POST, "/api/community/posts", AnonAccess.PROTECTED),
                Arguments.of("GET instructor", HttpMethod.GET, "/api/instructor/sessions", AnonAccess.PROTECTED),
                Arguments.of("GET admin referrals", HttpMethod.GET, "/api/admin/referrals", AnonAccess.PROTECTED),
                Arguments.of("POST payments", HttpMethod.POST, "/api/payments/razorpay/create", AnonAccess.PROTECTED),
                Arguments.of("GET users list", HttpMethod.GET, "/api/users", AnonAccess.PROTECTED),
                Arguments.of("GET user by id", HttpMethod.GET, "/api/users/00000000-0000-0000-0000-000000000001", AnonAccess.PROTECTED)
        );
    }

    @ParameterizedTest(name = "anon {0}")
    @MethodSource("anonymousMatrix")
    @DisplayName("Unauthenticated access matches SecurityConfig")
    void unauthenticated(String label, HttpMethod method, String path, AnonAccess access) throws Exception {
        MockHttpServletRequestBuilder req = request(method, path);
        if (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH) {
            req.contentType("application/json").content("{}");
        }
        ResultActions actions = mockMvc.perform(req);
        if (access == AnonAccess.PUBLIC) {
            actions.andExpect(result -> {
                int s = result.getResponse().getStatus();
                if (s == 401) {
                    throw new AssertionError(label + " PUBLIC but got 401 for " + method + " " + path);
                }
            });
        } else {
            actions.andExpect(status().isUnauthorized());
        }
    }

    // -------------------------------------------------------------------------
    // Role-positive matrix
    // -------------------------------------------------------------------------

    enum Expect {
        /** Filter allows request through (status not 401/403) */
        ALLOW,
        /** Authenticated but wrong role → 403 Forbidden */
        DENY
    }

    /**
     * Representative SecurityConfig role rules.
     * Columns: label, method, path, actor role, expected.
     */
    static Stream<Arguments> roleMatrix() {
        String uid = "00000000-0000-0000-0000-000000000001";
        return Stream.of(
                // --- USER may ---
                Arguments.of("USER → payments", HttpMethod.POST, "/api/payments/razorpay/create", UserRole.USER, Expect.ALLOW),
                Arguments.of("USER → learning", HttpMethod.POST, "/api/learning", UserRole.USER, Expect.ALLOW),
                Arguments.of("USER → progress", HttpMethod.GET, "/api/progress", UserRole.USER, Expect.ALLOW),
                Arguments.of("USER → community write", HttpMethod.POST, "/api/community/posts", UserRole.USER, Expect.ALLOW),
                Arguments.of("USER → practice attempt", HttpMethod.POST, "/api/v1/practice/tests/1/attempts", UserRole.USER, Expect.ALLOW),
                Arguments.of("USER → dashboard student-ish", HttpMethod.GET, "/api/dashboard/student", UserRole.USER, Expect.ALLOW),
                Arguments.of("USER → self user get", HttpMethod.GET, "/api/users/" + uid, UserRole.USER, Expect.ALLOW),

                // --- USER must not ---
                Arguments.of("USER ✗ admin mock-tests", HttpMethod.GET, "/api/v1/admin/mock-tests", UserRole.USER, Expect.DENY),
                Arguments.of("USER ✗ admin referrals", HttpMethod.GET, "/api/admin/referrals", UserRole.USER, Expect.DENY),
                Arguments.of("USER ✗ create course", HttpMethod.POST, "/api/courses", UserRole.USER, Expect.DENY),
                Arguments.of("USER ✗ users list", HttpMethod.GET, "/api/users", UserRole.USER, Expect.DENY),
                Arguments.of("USER ✗ instructor", HttpMethod.GET, "/api/instructor/sessions", UserRole.USER, Expect.DENY),
                Arguments.of("USER ✗ dashboard admin", HttpMethod.GET, "/api/dashboard/admin/summary", UserRole.USER, Expect.DENY),

                // --- INSTRUCTOR may ---
                Arguments.of("INSTRUCTOR → instructor API", HttpMethod.GET, "/api/instructor/sessions", UserRole.INSTRUCTOR, Expect.ALLOW),
                Arguments.of("INSTRUCTOR → admin analytics", HttpMethod.GET, "/api/admin/analytics/overview", UserRole.INSTRUCTOR, Expect.ALLOW),
                Arguments.of("INSTRUCTOR → learning", HttpMethod.GET, "/api/learning", UserRole.INSTRUCTOR, Expect.ALLOW),
                Arguments.of("INSTRUCTOR → curriculum mutate path", HttpMethod.POST, "/api/curriculum", UserRole.INSTRUCTOR, Expect.ALLOW),

                // --- INSTRUCTOR must not ---
                Arguments.of("INSTRUCTOR ✗ v1 admin", HttpMethod.GET, "/api/v1/admin/mock-tests", UserRole.INSTRUCTOR, Expect.DENY),
                Arguments.of("INSTRUCTOR ✗ admin referrals", HttpMethod.GET, "/api/admin/referrals", UserRole.INSTRUCTOR, Expect.DENY),
                Arguments.of("INSTRUCTOR ✗ create course", HttpMethod.POST, "/api/courses", UserRole.INSTRUCTOR, Expect.DENY),
                Arguments.of("INSTRUCTOR ✗ users list", HttpMethod.GET, "/api/users", UserRole.INSTRUCTOR, Expect.DENY),

                // --- ADMIN may ---
                Arguments.of("ADMIN → v1 admin", HttpMethod.GET, "/api/v1/admin/mock-tests", UserRole.ADMIN, Expect.ALLOW),
                Arguments.of("ADMIN → create course", HttpMethod.POST, "/api/courses", UserRole.ADMIN, Expect.ALLOW),
                Arguments.of("ADMIN → users list", HttpMethod.GET, "/api/users", UserRole.ADMIN, Expect.ALLOW),
                Arguments.of("ADMIN → admin referrals", HttpMethod.GET, "/api/admin/referrals", UserRole.ADMIN, Expect.ALLOW),
                Arguments.of("ADMIN → dashboard admin", HttpMethod.GET, "/api/dashboard/admin/summary", UserRole.ADMIN, Expect.ALLOW),
                Arguments.of("ADMIN → instructor API", HttpMethod.GET, "/api/instructor/sessions", UserRole.ADMIN, Expect.ALLOW),

                // --- SUPER_ADMIN may (same admin surface) ---
                Arguments.of("SUPER → v1 admin", HttpMethod.GET, "/api/v1/admin/mock-tests", UserRole.SUPER_ADMIN, Expect.ALLOW),
                Arguments.of("SUPER → users list", HttpMethod.GET, "/api/users", UserRole.SUPER_ADMIN, Expect.ALLOW),
                Arguments.of("SUPER → create course", HttpMethod.POST, "/api/courses", UserRole.SUPER_ADMIN, Expect.ALLOW)
        );
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("roleMatrix")
    @DisplayName("JWT role-positive / role-denied access")
    void withJwtRole(String label, HttpMethod method, String path, UserRole role, Expect expect) throws Exception {
        String token = tokens.get(role);
        MockHttpServletRequestBuilder req = request(method, path)
                .header("Authorization", "Bearer " + token);
        if (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.PATCH) {
            req.contentType("application/json").content("{}");
        }

        ResultActions actions = mockMvc.perform(req);
        actions.andExpect(result -> {
            int s = result.getResponse().getStatus();
            if (expect == Expect.ALLOW) {
                if (s == 401 || s == 403) {
                    throw new AssertionError(label + " expected ALLOW for " + role
                            + " but got " + s + " on " + method + " " + path);
                }
            } else {
                if (s != 401 && s != 403) {
                    throw new AssertionError(label + " expected DENY (401/403) for " + role
                            + " but got " + s + " on " + method + " " + path);
                }
            }
        });
    }
}
