package com.doctorjava.lms.service;

import com.doctorjava.lms.dto.CodingDtos.*;
import com.doctorjava.lms.entity.*;
import com.doctorjava.lms.repository.*;
import com.doctorjava.lms.service.execution.CodeExecutionService;
import com.doctorjava.lms.service.execution.ExecutionResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CodingQuestionService {

    private final CodingQuestionRepository questions;
    private final SubjectRepository subjects;
    private final TopicRepository topics;
    private final CodeExecutionService executionService;

    @Transactional(readOnly = true)
    public List<CodingQuestionCard> listAdmin() {
        return questions.findAll().stream().map(this::card).toList();
    }

    @Transactional(readOnly = true)
    public List<CodingQuestionCard> listPublished() {
        return questions.findAllPublished().stream().map(this::card).toList();
    }

    @Transactional(readOnly = true)
    public CodingQuestionAdminView getAdmin(Long id) {
        CodingQuestion q = questions.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Coding question not found"));
        return toAdminView(q);
    }

    @Transactional
    public CodingQuestionAdminView create(CodingQuestionRequest req) {
        CodingQuestion q = mapNew(req);
        q = questions.save(q); // need id before templates
        applyTestCasesAndTemplates(q, req);
        // set codingQuestionId on templates
        for (CodingQuestionTemplate t : q.getTemplates()) {
            t.setCodingQuestionId(q.getId());
            t.setCodingQuestion(q);
        }
        return toAdminView(questions.save(q));
    }

    @Transactional
    public CodingQuestionAdminView update(Long id, CodingQuestionRequest req) {
        CodingQuestion q = questions.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Coding question not found"));
        q.setTitle(req.title());
        q.setProblemStatementMarkdown(req.problemStatementMarkdown());
        q.setSubject(subjects.findById(req.subjectId()).orElseThrow());
        if (req.topicId() != null) {
            q.setTopic(topics.findById(req.topicId()).orElse(null));
        }
        q.setDifficulty(Question.Difficulty.valueOf(req.difficulty().toUpperCase()));
        q.setConstraintsText(req.constraintsText());
        q.setInputFormat(req.inputFormat());
        q.setOutputFormat(req.outputFormat());
        if (req.timeLimitMs() != null) q.setTimeLimitMs(req.timeLimitMs());
        if (req.memoryLimitKb() != null) q.setMemoryLimitKb(req.memoryLimitKb());
        if (req.allowedLanguages() != null) q.setAllowedLanguages(req.allowedLanguages());
        if (req.marks() != null) q.setMarks(req.marks());
        if (req.partialCreditAllowed() != null) q.setPartialCreditAllowed(req.partialCreditAllowed());
        if (req.status() != null) q.setStatus(Question.QuestionStatus.valueOf(req.status().toUpperCase()));

        q.getTestCases().clear();
        q.getTemplates().clear();
        questions.saveAndFlush(q);
        applyTestCasesAndTemplates(q, req);
        for (CodingQuestionTemplate t : q.getTemplates()) {
            t.setCodingQuestionId(q.getId());
            t.setCodingQuestion(q);
        }
        return toAdminView(questions.save(q));
    }

    @Transactional
    public void delete(Long id) {
        if (!questions.existsById(id)) throw new NoSuchElementException("Coding question not found");
        questions.deleteById(id);
    }

    /**
     * Validate reference solution against all test cases before publishing.
     * Returns list of failing case descriptions (empty = all pass).
     */
    @Transactional(readOnly = true)
    public List<String> validateReference(Long id, String language) {
        CodingQuestion q = questions.findByIdWithDetails(id)
                .orElseThrow(() -> new NoSuchElementException("Coding question not found"));
        String lang = language == null ? "JAVA" : language.toUpperCase();
        CodingQuestionTemplate tpl = q.templateFor(lang)
                .orElseThrow(() -> new IllegalArgumentException("No reference solution for " + lang));
        String ref = tpl.getReferenceSolution();
        if (ref == null || ref.isBlank()) {
            throw new IllegalArgumentException("Reference solution is empty for " + lang);
        }
        List<String> failures = new ArrayList<>();
        for (CodingQuestionTestCase tc : q.getTestCases()) {
            ExecutionResult er = executionService.execute(lang, ref, tc.getInput(),
                    q.getTimeLimitMs(), q.getMemoryLimitKb());
            if (er.compileError()) {
                failures.add("Compile error: " + er.stderr());
                break;
            }
            if (er.timedOut()) {
                failures.add("TLE on case order=" + tc.getDisplayOrder());
                continue;
            }
            if (er.exitCode() != 0) {
                failures.add("Runtime error on case order=" + tc.getDisplayOrder() + ": " + er.stderr());
                continue;
            }
            if (!CodeGradingService.normalize(er.stdout()).equals(CodeGradingService.normalize(tc.getExpectedOutput()))) {
                failures.add("WA on case order=" + tc.getDisplayOrder());
            }
        }
        return failures;
    }

    private void applyTestCasesAndTemplates(CodingQuestion q, CodingQuestionRequest req) {
        if (req.testCases() != null) {
            int order = 0;
            for (TestCaseRequest tc : req.testCases()) {
                CodingQuestionTestCase entity = CodingQuestionTestCase.builder()
                        .codingQuestion(q)
                        .input(tc.input() == null ? "" : tc.input())
                        .expectedOutput(tc.expectedOutput() == null ? "" : tc.expectedOutput())
                        .sample(tc.sample())
                        .displayOrder(tc.displayOrder() > 0 ? tc.displayOrder() : order++)
                        .weight(tc.weight() != null ? tc.weight() : BigDecimal.ONE)
                        .build();
                q.getTestCases().add(entity);
            }
        }
        if (req.templates() != null) {
            for (TemplateRequest t : req.templates()) {
                CodingQuestionTemplate tpl = CodingQuestionTemplate.builder()
                        .codingQuestionId(q.getId())
                        .language(t.language().toUpperCase())
                        .starterCode(t.starterCode())
                        .referenceSolution(t.referenceSolution())
                        .codingQuestion(q)
                        .build();
                // id may be null on first create — flush parent first
                q.getTemplates().add(tpl);
            }
        }
        // Ensure JAVA starter exists
        boolean hasJava = q.getTemplates().stream().anyMatch(t -> "JAVA".equalsIgnoreCase(t.getLanguage()));
        if (!hasJava) {
            q.getTemplates().add(CodingQuestionTemplate.builder()
                    .codingQuestionId(q.getId())
                    .language("JAVA")
                    .starterCode(defaultJavaStarter())
                    .codingQuestion(q)
                    .build());
        }
    }

    private CodingQuestion mapNew(CodingQuestionRequest req) {
        return CodingQuestion.builder()
                .title(req.title())
                .problemStatementMarkdown(req.problemStatementMarkdown())
                .subject(subjects.findById(req.subjectId()).orElseThrow())
                .topic(req.topicId() != null ? topics.findById(req.topicId()).orElse(null) : null)
                .difficulty(Question.Difficulty.valueOf(req.difficulty().toUpperCase()))
                .constraintsText(req.constraintsText())
                .inputFormat(req.inputFormat())
                .outputFormat(req.outputFormat())
                .timeLimitMs(req.timeLimitMs() != null ? req.timeLimitMs() : 2000)
                .memoryLimitKb(req.memoryLimitKb() != null ? req.memoryLimitKb() : 262144)
                .allowedLanguages(req.allowedLanguages() != null ? req.allowedLanguages() : "JAVA")
                .marks(req.marks() != null ? req.marks() : new BigDecimal("100"))
                .partialCreditAllowed(req.partialCreditAllowed() == null || req.partialCreditAllowed())
                .status(req.status() != null
                        ? Question.QuestionStatus.valueOf(req.status().toUpperCase())
                        : Question.QuestionStatus.DRAFT)
                .testCases(new ArrayList<>())
                .templates(new ArrayList<>())
                .build();
    }

    private CodingQuestionCard card(CodingQuestion q) {
        int samples = (int) q.getTestCases().stream().filter(CodingQuestionTestCase::isSample).count();
        int hidden = q.getTestCases().size() - samples;
        return new CodingQuestionCard(q.getId(), q.getQuestionCode(), q.getTitle(),
                q.getDifficulty().name(),
                q.getSubject() != null ? q.getSubject().getName() : null,
                q.getMarks(), q.getStatus().name(), samples, hidden);
    }

    private CodingQuestionAdminView toAdminView(CodingQuestion q) {
        return new CodingQuestionAdminView(
                q.getId(), q.getQuestionCode(), q.getTitle(), q.getProblemStatementMarkdown(),
                q.getSubject() != null ? q.getSubject().getId() : null,
                q.getSubject() != null ? q.getSubject().getName() : null,
                q.getTopic() != null ? q.getTopic().getId() : null,
                q.getTopic() != null ? q.getTopic().getName() : null,
                q.getDifficulty().name(), q.getConstraintsText(), q.getInputFormat(), q.getOutputFormat(),
                q.getTimeLimitMs(), q.getMemoryLimitKb(), q.getAllowedLanguages(),
                q.getMarks(), q.isPartialCreditAllowed(), q.getStatus().name(),
                q.getTestCases().stream()
                        .map(tc -> new TestCaseAdminView(tc.getId(), tc.getInput(), tc.getExpectedOutput(),
                                tc.isSample(), tc.getDisplayOrder(), tc.getWeight()))
                        .toList(),
                q.getTemplates().stream()
                        .map(t -> new TemplateAdminView(t.getLanguage(), t.getStarterCode(), t.getReferenceSolution()))
                        .toList(),
                q.getCreatedAt(), q.getUpdatedAt()
        );
    }

    public static String defaultJavaStarter() {
        return """
                import java.util.*;
                import java.io.*;

                public class Main {
                    public static void main(String[] args) throws Exception {
                        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
                        // TODO: read input and write output
                    }
                }
                """;
    }
}
