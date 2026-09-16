package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    long countByCouponIdAndUserId(UUID couponId, UUID userId);
    long countByCouponId(UUID couponId);
    boolean existsByPaymentId(UUID paymentId);
}
