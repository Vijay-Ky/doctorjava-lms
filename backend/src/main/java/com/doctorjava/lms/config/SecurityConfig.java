package com.doctorjava.lms.config;

import com.doctorjava.lms.core.security.AuthRateLimitFilter;
import com.doctorjava.lms.core.config.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.ObjectProvider;
import com.doctorjava.lms.core.security.CookieCsrfFilter;
import com.doctorjava.lms.core.security.jwt.JwtAuthTokenFilter;
import com.doctorjava.lms.core.security.jwt.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthTokenFilter jwtAuthTokenFilter;
    private final AuthRateLimitFilter authRateLimitFilter;
    private final CookieCsrfFilter cookieCsrfFilter;
    private final ObjectProvider<OAuth2LoginSuccessHandler> oauth2SuccessHandler;

    @Value("${app.cors.allowed-origin:http://localhost:3000}")
    private String allowedOrigin;

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // JWT in Authorization header / SameSite cookie; see README for CSRF if moving fully to cookie
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(e -> e.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public auth (explicit methods) + docs + health — must stay before anyRequest()
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/session").permitAll()
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/oauth2/**", "/swagger-ui/**", "/v3/api-docs/**", "/actuator/health", "/error").permitAll()

                // Public course catalog (read-only)
                .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/curriculum/course/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/curriculum/**").authenticated()
                .requestMatchers("/api/curriculum/**").hasAnyRole("ADMIN", "SUPER_ADMIN", "INSTRUCTOR")

                // Practice: browse public; taking tests requires login
                .requestMatchers(HttpMethod.GET, "/api/v1/practice/tests", "/api/v1/practice/tests/**", "/api/v1/practice/mcq/**", "/api/v1/practice/coding-tests", "/api/v1/practice/coding-tests/**").permitAll()
                .requestMatchers("/api/v1/practice/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/catalog/**").permitAll()

                // Payment webhooks (signature-verified in controller)
                .requestMatchers(HttpMethod.POST, "/api/payments/webhook/**").permitAll()

                // ---- ADMIN ONLY (practice question bank + mock test management) ----
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Course mutations — admin
                .requestMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Authenticated learner + staff
                .requestMatchers("/api/assessments/**", "/api/learning/**", "/api/progress/**",
                        "/api/questions/**", "/api/discussions/**", "/api/feedbacks/**")
                    .hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "INSTRUCTOR")
                .requestMatchers("/api/dashboard/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/dashboard/**").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "INSTRUCTOR")
                .requestMatchers("/api/notifications/**").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "INSTRUCTOR")
                .requestMatchers("/api/assignments/**").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN", "INSTRUCTOR")
                .requestMatchers(HttpMethod.GET, "/api/community/**").permitAll()
                .requestMatchers("/api/community/**").authenticated()
                .requestMatchers("/api/instructor/**").hasAnyRole("INSTRUCTOR", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/analytics/**").hasAnyRole("ADMIN", "SUPER_ADMIN", "INSTRUCTOR")
                .requestMatchers("/api/leaderboard/**").permitAll()
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/payments/**").hasAnyRole("USER", "ADMIN", "SUPER_ADMIN")

                // User management: list/delete/role changes are admin; self profile needs auth
                .requestMatchers(HttpMethod.GET, "/api/users/details").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/{id}").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/{id}/profile-image").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/{id}").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/{id}/upload-image").authenticated()
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                .anyRequest().authenticated())
            .addFilterBefore(authRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(cookieCsrfFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);
        OAuth2LoginSuccessHandler handler = oauth2SuccessHandler.getIfAvailable();
        if (handler != null) {
            http.oauth2Login(oauth -> oauth.successHandler(handler));
        }
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        // Driven by FRONTEND_ORIGIN / app.cors.allowed-origin — never wildcard with credentials
        List<String> origins = Arrays.stream(allowedOrigin.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        c.setAllowedOrigins(origins);
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Student-Key", "X-XSRF-TOKEN", "Accept"));
        c.setAllowCredentials(true);
        c.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}
