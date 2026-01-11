CREATE TABLE IF NOT EXISTS `instagram_daily_metrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` VARCHAR(10) NOT NULL,
  `reach` INT,
  `accounts_engaged` INT,
  `likes` INT,
  `comments` INT,
  `shares` INT,
  `follows` INT,
  `profile_links_taps` INT,
  `views` INT,
  `total_interactions` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_date` (`date`)
);

CREATE TABLE IF NOT EXISTS `instagram_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_url` TEXT,
  `post_date` VARCHAR(10),
  `created_time` TIMESTAMP NULL,
  `caption` TEXT,
  `likes` INT,
  `reach` INT,
  `comments` INT,
  `saved` INT,
  `follows` INT,
  `media_type` VARCHAR(50),
  `watch_time_ms` BIGINT,
  `theme` VARCHAR(100),
  `media_url` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_post_date` (`post_date`),
  INDEX `idx_theme` (`theme`)
);

CREATE TABLE IF NOT EXISTS `instagram_summary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `synced_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `time_frame` VARCHAR(50),
  `posts_count` INT,
  `total_reach` INT,
  `total_likes` INT,
  `total_comments` INT,
  `total_saved` INT,
  `total_follows` INT,
  `avg_reach_per_post` DECIMAL(10, 2),
  `engagement_rate` DECIMAL(5, 2),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `instagram_weekly_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `week_starting` VARCHAR(10) NOT NULL,
  `posts_count` INT,
  `reach` INT,
  `likes` INT,
  `comments` INT,
  `saved` INT,
  `follows` INT,
  `avg_reach_per_post` DECIMAL(10, 2),
  `engagement_rate` DECIMAL(5, 2),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_week` (`week_starting`)
);
