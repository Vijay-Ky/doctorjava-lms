package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.security.SecurityUtils;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/user/me")
    public Map<String, Object> myDashboard(Authentication auth) {
        UserPrincipal up = (UserPrincipal) auth.getPrincipal();
        return dashboardService.userDashboard(up.getId());
    }

    @GetMapping("/user/{userId}")
    public Map<String, Object> userDashboard(@PathVariable UUID userId) {
        SecurityUtils.requireOwnerOrAdmin(userId);
        return dashboardService.userDashboard(userId);
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Map<String, Object> adminSummary() {
        return dashboardService.adminSummary();
    }
}
