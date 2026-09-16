package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.CommunityPost;
import com.doctorjava.lms.core.entity.CommunityReply;
import com.doctorjava.lms.core.repository.CommunityPostRepository;
import com.doctorjava.lms.core.repository.CommunityReplyRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityPostRepository postRepository;
    private final CommunityReplyRepository replyRepository;
    private final UserRepository userRepository;

    @GetMapping("/posts")
    public List<Map<String, Object>> list(@RequestParam(required = false) UUID courseId) {
        List<CommunityPost> posts = courseId != null
                ? postRepository.findByCourseIdOrderByPinnedDescCreatedAtDesc(courseId)
                : postRepository.findAllByOrderByPinnedDescCreatedAtDesc();
        List<Map<String, Object>> out = new ArrayList<>();
        for (CommunityPost p : posts) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("title", p.getTitle());
            m.put("body", p.getBody());
            m.put("courseId", p.getCourseId());
            m.put("pinned", p.isPinned());
            m.put("createdAt", p.getCreatedAt());
            m.put("userId", p.getUserId());
            userRepository.findById(p.getUserId()).ifPresent(u -> m.put("userName", u.getUsername()));
            m.put("replyCount", replyRepository.findByPostIdOrderByCreatedAtAsc(p.getId()).size());
            out.add(m);
        }
        return out;
    }

    @PostMapping("/posts")
    public CommunityPost create(@RequestBody Map<String, String> body, Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        CommunityPost p = CommunityPost.builder()
                .userId(up.getId())
                .title(body.get("title"))
                .body(body.get("body"))
                .courseId(body.get("courseId") != null && !body.get("courseId").isBlank()
                        ? UUID.fromString(body.get("courseId")) : null)
                .pinned(false)
                .build();
        return postRepository.save(p);
    }

    @GetMapping("/posts/{id}/replies")
    public List<Map<String, Object>> replies(@PathVariable UUID id) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (CommunityReply r : replyRepository.findByPostIdOrderByCreatedAtAsc(id)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("body", r.getBody());
            m.put("createdAt", r.getCreatedAt());
            m.put("userId", r.getUserId());
            userRepository.findById(r.getUserId()).ifPresent(u -> m.put("userName", u.getUsername()));
            out.add(m);
        }
        return out;
    }

    @PostMapping("/posts/{id}/replies")
    public CommunityReply reply(@PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        return replyRepository.save(CommunityReply.builder()
                .postId(id).userId(up.getId()).body(body.get("body")).build());
    }
}
