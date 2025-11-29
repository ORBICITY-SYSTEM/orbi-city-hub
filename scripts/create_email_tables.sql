-- Email Categories Table
CREATE TABLE IF NOT EXISTS emailCategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailId VARCHAR(255) NOT NULL UNIQUE,
  emailSubject TEXT,
  emailFrom VARCHAR(320),
  emailDate TIMESTAMP,
  category ENUM('bookings', 'finance', 'marketing', 'spam', 'important', 'general') NOT NULL,
  confidence INT DEFAULT 0 NOT NULL,
  aiReasoning TEXT,
  manualCategory ENUM('bookings', 'finance', 'marketing', 'spam', 'important', 'general'),
  manuallyOverridden BOOLEAN DEFAULT FALSE,
  userId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Unsubscribe Suggestions Table
CREATE TABLE IF NOT EXISTS unsubscribeSuggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailId VARCHAR(255) NOT NULL,
  emailFrom VARCHAR(320) NOT NULL,
  emailSubject TEXT,
  detectionMethod ENUM('unsubscribe_link', 'list_unsubscribe', 'pattern_match', 'ai_detection') NOT NULL,
  unsubscribeUrl VARCHAR(500),
  senderEmailCount INT DEFAULT 1 NOT NULL,
  lastEmailDate TIMESTAMP,
  status ENUM('suggested', 'dismissed', 'unsubscribed', 'kept') DEFAULT 'suggested' NOT NULL,
  actionDate TIMESTAMP,
  userId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Email Summaries Table
CREATE TABLE IF NOT EXISTS emailSummaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailId VARCHAR(255) NOT NULL UNIQUE,
  shortSummary VARCHAR(500) NOT NULL,
  keyPoints JSON,
  actionItems JSON,
  sentiment ENUM('positive', 'neutral', 'negative', 'urgent'),
  wordCount INT DEFAULT 0,
  generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  userId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
