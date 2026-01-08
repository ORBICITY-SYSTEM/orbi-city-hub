CREATE TABLE `adminUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`email` varchar(320),
	`role` enum('super_admin','admin','moderator') NOT NULL DEFAULT 'admin',
	`isActive` boolean DEFAULT true,
	`lastLogin` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminUsers_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `aiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`module` varchar(64) NOT NULL,
	`messages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`description` text,
	`color` varchar(16),
	`icon` varchar(32),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailCategories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `emailSummaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailId` varchar(255),
	`summary` text,
	`keyPoints` json,
	`actionItems` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailSummaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` varchar(255) NOT NULL,
	`threadId` varchar(255) NOT NULL,
	`subject` text,
	`sender` varchar(320),
	`recipient` varchar(320),
	`emailDate` timestamp,
	`snippet` text,
	`body` text,
	`labels` json,
	`isRead` boolean DEFAULT false,
	`category` enum('bookings','questions','payments','complaints','general','technical','newsletters','spam','partnerships','reports') NOT NULL DEFAULT 'general',
	`language` enum('Georgian','English','Russian') NOT NULL DEFAULT 'English',
	`sentiment` enum('positive','neutral','negative') NOT NULL DEFAULT 'neutral',
	`priority` enum('urgent','high','normal','low') NOT NULL DEFAULT 'normal',
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `errorLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorType` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`userId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `errorLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(512),
	`fileSize` int,
	`mimeType` varchar(128),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`revenue` int DEFAULT 0,
	`expenses` int DEFAULT 0,
	`profit` int DEFAULT 0,
	`channel` varchar(64),
	`category` varchar(64),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financialData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`nationality` varchar(64),
	`passportNumber` varchar(64),
	`notes` text,
	`totalStays` int DEFAULT 0,
	`totalSpent` int DEFAULT 0,
	`vipStatus` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `housekeepingSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`scheduledTime` varchar(16),
	`taskType` varchar(64) NOT NULL,
	`assignedTo` int,
	`status` enum('scheduled','in_progress','completed','cancelled','skipped') NOT NULL DEFAULT 'scheduled',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `housekeepingSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `housekeepingTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int,
	`taskType` varchar(64) NOT NULL,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`assignedTo` int,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`notes` text,
	`scheduledFor` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `housekeepingTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`type` varchar(64),
	`status` enum('active','inactive','error','pending') NOT NULL DEFAULT 'inactive',
	`config` json,
	`lastSync` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `inventoryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(64),
	`quantity` int DEFAULT 0,
	`minQuantity` int DEFAULT 0,
	`unit` varchar(32),
	`location` varchar(128),
	`lastRestocked` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logisticsActivityLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityType` varchar(64) NOT NULL,
	`description` text,
	`roomNumber` varchar(16),
	`staffId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logisticsActivityLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenanceSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int,
	`equipmentName` varchar(255),
	`maintenanceType` varchar(64) NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`assignedTo` int,
	`status` enum('scheduled','in_progress','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`estimatedDuration` int,
	`actualDuration` int,
	`cost` int,
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenanceSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`aiPrompt` text,
	`settings` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `otelmsDailyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` timestamp NOT NULL,
	`occupancy` int,
	`revenue` int,
	`adr` int,
	`revpar` int,
	`bookingsCount` int,
	`checkInsCount` int,
	`checkOutsCount` int,
	`rawData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otelmsDailyReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` varchar(128),
	`guestName` varchar(255) NOT NULL,
	`guestEmail` varchar(320),
	`guestPhone` varchar(32),
	`roomNumber` varchar(16),
	`checkIn` timestamp NOT NULL,
	`checkOut` timestamp NOT NULL,
	`totalPrice` int,
	`currency` varchar(8) DEFAULT 'GEL',
	`channel` varchar(64),
	`status` enum('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`),
	CONSTRAINT `reservations_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
CREATE TABLE `roomInventoryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`itemId` int NOT NULL,
	`quantity` int DEFAULT 0,
	`lastChecked` timestamp,
	`status` enum('ok','missing','damaged','needs_replacement') NOT NULL DEFAULT 'ok',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roomInventoryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomNumber` varchar(16) NOT NULL,
	`roomType` varchar(64),
	`floor` int,
	`status` enum('available','occupied','cleaning','maintenance','blocked') NOT NULL DEFAULT 'available',
	`lastCleaned` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_roomNumber_unique` UNIQUE(`roomNumber`)
);
--> statement-breakpoint
CREATE TABLE `standardInventoryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(64),
	`defaultQuantity` int DEFAULT 1,
	`unit` varchar(32),
	`isRequired` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `standardInventoryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` json,
	`category` varchar(64),
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`type` varchar(32) DEFAULT 'string',
	`category` varchar(64),
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `unsubscribeSuggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailId` varchar(255),
	`sender` varchar(320),
	`reason` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `unsubscribeSuggestions_id` PRIMARY KEY(`id`)
);
