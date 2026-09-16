CREATE TABLE IF NOT EXISTS lms_coupons (
  id BINARY(16) PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value INT NOT NULL,
  scope VARCHAR(30) NOT NULL DEFAULT 'ALL_COURSES',
  course_id BINARY(16) NULL,
  max_redemptions INT NULL,
  max_redemptions_per_user INT NOT NULL DEFAULT 1,
  redemption_count INT NOT NULL DEFAULT 0,
  expires_at DATETIME NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_coupon_code (code),
  CONSTRAINT fk_coupon_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lms_coupon_redemptions (
  id BINARY(16) PRIMARY KEY,
  coupon_id BINARY(16) NOT NULL,
  user_id BINARY(16) NOT NULL,
  payment_id BINARY(16) NULL,
  redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_red_coupon FOREIGN KEY (coupon_id) REFERENCES lms_coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_red_user FOREIGN KEY (user_id) REFERENCES lms_users(id) ON DELETE CASCADE,
  INDEX idx_red_coupon_user (coupon_id, user_id)
);

ALTER TABLE lms_payments
  ADD COLUMN coupon_id BINARY(16) NULL,
  ADD COLUMN abandoned_reminder_sent_at DATETIME NULL;

-- Safe first deploy: mark all pre-existing CREATED payments as already reminded
UPDATE lms_payments
  SET abandoned_reminder_sent_at = created_at
  WHERE status = 'CREATED' AND abandoned_reminder_sent_at IS NULL;

ALTER TABLE lms_users
  ADD COLUMN referred_by_user_id BINARY(16) NULL;
