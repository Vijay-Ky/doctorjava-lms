package com.doctorjava.lms.service;

import com.doctorjava.lms.dto.CodingDtos.*;
import com.doctorjava.lms.entity.*;
import com.doctorjava.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CodingMockTestService {

    private final MockTestRepository tests;
    private final SubjectRepository subjects;
    private final CodingQuestionRepository codingQuestions;
    private final CodingAttemptRepository attempts;
    private final CodeSubmissionRepository submissions;
    private final CodeGradingService gradingService;

    // ---------- Admin: coding mock tests ----------

    @Transactional(readOnly = true)
    public List<CodingTestCard> listCodingTests() {
        return tests.findAll().stream()
                .filter(t -> t.getTestType() == MockTest.TestType.CODING)
                .map(this::card)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CodingTestCard> listPublishedCodingTests() {
        return tests.findAll().stream()
                .filter(t -> t.getTestType() == MockTest.TestType.CODING && t.isPublished())
                .map(this::card)
                .toList();
    }

    @Transactional
    public CodingTestCard createCodingTest(CodingTestRequest req) {
        MockTest t = MockTest.builder()
                .testCode("CT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .testType(MockTest.TestType.CODING)
                .title(req.title())
                .description(req.description())
                .subject(subjects.findById(req.subjectId()).orElseThrow())
                .difficulty(Question.Difficulty.valueOf(req.difficulty().toUpperCase()))
                .durationMinutes(req.durationMinutes())
                .totalQuestions(req.codingQuestionIds().size())
                .marksPerQuestion(BigDecimal.ZERO)
                .negativeMarks(BigDecimal.ZERO)
                .passPercentage(req.passPercentage())
                .instructions(req.instructions())
                .published(req.published())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .codingQuestions(new ArrayList<>())
                .questions(new ArrayList<>())
                .build();
        int order = 1;
        for (Long qid : req.codingQuestionIds()) {
            CodingQuestion cq = codingQuestions.findById(qid)
                    .orElseThrow(() -> new NoSuchElementException("Coding question " + qid));
            if (cq.getStatus() != Question.QuestionStatus.PUBLISHED) {
                throw new IllegalArgumentException("Only published coding questions can be added");
            }
            t.getCodingQuestions().add(MockTestCodingQuestion.builder()
                    .mockTest(t)
                    .codingQuestion(cq)
                    .displayOrder(order++)
                    .marks(cq.getMarks())
                    .build());
        }
        return card(tests.save(t));
    }

    @Transactional
    public CodingTestCard updateCodingTest(Long id, CodingTestRequest req) {
        MockTest t = tests.findById(id).orElseThrow(() -> new NoSuchElementException("Test not found"));
        if (t.getTestType() != MockTest.TestType.CODING) {
            throw new IllegalArgumentException("Not a coding test");
        }
        t.setTitle(req.title());
        t.setDescription(req.description());
        t.setSubject(subjects.findById(req.subjectId()).orElseThrow());
        t.setDifficulty(Question.Difficulty.valueOf(req.difficulty().toUpperCase()));
        t.setDurationMinutes(req.durationMinutes());
        t.setPassPercentage(req.passPercentage());
        t.setInstructions(req.instructions());
        t.setPublished(req.published());
        t.setUpdatedAt(LocalDateTime.now());
        t.getCodingQuestions().clear();
        int order = 1;
        for (Long qid : req.codingQuestionIds()) {
            CodingQuestion cq = codingQuestions.findById(qid).orElseThrow();
            t.getCodingQuestions().add(MockTestCodingQuestion.builder()
                    .mockTest(t).codingQuestion(cq).displayOrder(order++).marks(cq.getMarks()).build());
        }
        t.setTotalQuestions(req.codingQuestionIds().size());
        return card(tests.save(t));
    }

    @Transactional
    public void deleteCodingTest(Long id) {
        MockTest t = tests.findById(id).orElseThrow(() -> new NoSuchElementException("Test not found"));
        tests.delete(t);
    }

    // ---------- Student attempt flow ----------

    @Transactional
    public CodingAttemptStartResponse start(Long testId, String studentKey) {
        MockTest t = tests.findById(testId).orElseThrow(() -> new NoSuchElementException("Test not found"));
        if (t.getTestType() != MockTest.TestType.CODING || !t.isPublished()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Coding test not found");
        }
        LocalDateTime now = LocalDateTime.now();
        CodingAttempt attempt = CodingAttempt.builder()
                .attemptCode("CA-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase())
                .mockTest(t)
                .studentKey(studentKey)
                .status(CodingAttempt.Status.IN_PROGRESS)
                .startedAt(now)
                .expiresAt(now.plusMinutes(t.getDurationMinutes()))
                .questions(new ArrayList<>())
                .build();

        // Snapshot each coding question + ALL test cases (samples flagged) + starter only
        List<MockTestCodingQuestion> ordered = t.getCodingQuestions().stream()
                .sorted(Comparator.comparingInt(MockTestCodingQuestion::getDisplayOrder))
                .toList();
        int order = 1;
        for (MockTestCodingQuestion link : ordered) {
            CodingQuestion src = codingQuestions.findByIdWithDetails(link.getCodingQuestion().getId())
                    .orElseThrow();
            CodingAttemptQuestion aq = CodingAttemptQuestion.builder()
                    .codingAttempt(attempt)
                    .codingQuestion(src)
                    .questionOrder(order++)
                    .title(src.getTitle())
                    .problemStatementMarkdown(src.getProblemStatementMarkdown())
                    .constraintsText(src.getConstraintsText())
                    .inputFormat(src.getInputFormat())
                    .outputFormat(src.getOutputFormat())
                    .timeLimitMs(src.getTimeLimitMs())
                    .memoryLimitKb(src.getMemoryLimitKb())
                    .allowedLanguages(src.getAllowedLanguages())
                    .marks(link.getMarks() != null ? link.getMarks() : src.getMarks())
                    .partialCreditAllowed(src.isPartialCreditAllowed())
                    .testCases(new ArrayList<>())
                    .starterCode(new HashMap<>())
                    .build();
            for (CodingQuestionTemplate tpl : src.getTemplates()) {
                aq.getStarterCode().put(tpl.getLanguage(), tpl.getStarterCode());
            }
            if (aq.getStarterCode().isEmpty()) {
                aq.getStarterCode().put("JAVA", CodingQuestionService.defaultJavaStarter());
            }
            int tcOrder = 0;
            for (CodingQuestionTestCase tc : src.getTestCases()) {
                aq.getTestCases().add(CodingAttemptTestCase.builder()
                        .attemptQuestion(aq)
                        .sourceTestCaseId(tc.getId())
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .sample(tc.isSample())
                        .displayOrder(tc.getDisplayOrder() > 0 ? tc.getDisplayOrder() : tcOrder++)
                        .weight(tc.getWeight())
                        .build());
            }
            attempt.getQuestions().add(aq);
        }

        attempt = attempts.save(attempt);
        List<QuestionSummary> summaries = attempt.getQuestions().stream()
                .map(q -> new QuestionSummary(q.getId(), q.getCodingQuestion().getId(), q.getTitle(), q.getQuestionOrder()))
                .toList();
        return new CodingAttemptStartResponse(
                attempt.getId(), attempt.getAttemptCode(), t.getDurationMinutes(),
                attempt.getExpiresAt(), summaries.size(), summaries);
    }

    @Transactional(readOnly = true)
    public CodingQuestionStudentView getQuestion(Long attemptId, Long attemptQuestionId, String studentKey) {
        CodingAttempt attempt = loadActive(attemptId, studentKey);
        CodingAttemptQuestion aq = findQuestion(attempt, attemptQuestionId);
        List<SampleCaseView> samples = aq.getTestCases().stream()
                .filter(CodingAttemptTestCase::isSample)
                .map(tc -> new SampleCaseView(tc.getId(), tc.getInput(), tc.getExpectedOutput(), tc.getDisplayOrder()))
                .toList();
        return new CodingQuestionStudentView(
                aq.getId(),
                aq.getCodingQuestion().getId(),
                aq.getTitle(),
                aq.getProblemStatementMarkdown(),
                aq.getConstraintsText(),
                aq.getInputFormat(),
                aq.getOutputFormat(),
                aq.getTimeLimitMs(),
                aq.getMemoryLimitKb(),
                Arrays.stream(aq.getAllowedLanguages().split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList(),
                aq.getStarterCode(),
                samples,
                aq.getMarks()
        );
    }

    @Transactional
    public RunResponse run(Long attemptId, Long attemptQuestionId, RunSubmitRequest body, String studentKey) {
        CodingAttempt attempt = loadActive(attemptId, studentKey);
        CodingAttemptQuestion aq = findQuestion(attempt, attemptQuestionId);
        validateLanguage(aq, body.language());

        CodeSubmission sub = CodeSubmission.builder()
                .codingAttempt(attempt)
                .attemptQuestion(aq)
                .language(body.language().toUpperCase())
                .sourceCode(body.sourceCode())
                .isFinal(false)
                .status(CodeSubmission.Status.PENDING)
                .submittedAt(LocalDateTime.now())
                .results(new ArrayList<>())
                .build();
        sub = submissions.save(sub);
        sub = gradingService.grade(sub, true);

        List<CaseResultView> caseViews = sub.getResults().stream()
                .map(r -> new CaseResultView(
                        r.getAttemptTestCase().getId(),
                        r.getAttemptTestCase().isSample(),
                        r.isPassed(),
                        r.getAttemptTestCase().getInput(),
                        r.getAttemptTestCase().getExpectedOutput(),
                        r.getActualOutput(),
                        r.getStderr(),
                        r.getRuntimeMs()))
                .toList();
        return new RunResponse(sub.getStatus().name(),
                sub.getTestCasesPassed() == null ? 0 : sub.getTestCasesPassed(),
                sub.getTestCasesTotal() == null ? 0 : sub.getTestCasesTotal(),
                caseViews, sub.getCompileError());
    }

    @Transactional
    public SubmitAcceptedResponse submit(Long attemptId, Long attemptQuestionId, RunSubmitRequest body, String studentKey) {
        CodingAttempt attempt = loadActive(attemptId, studentKey);
        CodingAttemptQuestion aq = findQuestion(attempt, attemptQuestionId);
        validateLanguage(aq, body.language());

        CodeSubmission sub = CodeSubmission.builder()
                .codingAttempt(attempt)
                .attemptQuestion(aq)
                .language(body.language().toUpperCase())
                .sourceCode(body.sourceCode())
                .isFinal(true)
                .status(CodeSubmission.Status.PENDING)
                .submittedAt(LocalDateTime.now())
                .results(new ArrayList<>())
                .build();
        sub = submissions.save(sub);
        // Grade synchronously for reliability (Piston is local); still returns quickly for few cases
        sub = gradingService.grade(sub, false);
        return new SubmitAcceptedResponse(sub.getId(), sub.getStatus().name());
    }

    @Transactional(readOnly = true)
    public SubmissionPollResponse pollSubmission(Long submissionId, String studentKey) {
        CodeSubmission sub = submissions.findByIdWithResults(submissionId)
                .orElseThrow(() -> new NoSuchElementException("Submission not found"));
        if (!sub.getCodingAttempt().getStudentKey().equals(studentKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        List<CaseResultView> caseViews = new ArrayList<>();
        for (CodeSubmissionResult r : sub.getResults()) {
            CodingAttemptTestCase tc = r.getAttemptTestCase();
            // Hide expected output for non-sample on final graded results? Show pass/fail only for hidden
            boolean showIo = !sub.isFinal() || tc.isSample();
            caseViews.add(new CaseResultView(
                    tc.getId(),
                    tc.isSample(),
                    r.isPassed(),
                    showIo ? tc.getInput() : null,
                    showIo ? tc.getExpectedOutput() : null,
                    showIo ? r.getActualOutput() : null,
                    showIo ? r.getStderr() : null,
                    r.getRuntimeMs()));
        }
        return new SubmissionPollResponse(
                sub.getId(), sub.getStatus().name(), sub.isFinal(),
                sub.getTestCasesPassed() == null ? 0 : sub.getTestCasesPassed(),
                sub.getTestCasesTotal() == null ? 0 : sub.getTestCasesTotal(),
                sub.getRuntimeMs(), sub.getMemoryKb(), sub.getAwardedMarks(),
                sub.getCompileError(), caseViews);
    }

    @Transactional
    public FinishResponse finish(Long attemptId, String studentKey) {
        CodingAttempt attempt = attempts.findByIdAndStudentKeyWithQuestions(attemptId, studentKey)
                .orElseThrow(() -> new NoSuchElementException("Attempt not found"));
        if (attempt.getStatus() != CodingAttempt.Status.IN_PROGRESS) {
            // already finished — return stored
            return buildFinish(attempt);
        }
        LocalDateTime now = LocalDateTime.now();
        boolean auto = now.isAfter(attempt.getExpiresAt());
        attempt.setStatus(auto ? CodingAttempt.Status.AUTO_SUBMITTED : CodingAttempt.Status.SUBMITTED);
        attempt.setSubmittedAt(now);
        attempt.setTimeTakenSeconds(java.time.Duration.between(attempt.getStartedAt(), now).getSeconds());

        BigDecimal score = BigDecimal.ZERO;
        BigDecimal max = BigDecimal.ZERO;
        List<QuestionScore> qScores = new ArrayList<>();
        for (CodingAttemptQuestion aq : attempt.getQuestions()) {
            max = max.add(aq.getMarks());
            List<CodeSubmission> finals = submissions
                    .findByCodingAttemptIdAndAttemptQuestionIdAndIsFinalTrueOrderBySubmittedAtDesc(
                            attempt.getId(), aq.getId());
            CodeSubmission best = finals.isEmpty() ? null : finals.get(0);
            // Prefer highest awarded marks among finals
            for (CodeSubmission s : finals) {
                if (s.getAwardedMarks() != null && (best.getAwardedMarks() == null
                        || s.getAwardedMarks().compareTo(best.getAwardedMarks()) > 0)) {
                    best = s;
                }
            }
            BigDecimal awarded = best != null && best.getAwardedMarks() != null
                    ? best.getAwardedMarks() : BigDecimal.ZERO;
            score = score.add(awarded);
            qScores.add(new QuestionScore(
                    aq.getId(), aq.getTitle(),
                    best == null ? "NOT_ATTEMPTED" : best.getStatus().name(),
                    best == null || best.getTestCasesPassed() == null ? 0 : best.getTestCasesPassed(),
                    best == null || best.getTestCasesTotal() == null ? 0 : best.getTestCasesTotal(),
                    awarded, aq.getMarks()));
        }
        attempt.setScore(score);
        attempt.setMaxScore(max);
        BigDecimal pct = max.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO
                : score.multiply(BigDecimal.valueOf(100)).divide(max, 2, RoundingMode.HALF_UP);
        attempt.setPercentage(pct);
        attempts.save(attempt);
        return buildFinish(attempt, qScores);
    }

    private FinishResponse buildFinish(CodingAttempt attempt) {
        List<QuestionScore> qScores = new ArrayList<>();
        for (CodingAttemptQuestion aq : attempt.getQuestions()) {
            List<CodeSubmission> finals = submissions
                    .findByCodingAttemptIdAndAttemptQuestionIdAndIsFinalTrueOrderBySubmittedAtDesc(
                            attempt.getId(), aq.getId());
            CodeSubmission best = finals.isEmpty() ? null : finals.get(0);
            qScores.add(new QuestionScore(aq.getId(), aq.getTitle(),
                    best == null ? "NOT_ATTEMPTED" : best.getStatus().name(),
                    best == null || best.getTestCasesPassed() == null ? 0 : best.getTestCasesPassed(),
                    best == null || best.getTestCasesTotal() == null ? 0 : best.getTestCasesTotal(),
                    best == null || best.getAwardedMarks() == null ? BigDecimal.ZERO : best.getAwardedMarks(),
                    aq.getMarks()));
        }
        return buildFinish(attempt, qScores);
    }

    private FinishResponse buildFinish(CodingAttempt attempt, List<QuestionScore> qScores) {
        int passPct = attempt.getMockTest() != null ? attempt.getMockTest().getPassPercentage() : 50;
        boolean passed = attempt.getPercentage() != null
                && attempt.getPercentage().doubleValue() >= passPct;
        return new FinishResponse(
                attempt.getId(),
                attempt.getScore(),
                attempt.getMaxScore(),
                attempt.getPercentage(),
                passed,
                attempt.getTimeTakenSeconds() == null ? 0 : attempt.getTimeTakenSeconds(),
                qScores);
    }

    private CodingAttempt loadActive(Long attemptId, String studentKey) {
        CodingAttempt a = attempts.findByIdAndStudentKeyWithQuestions(attemptId, studentKey)
                .orElseThrow(() -> new NoSuchElementException("Attempt not found"));
        if (a.getStatus() != CodingAttempt.Status.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Attempt already submitted");
        }
        if (LocalDateTime.now().isAfter(a.getExpiresAt())) {
            finish(attemptId, studentKey);
            throw new ResponseStatusException(HttpStatus.GONE, "Test time has expired");
        }
        return a;
    }

    private CodingAttemptQuestion findQuestion(CodingAttempt attempt, Long attemptQuestionId) {
        return attempt.getQuestions().stream()
                .filter(q -> q.getId().equals(attemptQuestionId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Question not in attempt"));
    }

    private void validateLanguage(CodingAttemptQuestion aq, String language) {
        String lang = language == null ? "" : language.trim().toUpperCase();
        List<String> allowed = Arrays.stream(aq.getAllowedLanguages().split(","))
                .map(String::trim).map(String::toUpperCase).toList();
        if (!allowed.contains(lang)) {
            throw new IllegalArgumentException("Language not allowed: " + language);
        }
    }

    private CodingTestCard card(MockTest t) {
        return new CodingTestCard(
                t.getId(), t.getTestCode(), t.getTitle(), t.getDescription(),
                t.getSubject() != null ? t.getSubject().getName() : null,
                t.getDifficulty() != null ? t.getDifficulty().name() : null,
                t.getDurationMinutes(), t.getTotalQuestions(), t.getPassPercentage(), t.isPublished());
    }
}
