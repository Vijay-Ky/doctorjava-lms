# Security & Build Fixes (Audit Revision 3)

## P0 fixed

### BUILD-001 — Frontend production build
- **File:** `frontend/app/admin/course-questions/page.tsx`
- **Change:** `lmsFetch` typed as `any` (not `any[]`) so `x?.content` is valid when the API returns a page envelope.

### PAY-001 — Mock payment bypass in production
- **File:** `backend/.../PaymentService.java` → `mockComplete()`
- **Change:** First line calls `requirePaymentProviderOrDev("Mock payment")`.
- Outside `local` / `dev` / `test` profiles the method throws `IllegalStateException` → HTTP 400.
- **Also:** `GlobalExceptionHandler` maps `IllegalStateException` → 400 JSON.

### PAY-002 — Free enroll of paid courses via POST `/api/learning`
- **File:** `backend/.../LearningService.java` → `enrollCourse()`
- **Change:** If `course.getPrice() > 0`, throws `ResponseStatusException` with **402 PAYMENT_REQUIRED**.
- Paid courses must use `/api/payments/*` (Razorpay/Stripe; mock only in local/dev/test).
- Free courses (`price == 0`) still enroll directly.

## How to verify locally

```bash
# Frontend build (must exit 0)
cd frontend && npm run build

# Backend — with profile=local, mock-complete still works
# With profile=prod (or no local/dev/test), mock-complete must return 4xx

# Paid course enroll without payment:
# POST /api/learning with a paid courseId → expect 402
```

## Not fully automated in this pass
GAP-001..GAP-013 tests from the audit are specified but not yet implemented as JUnit classes.
Priority next: ownership checks (coding attempts, assessments), mock timer/replay, SUPER_ADMIN creation gate.

## GAP series (high priority) — status

### GAP-001 — Coding attempt ownership
**Status: already enforced (verified correct, regression-pinned)**  
`CodingMockTestService` loads attempts via `findByIdAndStudentKey*` and `loadActive(attemptId, studentKey)`.  
Controller always passes `auth.getName()` as studentKey. Cross-user access returns not-found / cannot act.

### GAP-003 — Assessment `userId` path ownership
**Status: FIXED**  
`AssessmentController` now calls `SecurityUtils.requireOwnerOrAdmin(userId)` on:
- GET `/api/assessments/user/{userId}/course/{courseId}`
- GET `/api/assessments/performance/{userId}`
- POST `/api/assessments/add/{userId}/{courseId}`

### GAP-004 / GAP-005 — Mock timer + submit replay
**Status: already enforced (verified correct, regression-pinned)**  
- `MockTestService.ensureActive()` rejects answers after expiry and marks AUTO_SUBMITTED.  
- `saveAnswer` calls `ensureActive`.  
- `submit` is idempotent: if status ≠ IN_PROGRESS, returns stored result (no re-score).  
- Late submit while still IN_PROGRESS after `expiresAt` → AUTO_SUBMITTED + scores clamped.  
Coding path: `loadActive` auto-finishes on expiry; `finish` is idempotent if already submitted.

### GAP-006 — SUPER_ADMIN creation / role assignment gate
**Status: FIXED (defense in depth)**  
- `POST /api/users/admin-create` already blocked non–SUPER_ADMIN from creating ADMIN/SUPER_ADMIN.  
- `PATCH /api/users/{id}/role` now same gate (controller + `UserService.updateRole`).  
- `SecurityUtils.isSuperAdmin()` added.

### How to smoke-test
```
# GAP-003: as student A, GET /api/assessments/performance/{studentB-id} → 403
# GAP-006: as ADMIN (not SUPER), PATCH role to SUPER_ADMIN → 403
# GAP-004: start mock, wait past expiresAt, saveAnswer → error; submit → AUTO_SUBMITTED once
# GAP-005: submit twice → second returns same scores, status stays SUBMITTED
```

## Remaining GAP exploration (this pass)

### GAP-007 — Email uniqueness on profile update
**Status: FIXED**  
`UserService.updateUser` now rejects email changes that collide with another account (HTTP 409 CONFLICT). Unchanged email is allowed.

### GAP-008 — Self-referral
**Status: FIXED (defensive)**  
After registration save, if `referredByUserId` equals the new user's id, it is cleared.  
No referral *reward* logic exists yet (admin report only) — self-referral cannot grant benefits until rewards are implemented.

### GAP-009 — File upload validation
**Status: largely already correct + hardened**  
- Profile images: 2MB, magic-byte sniff (JPEG/PNG/WebP), ImageIO re-encode (strip EXIF) — already present.  
- Bulk MCQ: **added** ≤2MB size limit, `.txt`/`.md` extension allowlist, pasted-text length cap.

### GAP-010 — Progress `playedTime` bounds
**Status: FIXED**  
- Rejects negative `playedTime` / `duration`.  
- Clamps `playedTime` to effective lecture duration when duration is known.

### GAP-011 — Full SecurityConfig route–role matrix test
**Status: PARTIAL / recommended next engineering task**  
Existing `AdminAccessControlTest` only covers a few unauthenticated admin routes.  
A full parameterized matrix (every `requestMatchers` × role) is high leverage but large; not expanded into a complete table in this pass. Keep extending `AdminAccessControlTest` as routes change.

### GAP-012 — Leaderboard PII
**Status: FIXED**  
Public leaderboard `displayName` no longer falls back to email local-part; uses username or `"Learner"`.  
Response fields remain score/rank oriented (`studentKey`, `learnerName`, averages) — no phone/email keys.

### GAP-013 — Certificates & community edit/delete
**Confirmation results:**  
**(a) Certificates — CLIENT-SIDE-ONLY**  
- Frontend: `app/certificate/[courseId]/page.tsx` uses `jspdf` + `html2canvas`.  
- No backend certificate issuance/verification entity or API found.  
- **Risk:** PDF can be generated without a server-side completion record (integrity is not employer-verifiable). Product decision required for server-side certificates.  
**(b) Community edit/delete — MISSING FEATURE**  
- `CommunityController` has list/create post, list/create reply only — **no PUT/DELETE**.  
- Log as missing feature; when built, require owner-vs-admin ownership matrix.

## Summary table

| ID | Outcome |
|----|---------|
| GAP-001 | Already correct |
| GAP-003 | Fixed earlier |
| GAP-004/005 | Already correct |
| GAP-006 | Fixed earlier |
| GAP-007 | Fixed |
| GAP-008 | Fixed (defensive) |
| GAP-009 | Already strong + bulk hardened |
| GAP-010 | Fixed |
| GAP-011 | Partial (existing smoke tests only) |
| GAP-012 | Fixed |
| GAP-013 | Confirmed: certs client-only; community no edit/delete |

### GAP-011 — Full route–role matrix (this pass)
**Status: DOCUMENTED + automated unauthenticated probes**  
- Matrix: `docs/ROUTE_ROLE_MATRIX.md` (transcribed from `SecurityConfig.java`)  
- Test: `backend/src/test/java/com/doctorjava/lms/security/FullRouteRoleMatrixTest.java`  
- Run: `./mvnw test -Dtest=FullRouteRoleMatrixTest`  
- Covers anonymous PUBLIC vs PROTECTED for every major rule; role-positive JWT cases are a follow-up.

### GAP-011 update — JWT role-positive cases
`FullRouteRoleMatrixTest` seeds USER / INSTRUCTOR / ADMIN / SUPER_ADMIN and asserts ALLOW vs DENY with real Bearer tokens. See `docs/ROUTE_ROLE_MATRIX.md`.

## Independent audit round (next plan) — applied

### PII-001 — Course leaderboard email leak
`LeaderboardController.byCourse()` now uses `displayName(key)` only (no email local-part).

### IDOR-001 — Profile image ownership
`GET /api/users/{id}/profile-image` calls `SecurityUtils.requireOwnerOrAdmin(id)`.
Tests: `UserProfileImageOwnershipTest`.

### AUTH-001 — Deactivated JWT
`JwtAuthTokenFilter` skips setting SecurityContext when `!userDetails.isEnabled()`.
Tests: `DeactivatedUserAccessTest`.

### PAY-003 — Mock payment replay
`mockComplete` returns early if status already PAID (no second coupon finalize).
`CouponService.recordRedemption` no-ops if `existsByPaymentId`.

### GAP-010 — Confirmed still present
Negative reject + clamp to duration in `ProgressService.updateProgress`.

## Open-item round (Docker / coupon DB / actuator / IDOR)

### DOCKER-001
- Removed `privileged: true`; localhost port bind; cap_drop ALL + minimal caps.
- See `docs/PISTON_HARDENING.md` for live verification steps.

### COUPON-001-B / DB-002 (schema)
- Flyway `V20__payment_coupon_integrity.sql`:
  - UNIQUE `lms_coupon_redemptions.payment_id`
  - UNIQUE `lms_payments.provider_order_id`
  - FK `lms_payments.user_id` → `lms_users`
  - Dedup cleanup before constraints

### Actuator
- Default + prod: expose **health only**; `show-details: never`.

### IDOR sweep
- Matrix: `docs/IDOR_ENDPOINT_MATRIX.md`
- Notification mark-read now returns 403 for non-owners.

## COUPON-001-B — Concurrent redemption test

- `CouponService.recordRedemption` uses `findByIdForUpdate` (pessimistic write) + max_redemptions check.
- `CouponConcurrencyTest`: 5 threads × mockComplete, asserts `redemption_count == 1` and one redemption row; sequential replay still one row per payment.
- Run: `./mvnw test -Dtest=CouponConcurrencyTest`
