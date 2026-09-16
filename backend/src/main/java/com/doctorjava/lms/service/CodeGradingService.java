package com.doctorjava.lms.service;

import com.doctorjava.lms.entity.*;
import com.doctorjava.lms.repository.CodeSubmissionRepository;
import com.doctorjava.lms.service.execution.CodeExecutionService;
import com.doctorjava.lms.service.execution.ExecutionResult;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class CodeGradingService {

    private static final Logger log = LoggerFactory.getLogger(CodeGradingService.class);
    private static final int MAX_PARALLEL = 4;

    private final CodeExecutionService executionService;
    private final CodeSubmissionRepository submissionRepository;

    /**
     * Synchronous grade — used for Run (samples) and small Submit sets.
     */
    @Transactional
    public CodeSubmission grade(CodeSubmission submission, boolean samplesOnly) {
        submission.setStatus(CodeSubmission.Status.RUNNING);
        submissionRepository.save(submission);

        CodingAttemptQuestion aq = submission.getAttemptQuestion();
        List<CodingAttemptTestCase> cases = aq.getTestCases().stream()
                .filter(tc -> !samplesOnly || tc.isSample())
                .toList();

        if (cases.isEmpty()) {
            submission.setStatus(CodeSubmission.Status.ACCEPTED);
            submission.setTestCasesPassed(0);
            submission.setTestCasesTotal(0);
            submission.setAwardedMarks(samplesOnly ? BigDecimal.ZERO : aq.getMarks());
            return submissionRepository.save(submission);
        }

        ExecutorService pool = Executors.newFixedThreadPool(Math.min(MAX_PARALLEL, cases.size()));
        List<Future<CaseOutcome>> futures = new ArrayList<>();
        int timeLimit = aq.getTimeLimitMs() != null ? aq.getTimeLimitMs() : 2000;
        int memLimit = aq.getMemoryLimitKb() != null ? aq.getMemoryLimitKb() : 262144;

        for (CodingAttemptTestCase tc : cases) {
            futures.add(pool.submit(() -> runOne(submission.getLanguage(), submission.getSourceCode(),
                    tc, timeLimit, memLimit)));
        }

        List<CodeSubmissionResult> results = new ArrayList<>();
        int passed = 0;
        boolean anyCompileError = false;
        boolean anyTle = false;
        boolean anyRe = false;
        int maxRuntime = 0;
        int maxMemory = 0;
        String compileErr = null;

        try {
            for (int i = 0; i < futures.size(); i++) {
                CaseOutcome outcome;
                try {
                    outcome = futures.get(i).get(timeLimit + 5000L, TimeUnit.MILLISECONDS);
                } catch (TimeoutException te) {
                    outcome = CaseOutcome.timeout(cases.get(i), timeLimit);
                } catch (Exception e) {
                    outcome = CaseOutcome.error(cases.get(i), e.getMessage());
                }

                CodeSubmissionResult r = CodeSubmissionResult.builder()
                        .codeSubmission(submission)
                        .attemptTestCase(outcome.tc())
                        .passed(outcome.passed())
                        .actualOutput(outcome.actualOutput())
                        .stderr(outcome.stderr())
                        .runtimeMs(outcome.runtimeMs())
                        .memoryKb(outcome.memoryKb())
                        .build();
                results.add(r);

                if (outcome.compileError()) {
                    anyCompileError = true;
                    if (compileErr == null) compileErr = outcome.stderr();
                }
                if (outcome.timedOut()) anyTle = true;
                if (outcome.runtimeError()) anyRe = true;
                if (outcome.passed()) passed++;
                if (outcome.runtimeMs() != null) maxRuntime = Math.max(maxRuntime, outcome.runtimeMs());
                if (outcome.memoryKb() != null) maxMemory = Math.max(maxMemory, outcome.memoryKb());
            }
        } finally {
            pool.shutdownNow();
        }

        submission.getResults().clear();
        submission.getResults().addAll(results);
        submission.setTestCasesPassed(passed);
        submission.setTestCasesTotal(cases.size());
        submission.setRuntimeMs(maxRuntime);
        submission.setMemoryKb(maxMemory);
        submission.setCompileError(compileErr);

        if (anyCompileError) {
            submission.setStatus(CodeSubmission.Status.COMPILE_ERROR);
            submission.setAwardedMarks(BigDecimal.ZERO);
        } else if (anyTle && passed < cases.size()) {
            submission.setStatus(CodeSubmission.Status.TIME_LIMIT_EXCEEDED);
            submission.setAwardedMarks(computeMarks(aq, passed, cases.size(), samplesOnly));
        } else if (anyRe && passed < cases.size()) {
            submission.setStatus(CodeSubmission.Status.RUNTIME_ERROR);
            submission.setAwardedMarks(computeMarks(aq, passed, cases.size(), samplesOnly));
        } else if (passed == cases.size()) {
            submission.setStatus(CodeSubmission.Status.ACCEPTED);
            submission.setAwardedMarks(samplesOnly ? BigDecimal.ZERO : aq.getMarks());
        } else {
            submission.setStatus(CodeSubmission.Status.WRONG_ANSWER);
            submission.setAwardedMarks(computeMarks(aq, passed, cases.size(), samplesOnly));
        }

        return submissionRepository.save(submission);
    }

    @Async
    @Transactional
    public void gradeAsync(Long submissionId, boolean samplesOnly) {
        CodeSubmission sub = submissionRepository.findByIdWithResults(submissionId)
                .orElse(null);
        if (sub == null) {
            log.warn("Submission {} not found for async grade", submissionId);
            return;
        }
        try {
            grade(sub, samplesOnly);
        } catch (Exception e) {
            log.error("Async grade failed for {}: {}", submissionId, e.getMessage());
            sub.setStatus(CodeSubmission.Status.RUNTIME_ERROR);
            sub.setCompileError(e.getMessage());
            submissionRepository.save(sub);
        }
    }

    private CaseOutcome runOne(String language, String source, CodingAttemptTestCase tc,
                               int timeLimitMs, int memoryLimitKb) {
        ExecutionResult er = executionService.execute(language, source, tc.getInput(), timeLimitMs, memoryLimitKb);
        if (er.compileError()) {
            return new CaseOutcome(tc, false, "", er.stderr(), (int) er.runtimeMs(), (int) er.memoryKb(),
                    true, false, false);
        }
        if (er.timedOut()) {
            return CaseOutcome.timeout(tc, (int) er.runtimeMs());
        }
        if (er.exitCode() != 0) {
            return new CaseOutcome(tc, false, er.stdout(), er.stderr(), (int) er.runtimeMs(), (int) er.memoryKb(),
                    false, false, true);
        }
        boolean pass = normalize(er.stdout()).equals(normalize(tc.getExpectedOutput()));
        return new CaseOutcome(tc, pass, er.stdout(), er.stderr(), (int) er.runtimeMs(), (int) er.memoryKb(),
                false, false, false);
    }

    static String normalize(String s) {
        if (s == null) return "";
        // Trim trailing whitespace per line and trailing newlines overall
        String[] lines = s.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].replaceAll("[ \\t]+$", "");
            if (i > 0) sb.append('\n');
            sb.append(line);
        }
        return sb.toString().replaceAll("\\n+$", "");
    }

    private BigDecimal computeMarks(CodingAttemptQuestion aq, int passed, int total, boolean samplesOnly) {
        if (samplesOnly || total <= 0) return BigDecimal.ZERO;
        if (!aq.isPartialCreditAllowed()) {
            return passed == total ? aq.getMarks() : BigDecimal.ZERO;
        }
        return aq.getMarks()
                .multiply(BigDecimal.valueOf(passed))
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }

    private record CaseOutcome(
            CodingAttemptTestCase tc,
            boolean passed,
            String actualOutput,
            String stderr,
            Integer runtimeMs,
            Integer memoryKb,
            boolean compileError,
            boolean timedOut,
            boolean runtimeError
    ) {
        static CaseOutcome timeout(CodingAttemptTestCase tc, int runtimeMs) {
            return new CaseOutcome(tc, false, "", "Time limit exceeded", runtimeMs, 0, false, true, false);
        }
        static CaseOutcome error(CodingAttemptTestCase tc, String msg) {
            return new CaseOutcome(tc, false, "", msg, 0, 0, false, false, true);
        }
    }
}
