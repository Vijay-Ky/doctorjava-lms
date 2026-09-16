CREATE TABLE IF NOT EXISTS lms_payments (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  course_id BINARY(16) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(30) NOT NULL,
  provider_order_id VARCHAR(191),
  provider_payment_id VARCHAR(191),
  checkout_url VARCHAR(1000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pay_user (user_id),
  INDEX idx_pay_order (provider_order_id),
  CONSTRAINT fk_pay_course FOREIGN KEY (course_id) REFERENCES lms_courses(course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
