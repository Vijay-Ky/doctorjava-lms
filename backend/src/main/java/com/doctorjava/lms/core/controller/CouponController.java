package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.Coupon;
import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PostMapping("/api/admin/coupons")
    public Coupon create(@RequestBody Map<String, Object> body) {
        return couponService.create(body);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @GetMapping("/api/admin/coupons")
    public List<Coupon> list() {
        return couponService.list();
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PatchMapping("/api/admin/coupons/{id}")
    public Coupon patch(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        return couponService.patch(id, body);
    }

    @PostMapping("/api/payments/validate-coupon")
    public ResponseEntity<?> validate(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            UUID courseId = UUID.fromString(body.get("courseId"));
            UUID userId = auth != null && auth.getPrincipal() instanceof UserPrincipal up ? up.getId() : null;
            CouponService.Quote q = couponService.validate(body.get("code"), courseId, userId);
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("code", q.code());
            out.put("originalPaise", q.originalPaise());
            out.put("discountPaise", q.discountPaise());
            out.put("finalPaise", q.finalPaise());
            out.put("originalRupees", q.originalPaise() / 100);
            out.put("discountRupees", q.discountPaise() / 100);
            out.put("finalRupees", q.finalPaise() / 100);
            return ResponseEntity.ok(out);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
