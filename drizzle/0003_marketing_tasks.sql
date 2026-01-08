-- Migration: Add marketing_tasks table for AI Marketing Director
-- Created: 2026-01-08

CREATE TABLE IF NOT EXISTS `marketingTasks` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text,
  `channel` enum('general', 'instagram', 'website', 'ota', 'leads', 'content', 'analytics') NOT NULL DEFAULT 'general',
  `status` enum('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `priority` enum('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
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
  INDEX `idx_marketing_tasks_status` (`status`),
  INDEX `idx_marketing_tasks_channel` (`channel`),
  INDEX `idx_marketing_tasks_agent_name` (`agentName`),
  INDEX `idx_marketing_tasks_due_date` (`dueDate`),
  INDEX `idx_marketing_tasks_assigned_to` (`assignedTo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
