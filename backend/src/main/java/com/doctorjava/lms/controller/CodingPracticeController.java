package com.doctorjava.lms.controller;

import com.doctorjava.lms.dto.CodingDtos.*;
import com.doctorjava.lms.service.CodingMockTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/practice")
@RequiredArgsConstructor
public class CodingPracticeController {

    private final CodingMockTestService service;

    private String studentKey(Authentication auth) {
        if (auth == null || auth.getName() == null) return "anonymous";
        return auth.getName();
    }

    @GetMapping("/coding-tests")
    public List<CodingTestCard> listCodingTests() {
        return service.listPublishedCodingTests();
    }

    @PostMapping("/coding-tests/{id}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public CodingAttemptStartResponse start(@PathVariable Long id, Authentication auth) {
        return service.start(id, studentKey(auth));
    }

    @GetMapping("/coding-attempts/{attemptId}/questions/{questionId}")
    public CodingQuestionStudentView getQuestion(
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            Authentication auth) {
        return service.getQuestion(attemptId, questionId, studentKey(auth));
    }

    @PostMapping("/coding-attempts/{attemptId}/questions/{questionId}/run")
    public RunResponse run(
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            @Valid @RequestBody RunSubmitRequest body,
            Authentication auth) {
        return service.run(attemptId, questionId, body, studentKey(auth));
    }

    @PostMapping("/coding-attempts/{attemptId}/questions/{questionId}/submit")
    public SubmitAcceptedResponse submit(
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            @Valid @RequestBody RunSubmitRequest body,
            Authentication auth) {
        return service.submit(attemptId, questionId, body, studentKey(auth));
    }

    @GetMapping("/coding-submissions/{submissionId}")
    public SubmissionPollResponse poll(@PathVariable Long submissionId, Authentication auth) {
        return service.pollSubmission(submissionId, studentKey(auth));
    }

    @PostMapping("/coding-attempts/{attemptId}/finish")
    public FinishResponse finish(@PathVariable Long attemptId, Authentication auth) {
        return service.finish(attemptId, studentKey(auth));
    }
}
