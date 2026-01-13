import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { logActivity } from "./logisticsActivity";
import {
  rooms,
  standardInventoryItems,
  roomInventoryItems,
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
        .orderBy(standardInventoryItems.category, standardInventoryItems.name);
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
          itemId: z.number(),
          quantity: z.number(),
          status: z.enum(["ok", "missing", "damaged", "needs_replacement"]).optional(),
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
              eq(roomInventoryItems.itemId, input.itemId)
            )
          )
          .limit(1);
        
        if (existing) {
          // Update
          await db
            .update(roomInventoryItems)
            .set({
              quantity: input.quantity,
              status: input.status || "ok",
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
            entityName: `Room ${input.roomId} - Item ${input.itemId}`,
            changes: { quantity: input.quantity, status: input.status },
          });
          
          return { success: true, id: existing.id };
        } else {
          // Insert
          const [result] = await db
            .insert(roomInventoryItems)
            .values({
              roomId: input.roomId,
              itemId: input.itemId,
              quantity: input.quantity,
              status: input.status || "ok",
              notes: input.notes,
              lastChecked: new Date(),
            });
          
          // Log activity
          await logActivity({
            userId: ctx.user.id,
            userEmail: ctx.user.email || "",
            action: "create",
            entityType: "inventory_item",
            entityId: Number(result.insertId),
            entityName: `Room ${input.roomId} - Item ${input.itemId}`,
            changes: { quantity: input.quantity, status: input.status },
          });
          
          return { success: true, id: Number(result.insertId) };
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
          roomId: z.number(),
          scheduledDate: z.string(),
          scheduledTime: z.string().optional(),
          taskType: z.string(),
          assignedTo: z.number().optional(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped"]).optional(),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [result] = await db.insert(housekeepingSchedules).values({
          roomId: input.roomId,
          scheduledDate: new Date(input.scheduledDate),
          scheduledTime: input.scheduledTime,
          taskType: input.taskType,
          assignedTo: input.assignedTo,
          status: input.status || "scheduled",
          priority: input.priority || "normal",
          notes: input.notes,
        });
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "housekeeping_schedule",
          entityId: Number(result.insertId),
          entityName: `Housekeeping Room ${input.roomId} - ${input.taskType}`,
          changes: { scheduledDate: input.scheduledDate, taskType: input.taskType },
        });
        
        return { success: true, id: Number(result.insertId) };
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped"]).optional(),
          notes: z.string().optional(),
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
          roomId: z.number().optional(),
          equipmentName: z.string().optional(),
          maintenanceType: z.string(),
          scheduledDate: z.string(),
          assignedTo: z.number().optional(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "postponed"]).optional(),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
          estimatedDuration: z.number().optional(),
          cost: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [result] = await db.insert(maintenanceSchedules).values({
          roomId: input.roomId,
          equipmentName: input.equipmentName,
          maintenanceType: input.maintenanceType,
          scheduledDate: new Date(input.scheduledDate),
          assignedTo: input.assignedTo,
          status: input.status || "scheduled",
          priority: input.priority || "normal",
          estimatedDuration: input.estimatedDuration,
          cost: input.cost,
          notes: input.notes,
        });
        
        // Log activity
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "maintenance_schedule",
          entityId: Number(result.insertId),
          entityName: `Maintenance ${input.equipmentName || 'Equipment'}: ${input.maintenanceType}`,
          changes: { maintenanceType: input.maintenanceType, cost: input.cost },
        });
        
        return { success: true, id: Number(result.insertId) };
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "postponed"]).optional(),
          notes: z.string().optional(),
          cost: z.number().optional(),
          assignedTo: z.number().optional(),
          actualDuration: z.number().optional(),
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
            cost: input.cost,
            assignedTo: input.assignedTo,
            actualDuration: input.actualDuration,
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
          changes: { status: input.status, cost: input.cost, completedAt: input.completedAt },
        });
        
        return { success: true };
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
