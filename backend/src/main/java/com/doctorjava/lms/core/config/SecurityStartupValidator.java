package com.doctorjava.lms.core.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Refuses to start in non-local profiles when critical secrets are missing or weak.
 */
@Component
@Slf4j
public class SecurityStartupValidator {

    private final Environment env;

    @Value("${app.jwtSecret:}")
    private String jwtSecret;

    @Value("${app.default-admin.password:}")
    private String adminPassword;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${payment.razorpay.key-id:}")
    private String razorpayKey;

    @Value("${payment.stripe.secret-key:}")
    private String stripeKey;

    public SecurityStartupValidator(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void validate() {
        boolean isLocal = Arrays.stream(env.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("local") || p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("test"));

        if (isLocal) {
            log.warn("Running with local/dev profile — weak secret fallbacks are allowed. Do NOT use this profile in production.");
            return;
        }

        // Production / default non-local: hard fail on missing secrets
        if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 32
                || jwtSecret.contains("change-this") || jwtSecret.contains("local-dev")) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set to a strong random value (>=32 chars) outside local/dev profiles. "
                            + "Generate with: openssl rand -base64 48");
        }
        if (adminPassword == null || adminPassword.isBlank()
                || adminPassword.equals("admin123") || adminPassword.equals("admin")) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD must be set to a strong non-default value outside local/dev profiles.");
        }
        if (dbPassword == null || dbPassword.isBlank() || dbPassword.equals("admin") || dbPassword.equals("root")) {
            throw new IllegalStateException(
                    "DB_PASSWORD must be set to a non-default value outside local/dev profiles.");
        }

        boolean razorpayOk = razorpayKey != null && !razorpayKey.isBlank() && !razorpayKey.contains("placeholder");
        boolean stripeOk = stripeKey != null && !stripeKey.isBlank() && !stripeKey.contains("placeholder");
        if (!razorpayOk && !stripeOk) {
            throw new IllegalStateException(
                    "At least one payment provider (Razorpay or Stripe) must be configured with real keys in production. "
                            + "Mock payment path is disabled outside local/dev/test.");
        }

        log.info("Security startup checks passed for active profiles: {}", Arrays.toString(env.getActiveProfiles()));
    }
}
