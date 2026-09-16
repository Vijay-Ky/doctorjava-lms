package com.doctorjava.lms.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lms_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID userId;

    @Column(name = "course_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID courseId;

    @Column(nullable = false, length = 20)
    private String provider; // RAZORPAY | STRIPE

    @Column(nullable = false)
    private int amount; // smallest currency unit (paise / cents) or whole INR for simplicity use rupees*100

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, length = 30)
    private String status; // CREATED | PAID | FAILED

    @Column(name = "provider_order_id", length = 191)
    private String providerOrderId;

    @Column(name = "provider_payment_id", length = 191)
    private String providerPaymentId;

    @Column(name = "checkout_url", length = 1000)
    private String checkoutUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "coupon_id", columnDefinition = "BINARY(16)")
    private UUID couponId;

    @Column(name = "abandoned_reminder_sent_at")
    private LocalDateTime abandonedReminderSentAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
