package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.security.UserPrincipal;
import com.doctorjava.lms.core.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private UUID uid(Authentication auth) {
        Object p = auth.getPrincipal();
        if (p instanceof UserPrincipal up) return up.getId();
        throw new RuntimeException("Unauthorized");
    }

    @PostMapping("/razorpay/create")
    public ResponseEntity<?> razorpayCreate(@RequestBody Map<String, String> body, Authentication auth) throws Exception {
        UUID courseId = UUID.fromString(body.get("courseId"));
        return ResponseEntity.ok(paymentService.createRazorpayOrder(uid(auth), courseId, body.get("couponCode")));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> razorpayVerify(@RequestBody Map<String, String> body, Authentication auth) throws Exception {
        return ResponseEntity.ok(paymentService.verifyRazorpay(
                uid(auth),
                body.get("orderId"),
                body.get("paymentId"),
                body.get("signature")
        ));
    }

    @PostMapping("/stripe/create")
    public ResponseEntity<?> stripeCreate(@RequestBody Map<String, String> body, Authentication auth) throws Exception {
        UUID courseId = UUID.fromString(body.get("courseId"));
        return ResponseEntity.ok(paymentService.createStripeCheckout(uid(auth), courseId, body.get("couponCode")));
    }

    @PostMapping("/stripe/confirm")
    public ResponseEntity<?> stripeConfirm(@RequestBody Map<String, String> body, Authentication auth) throws Exception {
        return ResponseEntity.ok(paymentService.confirmStripeSession(uid(auth), body.get("sessionId")));
    }

    /** Local/dev when keys are placeholders */
    @PostMapping("/mock-complete")
    public ResponseEntity<?> mockComplete(@RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(paymentService.mockComplete(uid(auth), body.get("orderId")));
    }
}
