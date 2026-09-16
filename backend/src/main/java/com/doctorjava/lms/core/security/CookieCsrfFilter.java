package com.doctorjava.lms.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Set;

/**
 * Hybrid CSRF: required only when the request was authenticated via the httpOnly JWT cookie
 * (browser session). Authorization: Bearer clients (mobile/API) skip CSRF.
 *
 * Double-submit: non-httpOnly cookie XSRF-TOKEN must match header X-XSRF-TOKEN.
 */
@Component
public class CookieCsrfFilter extends OncePerRequestFilter {

    public static final String CSRF_COOKIE = "XSRF-TOKEN";
    public static final String CSRF_HEADER = "X-XSRF-TOKEN";
    public static final String JWT_COOKIE = "DJ_ACCESS_TOKEN";

    private static final Set<String> SAFE = Set.of("GET", "HEAD", "OPTIONS", "TRACE");
    private final SecureRandom random = new SecureRandom();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // Always mint XSRF cookie (including login) so the next authenticated POST can send it.
        String csrf = readCookie(request, CSRF_COOKIE);
        if (csrf == null || csrf.isBlank()) {
            csrf = newToken();
            Cookie c = new Cookie(CSRF_COOKIE, csrf);
            c.setHttpOnly(false);
            c.setPath("/");
            c.setSecure(request.isSecure());
            response.addCookie(c);
        }

        String path = request.getRequestURI() != null ? request.getRequestURI() : "";
        boolean publicAuth = path.startsWith("/api/auth/")
                || path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")
                || path.startsWith("/api/payments/webhook/");

        if (SAFE.contains(request.getMethod().toUpperCase()) || publicAuth) {
            chain.doFilter(request, response);
            return;
        }

        boolean usedCookieJwt = hasCookie(request, JWT_COOKIE) && !hasBearer(request);
        if (usedCookieJwt) {
            String header = request.getHeader(CSRF_HEADER);
            if (header == null || !header.equals(csrf)) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"CSRF token missing or invalid\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean hasBearer(HttpServletRequest request) {
        String h = request.getHeader("Authorization");
        return h != null && h.startsWith("Bearer ");
    }

    private boolean hasCookie(HttpServletRequest request, String name) {
        return readCookie(request, name) != null;
    }

    private String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private String newToken() {
        byte[] buf = new byte[24];
        random.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }
}
