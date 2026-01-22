-- Finance Copilot Tables Migration
-- Run this SQL to create the required tables for Finance Copilot

-- 1. Finance Copilot Briefings - Daily AI-generated financial summaries
CREATE TABLE IF NOT EXISTS `financeCopilotBriefings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `briefingDate` TIMESTAMP NOT NULL,
  `language` VARCHAR(8) NOT NULL DEFAULT 'ka',
  `content` JSON,
  `generatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` TIMESTAMP NULL,
  INDEX `idx_briefing_date_lang` (`briefingDate`, `language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Finance Copilot Recommendations - AI-generated actionable recommendations
CREATE TABLE IF NOT EXISTS `financeCopilotRecommendations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(64) NOT NULL DEFAULT 'general',
  `title` VARCHAR(255) NOT NULL,
  `titleGe` VARCHAR(255),
  `description` TEXT,
  `descriptionGe` TEXT,
  `estimatedImpact` VARCHAR(128),
  `priority` INT DEFAULT 3,
  `status` ENUM('active', 'converted', 'dismissed', 'expired') NOT NULL DEFAULT 'active',
  `relatedTaskId` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Finance Anomaly Log - Track detected anomalies
CREATE TABLE IF NOT EXISTS `financeAnomalyLog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `anomalyType` VARCHAR(64) NOT NULL,
  `severity` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `metric` VARCHAR(64) NOT NULL,
  `expectedValue` DECIMAL(15, 2),
  `actualValue` DECIMAL(15, 2),
  `deviationPercent` DECIMAL(5, 2),
  `description` TEXT,
  `acknowledgedAt` TIMESTAMP NULL,
  `acknowledgedBy` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_anomaly_type` (`anomalyType`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
