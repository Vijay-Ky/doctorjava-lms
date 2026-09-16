package com.doctorjava.lms.service;

import com.doctorjava.lms.entity.*;
import com.doctorjava.lms.repository.QuestionRepository;
import com.doctorjava.lms.repository.SubjectRepository;
import com.doctorjava.lms.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses Doctor Java assignment-style MCQ text files:
 *
 * **Question N:**
 * [optional code block]
 * question stem?
 * a) option
 * b) option
 * c) option
 * d) option
 *
 * **Answer: c) ...**
 * Explanation: ...
 */
@Service
@RequiredArgsConstructor
public class BulkMcqImportService {

    private final QuestionRepository questions;
    private final SubjectRepository subjects;
    private final TopicRepository topics;

    private static final Pattern QUESTION_SPLIT = Pattern.compile("(?i)\\*\\*Question\\s+(\\d+):\\*\\*");
    private static final Pattern ANSWER_LINE = Pattern.compile(
            "(?i)\\*\\*Answer:\\s*([a-dA-D])\\)?\\s*(.*?)\\*\\*");
    private static final Pattern ANSWER_LINE_ALT = Pattern.compile(
            "(?i)(?:\\*\\*)?Answer:\\s*([a-dA-D])\\)?\\s*(.*)");
    private static final Pattern OPTION = Pattern.compile("(?m)^\\s*([a-dA-D])[)\\.]\\s*(.+)$");

    public record ImportResult(int imported, int skipped, List<String> errors, List<Long> questionIds) {}

    public record ParsedMcq(
            String stem,
            String codeContent,
            List<String> options, // A-D text
            char correctKey,
            String explanation
    ) {}

    @Transactional
    public ImportResult importText(String rawText, Long subjectId, Long topicId,
                                   String difficulty, boolean publish) {
        Subject subject = subjects.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found: " + subjectId));
        Topic topic = topics.findById(topicId)
                .orElseThrow(() -> new NoSuchElementException("Topic not found: " + topicId));
        Question.Difficulty diff = difficulty != null
                ? Question.Difficulty.valueOf(difficulty.toUpperCase())
                : Question.Difficulty.EASY;
        Question.QuestionStatus status = publish
                ? Question.QuestionStatus.PUBLISHED
                : Question.QuestionStatus.DRAFT;

        List<ParsedMcq> parsed = parse(rawText);
        int imported = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();
        List<Long> ids = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < parsed.size(); i++) {
            ParsedMcq p = parsed.get(i);
            try {
                if (p.options().size() < 2) {
                    skipped++;
                    errors.add("Q" + (i + 1) + ": fewer than 2 options");
                    continue;
                }
                boolean hasCode = p.codeContent() != null && !p.codeContent().isBlank();
                Question q = Question.builder()
                        .questionCode("IMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .type(hasCode ? Question.QuestionType.CODE_OUTPUT : Question.QuestionType.TECHNICAL_MCQ)
                        .subject(subject)
                        .topic(topic)
                        .difficulty(diff)
                        .questionText(p.stem())
                        .codeContent(hasCode ? p.codeContent() : null)
                        .codeLanguage(hasCode ? "java" : null)
                        .explanation(p.explanation())
                        .marks(BigDecimal.ONE)
                        .negativeMarks(BigDecimal.ZERO)
                        .status(status)
                        .version(1)
                        .createdAt(now)
                        .updatedAt(now)
                        .options(new ArrayList<>())
                        .build();

                char correct = Character.toUpperCase(p.correctKey());
                for (int oi = 0; oi < p.options().size(); oi++) {
                    char key = (char) ('A' + oi);
                    String text = p.options().get(oi);
                    // strip leading "a) " if still present
                    text = text.replaceFirst("(?i)^[a-d][)\\.]\\s*", "").trim();
                    q.getOptions().add(QuestionOption.builder()
                            .question(q)
                            .optionKey(String.valueOf(key))
                            .optionText(text)
                            .correct(key == correct)
                            .displayOrder(oi + 1)
                            .build());
                }
                q = questions.save(q);
                ids.add(q.getId());
                imported++;
            } catch (Exception e) {
                skipped++;
                errors.add("Q" + (i + 1) + ": " + e.getMessage());
            }
        }
        return new ImportResult(imported, skipped, errors, ids);
    }

    public List<ParsedMcq> parse(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        // Prefer answers file format (has **Answer:**) — works for combined QA too
        String[] parts = QUESTION_SPLIT.split(raw);
        // parts[0] is preamble; subsequent are question bodies (without the header number captured in split)
        Matcher numMatcher = QUESTION_SPLIT.matcher(raw);
        List<Integer> numbers = new ArrayList<>();
        while (numMatcher.find()) numbers.add(Integer.parseInt(numMatcher.group(1)));

        List<ParsedMcq> out = new ArrayList<>();
        for (int i = 1; i < parts.length; i++) {
            String body = parts[i].trim();
            if (body.isEmpty()) continue;
            try {
                out.add(parseOne(body));
            } catch (Exception ignored) {
                // skip malformed block
            }
        }
        return out;
    }

    private ParsedMcq parseOne(String body) {
        String explanation = null;
        char correct = '?';

        Matcher ans = ANSWER_LINE.matcher(body);
        boolean foundAns = ans.find();
        if (!foundAns) {
            ans = ANSWER_LINE_ALT.matcher(body);
            foundAns = ans.find();
        }
        if (foundAns) {
            correct = Character.toUpperCase(ans.group(1).charAt(0));
            // explanation may follow
            int afterAns = ans.end();
            String rest = body.substring(afterAns);
            Matcher exp = Pattern.compile("(?i)Explanation:\\s*(.+)", Pattern.DOTALL).matcher(rest);
            if (exp.find()) {
                explanation = exp.group(1).trim();
                // cut at next question if any
                int nextQ = explanation.toLowerCase().indexOf("**question");
                if (nextQ > 0) explanation = explanation.substring(0, nextQ).trim();
            }
            body = body.substring(0, ans.start()).trim();
        }

        String code = null;
        Matcher codeBlock = Pattern.compile("```(?:java)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE)
                .matcher(body);
        if (codeBlock.find()) {
            code = codeBlock.group(1).trim();
            body = body.substring(0, codeBlock.start()) + body.substring(codeBlock.end());
        }

        List<String> options = new ArrayList<>();
        Matcher optMatcher = OPTION.matcher(body);
        int firstOpt = -1;
        Map<Character, String> optMap = new LinkedHashMap<>();
        while (optMatcher.find()) {
            if (firstOpt < 0) firstOpt = optMatcher.start();
            char k = Character.toUpperCase(optMatcher.group(1).charAt(0));
            optMap.put(k, optMatcher.group(2).trim());
        }
        for (char c = 'A'; c <= 'D'; c++) {
            if (optMap.containsKey(c)) options.add(optMap.get(c));
        }
        // if keys were a-d only in order
        if (options.isEmpty() && !optMap.isEmpty()) {
            options.addAll(optMap.values());
        }

        String stem = firstOpt > 0 ? body.substring(0, firstOpt).trim() : body.trim();
        stem = stem.replaceAll("(?m)^\\s*$", "").trim();
        if (stem.isBlank() && code != null) {
            stem = "What is the output of the following code?";
        }

        if (correct == '?' && !options.isEmpty()) {
            // default first option if answers-only file missing — mark A (admin should review)
            correct = 'A';
        }

        return new ParsedMcq(stem, code, options, correct, explanation);
    }

    /**
     * Ensure a topic exists under subject (by name), create if missing.
     */
    @Transactional
    public Topic ensureTopic(Long subjectId, String topicName) {
        Subject s = subjects.findById(subjectId).orElseThrow();
        return topics.findAll().stream()
                .filter(t -> t.getSubject() != null
                        && t.getSubject().getId().equals(subjectId)
                        && topicName.equalsIgnoreCase(t.getName()))
                .findFirst()
                .orElseGet(() -> topics.save(Topic.builder()
                        .name(topicName)
                        .subject(s)
                        .build()));
    }
}
