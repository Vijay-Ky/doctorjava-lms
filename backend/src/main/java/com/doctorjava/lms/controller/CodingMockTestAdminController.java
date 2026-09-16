package com.doctorjava.lms.controller;

import com.doctorjava.lms.dto.CodingDtos.*;
import com.doctorjava.lms.service.CodingMockTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/coding-tests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class CodingMockTestAdminController {

    private final CodingMockTestService service;

    @GetMapping
    public List<CodingTestCard> list() {
        return service.listCodingTests();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CodingTestCard create(@Valid @RequestBody CodingTestRequest request) {
        return service.createCodingTest(request);
    }

    @PutMapping("/{id}")
    public CodingTestCard update(@PathVariable Long id, @Valid @RequestBody CodingTestRequest request) {
        return service.updateCodingTest(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.deleteCodingTest(id);
    }
}
