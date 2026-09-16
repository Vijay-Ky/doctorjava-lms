package com.doctorjava.lms.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public final class CodingDtos {
    private CodingDtos() {}

    public record TestCaseRequest(
            String input,
            String expectedOutput,
            boolean sample,
            int displayOrder,
            BigDecimal weight
    ) {}

    public record TemplateRequest(
            @NotBlank String language,
            @NotBlank String starterCode,
            String referenceSolution
    ) {}

    public record CodingQuestionRequest(
            @NotBlank String title,
            @NotBlank String problemStatementMarkdown,
            @NotNull Long subjectId,
            Long topicId,
            @NotBlank String difficulty,
            String constraintsText,
            String inputFormat,
            String outputFormat,
            Integer timeLimitMs,
            Integer memoryLimitKb,
            String allowedLanguages,
            BigDecimal marks,
            Boolean partialCreditAllowed,
            String status,
            List<TestCaseRequest> testCases,
            List<TemplateRequest> templates
    ) {}

    public record TestCaseAdminView(
            Long id, String input, String expectedOutput, boolean sample, int displayOrder, BigDecimal weight
    ) {}

    public record TemplateAdminView(
            String language, String starterCode, String referenceSolution
    ) {}

    public record CodingQuestionAdminView(
            Long id, String questionCode, String title, String problemStatementMarkdown,
            Long subjectId, String subjectName, Long topicId, String topicName,
            String difficulty, String constraintsText, String inputFormat, String outputFormat,
            int timeLimitMs, int memoryLimitKb, String allowedLanguages,
            BigDecimal marks, boolean partialCreditAllowed, String status,
            List<TestCaseAdminView> testCases, List<TemplateAdminView> templates,
            LocalDateTime createdAt, LocalDateTime updatedAt
    ) {}

    public record CodingQuestionCard(
            Long id, String questionCode, String title, String difficulty,
            String subjectName, BigDecimal marks, String status, int sampleCount, int hiddenCount
    ) {}

    public record CodingTestCard(
            Long id, String testCode, String title, String description,
            String subject, String difficulty, int durationMinutes,
            int totalQuestions, int passPercentage, boolean published
    ) {}

    public record CodingTestRequest(
            @NotBlank String title,
            String description,
            @NotNull Long subjectId,
            @NotBlank String difficulty,
            @Min(1) int durationMinutes,
            @Min(0) int passPercentage,
            String instructions,
            boolean published,
            @NotEmpty List<Long> codingQuestionIds
    ) {}

    public record CodingAttemptStartResponse(
            Long attemptId, String attemptCode, int durationMinutes,
            LocalDateTime expiresAt, int questionCount, List<QuestionSummary> questions
    ) {}

    public record QuestionSummary(Long attemptQuestionId, Long codingQuestionId, String title, int order) {}

    public record SampleCaseView(Long id, String input, String expectedOutput, int displayOrder) {}

    public record CodingQuestionStudentView(
            Long attemptQuestionId,
            Long codingQuestionId,
            String title,
            String problemStatementMarkdown,
            String constraintsText,
            String inputFormat,
            String outputFormat,
            int timeLimitMs,
            int memoryLimitKb,
            List<String> allowedLanguages,
            Map<String, String> starterCode,
            List<SampleCaseView> sampleCases,
            BigDecimal marks
    ) {}

    public record RunSubmitRequest(
            @NotBlank String language,
            @NotBlank String sourceCode
    ) {}

    public record CaseResultView(
            Long testCaseId,
            boolean sample,
            boolean passed,
            String input,
            String expectedOutput,
            String actualOutput,
            String stderr,
            Integer runtimeMs
    ) {}

    public record RunResponse(
            String status,
            int passed,
            int total,
            List<CaseResultView> cases,
            String compileError
    ) {}

    public record SubmitAcceptedResponse(Long submissionId, String status) {}

    public record SubmissionPollResponse(
            Long submissionId,
            String status,
            boolean isFinal,
            int passed,
            int total,
            Integer runtimeMs,
            Integer memoryKb,
            BigDecimal awardedMarks,
            String compileError,
            List<CaseResultView> cases
    ) {}

    public record FinishResponse(
            Long attemptId,
            BigDecimal score,
            BigDecimal maxScore,
            BigDecimal percentage,
            boolean passed,
            long timeTakenSeconds,
            List<QuestionScore> questionScores
    ) {}

    public record QuestionScore(
            Long attemptQuestionId,
            String title,
            String status,
            int passed,
            int total,
            BigDecimal awardedMarks,
            BigDecimal maxMarks
    ) {}
}
