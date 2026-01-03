/**
 * Logistics Seed Router
 * 
 * API endpoint to seed logistics data from LOGISTICS_DATA_EXPORT.json
 * This runs inside the Hub environment with database access
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  rooms,
  standardInventoryItems,
  roomInventoryItems,
} from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// Seed data embedded directly (from LOGISTICS_DATA_EXPORT.json)
const SEED_DATA = {
  rooms: [
    {"room_number": "A 1033", "building": "A"},
    {"room_number": "A 1258", "building": "A"},
    {"room_number": "A 1301", "building": "A"},
    {"room_number": "A 1806", "building": "A"},
    {"room_number": "A 1821", "building": "A"},
    {"room_number": "A 1833", "building": "A"},
    {"room_number": "A 2035", "building": "A"},
    {"room_number": "A 2441", "building": "A"},
    {"room_number": "A 3035", "building": "A"},
    {"room_number": "A 3041", "building": "A"},
    {"room_number": "A 4022", "building": "A"},
    {"room_number": "A 4023", "building": "A"},
    {"room_number": "A 4024", "building": "A"},
    {"room_number": "A 4025", "building": "A"},
    {"room_number": "A 4026", "building": "A"},
    {"room_number": "A 4027", "building": "A"},
    {"room_number": "A 4029", "building": "A"},
    {"room_number": "A 4035", "building": "A"},
    {"room_number": "C 1256", "building": "C"},
    {"room_number": "C 2107", "building": "C"},
    {"room_number": "C 2520", "building": "C"},
    {"room_number": "C 2522", "building": "C"},
    {"room_number": "C 2524", "building": "C"},
    {"room_number": "C 2529", "building": "C"},
    {"room_number": "C 2547", "building": "C"},
    {"room_number": "C 2558", "building": "C"},
    {"room_number": "C 2609", "building": "C"},
    {"room_number": "C 2637", "building": "C"},
    {"room_number": "C 2641", "building": "C"},
    {"room_number": "C 2847", "building": "C"},
    {"room_number": "C 2861", "building": "C"},
    {"room_number": "C 2921", "building": "C"},
    {"room_number": "C 2923", "building": "C"},
    {"room_number": "C 2936", "building": "C"},
    {"room_number": "C 2947", "building": "C"},
    {"room_number": "C 2961", "building": "C"},
    {"room_number": "C 3421", "building": "C"},
    {"room_number": "C 3423", "building": "C"},
    {"room_number": "C 3425", "building": "C"},
    {"room_number": "C 3428", "building": "C"},
    {"room_number": "C 3431", "building": "C"},
    {"room_number": "C 3437", "building": "C"},
    {"room_number": "C 3439", "building": "C"},
    {"room_number": "C 3441", "building": "C"},
    {"room_number": "C 3611", "building": "C"},
    {"room_number": "C 3834", "building": "C"},
    {"room_number": "C 3928", "building": "C"},
    {"room_number": "C 3937", "building": "C"},
    {"room_number": "C 4011", "building": "C"},
    {"room_number": "C 4638", "building": "C"},
    {"room_number": "C 4704", "building": "C"},
    {"room_number": "C 4706", "building": "C"},
    {"room_number": "D1 3414", "building": "D1"},
    {"room_number": "D1 3416", "building": "D1"},
    {"room_number": "D1 3418", "building": "D1"},
    {"room_number": "D2 3727", "building": "D2"}
  ],
  standard_inventory_items: [
    {"category": "აბაზანის აქსესუარები", "item_name": "აბაზანის სარკე", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "ნაგვის ურნა", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "ნიჟარა შემრევით", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "საშხაპე დუშითა და შემრევით", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "საშხაპის აქსესუარი", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "ტუალეტის ქაღალდის საკიდი", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "უნიტაზი", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "უნიტაზის ჯაგრისი", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "ფენი", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "წყლის გამაცხელებელი", "standard_quantity": 1},
    {"category": "აბაზანის აქსესუარები", "item_name": "ხის კალათა", "standard_quantity": 1},
    {"category": "ავეჯი და ტექსტილი", "item_name": "აივნის მაგიდა", "standard_quantity": 1},
    {"category": "ავეჯი და ტექსტილი", "item_name": "აივნის სკამი", "standard_quantity": 4},
    {"category": "ავეჯი და ტექსტილი", "item_name": "ბალიში (საწოლისთვის და დივნისთვის)", "standard_quantity": 3},
    {"category": "ავეჯი და ტექსტილი", "item_name": "ბალიშის ჩიხოლი (საწოლისთვის და დივნისთვის)", "standard_quantity": 3},
    {"category": "ავეჯი და ტექსტილი", "item_name": "დივანი გასაშლელი", "standard_quantity": 1},
    {"category": "ავეჯი და ტექსტილი", "item_name": "ზეწარი (საწოლისთვის და დივნისთვის)", "standard_quantity": 2}
  ]
};

// Helper function to extract floor number from room number
function extractFloor(roomNumber: string): number {
  const match = roomNumber.match(/\d+/);
  if (match) {
    const num = match[0];
    if (num.length >= 3) {
      return parseInt(num.substring(0, num.length - 2));
    }
  }
  return 1;
}

export const seedLogisticsRouter = router({
  // Check current data status
  status: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [roomCount] = await db.select({ count: sql<number>`count(*)` }).from(rooms);
    const [itemCount] = await db.select({ count: sql<number>`count(*)` }).from(standardInventoryItems);
    
    return {
      roomsInDb: Number(roomCount?.count) || 0,
      standardItemsInDb: Number(itemCount?.count) || 0,
      roomsToSeed: 56,
      itemsToSeed: 16,
    };
  }),
  
  // Seed rooms
  seedRooms: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    let inserted = 0;
    let updated = 0;
    
    for (const room of SEED_DATA.rooms) {
      try {
        // Check if room exists
        const [existing] = await db
          .select()
          .from(rooms)
          .where(eq(rooms.roomNumber, room.room_number))
          .limit(1);
        
        if (existing) {
          // Update building if needed
          await db
            .update(rooms)
            .set({ building: room.building, floor: extractFloor(room.room_number) })
            .where(eq(rooms.id, existing.id));
          updated++;
        } else {
          // Insert new room
          await db.insert(rooms).values({
            roomNumber: room.room_number,
            building: room.building,
            floor: extractFloor(room.room_number),
            roomType: "studio",
            status: "available",
          });
          inserted++;
        }
      } catch (err: any) {
        console.error(`Error with room ${room.room_number}:`, err.message);
      }
    }
    
    return { inserted, updated, total: SEED_DATA.rooms.length };
  }),
  
  // Seed standard inventory items
  seedStandardItems: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    let inserted = 0;
    let updated = 0;
    
    for (const item of SEED_DATA.standard_inventory_items) {
      try {
        // Check if item exists
        const [existing] = await db
          .select()
          .from(standardInventoryItems)
          .where(eq(standardInventoryItems.itemName, item.item_name))
          .limit(1);
        
        if (existing) {
          await db
            .update(standardInventoryItems)
            .set({ 
              category: item.category, 
              defaultQuantity: item.standard_quantity 
            })
            .where(eq(standardInventoryItems.id, existing.id));
          updated++;
        } else {
          await db.insert(standardInventoryItems).values({
            itemName: item.item_name,
            category: item.category,
            defaultQuantity: item.standard_quantity,
            isRequired: true,
          });
          inserted++;
        }
      } catch (err: any) {
        console.error(`Error with item ${item.item_name}:`, err.message);
      }
    }
    
    return { inserted, updated, total: SEED_DATA.standard_inventory_items.length };
  }),
  
  // Create room inventory items (link rooms to standard items)
  seedRoomInventory: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Get all rooms
    const allRooms = await db.select().from(rooms);
    
    // Get all standard items
    const allItems = await db.select().from(standardInventoryItems);
    
    let created = 0;
    
    for (const room of allRooms) {
      for (const item of allItems) {
        try {
          // Check if already exists
          const [existing] = await db
            .select()
            .from(roomInventoryItems)
            .where(
              sql`${roomInventoryItems.roomId} = ${room.id} AND ${roomInventoryItems.itemId} = ${item.id}`
            )
            .limit(1);
          
          if (!existing) {
            await db.insert(roomInventoryItems).values({
              roomId: room.id,
              itemId: item.id,
              quantity: item.defaultQuantity,
              status: "ok",
            });
            created++;
          }
        } catch (err: any) {
          // Skip duplicates silently
        }
      }
    }
    
    return { created, rooms: allRooms.length, items: allItems.length };
  }),
  
  // Run all seeds at once
  seedAll: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const results = {
      rooms: { inserted: 0, updated: 0 },
      standardItems: { inserted: 0, updated: 0 },
      roomInventory: { created: 0 },
    };
    
    // 1. Seed rooms
    for (const room of SEED_DATA.rooms) {
      try {
        const [existing] = await db
          .select()
          .from(rooms)
          .where(eq(rooms.roomNumber, room.room_number))
          .limit(1);
        
        if (existing) {
          await db
            .update(rooms)
            .set({ building: room.building, floor: extractFloor(room.room_number) })
            .where(eq(rooms.id, existing.id));
          results.rooms.updated++;
        } else {
          await db.insert(rooms).values({
            roomNumber: room.room_number,
            building: room.building,
            floor: extractFloor(room.room_number),
            roomType: "studio",
            status: "available",
          });
          results.rooms.inserted++;
        }
      } catch (err: any) {
        console.error(`Error with room ${room.room_number}:`, err.message);
      }
    }
    
    // 2. Seed standard items
    for (const item of SEED_DATA.standard_inventory_items) {
      try {
        const [existing] = await db
          .select()
          .from(standardInventoryItems)
          .where(eq(standardInventoryItems.itemName, item.item_name))
          .limit(1);
        
        if (existing) {
          await db
            .update(standardInventoryItems)
            .set({ 
              category: item.category, 
              defaultQuantity: item.standard_quantity 
            })
            .where(eq(standardInventoryItems.id, existing.id));
          results.standardItems.updated++;
        } else {
          await db.insert(standardInventoryItems).values({
            itemName: item.item_name,
            category: item.category,
            defaultQuantity: item.standard_quantity,
            isRequired: true,
          });
          results.standardItems.inserted++;
        }
      } catch (err: any) {
        console.error(`Error with item ${item.item_name}:`, err.message);
      }
    }
    
    // 3. Create room inventory links
    const allRooms = await db.select().from(rooms);
    const allItems = await db.select().from(standardInventoryItems);
    
    for (const room of allRooms) {
      for (const item of allItems) {
        try {
          const [existing] = await db
            .select()
            .from(roomInventoryItems)
            .where(
              sql`${roomInventoryItems.roomId} = ${room.id} AND ${roomInventoryItems.itemId} = ${item.id}`
            )
            .limit(1);
          
          if (!existing) {
            await db.insert(roomInventoryItems).values({
              roomId: room.id,
              itemId: item.id,
              quantity: item.defaultQuantity,
              status: "ok",
            });
            results.roomInventory.created++;
          }
        } catch (err: any) {
          // Skip duplicates
        }
      }
    }
    
    return {
      success: true,
      results,
      summary: {
        totalRooms: results.rooms.inserted + results.rooms.updated,
        totalItems: results.standardItems.inserted + results.standardItems.updated,
        totalRoomInventory: results.roomInventory.created,
      },
    };
  }),
});
