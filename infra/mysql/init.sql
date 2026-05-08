CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  whatsapp_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(500),
  transaction_date DATE NOT NULL,
  source ENUM('whatsapp_text','whatsapp_image','dashboard') DEFAULT 'whatsapp_text',
  drive_file_id VARCHAR(255),
  ai_confidence FLOAT DEFAULT 0.0,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_date (user_id, transaction_date)
);

CREATE TABLE IF NOT EXISTS monthly_usage (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  year_month CHAR(7) NOT NULL,
  tx_count INT DEFAULT 0,
  UNIQUE KEY unique_user_month (user_id, year_month),
  FOREIGN KEY (user_id) REFERENCES users(id)
);