package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_coupon_redemptions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CouponRedemption {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(name="coupon_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID couponId;
    @Column(name="user_id", nullable=false, columnDefinition="BINARY(16)")
    private UUID userId;
    @Column(name="payment_id", columnDefinition="BINARY(16)")
    private UUID paymentId;
    @Column(name="redeemed_at")
    private LocalDateTime redeemedAt;
    @PrePersist void pre(){ if(redeemedAt==null) redeemedAt=LocalDateTime.now(); }
}
