import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { logActivity } from "./logisticsActivity";
import {
  rooms,
  standardInventoryItems,
  roomInventoryItems,
  roomInventoryDescriptions,
  housekeepingSchedules,
  maintenanceSchedules,
  logisticsActivityLog,
} from "../drizzle/schema";

export const logisticsRouter = router({
  // ============================================================================
  // ROOMS
  // ============================================================================
  
  rooms: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(rooms).orderBy(rooms.roomNumber);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [room] = await db.select().from(rooms).where(eq(rooms.id, input.id)).limit(1);
        return room;
      }),
  }),

  // ============================================================================
  // STANDARD INVENTORY ITEMS
  // ============================================================================
  
  standardItems: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db
        .select()
        .from(standardInventoryItems)
        .orderBy(standardInventoryItems.category, standardInventoryItems.itemName);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [item] = await db
          .select()
          .from(standardInventoryItems)
          .where(eq(standardInventoryItems.id, input.id))
          .limit(1);
        return item;
      }),
  }),

  // ============================================================================
  // ROOM INVENTORY ITEMS
  // ============================================================================
  
  roomInventory: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(roomInventoryItems);
    }),
    
    getByRoomId: protectedProcedure
      .input(z.object({ roomId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return await db
          .select()
          .from(roomInventoryItems)
          .where(eq(roomInventoryItems.roomId, input.roomId));
      }),
    
    upsert: protectedProcedure
      .input(
        z.object({
          roomId: z.number(),
          standardItemId: z.number(),
          actualQuantity: z.number(),
          condition: z.enum(["good", "fair", "poor", "missing"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Check if item exists
        const [existing] = await db
          .select()
          .from(roomInventoryItems)
          .where(
            and(
              eq(roomInventoryItems.roomId, input.roomId),
              eq(roomInventoryItems.standardItemId, input.standardItemId)
            )
          )
          .limit(1);
        
        if (existing) {
          // Update
          await db
            .update(roomInventoryItems)
            .set({
              actualQuantity: input.actualQuantity,
              condition: input.condition,
              notes: input.notes,
              lastChecked: new Date(),
            })
            .where(eq(roomInventoryItems.id, existing.id));
          
          // Log activity
          await logActivity({
            userId: ctx.user.id,
            userEmail: ctx.user.email || "",
            action: "update",
            entityType: "inventory_item",
            entityId: existing.id,
            entityName: `Room ${input.roomId} - Item ${input.standardItemId}`,
            changes: { actualQuantity: input.actualQuantity, condition: input.condition },
          });
          
          return { success: true, id: existing.id };
        } else {
          // Insert
          const [result] = await db
            .insert(roomInventoryItems)
            .values({
              roomId: input.roomId,
              standardItemId: input.standardItemId,
              actualQuantity: input.actualQuantity,
              condition: input.condition || "good",
              notes: input.notes,
              lastChecked: new Date(),
            });
          
          // Log activity
          await logActivity({
            userId: ctx.user.id,
            userEmail: ctx.user.email || "",
            action: "create",
            entityType: "inventory_item",
            entityId: result.insertId,
            entityName: `Room ${input.roomId} - Item ${input.standardItemId}`,
            changes: { actualQuantity: input.actualQuantity, condition: input.condition },
          });
          
          return { success: true, id: result.insertId };
        }
      }),
  }),

  // ============================================================================
  // HOUSEKEEPING SCHEDULES
  // ============================================================================
  
  housekeeping: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db
        .select()
        .from(housekeepingSchedules)
        .orderBy(desc(housekeepingSchedules.scheduledDate));
    }),
    
    create: protectedProcedure
      .input(
        z.object({
          scheduledDate: z.string(),
          rooms: z.array(z.string()),
          totalRooms: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [result] = await db.insert(housekeepingSchedules).values({
          userId: ctx.user.id,
          scheduledDate: input.scheduledDate,
          rooms: input.rooms,
          totalRooms: input.totalRooms,
          status: input.status || "pending",
          notes: input.notes,
        });
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "housekeeping_schedule",
          entityId: result.insertId,
          entityName: `Housekeeping ${input.scheduledDate} (${input.totalRooms} rooms)`,
          changes: { scheduledDate: input.scheduledDate, totalRooms: input.totalRooms },
        });
        
        return { success: true, id: result.insertId };
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
          notes: z.string().optional(),
          additionalNotes: z.string().optional(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(housekeepingSchedules)
          .set({
            status: input.status,
            notes: input.notes,
            additionalNotes: input.additionalNotes,
            completedAt: input.completedAt,
          })
          .where(eq(housekeepingSchedules.id, input.id));
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "housekeeping_schedule",
          entityId: input.id,
          entityName: `Housekeeping Schedule #${input.id}`,
          changes: { status: input.status, completedAt: input.completedAt },
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Get schedule before delete for logging
        const [schedule] = await db.select().from(housekeepingSchedules).where(eq(housekeepingSchedules.id, input.id)).limit(1);
        
        await db.delete(housekeepingSchedules).where(eq(housekeepingSchedules.id, input.id));
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "delete",
          entityType: "housekeeping_schedule",
          entityId: input.id,
          entityName: schedule ? `Housekeeping ${schedule.scheduledDate}` : `Schedule #${input.id}`,
        });
        
        return { success: true };
      }),
  }),

  // ============================================================================
  // MAINTENANCE SCHEDULES
  // ============================================================================
  
  maintenance: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db
        .select()
        .from(maintenanceSchedules)
        .orderBy(desc(maintenanceSchedules.scheduledDate));
    }),
    
    create: protectedProcedure
      .input(
        z.object({
          roomNumber: z.string(),
          scheduledDate: z.string(),
          problem: z.string(),
          notes: z.string().optional(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
          estimatedCost: z.number().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [result] = await db.insert(maintenanceSchedules).values({
          userId: ctx.user.id,
          roomNumber: input.roomNumber,
          scheduledDate: input.scheduledDate,
          problem: input.problem,
          notes: input.notes,
          status: input.status || "pending",
          estimatedCost: input.estimatedCost,
          priority: input.priority || "medium",
        });
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "maintenance_schedule",
          entityId: result.insertId,
          entityName: `Maintenance ${input.roomNumber}: ${input.problem}`,
          changes: { roomNumber: input.roomNumber, problem: input.problem, estimatedCost: input.estimatedCost },
        });
        
        return { success: true, id: result.insertId };
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
          notes: z.string().optional(),
          estimatedCost: z.number().optional(),
          actualCost: z.number().optional(),
          assignedTo: z.string().optional(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(maintenanceSchedules)
          .set({
            status: input.status,
            notes: input.notes,
            estimatedCost: input.estimatedCost,
            actualCost: input.actualCost,
            assignedTo: input.assignedTo,
            completedAt: input.completedAt,
          })
          .where(eq(maintenanceSchedules.id, input.id));
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "maintenance_schedule",
          entityId: input.id,
          entityName: `Maintenance Schedule #${input.id}`,
          changes: { status: input.status, actualCost: input.actualCost, completedAt: input.completedAt },
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Get schedule before delete for logging
        const [schedule] = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id)).limit(1);
        
        await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "delete",
          entityType: "maintenance_schedule",
          entityId: input.id,
          entityName: schedule ? `Maintenance ${schedule.roomNumber}: ${schedule.problem}` : `Schedule #${input.id}`,
        });
        
        return { success: true };
      }),
  }),

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================
  
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get all rooms
      const allRooms = await db.select().from(rooms);
      
      // Get housekeeping schedules
      const housekeeping = await db.select().from(housekeepingSchedules);
      const pendingHousekeeping = housekeeping.filter(h => h.status === "pending").length;
      const completedHousekeeping = housekeeping.filter(h => h.status === "completed").length;
      
      // Get maintenance schedules
      const maintenance = await db.select().from(maintenanceSchedules);
      const pendingMaintenance = maintenance.filter(m => m.status === "pending" || m.status === "in_progress").length;
      const completedMaintenance = maintenance.filter(m => m.status === "completed").length;
      
      // Get inventory items with issues
      const inventoryItems = await db.select().from(roomInventoryItems);
      const standardItems = await db.select().from(standardInventoryItems);
      
      // Calculate missing items
      const missingItems: Array<{
        category: string;
        itemName: string;
        standardQuantity: number;
        totalMissing: number;
        roomsWithIssues: Array<{ roomNumber: string; actualQuantity: number; missingCount: number }>;
      }> = [];
      
      for (const stdItem of standardItems) {
        const roomsWithIssue: Array<{ roomNumber: string; actualQuantity: number; missingCount: number }> = [];
        let totalMissing = 0;
        
        for (const room of allRooms) {
          const roomItem = inventoryItems.find(
            i => i.roomId === room.id && i.standardItemId === stdItem.id
          );
          const actualQty = roomItem?.actualQuantity ?? 0;
          const missing = stdItem.standardQuantity - actualQty;
          
          if (missing > 0) {
            totalMissing += missing;
            roomsWithIssue.push({
              roomNumber: room.roomNumber,
              actualQuantity: actualQty,
              missingCount: missing,
            });
          }
        }
        
        if (totalMissing > 0) {
          missingItems.push({
            category: stdItem.category,
            itemName: stdItem.itemName,
            standardQuantity: stdItem.standardQuantity,
            totalMissing,
            roomsWithIssues: roomsWithIssue,
          });
        }
      }
      
      return {
        totalRooms: allRooms.length,
        housekeeping: {
          pending: pendingHousekeeping,
          completed: completedHousekeeping,
          total: housekeeping.length,
        },
        maintenance: {
          pending: pendingMaintenance,
          completed: completedMaintenance,
          total: maintenance.length,
        },
        inventory: {
          totalMissingItems: missingItems.reduce((sum, item) => sum + item.totalMissing, 0),
          itemsWithIssues: missingItems.length,
          missingItems: missingItems.slice(0, 10), // Top 10 missing items
        },
      };
    }),
  }),

  // ============================================================================
  // ACTIVITY LOG
  // ============================================================================
  
  activityLog: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const query = db
          .select()
          .from(logisticsActivityLog)
          .orderBy(desc(logisticsActivityLog.createdAt));
        
        if (input.limit) {
          return await query.limit(input.limit);
        }
        
        return await query;
      }),
  }),
});
