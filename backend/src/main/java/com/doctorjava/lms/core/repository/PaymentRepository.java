package com.doctorjava.lms.core.repository;

import com.doctorjava.lms.core.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByProviderOrderId(String providerOrderId);
}
