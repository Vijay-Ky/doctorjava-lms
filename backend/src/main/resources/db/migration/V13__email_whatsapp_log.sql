CREATE TABLE IF NOT EXISTS lms_email_log (
  id BINARY(16) PRIMARY KEY,
  recipient VARCHAR(180) NOT NULL,
  template_type VARCHAR(60) NOT NULL,
  status VARCHAR(20) NOT NULL,
  related_entity_id VARCHAR(64) NULL,
  error_message VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_log_created (created_at)
);

CREATE TABLE IF NOT EXISTS lms_whatsapp_templates (
  id BINARY(16) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  meta_template_id VARCHAR(120) NOT NULL,
  category VARCHAR(30) NOT NULL,
  placeholders VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lms_whatsapp_log (
  id BINARY(16) PRIMARY KEY,
  recipient_phone VARCHAR(30) NOT NULL,
  template_name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL,
  error_message VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
