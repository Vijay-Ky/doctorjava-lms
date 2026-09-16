package com.doctorjava.lms.controller;

import com.doctorjava.lms.dto.MockTestDtos.*;
import com.doctorjava.lms.service.MockTestService;
import com.doctorjava.lms.core.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {
    private final MockTestService service;
    public PracticeController(MockTestService service){ this.service = service; }

    private String studentKey(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required to take practice tests");
        }
        return up.getId().toString();
    }

    /** Public: list published mock tests */
    @GetMapping("/tests")
    public List<TestCardResponse> list(){ return service.list(); }

    @GetMapping("/tests/{id}")
    public TestDetailResponse get(@PathVariable Long id){ return service.get(id); }

    /** Public: topic cards for MCQ practice */
    @GetMapping("/mcq/topics")
    public List<Map<String,Object>> mcqTopics(){ return service.mcqTopics(); }

    /** Auth required: start full mock test */
    @PostMapping("/tests/{id}/attempts")
    public AttemptStartResponse start(@PathVariable Long id, Authentication auth){
        return service.start(id, studentKey(auth));
    }

    /** Auth required: start topic MCQ practice */
    @PostMapping("/mcq/topics/{topicId}/attempts")
    public AttemptStartResponse startTopic(@PathVariable Long topicId, Authentication auth){
        return service.startTopicPractice(topicId, studentKey(auth));
    }

    @PutMapping("/attempts/{attemptId}/questions/{questionId}")
    public void answer(@PathVariable Long attemptId, @PathVariable Long questionId,
                       @RequestBody AnswerRequest request, Authentication auth){
        service.saveAnswer(attemptId, questionId, request, studentKey(auth));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public SubmitResponse submit(@PathVariable Long attemptId, Authentication auth){
        return service.submit(attemptId, studentKey(auth));
    }

    /** Auth required: my attempt history */
    @GetMapping("/attempts/mine")
    public List<Map<String,Object>> myAttempts(Authentication auth){
        return service.myAttempts(studentKey(auth));
    }
}
