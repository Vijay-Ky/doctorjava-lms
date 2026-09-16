package com.doctorjava.lms.core.service;

import com.doctorjava.lms.core.entity.Coupon;
import com.doctorjava.lms.core.entity.CouponRedemption;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.repository.CouponRedemptionRepository;
import com.doctorjava.lms.core.repository.CouponRepository;
import com.doctorjava.lms.core.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;
    private final CourseRepository courseRepository;

    public record Quote(int originalPaise, int discountPaise, int finalPaise, UUID couponId, String code, String message) {}

    @Transactional(readOnly = true)
    public Quote validate(String code, UUID courseId, UUID userId) {
        if (code == null || code.isBlank()) throw new IllegalArgumentException("Coupon code required");
        Coupon c = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));
        if (!c.isActive()) throw new IllegalArgumentException("Coupon is inactive");
        if (c.getExpiresAt() != null && LocalDateTime.now().isAfter(c.getExpiresAt())) {
            throw new IllegalArgumentException("Coupon has expired");
        }
        if (c.getMaxRedemptions() != null && c.getRedemptionCount() >= c.getMaxRedemptions()) {
            throw new IllegalArgumentException("Coupon redemptions exhausted");
        }
        if ("SPECIFIC_COURSE".equalsIgnoreCase(c.getScope())) {
            if (c.getCourseId() == null || !c.getCourseId().equals(courseId)) {
                throw new IllegalArgumentException("Coupon not valid for this course");
            }
        }
        if (userId != null) {
            long used = redemptionRepository.countByCouponIdAndUserId(c.getId(), userId);
            if (used >= c.getMaxRedemptionsPerUser()) {
                throw new IllegalArgumentException("You have already used this coupon");
            }
        }
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        int originalPaise = Math.max(course.getPrice(), 0) * 100;
        int discountPaise = 0;
        if ("PERCENT".equalsIgnoreCase(c.getDiscountType())) {
            int pct = Math.min(100, Math.max(0, c.getDiscountValue()));
            discountPaise = (int) Math.round(originalPaise * (pct / 100.0));
        } else { // FLAT — discountValue is in rupees (same unit as course.price)
            discountPaise = Math.min(originalPaise, Math.max(0, c.getDiscountValue()) * 100);
        }
        int finalPaise = Math.max(0, originalPaise - discountPaise);
        return new Quote(originalPaise, discountPaise, finalPaise, c.getId(), c.getCode(), "OK");
    }

    @Transactional
    public void recordRedemption(UUID couponId, UUID userId, UUID paymentId) {
        // COUPON-001 / PAY-003: one redemption row per payment (replay-safe)
        if (paymentId != null && redemptionRepository.existsByPaymentId(paymentId)) {
            return;
        }
        // Pessimistic row lock so concurrent threads cannot exceed max_redemptions
        Coupon c = couponRepository.findByIdForUpdate(couponId).orElse(null);
        if (c == null) return;
        if (c.getMaxRedemptions() != null && c.getRedemptionCount() >= c.getMaxRedemptions()) {
            return;
        }
        c.setRedemptionCount(c.getRedemptionCount() + 1);
        couponRepository.saveAndFlush(c);
        redemptionRepository.save(CouponRedemption.builder()
                .couponId(couponId).userId(userId).paymentId(paymentId).build());
    }

    public Coupon create(Map<String, Object> body) {
        Coupon c = Coupon.builder()
                .code(String.valueOf(body.get("code")).toUpperCase().trim())
                .discountType(String.valueOf(body.getOrDefault("discountType", "PERCENT")))
                .discountValue(Integer.parseInt(String.valueOf(body.get("discountValue"))))
                .scope(String.valueOf(body.getOrDefault("scope", "ALL_COURSES")))
                .courseId(body.get("courseId") != null && !String.valueOf(body.get("courseId")).isBlank()
                        ? UUID.fromString(String.valueOf(body.get("courseId"))) : null)
                .maxRedemptions(body.get("maxRedemptions") != null ? Integer.parseInt(String.valueOf(body.get("maxRedemptions"))) : null)
                .maxRedemptionsPerUser(body.get("maxRedemptionsPerUser") != null
                        ? Integer.parseInt(String.valueOf(body.get("maxRedemptionsPerUser"))) : 1)
                .expiresAt(body.get("expiresAt") != null && !String.valueOf(body.get("expiresAt")).isBlank()
                        ? LocalDateTime.parse(String.valueOf(body.get("expiresAt"))) : null)
                .active(true)
                .redemptionCount(0)
                .build();
        return couponRepository.save(c);
    }

    public List<Coupon> list() { return couponRepository.findAllByOrderByCreatedAtDesc(); }

    public Coupon patch(UUID id, Map<String, Object> body) {
        Coupon c = couponRepository.findById(id).orElseThrow();
        if (body.containsKey("active")) c.setActive(Boolean.parseBoolean(String.valueOf(body.get("active"))));
        if (body.containsKey("maxRedemptions")) {
            Object v = body.get("maxRedemptions");
            c.setMaxRedemptions(v == null || String.valueOf(v).isBlank() ? null : Integer.parseInt(String.valueOf(v)));
        }
        if (body.containsKey("expiresAt")) {
            Object v = body.get("expiresAt");
            c.setExpiresAt(v == null || String.valueOf(v).isBlank() ? null : LocalDateTime.parse(String.valueOf(v)));
        }
        return couponRepository.save(c);
    }
}
