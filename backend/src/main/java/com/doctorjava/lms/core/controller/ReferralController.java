package com.doctorjava.lms.core.controller;

import com.doctorjava.lms.core.entity.Payment;
import com.doctorjava.lms.core.entity.User;
import com.doctorjava.lms.core.repository.PaymentRepository;
import com.doctorjava.lms.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/referrals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class ReferralController {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/summary")
    public List<Map<String, Object>> summary() {
        List<User> all = userRepository.findAll();
        Map<UUID, List<User>> byRef = all.stream()
                .filter(u -> u.getReferredByUserId() != null)
                .collect(Collectors.groupingBy(User::getReferredByUserId));
        List<Payment> paid = paymentRepository.findAll().stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .toList();
        Map<UUID, User> usersById = all.stream().collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        List<Map<String, Object>> out = new ArrayList<>();
        for (Map.Entry<UUID, List<User>> e : byRef.entrySet()) {
            User referrer = usersById.get(e.getKey());
            Set<UUID> referredIds = e.getValue().stream().map(User::getId).collect(Collectors.toSet());
            long converted = paid.stream().map(Payment::getUserId).filter(referredIds::contains).distinct().count();
            long revenue = paid.stream().filter(p -> referredIds.contains(p.getUserId())).mapToLong(Payment::getAmount).sum();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("referrerUserId", e.getKey().toString());
            m.put("referrerName", referrer != null ? referrer.getUsername() : null);
            m.put("referrerEmail", referrer != null ? referrer.getEmail() : null);
            m.put("signups", e.getValue().size());
            m.put("convertedPayers", converted);
            m.put("revenuePaise", revenue);
            out.add(m);
        }
        out.sort((a, b) -> Integer.compare((Integer) b.get("signups"), (Integer) a.get("signups")));
        return out;
    }
}
