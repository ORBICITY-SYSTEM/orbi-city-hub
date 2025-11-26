-- Create Logistics tables for ORBI City Hub

-- 1. Standard Inventory Items (template for all rooms)
CREATE TABLE IF NOT EXISTS standardInventoryItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemName VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  standardQuantity INT DEFAULT 1 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- 2. Room Inventory Items (actual inventory per room)
CREATE TABLE IF NOT EXISTS roomInventoryItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT NOT NULL,
  standardItemId INT NOT NULL,
  actualQuantity INT DEFAULT 0 NOT NULL,
  `condition` ENUM('good', 'fair', 'poor', 'missing') DEFAULT 'good',
  lastChecked TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (standardItemId) REFERENCES standardInventoryItems(id) ON DELETE CASCADE
);

-- 3. Room Inventory Descriptions (change history)
CREATE TABLE IF NOT EXISTS roomInventoryDescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT NOT NULL,
  description TEXT NOT NULL,
  changedBy VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 4. Housekeeping Schedules
CREATE TABLE IF NOT EXISTS housekeepingSchedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  scheduledDate VARCHAR(10) NOT NULL,
  rooms JSON NOT NULL,
  totalRooms INT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' NOT NULL,
  notes TEXT,
  additionalNotes TEXT,
  mediaUrls JSON,
  assignedTo VARCHAR(255),
  completedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- 5. Maintenance Schedules
CREATE TABLE IF NOT EXISTS maintenanceSchedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  roomNumber VARCHAR(20) NOT NULL,
  scheduledDate VARCHAR(10) NOT NULL,
  problem TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' NOT NULL,
  status ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' NOT NULL,
  estimatedCost DECIMAL(10, 2),
  actualCost DECIMAL(10, 2),
  assignedTo VARCHAR(255),
  completedAt TIMESTAMP NULL,
  notes TEXT,
  mediaUrls JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roomInventoryItems_roomId ON roomInventoryItems(roomId);
CREATE INDEX IF NOT EXISTS idx_roomInventoryItems_standardItemId ON roomInventoryItems(standardItemId);
CREATE INDEX IF NOT EXISTS idx_housekeepingSchedules_scheduledDate ON housekeepingSchedules(scheduledDate);
CREATE INDEX IF NOT EXISTS idx_housekeepingSchedules_status ON housekeepingSchedules(status);
CREATE INDEX IF NOT EXISTS idx_maintenanceSchedules_roomNumber ON maintenanceSchedules(roomNumber);
CREATE INDEX IF NOT EXISTS idx_maintenanceSchedules_status ON maintenanceSchedules(status);
CREATE INDEX IF NOT EXISTS idx_maintenanceSchedules_priority ON maintenanceSchedules(priority);
