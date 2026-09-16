package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.dto.ApiResponse;
import com.doctorjava.lms.core.dto.JwtResponseDTO;
import com.doctorjava.lms.core.dto.LoginRequestDTO;
import com.doctorjava.lms.core.dto.RegisterRequest;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.security.util.JwtUtils;
import com.doctorjava.lms.core.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.jwtExpirationMs:86400000}")
    private long jwtExpirationMs;

    private static final String JWT_COOKIE = "DJ_ACCESS_TOKEN";

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO loginRequest,
            HttpServletResponse response) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        var existing = authService.getUserByEmail(loginRequest.getEmail());
        if (existing != null) {
            try {
                authService.assertNotLocked(existing);
            } catch (IllegalStateException ex) {
                return ResponseEntity.status(HttpStatus.LOCKED)
                        .body(new ApiResponse<>(ex.getMessage(), null));
            }
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            authService.recordFailedLogin(loginRequest.getEmail());
            throw ex;
        }

        authService.resetFailedLogin(loginRequest.getEmail());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // httpOnly cookie — not readable by JS (mitigates XSS token theft)
        ResponseCookie cookie = ResponseCookie.from(JWT_COOKIE, jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .sameSite(cookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Token still returned in body for backward compatibility during migration;
        // frontend should prefer the cookie and stop persisting JWT in localStorage.
        JwtResponseDTO jwtResponse = JwtResponseDTO.builder()
                .token(jwt)
                .type("Bearer")
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .name(userPrincipal.getName())
                .role(userPrincipal.getAuthorities().iterator().next().getAuthority())
                .build();

        log.info("User logged in successfully: {}", loginRequest.getEmail());
        return ResponseEntity.ok(new ApiResponse<>("Login successful", jwtResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest signUpRequest) {
        log.info("Registration attempt for email: {}", signUpRequest.getEmail());

        User user = authService.createUser(signUpRequest);

        log.info("User registered successfully: {}", signUpRequest.getEmail());
        // Never return password hash; User.password is WRITE_ONLY already
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("User registered successfully", user));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<Map<String, Object>>> session(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal up)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>("Not authenticated", null));
        }
        Map<String, Object> data = Map.of(
                "id", up.getId().toString(),
                "email", up.getEmail(),
                "name", up.getName(),
                "role", up.getAuthorities().iterator().next().getAuthority()
        );
        return ResponseEntity.ok(new ApiResponse<>("OK", data));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        ResponseCookie clear = ResponseCookie.from(JWT_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clear.toString());
        return ResponseEntity.ok(new ApiResponse<>("Logout successful", null));
    }
}