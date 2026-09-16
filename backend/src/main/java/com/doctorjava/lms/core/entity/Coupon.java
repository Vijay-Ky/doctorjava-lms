package com.doctorjava.lms.core.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="lms_coupons")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {
    @Id @GeneratedValue(generator="uuid2")
    @GenericGenerator(name="uuid2", strategy="org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition="BINARY(16)")
    private UUID id;
    @Column(nullable=false, unique=true, length=40)
    private String code;
    @Column(name="discount_type", nullable=false, length=20)
    private String discountType; // PERCENT | FLAT
    @Column(name="discount_value", nullable=false)
    private int discountValue;
    @Column(nullable=false, length=30)
    private String scope = "ALL_COURSES"; // ALL_COURSES | SPECIFIC_COURSE
    @Column(name="course_id", columnDefinition="BINARY(16)")
    private UUID courseId;
    @Column(name="max_redemptions")
    private Integer maxRedemptions;
    @Column(name="max_redemptions_per_user")
    private int maxRedemptionsPerUser = 1;
    @Column(name="redemption_count")
    private int redemptionCount;
    @Column(name="expires_at")
    private LocalDateTime expiresAt;
    private boolean active = true;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @PrePersist void pre(){ if(createdAt==null) createdAt=LocalDateTime.now(); if(code!=null) code=code.toUpperCase().trim(); }
}
