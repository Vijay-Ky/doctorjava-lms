package com.doctorjava.lms.core.config;

import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.enums.UserRole;
import com.doctorjava.lms.core.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@Configuration
@Slf4j
public class AdminInitializer {

    @Value("${app.default-admin.username:admin}")
    private String defaultUsername;

    @Value("${app.default-admin.password:admin}")
    private String defaultPassword;

    @Value("${app.default-admin.email:admin@doctorjava.tech}")
    private String defaultEmail;

    @Bean
    public CommandLineRunner createDefaultUsers(UserRepository userRepository,
                                                PasswordEncoder passwordEncoder,
                                                Environment env) {
        return args -> {
            boolean isLocal = Arrays.stream(env.getActiveProfiles())
                    .anyMatch(p -> p.equalsIgnoreCase("local") || p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("test"));

            // --- SUPER_ADMIN: username display "admin", email admin@doctorjava.tech, password admin ---
            User admin = userRepository.findByEmail(defaultEmail);
            if (admin == null) {
                admin = userRepository.findByEmail("admin");
            }
            if (admin == null) {
                admin = new User();
                admin.setUsername(defaultUsername);
                admin.setEmail(defaultEmail);
                admin.setPassword(passwordEncoder.encode(
                        defaultPassword != null && !defaultPassword.isBlank() ? defaultPassword : "admin"));
                admin.setRole(UserRole.SUPER_ADMIN);
                admin.setIsActive(true);
                userRepository.save(admin);
                log.warn("Created default SUPER_ADMIN email={} password=admin (change in production)", defaultEmail);
            } else if (isLocal) {
                // Local only: ensure known password for development
                admin.setRole(UserRole.SUPER_ADMIN);
                admin.setIsActive(true);
                admin.setPassword(passwordEncoder.encode(
                        defaultPassword != null && !defaultPassword.isBlank() ? defaultPassword : "admin"));
                userRepository.save(admin);
                log.warn("Local profile: reset SUPER_ADMIN password for {}", defaultEmail);
            } else {
                log.info("Admin already exists: {}", defaultEmail);
            }

            // --- Default learner ---
            String demoEmail = "vijayky007@gmail.com";
            User learner = userRepository.findByEmail(demoEmail);
            if (learner == null) {
                learner = new User();
                learner.setUsername("vijay");
                learner.setEmail(demoEmail);
                learner.setPassword(passwordEncoder.encode("vijay"));
                learner.setRole(UserRole.USER);
                learner.setIsActive(true);
                userRepository.save(learner);
                log.warn("Created default USER email={} password=vijay", demoEmail);
            } else if (isLocal) {
                learner.setPassword(passwordEncoder.encode("vijay"));
                learner.setIsActive(true);
                userRepository.save(learner);
                log.info("Local profile: reset demo user password for {}", demoEmail);
            }
        };
    }
}
