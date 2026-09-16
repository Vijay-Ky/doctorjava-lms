package com.doctorjava.lms.controller;

import com.doctorjava.lms.dto.CodingDtos.*;
import com.doctorjava.lms.service.CodingQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/coding-questions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class CodingQuestionAdminController {

    private final CodingQuestionService service;

    @GetMapping
    public List<CodingQuestionCard> list() {
        return service.listAdmin();
    }

    @GetMapping("/{id}")
    public CodingQuestionAdminView get(@PathVariable Long id) {
        return service.getAdmin(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CodingQuestionAdminView create(@Valid @RequestBody CodingQuestionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public CodingQuestionAdminView update(@PathVariable Long id, @Valid @RequestBody CodingQuestionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/{id}/validate")
    public Map<String, Object> validate(@PathVariable Long id, @RequestParam(defaultValue = "JAVA") String language) {
        List<String> failures = service.validateReference(id, language);
        return Map.of(
                "ok", failures.isEmpty(),
                "failures", failures
        );
    }
}
