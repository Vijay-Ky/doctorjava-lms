package com.doctorjava.lms.controller;

import com.doctorjava.lms.entity.Topic;
import com.doctorjava.lms.service.BulkMcqImportService;
import com.doctorjava.lms.service.BulkMcqImportService.ImportResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/mcq-import")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class BulkMcqImportController {

    private final BulkMcqImportService importService;

    /**
     * Paste or upload assignment-style text (Questions + Answers).
     * Form fields: subjectId, topicId (or topicName), difficulty, publish, text
     * Optional multipart file "file" (.txt).
     */
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ImportResult importMcq(
            @RequestParam Long subjectId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String topicName,
            @RequestParam(defaultValue = "EASY") String difficulty,
            @RequestParam(defaultValue = "true") boolean publish,
            @RequestParam(required = false) String text,
            @RequestPart(required = false) MultipartFile file
    ) throws Exception {
        if (topicId == null) {
            if (topicName == null || topicName.isBlank()) {
                throw new IllegalArgumentException("topicId or topicName is required");
            }
            Topic t = importService.ensureTopic(subjectId, topicName.trim());
            topicId = t.getId();
        }
        String body = text;
        if ((body == null || body.isBlank()) && file != null && !file.isEmpty()) {
            // GAP-009: size + extension allowlist (text only)
            if (file.getSize() > 2L * 1024 * 1024) {
                throw new IllegalArgumentException("Import file must be <= 2MB");
            }
            String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (!name.endsWith(".txt") && !name.endsWith(".md") && !name.isBlank()) {
                throw new IllegalArgumentException("Only .txt or .md files are allowed");
            }
            body = new String(file.getBytes(), StandardCharsets.UTF_8);
        }
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Provide text or a .txt file");
        }
        if (body.length() > 2_000_000) {
            throw new IllegalArgumentException("Import text must be <= 2MB");
        }
        return importService.importText(body, subjectId, topicId, difficulty, publish);
    }

    @PostMapping(value = "/preview", consumes = MediaType.TEXT_PLAIN_VALUE)
    public Map<String, Object> preview(@RequestBody String text) {
        var parsed = importService.parse(text);
        return Map.of(
                "count", parsed.size(),
                "sample", parsed.stream().limit(3).map(p -> Map.of(
                        "stem", p.stem() != null ? p.stem().substring(0, Math.min(120, p.stem().length())) : "",
                        "options", p.options().size(),
                        "correct", String.valueOf(p.correctKey()),
                        "hasCode", p.codeContent() != null && !p.codeContent().isBlank()
                )).toList()
        );
    }
}
