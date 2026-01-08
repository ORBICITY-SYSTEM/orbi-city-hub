-- Migration: Add logisticsTasks table for AI Logistics Director
-- Created: 2026-01-08

CREATE TABLE IF NOT EXISTS `logisticsTasks` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` enum('housekeeping','inventory','maintenance','scheduling','general') NOT NULL DEFAULT 'general',
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `assignedTo` varchar(64),
  `agentName` varchar(64),
  `dueDate` timestamp NULL,
  `completedAt` timestamp NULL,
  `createdBy` varchar(64) NOT NULL DEFAULT 'human',
  `aiNotes` text,
  `humanNotes` text,
  `parentTaskId` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_logistics_tasks_status` (`status`),
  INDEX `idx_logistics_tasks_category` (`category`),
  INDEX `idx_logistics_tasks_agent_name` (`agentName`),
  INDEX `idx_logistics_tasks_due_date` (`dueDate`),
  INDEX `idx_logistics_tasks_assigned_to` (`assignedTo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
