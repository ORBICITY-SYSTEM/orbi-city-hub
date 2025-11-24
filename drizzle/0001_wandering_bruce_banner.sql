CREATE TABLE `aiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`module` varchar(100) NOT NULL,
	`userMessage` text NOT NULL,
	`aiResponse` text NOT NULL,
	`fileUrl` varchar(500),
	`fileName` varchar(255),
	`fileType` varchar(50),
	`responseTime` int,
	`tokensUsed` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guestId` int NOT NULL,
	`bookingNumber` varchar(100) NOT NULL,
	`channel` varchar(100) NOT NULL,
	`status` enum('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending',
	`checkIn` timestamp NOT NULL,
	`checkOut` timestamp NOT NULL,
	`bookedAt` timestamp NOT NULL DEFAULT (now()),
	`roomNumber` varchar(20),
	`roomType` varchar(100) DEFAULT 'Sea View Studio',
	`adults` int NOT NULL DEFAULT 2,
	`children` int NOT NULL DEFAULT 0,
	`totalPrice` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'GEL',
	`specialRequests` text,
	`lateCheckIn` boolean DEFAULT false,
	`earlyCheckOut` boolean DEFAULT false,
	`emailId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingNumber_unique` UNIQUE(`bookingNumber`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`channel` varchar(100) NOT NULL,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` int,
	`spent` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`revenue` int DEFAULT 0,
	`description` text,
	`targetAudience` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `channelPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` varchar(100) NOT NULL,
	`month` varchar(7) NOT NULL,
	`bookings` int DEFAULT 0,
	`revenue` int DEFAULT 0,
	`commission` int DEFAULT 0,
	`occupancyRate` int DEFAULT 0,
	`averageRating` int,
	`reviewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channelPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`country` varchar(100),
	`language` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `housekeepingTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomNumber` varchar(20) NOT NULL,
	`taskType` enum('cleaning','maintenance','inspection') NOT NULL,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedTo` varchar(255),
	`assignedAt` timestamp,
	`scheduledFor` timestamp NOT NULL,
	`completedAt` timestamp,
	`description` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `housekeepingTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`currentQuantity` int NOT NULL DEFAULT 0,
	`minimumQuantity` int NOT NULL DEFAULT 0,
	`unit` varchar(50) NOT NULL DEFAULT 'pieces',
	`unitPrice` int,
	`status` enum('in_stock','low_stock','out_of_stock') NOT NULL DEFAULT 'in_stock',
	`supplier` varchar(255),
	`lastOrderDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('revenue','expense') NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'GEL',
	`transactionDate` timestamp NOT NULL,
	`bookingId` int,
	`channel` varchar(100),
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
