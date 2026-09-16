package com.doctorjava.lms.payment;

import com.doctorjava.lms.core.entity.Coupon;
import com.doctorjava.lms.core.entity.CouponRedemption;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Payment;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.enums.UserRole;
import com.doctorjava.lms.core.repository.CouponRedemptionRepository;
import com.doctorjava.lms.core.repository.CouponRepository;
import com.doctorjava.lms.core.repository.CourseRepository;
import com.doctorjava.lms.core.repository.PaymentRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import com.doctorjava.lms.core.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * COUPON-001-B: concurrent mock-complete must not exceed max_redemptions
 * and must not create more than one redemption row per payment (PAY-003).
 *
 * Requires MySQL (local profile) and V20 unique constraint on payment_id.
 *
 * Run: ./mvnw test -Dtest=CouponConcurrencyTest
 */
@SpringBootTest
@ActiveProfiles("local")
class CouponConcurrencyTest {

    private static final int THREADS = 5;

    @Autowired PaymentService paymentService;
    @Autowired PaymentRepository paymentRepository;
    @Autowired CouponRepository couponRepository;
    @Autowired CouponRedemptionRepository redemptionRepository;
    @Autowired UserRepository userRepository;
    @Autowired CourseRepository courseRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private Coupon coupon;
    private Course course;
    private final List<Payment> payments = new ArrayList<>();
    private final List<User> users = new ArrayList<>();

    @BeforeEach
    void seed() {
        payments.clear();
        users.clear();

        course = courseRepository.findAll().stream().findFirst().orElseGet(() -> {
            Course c = new Course();
            c.setCourse_name("Concurrency Test Course");
            c.setPrice(999);
            c.setInstructor("Test");
            c.setDescription("Coupon concurrency");
            return courseRepository.save(c);
        });

        String code = "CONC" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        coupon = couponRepository.save(Coupon.builder()
                .code(code)
                .discountType("PERCENT")
                .discountValue(50)
                .scope("ALL_COURSES")
                .maxRedemptions(1)
                .maxRedemptionsPerUser(1)
                .redemptionCount(0)
                .active(true)
                .build());

        for (int i = 0; i < THREADS; i++) {
            String email = "conc-user-" + i + "-" + UUID.randomUUID().toString().substring(0, 6) + "@test.local";
            User u = userRepository.save(User.builder()
                    .username("conc" + i)
                    .email(email)
                    .password(passwordEncoder.encode("TestPass123!"))
                    .role(UserRole.USER)
                    .isActive(true)
                    .build());
            users.add(u);

            Payment p = paymentRepository.save(Payment.builder()
                    .userId(u.getId())
                    .courseId(course.getCourse_id())
                    .provider("RAZORPAY")
                    .amount(49900)
                    .currency("INR")
                    .status("CREATED")
                    .providerOrderId("order_conc_" + UUID.randomUUID())
                    .couponId(coupon.getId())
                    .build());
            payments.add(p);
        }
    }

    @Test
    void concurrentMockComplete_respectsMaxRedemptionsAndOneRedemptionPerPayment() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(THREADS);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger failures = new AtomicInteger();
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < THREADS; i++) {
            final int idx = i;
            futures.add(pool.submit(() -> {
                try {
                    start.await(10, TimeUnit.SECONDS);
                    paymentService.mockComplete(users.get(idx).getId(), payments.get(idx).getProviderOrderId());
                    successes.incrementAndGet();
                } catch (Exception e) {
                    failures.incrementAndGet();
                }
            }));
        }

        start.countDown();
        for (Future<?> f : futures) {
            f.get(30, TimeUnit.SECONDS);
        }
        pool.shutdown();
        assertTrue(pool.awaitTermination(10, TimeUnit.SECONDS));

        // All five payments may reach PAID (enrollment is allowed); coupon must only redeem once total
        Coupon refreshed = couponRepository.findById(coupon.getId()).orElseThrow();
        long redemptionRows = redemptionRepository.countByCouponId(coupon.getId());

        assertEquals(1, refreshed.getRedemptionCount(),
                "redemption_count must be 1 under max_redemptions=1 after concurrent completes");
        assertEquals(1, redemptionRows,
                "exactly one lms_coupon_redemptions row for this coupon");

        // Each payment at most one redemption row (PAY-003 / unique payment_id)
        for (Payment p : payments) {
            long perPayment = redemptionRepository.findAll().stream()
                    .filter(r -> p.getId().equals(r.getPaymentId()))
                    .count();
            assertTrue(perPayment <= 1, "payment " + p.getId() + " has " + perPayment + " redemptions");
        }

        // Sanity: at least one success path ran
        assertTrue(successes.get() >= 1, "expected at least one successful mockComplete");
    }

    @Test
    void sequentialReplay_samePayment_singleRedemption() {
        Payment p = payments.get(0);
        User u = users.get(0);

        paymentService.mockComplete(u.getId(), p.getProviderOrderId());
        paymentService.mockComplete(u.getId(), p.getProviderOrderId()); // replay

        Coupon refreshed = couponRepository.findById(coupon.getId()).orElseThrow();
        long rows = redemptionRepository.findAll().stream()
                .filter(r -> p.getId().equals(r.getPaymentId()))
                .count();

        assertEquals(1, rows, "replay must not insert a second redemption for same payment");
        assertEquals(1, refreshed.getRedemptionCount());
    }
}
