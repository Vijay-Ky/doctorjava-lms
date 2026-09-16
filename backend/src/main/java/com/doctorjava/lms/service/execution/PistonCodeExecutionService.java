package com.doctorjava.lms.service.execution;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Executes code via a self-hosted Piston instance.
 * Default URL: http://localhost:2000 — see docker-compose piston service.
 */
@Service
public class PistonCodeExecutionService implements CodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(PistonCodeExecutionService.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.piston.url:http://localhost:2000}")
    private String pistonUrl;

    /** Piston language id → version (use * for latest installed) */
    private static final Map<String, String> LANGUAGE_VERSION = Map.of(
            "JAVA", "15.0.2",
            "PYTHON3", "3.10.0",
            "JAVASCRIPT", "18.15.0",
            "CPP", "10.2.0"
    );

    private static final Map<String, String> PISTON_LANG = Map.of(
            "JAVA", "java",
            "PYTHON3", "python",
            "JAVASCRIPT", "javascript",
            "CPP", "c++"
    );

    @Override
    public ExecutionResult execute(String language, String sourceCode, String stdin, int timeLimitMs, int memoryLimitKb) {
        String langKey = language == null ? "JAVA" : language.trim().toUpperCase();
        String pistonLang = PISTON_LANG.getOrDefault(langKey, "java");
        String version = LANGUAGE_VERSION.getOrDefault(langKey, "*");

        // Piston run_timeout is in milliseconds
        long runTimeout = Math.max(500, Math.min(timeLimitMs, 15000));

        String fileName = switch (langKey) {
            case "JAVA" -> "Main.java";
            case "PYTHON3" -> "main.py";
            case "JAVASCRIPT" -> "main.js";
            case "CPP" -> "main.cpp";
            default -> "Main.java";
        };

        Map<String, Object> body = Map.of(
                "language", pistonLang,
                "version", version,
                "files", List.of(Map.of("name", fileName, "content", sourceCode == null ? "" : sourceCode)),
                "stdin", stdin == null ? "" : stdin,
                "run_timeout", runTimeout,
                "compile_timeout", 10000
        );

        try {
            String url = pistonUrl.replaceAll("/$", "") + "/api/v2/execute";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<String> resp = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                log.warn("Piston non-2xx: {}", resp.getStatusCode());
                return ExecutionResult.compileError("Execution service unavailable: " + resp.getStatusCode());
            }

            JsonNode root = mapper.readTree(resp.getBody());
            JsonNode compile = root.path("compile");
            JsonNode run = root.path("run");

            if (!compile.isMissingNode() && compile.path("code").asInt(0) != 0) {
                String err = compile.path("stderr").asText("") + compile.path("stdout").asText("");
                return ExecutionResult.compileError(err.isBlank() ? "Compilation failed" : err);
            }

            boolean timedOut = run.path("signal").asText("").equalsIgnoreCase("SIGKILL")
                    || run.path("code").asInt(0) == 124;
            String stdout = run.path("stdout").asText("");
            String stderr = run.path("stderr").asText("");
            int exitCode = run.path("code").asInt(0);
            // Piston does not always report precise runtime/memory; approximate from wall if present
            long runtimeMs = run.path("cpu_time").asLong(0);
            if (runtimeMs <= 0) runtimeMs = run.path("wall_time").asLong(0);
            long memoryKb = run.path("memory").asLong(0) / 1024;

            if (timedOut) {
                return ExecutionResult.timeout(runtimeMs > 0 ? runtimeMs : timeLimitMs);
            }
            return new ExecutionResult(stdout, stderr, exitCode, runtimeMs, memoryKb, false, false);
        } catch (Exception e) {
            log.error("Piston execute failed: {}", e.getMessage());
            return ExecutionResult.compileError("Execution service error: " + e.getMessage()
                    + ". Ensure Piston is running (docker compose up piston).");
        }
    }
}
