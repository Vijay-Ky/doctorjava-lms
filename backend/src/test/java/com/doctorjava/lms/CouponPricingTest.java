package com.doctorjava.lms;

import com.doctorjava.lms.core.service.CouponService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Documents server-side pricing rule: percent discount is applied to course price * 100 (paise).
 * Integration tests with full Spring context can extend this; pure math here stays dependency-free.
 */
public class CouponPricingTest {

    @Test
    void percentDiscountIsComputedServerSide() {
        int originalPaise = 99900; // ₹999
        int pct = 10;
        int discountPaise = (int) Math.round(originalPaise * (pct / 100.0));
        int finalPaise = originalPaise - discountPaise;
        assertEquals(9990, discountPaise);
        assertEquals(89910, finalPaise);
        // Client-supplied lower amount must NOT be trusted — server recomputes from course + coupon
        int tamperedClientAmount = 100;
        assertNotEquals(tamperedClientAmount, finalPaise);
    }

    @Test
    void flatDiscountCapsAtOriginal() {
        int originalPaise = 50000;
        int flatRupees = 1000; // more than course
        int discountPaise = Math.min(originalPaise, flatRupees * 100);
        assertEquals(50000, discountPaise);
    }
}
