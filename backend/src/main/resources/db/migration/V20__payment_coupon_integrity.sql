-- COUPON-001: at most one redemption per payment (replay-safe at DB layer)
-- Clean duplicates keeping the earliest row per payment_id (MySQL 8+)
DELETE r1 FROM lms_coupon_redemptions r1
  INNER JOIN lms_coupon_redemptions r2
  ON r1.payment_id = r2.payment_id
  AND r1.payment_id IS NOT NULL
  AND r1.id > r2.id;

-- Unique payment_id when not null (MySQL allows multiple NULLs in UNIQUE)
ALTER TABLE lms_coupon_redemptions
  ADD UNIQUE KEY uk_redemption_payment (payment_id);

-- DB-002: unique provider order id (prevents ambiguous order lookups)
-- Null out empty strings first
UPDATE lms_payments SET provider_order_id = NULL WHERE provider_order_id = '';

-- Drop duplicate provider_order_id rows keeping oldest (optional safety)
DELETE p1 FROM lms_payments p1
  INNER JOIN lms_payments p2
  ON p1.provider_order_id = p2.provider_order_id
  AND p1.provider_order_id IS NOT NULL
  AND p1.created_at > p2.created_at;

ALTER TABLE lms_payments
  ADD UNIQUE KEY uk_pay_provider_order (provider_order_id);

-- FK user_id → lms_users (orphans blocked going forward)
-- Skip rows that would violate if any exist
DELETE FROM lms_payments
 WHERE user_id NOT IN (SELECT id FROM lms_users);

ALTER TABLE lms_payments
  ADD CONSTRAINT fk_pay_user FOREIGN KEY (user_id) REFERENCES lms_users(id);
