package com.doctorjava.lms.core.config;

import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.enums.UserRole;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.security.util.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.UUID;

/**
 * On Google/Facebook success: find-or-create user by email, issue DJ_ACCESS_TOKEN cookie, redirect to frontend callback.
 */
@Component
@RequiredArgsConstructor
@ConditionalOnClass(name = "org.springframework.security.oauth2.core.user.OAuth2User")
@ConditionalOnProperty(name = "spring.security.oauth2.client.registration.google.client-id")
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.cors.allowed-origin:http://localhost:3000}")
    private String frontendOrigin;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.jwtExpirationMs:86400000}")
    private long jwtExpirationMs;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth = (OAuth2User) authentication.getPrincipal();
        String email = oauth.getAttribute("email");
        String name = oauth.getAttribute("name");
        if (email == null) {
            response.sendRedirect(frontendOrigin + "/login?error=oauth_no_email");
            return;
        }
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = User.builder()
                    .username(name != null ? name : email)
                    .email(email)
                    .password("$2a$10$oauth.placeholder.hash.not.usable.xx") // unusable
                    .role(UserRole.USER)
                    .isActive(true)
                    .authProvider(request.getRequestURI().contains("google") ? "GOOGLE" : "FACEBOOK")
                    .providerUserId(String.valueOf(oauth.getAttribute("sub") != null ? oauth.getAttribute("sub") : oauth.getAttribute("id")))
                    .build();
            user = userRepository.save(user);
        }

        UserPrincipal principal = UserPrincipal.create(user);
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());
        String jwt = jwtUtils.generateJwtToken(auth);

        ResponseCookie cookie = ResponseCookie.from("DJ_ACCESS_TOKEN", jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        response.sendRedirect(frontendOrigin + "/auth/callback?status=success");
    }
}
