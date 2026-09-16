package com.doctorjava.lms.core.controller;
import com.doctorjava.lms.core.entity.Notification;
import com.doctorjava.lms.core.repository.NotificationRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/notifications") @RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepository repo;
    private final UserRepository users;

    @GetMapping
    public List<Notification> mine(Authentication auth) {
        UUID id = ((UserPrincipal)auth.getPrincipal()).getId();
        return repo.findByUserIdOrderByCreatedAtDesc(id);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread(Authentication auth) {
        UUID id = ((UserPrincipal)auth.getPrincipal()).getId();
        return Map.of("count", repo.countByUserIdAndReadFalse(id));
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable UUID id, Authentication auth) {
        UUID uid = ((UserPrincipal)auth.getPrincipal()).getId();
        Notification n = repo.findById(id).orElseThrow(() ->
                new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getUserId().equals(uid)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Access denied");
        }
        n.setRead(true);
        repo.save(n);
    }

    @PostMapping("/announce")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Map<String,Object> announce(@RequestBody Map<String,String> body) {
        String title = body.getOrDefault("title", "Announcement");
        String msg = body.getOrDefault("body", "");
        String link = body.get("link");
        int n = 0;
        for (User u : users.findAll()) {
            repo.save(Notification.builder().userId(u.getId()).title(title).body(msg).link(link).read(false).build());
            n++;
        }
        return Map.of("sent", n);
    }
}
