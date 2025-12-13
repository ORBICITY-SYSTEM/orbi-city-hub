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
DROP TABLE `aiConversations`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
DROP TABLE `campaigns`;--> statement-breakpoint
DROP TABLE `channelPerformance`;--> statement-breakpoint
DROP TABLE `guests`;--> statement-breakpoint
DROP TABLE `housekeepingTasks`;--> statement-breakpoint
DROP TABLE `inventoryItems`;--> statement-breakpoint
DROP TABLE `systemConfig`;--> statement-breakpoint
DROP TABLE `transactions`;