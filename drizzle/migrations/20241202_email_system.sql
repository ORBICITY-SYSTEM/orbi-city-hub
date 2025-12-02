-- Email System Database Schema (adapted from NEXUS Supabase)
-- Created: 2024-12-02

-- Google OAuth tokens table
CREATE TABLE IF NOT EXISTS google_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_token (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gmail messages table
CREATE TABLE IF NOT EXISTS gmail_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message_id VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255),
  subject TEXT,
  from_email VARCHAR(500),
  to_email VARCHAR(500),
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  received_date TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  labels JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_message (user_id, message_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_received (user_id, received_date DESC),
  INDEX idx_thread (thread_id),
  INDEX idx_from (from_email(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email categories table (AI categorization)
CREATE TABLE IF NOT EXISTS email_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  category ENUM('booking', 'review', 'complaint', 'question', 'financial', 'marketing', 'spam', 'important', 'general') NOT NULL,
  confidence DECIMAL(5,2) DEFAULT 0.00,
  ai_reasoning TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES gmail_messages(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_message (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email responses table (AI-generated responses)
CREATE TABLE IF NOT EXISTS email_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  response_text TEXT NOT NULL,
  template_used VARCHAR(100),
  language VARCHAR(10) DEFAULT 'en',
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES gmail_messages(id) ON DELETE CASCADE,
  INDEX idx_message (message_id),
  INDEX idx_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking revenue tracking (extracted from emails)
CREATE TABLE IF NOT EXISTS email_booking_revenue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  guest_name VARCHAR(255),
  check_in_date DATE,
  check_out_date DATE,
  studio_number VARCHAR(50),
  total_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'GEL',
  booking_source VARCHAR(100),
  extracted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES gmail_messages(id) ON DELETE CASCADE,
  INDEX idx_check_in (check_in_date),
  INDEX idx_studio (studio_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email sync log (track sync history)
CREATE TABLE IF NOT EXISTS email_sync_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sync_type VARCHAR(50) NOT NULL,
  messages_fetched INT DEFAULT 0,
  messages_new INT DEFAULT 0,
  messages_updated INT DEFAULT 0,
  status ENUM('success', 'partial', 'failed') NOT NULL,
  error_message TEXT,
  sync_started_at TIMESTAMP NOT NULL,
  sync_completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sync (user_id, sync_started_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
