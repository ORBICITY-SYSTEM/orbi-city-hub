CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`actionType` varchar(64) NOT NULL,
	`targetEntity` varchar(64),
	`targetId` varchar(128),
	`oldValue` json,
	`newValue` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`module` varchar(64),
	`isRollbackable` boolean DEFAULT true,
	`rolledBackAt` timestamp,
	`rolledBackBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiTaskAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskType` varchar(64) NOT NULL,
	`status` enum('pending','approved','rejected','completed','failed') NOT NULL DEFAULT 'pending',
	`userId` int,
	`approvedBy` int,
	`approvedAt` timestamp,
	`completedAt` timestamp,
	`executionTimeMs` int,
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiTaskAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('info','success','warning','error','approval') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text,
	`actionUrl` varchar(512),
	`actionLabel` varchar(64),
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`emailSent` boolean DEFAULT false,
	`whatsappSent` boolean DEFAULT false,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whitelabelSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) DEFAULT 'ORBI City Hub',
	`logoUrl` text,
	`faviconUrl` text,
	`primaryColor` varchar(32) DEFAULT '#10b981',
	`secondaryColor` varchar(32) DEFAULT '#1e293b',
	`accentColor` varchar(32) DEFAULT '#3b82f6',
	`customCss` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whitelabelSettings_id` PRIMARY KEY(`id`)
);
