/**
 * Logistics Seed Migration Script
 * 
 * Migrates data from orbi-ai-nexus (LOGISTICS_DATA_EXPORT.json) to Hub MySQL database.
 * 
 * Usage: DATABASE_URL="mysql://..." node scripts/seed-logistics.mjs
 * 
 * Prerequisites:
 * - DATABASE_URL environment variable must be set
 * - Run after drizzle migrations are applied
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the export data
const dataPath = join(__dirname, 'LOGISTICS_DATA_EXPORT.json');
const exportData = JSON.parse(readFileSync(dataPath, 'utf-8'));

async function main() {
  console.log('🚀 Starting Logistics Data Migration...\n');
  console.log(`📁 Data source: ${dataPath}`);
  console.log(`📊 Statistics from source:`);
  console.log(`   - Rooms: ${exportData.rooms.length}`);
  console.log(`   - Standard Items: ${exportData.standard_inventory_items.length}`);
  console.log(`   - Housekeeping Schedules: ${exportData.housekeeping_schedules.length}`);
  console.log(`   - Maintenance Schedules: ${exportData.maintenance_schedules.length}\n`);
  
  // Connect to database
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('✅ Connected to database\n');
  
  try {
    // 1. Migrate Rooms
    console.log('📦 Migrating Rooms...');
    const roomsInserted = await migrateRooms(connection, exportData.rooms);
    console.log(`   ✅ Inserted/Updated ${roomsInserted} rooms\n`);
    
    // 2. Migrate Standard Inventory Items
    console.log('📦 Migrating Standard Inventory Items...');
    const standardItemsInserted = await migrateStandardInventoryItems(connection, exportData.standard_inventory_items);
    console.log(`   ✅ Inserted ${standardItemsInserted} standard inventory items\n`);
    
    // 3. Create Room Inventory Items (link rooms to standard items)
    console.log('📦 Creating Room Inventory Items...');
    const roomItemsInserted = await createRoomInventoryItems(connection);
    console.log(`   ✅ Created ${roomItemsInserted} room inventory items\n`);
    
    // 4. Migrate Housekeeping Schedules (with batch support)
    console.log('🧹 Migrating Housekeeping Schedules...');
    const schedulesInserted = await migrateHousekeepingSchedules(connection, exportData.housekeeping_schedules);
    console.log(`   ✅ Inserted ${schedulesInserted} housekeeping schedules\n`);
    
    // 5. Migrate Maintenance Schedules
    console.log('🔧 Migrating Maintenance Schedules...');
    const maintenanceInserted = await migrateMaintenanceSchedules(connection, exportData.maintenance_schedules);
    console.log(`   ✅ Inserted ${maintenanceInserted} maintenance schedules\n`);
    
    // 6. Migrate Activity Log
    console.log('📝 Migrating Activity Log...');
    const logsInserted = await migrateActivityLog(connection, exportData.activity_log_sample);
    console.log(`   ✅ Inserted ${logsInserted} activity log entries\n`);
    
    console.log('═'.repeat(50));
    console.log('🎉 Migration Complete!');
    console.log('═'.repeat(50));
    console.log('\nSummary:');
    console.log(`   📦 Rooms: ${roomsInserted}`);
    console.log(`   📦 Standard Inventory Items: ${standardItemsInserted}`);
    console.log(`   📦 Room Inventory Items: ${roomItemsInserted}`);
    console.log(`   🧹 Housekeeping Schedules: ${schedulesInserted}`);
    console.log(`   🔧 Maintenance Schedules: ${maintenanceInserted}`);
    console.log(`   📝 Activity Logs: ${logsInserted}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

async function migrateRooms(connection, rooms) {
  let count = 0;
  
  for (const room of rooms) {
    try {
      await connection.execute(
        `INSERT INTO rooms (roomNumber, building, floor, roomType, status, createdAt, updatedAt)
         VALUES (?, ?, ?, 'studio', 'available', NOW(), NOW())
         ON DUPLICATE KEY UPDATE building = VALUES(building), floor = VALUES(floor), updatedAt = NOW()`,
        [
          room.room_number,
          room.building,
          extractFloor(room.room_number)
        ]
      );
      count++;
    } catch (err) {
      console.log(`   ⚠️ Error with room ${room.room_number}: ${err.message}`);
    }
  }
  
  return count;
}

async function migrateStandardInventoryItems(connection, standardItems) {
  let count = 0;
  
  for (const item of standardItems) {
    try {
      await connection.execute(
        `INSERT INTO standardInventoryItems (name, category, defaultQuantity, isRequired, createdAt)
         VALUES (?, ?, ?, true, NOW())
         ON DUPLICATE KEY UPDATE category = VALUES(category), defaultQuantity = VALUES(defaultQuantity)`,
        [
          item.item_name,
          item.category,
          item.standard_quantity
        ]
      );
      count++;
    } catch (err) {
      console.log(`   ⚠️ Error with item ${item.item_name}: ${err.message}`);
    }
  }
  
  return count;
}

async function createRoomInventoryItems(connection) {
  let count = 0;
  
  // Get all rooms
  const [rooms] = await connection.execute('SELECT id, roomNumber FROM rooms');
  
  // Get all standard items
  const [standardItems] = await connection.execute('SELECT id, name, defaultQuantity FROM standardInventoryItems');
  
  for (const room of rooms) {
    for (const item of standardItems) {
      try {
        await connection.execute(
          `INSERT INTO roomInventoryItems (roomId, itemId, quantity, status, createdAt, updatedAt)
           VALUES (?, ?, ?, 'ok', NOW(), NOW())
           ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
          [
            room.id,
            item.id,
            item.defaultQuantity
          ]
        );
        count++;
      } catch (err) {
        // Skip duplicates silently
      }
    }
  }
  
  return count;
}

async function migrateHousekeepingSchedules(connection, schedules) {
  let count = 0;
  
  // Get room IDs
  const [roomRows] = await connection.execute('SELECT id, roomNumber FROM rooms');
  const roomMap = new Map(roomRows.map(r => [r.roomNumber, r.id]));
  
  for (const schedule of schedules) {
    // Create a batch ID for multi-room schedules
    const batchId = `batch_${schedule.scheduled_date.replace(/-/g, '')}_${schedule.rooms.length}rooms`;
    
    for (const roomNumber of schedule.rooms) {
      const roomId = roomMap.get(roomNumber);
      if (!roomId) {
        console.log(`   ⚠️ Room not found: ${roomNumber}`);
        continue;
      }
      
      try {
        const status = schedule.status === 'completed' ? 'completed' : 'scheduled';
        const completedAt = schedule.completed_at ? new Date(schedule.completed_at) : null;
        
        await connection.execute(
          `INSERT INTO housekeepingSchedules 
           (batchId, roomId, scheduledDate, taskType, status, priority, notes, completedAt, createdAt, updatedAt)
           VALUES (?, ?, ?, 'cleaning', ?, 'normal', ?, ?, NOW(), NOW())`,
          [
            batchId,
            roomId,
            new Date(schedule.scheduled_date),
            status,
            schedule.notes || null,
            completedAt
          ]
        );
        count++;
      } catch (err) {
        console.log(`   ⚠️ Error inserting schedule for ${roomNumber}: ${err.message}`);
      }
    }
  }
  
  return count;
}

async function migrateMaintenanceSchedules(connection, maintenanceSchedules) {
  let count = 0;
  
  // Get room IDs
  const [roomRows] = await connection.execute('SELECT id, roomNumber FROM rooms');
  const roomMap = new Map(roomRows.map(r => [r.roomNumber, r.id]));
  
  for (const maintenance of maintenanceSchedules) {
    const roomId = roomMap.get(maintenance.room_number);
    if (!roomId) {
      console.log(`   ⚠️ Room not found: ${maintenance.room_number}`);
      continue;
    }
    
    try {
      await connection.execute(
        `INSERT INTO maintenanceSchedules 
         (roomId, description, descriptionEn, maintenanceType, scheduledDate, status, priority, cost, notes, completedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, 'repair', ?, 'completed', 'normal', ?, ?, ?, NOW(), NOW())`,
        [
          roomId,
          maintenance.problem,
          maintenance.problem_en || maintenance.problem,
          new Date(maintenance.scheduled_date),
          maintenance.cost || 0,
          maintenance.notes || null,
          new Date(maintenance.scheduled_date)
        ]
      );
      count++;
    } catch (err) {
      console.log(`   ⚠️ Error inserting maintenance for ${maintenance.room_number}: ${err.message}`);
    }
  }
  
  return count;
}

async function migrateActivityLog(connection, activityLogs) {
  let count = 0;
  
  for (const log of activityLogs) {
    try {
      await connection.execute(
        `INSERT INTO activityLogs 
         (actionType, targetEntity, targetId, newValue, module, createdAt)
         VALUES (?, ?, ?, ?, 'logistics', ?)`,
        [
          log.action,
          log.entity_type,
          log.entity_name,
          JSON.stringify(log.changes),
          new Date(log.created_at)
        ]
      );
      count++;
    } catch (err) {
      console.log(`   ⚠️ Error inserting activity log: ${err.message}`);
    }
  }
  
  return count;
}

// Helper function to extract floor number from room number
function extractFloor(roomNumber) {
  // Room format: "A 1033" -> floor 10, "C 2520" -> floor 25
  const match = roomNumber.match(/\d+/);
  if (match) {
    const num = match[0];
    if (num.length >= 3) {
      return parseInt(num.substring(0, num.length - 2));
    }
  }
  return 1;
}

// Run migration
main().catch(console.error);
