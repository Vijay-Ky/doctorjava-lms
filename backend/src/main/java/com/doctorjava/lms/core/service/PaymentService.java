package com.doctorjava.lms.core.service;

import com.doctorjava.lms.core.config.PaymentProperties;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Payment;
import com.doctorjava.lms.core.repository.CourseRepository;
import com.doctorjava.lms.core.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final LearningService learningService;
    private final PaymentProperties props;
    private final Environment env;
    private final CouponService couponService;

    private boolean isDevOrTestProfile() {
        return Arrays.stream(env.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("local") || p.equalsIgnoreCase("dev") || p.equalsIgnoreCase("test"));
    }

    private void requirePaymentProviderOrDev(String provider) {
        if (!isDevOrTestProfile()) {
            throw new IllegalStateException(
                    provider + " is not configured. Mock payment path is disabled outside local/dev/test profiles.");
        }
    }

    public boolean isRazorpayConfigured() {
        String k = props.getRazorpay().getKeyId();
        return k != null && !k.contains("placeholder") && !k.isBlank();
    }

    public boolean isStripeConfigured() {
        String k = props.getStripe().getSecretKey();
        return k != null && !k.contains("placeholder") && !k.isBlank();
    }


    private record AmountCoupon(int amountPaise, java.util.UUID couponId) {}

    private AmountCoupon computeAmount(UUID userId, UUID courseId, String couponCode) {
        int amountPaise = Math.max(courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found")).getPrice(), 1) * 100;
        UUID couponId = null;
        if (couponCode != null && !couponCode.isBlank()) {
            CouponService.Quote q = couponService.validate(couponCode, courseId, userId);
            amountPaise = Math.max(q.finalPaise(), 0);
            couponId = q.couponId();
        }
        return new AmountCoupon(amountPaise, couponId);
    }

    private void finalizeCoupon(Payment payment) {
        if (payment.getCouponId() != null) {
            couponService.recordRedemption(payment.getCouponId(), payment.getUserId(), payment.getId());
        }
    }

    @Transactional
    public Map<String, Object> createRazorpayOrder(UUID userId, UUID courseId) throws Exception {
        return createRazorpayOrder(userId, courseId, null);
    }

    @Transactional
    public Map<String, Object> createRazorpayOrder(UUID userId, UUID courseId, String couponCode) throws Exception {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        AmountCoupon ac = computeAmount(userId, courseId, couponCode);
        int amountPaise = ac.amountPaise();
        Payment payment = Payment.builder()
                .userId(userId)
                .courseId(courseId)
                .provider("RAZORPAY")
                .amount(amountPaise)
                .currency(props.getCurrency())
                .status("CREATED")
                .couponId(ac.couponId())
                .build();

        if (!isRazorpayConfigured()) {
            requirePaymentProviderOrDev("Razorpay");
            // Dev mock only
            payment.setProviderOrderId("mock_order_" + UUID.randomUUID());
            paymentRepository.save(payment);
            return Map.of(
                    "mock", true,
                    "provider", "RAZORPAY",
                    "orderId", payment.getProviderOrderId(),
                    "amount", amountPaise,
                    "currency", props.getCurrency(),
                    "keyId", "mock",
                    "paymentId", payment.getId().toString(),
                    "message", "Razorpay keys not set — use /api/payments/mock-complete for local testing"
            );
        }

        RazorpayClient client = new RazorpayClient(props.getRazorpay().getKeyId(), props.getRazorpay().getKeySecret());
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountPaise);
        orderRequest.put("currency", props.getCurrency());
        orderRequest.put("receipt", "course_" + courseId);
        Order order = client.orders.create(orderRequest);
        payment.setProviderOrderId(order.get("id"));
        paymentRepository.save(payment);

        return Map.of(
                "mock", false,
                "provider", "RAZORPAY",
                "orderId", order.get("id"),
                "amount", amountPaise,
                "currency", props.getCurrency(),
                "keyId", props.getRazorpay().getKeyId(),
                "paymentId", payment.getId().toString(),
                "courseName", course.getCourse_name()
        );
    }

    @Transactional
    public Map<String, Object> verifyRazorpay(UUID userId, String orderId, String paymentId, String signature) throws Exception {
        Payment payment = paymentRepository.findByProviderOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment order not found"));
        if (!payment.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        if (!isRazorpayConfigured()) {
            requirePaymentProviderOrDev("Razorpay");
            // mock accept (dev only)
            payment.setStatus("PAID");
        finalizeCoupon(payment);
            payment.setProviderPaymentId(paymentId != null ? paymentId : "mock_pay");
            paymentRepository.save(payment);
            learningService.enrollCourseByIds(userId, payment.getCourseId());
            return Map.of("status", "PAID", "enrolled", true);
        }

        String payload = orderId + "|" + paymentId;
        String expected = hmacSha256(payload, props.getRazorpay().getKeySecret());
        if (!expected.equals(signature)) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            throw new RuntimeException("Invalid Razorpay signature");
        }
        payment.setStatus("PAID");
        finalizeCoupon(payment);
        payment.setProviderPaymentId(paymentId);
        paymentRepository.save(payment);
        learningService.enrollCourseByIds(userId, payment.getCourseId());
        return Map.of("status", "PAID", "enrolled", true);
    }

    @Transactional
    public Map<String, Object> createStripeCheckout(UUID userId, UUID courseId) throws Exception {
        return createStripeCheckout(userId, courseId, null);
    }

    @Transactional
    public Map<String, Object> createStripeCheckout(UUID userId, UUID courseId, String couponCode) throws Exception {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        AmountCoupon ac = computeAmount(userId, courseId, couponCode);
        int amount = ac.amountPaise();
        Payment payment = Payment.builder()
                .userId(userId)
                .courseId(courseId)
                .provider("STRIPE")
                .amount(amount)
                .currency(props.getCurrency())
                .status("CREATED")
                .couponId(ac.couponId())
                .build();

        if (!isStripeConfigured()) {
            requirePaymentProviderOrDev("Stripe");
            payment.setProviderOrderId("mock_stripe_" + UUID.randomUUID());
            paymentRepository.save(payment);
            return Map.of(
                    "mock", true,
                    "provider", "STRIPE",
                    "sessionId", payment.getProviderOrderId(),
                    "url", props.getSuccessUrl() + "?mock=1&orderId=" + payment.getProviderOrderId(),
                    "paymentId", payment.getId().toString(),
                    "message", "Stripe keys not set — open url or call mock-complete"
            );
        }

        Stripe.apiKey = props.getStripe().getSecretKey();
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(props.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(props.getCancelUrl())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(props.getCurrency().toLowerCase())
                                .setUnitAmount((long) amount)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(course.getCourse_name())
                                        .build())
                                .build())
                        .build())
                .putMetadata("userId", userId.toString())
                .putMetadata("courseId", courseId.toString())
                .build();
        Session session = Session.create(params);
        payment.setProviderOrderId(session.getId());
        payment.setCheckoutUrl(session.getUrl());
        paymentRepository.save(payment);

        return Map.of(
                "mock", false,
                "provider", "STRIPE",
                "sessionId", session.getId(),
                "url", session.getUrl(),
                "paymentId", payment.getId().toString()
        );
    }

    @Transactional
    public Map<String, Object> confirmStripeSession(UUID userId, String sessionId) throws Exception {
        Payment payment = paymentRepository.findByProviderOrderId(sessionId)
                .orElseThrow(() -> new RuntimeException("Payment session not found"));
        if (!payment.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");

        if (!isStripeConfigured()) {
            requirePaymentProviderOrDev("Stripe");
            payment.setStatus("PAID");
        finalizeCoupon(payment);
            paymentRepository.save(payment);
            learningService.enrollCourseByIds(userId, payment.getCourseId());
            return Map.of("status", "PAID", "enrolled", true);
        }

        Stripe.apiKey = props.getStripe().getSecretKey();
        Session session = Session.retrieve(sessionId);
        if (!"paid".equalsIgnoreCase(session.getPaymentStatus()) && !"complete".equalsIgnoreCase(session.getStatus())) {
            throw new RuntimeException("Stripe payment not completed");
        }
        payment.setStatus("PAID");
        finalizeCoupon(payment);
        payment.setProviderPaymentId(session.getPaymentIntent());
        paymentRepository.save(payment);
        learningService.enrollCourseByIds(userId, payment.getCourseId());
        return Map.of("status", "PAID", "enrolled", true);
    }

    @Transactional
    public Map<String, Object> mockComplete(UUID userId, String orderId) {
        requirePaymentProviderOrDev("Mock payment");
        Payment payment = paymentRepository.findByProviderOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!payment.getUserId().equals(userId)) throw new RuntimeException("Unauthorized");
        // PAY-003: idempotent — already paid → no second coupon redemption
        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            learningService.enrollCourseByIds(userId, payment.getCourseId());
            return Map.of("status", "PAID", "enrolled", true, "courseId", payment.getCourseId().toString());
        }
        payment.setStatus("PAID");
        finalizeCoupon(payment);
        payment.setProviderPaymentId("mock_complete");
        paymentRepository.save(payment);
        learningService.enrollCourseByIds(userId, payment.getCourseId());
        return Map.of("status", "PAID", "enrolled", true, "courseId", payment.getCourseId().toString());
    }

    private static String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }
}
