/**
 * Bulk Room Inventory Population Script
 * 
 * Populates roomInventoryItems table with default quantities for all rooms.
 * Creates 56 rooms × 16 items = 896 inventory records.
 */

import { getDb } from "../server/db";
import { rooms, standardInventoryItems, roomInventoryItems } from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Default quantities for each inventory item
 * Based on typical studio apartment setup
 */
const DEFAULT_QUANTITIES: Record<string, number> = {
  "კერძა საწოლი": 1, // Single bed
  "სამუშაო მაგიდა": 1, // Work desk
  "საწოლი მატრასით": 1, // Bed with mattress
  "დივანი გახსნილი": 1, // Sofa bed
  "მაგიდა": 1, // Table
  "სკამი (2)": 2, // Chairs (2)
  "ბივენის სკამი (4)": 4, // Bar stools (4)
  "ბივენის მაგიდა": 1, // Bar table
  "ფარდა (2)": 2, // Curtains (2)
  "საწოლის დეკორატიული გადასაფარებელი": 1, // Decorative bedspread
  "სამზის პირი": 1, // Duvet cover
  "ბალიში (3)": 3, // Pillows (3)
  "ბალიშის ჩიხლი (3)": 3, // Pillowcases (3)
  "მატრასის გადასაფარებელი": 1, // Mattress cover
  "ზეწარი (2)": 2, // Blankets (2)
  "საბანი (2)": 2, // Sheets (2)
};

async function populateRoomInventory() {
  console.log("🚀 Starting room inventory population...\n");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  try {
    // 1. Get all rooms
    console.log("📋 Fetching all rooms...");
    const allRooms = await db.select().from(rooms);
    console.log(`✅ Found ${allRooms.length} rooms\n`);

    // 2. Get all standard inventory items
    console.log("📦 Fetching standard inventory items...");
    const allItems = await db.select().from(standardInventoryItems);
    console.log(`✅ Found ${allItems.length} standard items\n`);

    // 3. Check existing inventory
    console.log("🔍 Checking existing inventory...");
    const existingInventory = await db.select().from(roomInventoryItems);
    const existingCount = existingInventory.length;
    console.log(`📊 Existing inventory records: ${existingCount}\n`);

    if (existingCount > 0) {
      console.log("⚠️  WARNING: Inventory already exists!");
      console.log("This script will DELETE all existing inventory and recreate it.\n");
      
      // Clear existing inventory
      console.log("🗑️  Deleting existing inventory...");
      await db.delete(roomInventoryItems);
      console.log("✅ Existing inventory cleared\n");
    }

    // 4. Populate inventory for each room
    console.log(`📝 Creating inventory records (${allRooms.length} × ${allItems.length} = ${allRooms.length * allItems.length})...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const room of allRooms) {
      console.log(`  Processing ${room.roomNumber}...`);

      for (const item of allItems) {
        try {
          // Get default quantity for this item
          const quantity = DEFAULT_QUANTITIES[item.itemName] || 1;

          // Insert inventory record
          await db.insert(roomInventoryItems).values({
            roomId: room.id,
            standardItemId: item.id,
            quantity,
            condition: "good",
            lastChecked: new Date(),
          });

          successCount++;
        } catch (error) {
          console.error(`    ❌ Failed to add ${item.itemName}: ${error}`);
          errorCount++;
        }
      }

      console.log(`    ✅ ${allItems.length} items added`);
    }

    // 5. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 INVENTORY POPULATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Rooms:           ${allRooms.length}`);
    console.log(`Standard Items:        ${allItems.length}`);
    console.log(`Expected Records:      ${allRooms.length * allItems.length}`);
    console.log(`Successfully Created:  ${successCount}`);
    console.log(`Errors:                ${errorCount}`);
    console.log(`Success Rate:          ${((successCount / (allRooms.length * allItems.length)) * 100).toFixed(2)}%`);
    console.log("=".repeat(60));

    // 6. Verify final count
    const finalInventory = await db.select().from(roomInventoryItems);
    const finalCount = finalInventory.length;
    console.log(`\n✅ Final inventory count: ${finalCount} records\n`);

    if (finalCount === allRooms.length * allItems.length) {
      console.log("🎉 SUCCESS! All inventory records created successfully!\n");
    } else {
      console.log("⚠️  WARNING: Final count doesn't match expected count!\n");
    }

  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

// Run the script
populateRoomInventory()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
