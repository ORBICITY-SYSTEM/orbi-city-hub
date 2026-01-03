import { z } from "zod";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
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
  activityLogs,
} from "../drizzle/schema";
import { randomUUID } from "crypto";

export const logisticsRouter = router({
  // ============================================================================
  // ROOMS
  // ============================================================================
  
  rooms: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(rooms).orderBy(rooms.building, rooms.roomNumber);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [room] = await db.select().from(rooms).where(eq(rooms.id, input.id)).limit(1);
        return room;
      }),
    
    getByNumber: protectedProcedure
      .input(z.object({ roomNumber: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [room] = await db.select().from(rooms).where(eq(rooms.roomNumber, input.roomNumber)).limit(1);
        return room;
      }),
      
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["available", "occupied", "cleaning", "maintenance", "blocked"])
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(rooms).set({ status: input.status }).where(eq(rooms.id, input.id));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "room",
          entityId: input.id,
          entityName: `Room #${input.id}`,
          changes: { status: input.status },
        });
        
        return { success: true };
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
          itemId: z.number(),
          quantity: z.number(),
          status: z.enum(["ok", "low", "missing", "damaged"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Check if exists
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
          const [result] = await db.insert(roomInventoryItems).values({
            roomId: input.roomId,
            itemId: input.itemId,
            quantity: input.quantity,
            status: input.status || "ok",
            notes: input.notes,
            lastChecked: new Date(),
          });
          
          await logActivity({
            userId: ctx.user.id,
            userEmail: ctx.user.email || "",
            action: "create",
            entityType: "inventory_item",
            entityId: result.insertId,
            entityName: `Room ${input.roomId} - Item ${input.itemId}`,
            changes: { quantity: input.quantity, status: input.status },
          });
          
          return { success: true, id: result.insertId };
        }
      }),
      
    updateQuantity: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(roomInventoryItems).set({
          quantity: input.quantity,
          lastChecked: new Date(),
        }).where(eq(roomInventoryItems.id, input.id));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "inventory_item",
          entityId: input.id,
          entityName: `Inventory Item #${input.id}`,
          changes: { quantity: input.quantity },
        });
        
        return { success: true };
      }),
  }),

  // ============================================================================
  // HOUSEKEEPING SCHEDULES (with batch support for multi-room)
  // ============================================================================
  
  housekeeping: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get all schedules with room info
      const schedules = await db
        .select({
          id: housekeepingSchedules.id,
          batchId: housekeepingSchedules.batchId,
          roomId: housekeepingSchedules.roomId,
          roomNumber: rooms.roomNumber,
          building: rooms.building,
          scheduledDate: housekeepingSchedules.scheduledDate,
          scheduledTime: housekeepingSchedules.scheduledTime,
          taskType: housekeepingSchedules.taskType,
          assignedTo: housekeepingSchedules.assignedTo,
          status: housekeepingSchedules.status,
          priority: housekeepingSchedules.priority,
          notes: housekeepingSchedules.notes,
          completedAt: housekeepingSchedules.completedAt,
          createdAt: housekeepingSchedules.createdAt,
        })
        .from(housekeepingSchedules)
        .leftJoin(rooms, eq(housekeepingSchedules.roomId, rooms.id))
        .orderBy(desc(housekeepingSchedules.scheduledDate));
      
      return schedules;
    }),
    
    // List grouped by batch (for multi-room view)
    listByBatch: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const schedules = await db
        .select({
          id: housekeepingSchedules.id,
          batchId: housekeepingSchedules.batchId,
          roomId: housekeepingSchedules.roomId,
          roomNumber: rooms.roomNumber,
          building: rooms.building,
          scheduledDate: housekeepingSchedules.scheduledDate,
          taskType: housekeepingSchedules.taskType,
          status: housekeepingSchedules.status,
          priority: housekeepingSchedules.priority,
          notes: housekeepingSchedules.notes,
          completedAt: housekeepingSchedules.completedAt,
        })
        .from(housekeepingSchedules)
        .leftJoin(rooms, eq(housekeepingSchedules.roomId, rooms.id))
        .orderBy(desc(housekeepingSchedules.scheduledDate), housekeepingSchedules.batchId);
      
      // Group by batchId
      const batches = new Map<string, typeof schedules>();
      for (const schedule of schedules) {
        const key = schedule.batchId || `single_${schedule.id}`;
        if (!batches.has(key)) {
          batches.set(key, []);
        }
        batches.get(key)!.push(schedule);
      }
      
      return Array.from(batches.entries()).map(([batchId, items]) => ({
        batchId,
        scheduledDate: items[0].scheduledDate,
        taskType: items[0].taskType,
        status: items[0].status,
        priority: items[0].priority,
        notes: items[0].notes,
        rooms: items.map(i => ({
          id: i.id,
          roomId: i.roomId,
          roomNumber: i.roomNumber,
          building: i.building,
          status: i.status,
          completedAt: i.completedAt,
        })),
        totalRooms: items.length,
        completedRooms: items.filter(i => i.status === "completed").length,
      }));
    }),
    
    // Create batch (multi-room schedule)
    createBatch: protectedProcedure
      .input(
        z.object({
          roomIds: z.array(z.number()),
          scheduledDate: z.string(),
          scheduledTime: z.string().optional(),
          taskType: z.string().default("cleaning"),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const batchId = `batch_${Date.now()}_${randomUUID().slice(0, 8)}`;
        
        // Insert one record per room
        for (const roomId of input.roomIds) {
          await db.insert(housekeepingSchedules).values({
            batchId,
            roomId,
            scheduledDate: new Date(input.scheduledDate),
            scheduledTime: input.scheduledTime,
            taskType: input.taskType,
            priority: input.priority || "normal",
            notes: input.notes,
            status: "scheduled",
          });
        }
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "housekeeping_batch",
          entityId: 0,
          entityName: `Housekeeping Batch ${input.scheduledDate} (${input.roomIds.length} rooms)`,
          changes: { batchId, roomCount: input.roomIds.length, scheduledDate: input.scheduledDate },
        });
        
        return { success: true, batchId };
      }),
    
    // Create single room schedule
    create: protectedProcedure
      .input(
        z.object({
          roomId: z.number(),
          scheduledDate: z.string(),
          scheduledTime: z.string().optional(),
          taskType: z.string().default("cleaning"),
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
          priority: input.priority || "normal",
          notes: input.notes,
          status: "scheduled",
        });
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "housekeeping_schedule",
          entityId: result.insertId,
          entityName: `Housekeeping for Room ${input.roomId}`,
          changes: { scheduledDate: input.scheduledDate, taskType: input.taskType },
        });
        
        return { success: true, id: result.insertId };
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped"]).optional(),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
          notes: z.string().optional(),
          assignedTo: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: any = {};
        if (input.status) updateData.status = input.status;
        if (input.priority) updateData.priority = input.priority;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.assignedTo !== undefined) updateData.assignedTo = input.assignedTo;
        if (input.status === "completed") updateData.completedAt = new Date();
        
        await db
          .update(housekeepingSchedules)
          .set(updateData)
          .where(eq(housekeepingSchedules.id, input.id));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "housekeeping_schedule",
          entityId: input.id,
          entityName: `Housekeeping Schedule #${input.id}`,
          changes: updateData,
        });
        
        return { success: true };
      }),
    
    // Complete entire batch
    completeBatch: protectedProcedure
      .input(z.object({ batchId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(housekeepingSchedules)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(housekeepingSchedules.batchId, input.batchId));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "complete",
          entityType: "housekeeping_batch",
          entityId: 0,
          entityName: `Batch ${input.batchId}`,
          changes: { status: "completed" },
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [schedule] = await db.select().from(housekeepingSchedules).where(eq(housekeepingSchedules.id, input.id)).limit(1);
        
        await db.delete(housekeepingSchedules).where(eq(housekeepingSchedules.id, input.id));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "delete",
          entityType: "housekeeping_schedule",
          entityId: input.id,
          entityName: schedule ? `Housekeeping for Room ${schedule.roomId}` : `Schedule #${input.id}`,
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
      
      const schedules = await db
        .select({
          id: maintenanceSchedules.id,
          roomId: maintenanceSchedules.roomId,
          roomNumber: rooms.roomNumber,
          building: rooms.building,
          equipmentName: maintenanceSchedules.equipmentName,
          description: maintenanceSchedules.description,
          descriptionEn: maintenanceSchedules.descriptionEn,
          maintenanceType: maintenanceSchedules.maintenanceType,
          scheduledDate: maintenanceSchedules.scheduledDate,
          assignedTo: maintenanceSchedules.assignedTo,
          status: maintenanceSchedules.status,
          priority: maintenanceSchedules.priority,
          estimatedDuration: maintenanceSchedules.estimatedDuration,
          actualDuration: maintenanceSchedules.actualDuration,
          cost: maintenanceSchedules.cost,
          notes: maintenanceSchedules.notes,
          completedAt: maintenanceSchedules.completedAt,
          createdAt: maintenanceSchedules.createdAt,
        })
        .from(maintenanceSchedules)
        .leftJoin(rooms, eq(maintenanceSchedules.roomId, rooms.id))
        .orderBy(desc(maintenanceSchedules.scheduledDate));
      
      return schedules;
    }),
    
    create: protectedProcedure
      .input(
        z.object({
          roomId: z.number(),
          equipmentName: z.string().optional(),
          description: z.string(),
          descriptionEn: z.string().optional(),
          maintenanceType: z.string().default("repair"),
          scheduledDate: z.string(),
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
          description: input.description,
          descriptionEn: input.descriptionEn,
          maintenanceType: input.maintenanceType,
          scheduledDate: new Date(input.scheduledDate),
          priority: input.priority || "normal",
          estimatedDuration: input.estimatedDuration,
          cost: input.cost,
          notes: input.notes,
          status: "scheduled",
        });
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "maintenance_schedule",
          entityId: result.insertId,
          entityName: `Maintenance for Room ${input.roomId}: ${input.description}`,
          changes: { description: input.description, cost: input.cost },
        });
        
        return { success: true, id: result.insertId };
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "postponed"]).optional(),
          priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
          actualDuration: z.number().optional(),
          cost: z.number().optional(),
          notes: z.string().optional(),
          assignedTo: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: any = {};
        if (input.status) updateData.status = input.status;
        if (input.priority) updateData.priority = input.priority;
        if (input.actualDuration !== undefined) updateData.actualDuration = input.actualDuration;
        if (input.cost !== undefined) updateData.cost = input.cost;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.assignedTo !== undefined) updateData.assignedTo = input.assignedTo;
        if (input.status === "completed") updateData.completedAt = new Date();
        
        await db
          .update(maintenanceSchedules)
          .set(updateData)
          .where(eq(maintenanceSchedules.id, input.id));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "maintenance_schedule",
          entityId: input.id,
          entityName: `Maintenance Schedule #${input.id}`,
          changes: updateData,
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [schedule] = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id)).limit(1);
        
        await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
        
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "delete",
          entityType: "maintenance_schedule",
          entityId: input.id,
          entityName: schedule ? `Maintenance: ${schedule.description}` : `Schedule #${input.id}`,
        });
        
        return { success: true };
      }),
  }),

  // ============================================================================
  // ACTIVITY LOG
  // ============================================================================
  
  activity: router({
    list: protectedProcedure
      .input(z.object({
        module: z.string().optional(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        let query = db
          .select()
          .from(activityLogs)
          .orderBy(desc(activityLogs.createdAt))
          .limit(input.limit);
        
        if (input.module) {
          query = db
            .select()
            .from(activityLogs)
            .where(eq(activityLogs.module, input.module))
            .orderBy(desc(activityLogs.createdAt))
            .limit(input.limit);
        }
        
        return await query;
      }),
    
    append: protectedProcedure
      .input(z.object({
        actionType: z.string(),
        targetEntity: z.string().optional(),
        targetId: z.string().optional(),
        oldValue: z.any().optional(),
        newValue: z.any().optional(),
        module: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [result] = await db.insert(activityLogs).values({
          userId: ctx.user.id,
          actionType: input.actionType,
          targetEntity: input.targetEntity,
          targetId: input.targetId,
          oldValue: input.oldValue,
          newValue: input.newValue,
          module: input.module || "logistics",
        });
        
        return { success: true, id: result.insertId };
      }),
  }),

  // ============================================================================
  // DASHBOARD STATS
  // ============================================================================
  
  dashboardStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Get room counts by status
    const roomStats = await db
      .select({
        status: rooms.status,
        count: sql<number>`count(*)`,
      })
      .from(rooms)
      .groupBy(rooms.status);
    
    // Get today's housekeeping
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayHousekeeping = await db
      .select({
        status: housekeepingSchedules.status,
        count: sql<number>`count(*)`,
      })
      .from(housekeepingSchedules)
      .where(
        and(
          sql`${housekeepingSchedules.scheduledDate} >= ${today}`,
          sql`${housekeepingSchedules.scheduledDate} < ${tomorrow}`
        )
      )
      .groupBy(housekeepingSchedules.status);
    
    // Get pending maintenance
    const pendingMaintenance = await db
      .select({ count: sql<number>`count(*)` })
      .from(maintenanceSchedules)
      .where(inArray(maintenanceSchedules.status, ["scheduled", "in_progress"]));
    
    // Get inventory alerts (low/missing items)
    const inventoryAlerts = await db
      .select({ count: sql<number>`count(*)` })
      .from(roomInventoryItems)
      .where(inArray(roomInventoryItems.status, ["low", "missing", "damaged"]));
    
    // Total maintenance cost this month
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maintenanceCost = await db
      .select({ total: sql<number>`COALESCE(SUM(cost), 0)` })
      .from(maintenanceSchedules)
      .where(
        and(
          eq(maintenanceSchedules.status, "completed"),
          sql`${maintenanceSchedules.completedAt} >= ${firstOfMonth}`
        )
      );
    
    return {
      rooms: {
        total: roomStats.reduce((sum, r) => sum + r.count, 0),
        available: roomStats.find(r => r.status === "available")?.count || 0,
        occupied: roomStats.find(r => r.status === "occupied")?.count || 0,
        cleaning: roomStats.find(r => r.status === "cleaning")?.count || 0,
        maintenance: roomStats.find(r => r.status === "maintenance")?.count || 0,
      },
      housekeeping: {
        todayTotal: todayHousekeeping.reduce((sum, h) => sum + h.count, 0),
        todayCompleted: todayHousekeeping.find(h => h.status === "completed")?.count || 0,
        todayPending: todayHousekeeping.filter(h => h.status !== "completed" && h.status !== "cancelled").reduce((sum, h) => sum + h.count, 0),
      },
      maintenance: {
        pending: pendingMaintenance[0]?.count || 0,
        monthCost: maintenanceCost[0]?.total || 0,
      },
      inventory: {
        alerts: inventoryAlerts[0]?.count || 0,
      },
    };
  }),
  
  // ============================================================================
  // SEED DATA - Quick seed for rooms and inventory
  // ============================================================================
  
  seedData: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const ROOMS = [
      {roomNumber: "A 1033", building: "A"}, {roomNumber: "A 1258", building: "A"},
      {roomNumber: "A 1301", building: "A"}, {roomNumber: "A 1806", building: "A"},
      {roomNumber: "A 1821", building: "A"}, {roomNumber: "A 1833", building: "A"},
      {roomNumber: "A 2035", building: "A"}, {roomNumber: "A 2441", building: "A"},
      {roomNumber: "A 3035", building: "A"}, {roomNumber: "A 3041", building: "A"},
      {roomNumber: "A 4022", building: "A"}, {roomNumber: "A 4023", building: "A"},
      {roomNumber: "A 4024", building: "A"}, {roomNumber: "A 4025", building: "A"},
      {roomNumber: "A 4026", building: "A"}, {roomNumber: "A 4027", building: "A"},
      {roomNumber: "A 4029", building: "A"}, {roomNumber: "A 4035", building: "A"},
      {roomNumber: "C 1256", building: "C"}, {roomNumber: "C 2107", building: "C"},
      {roomNumber: "C 2520", building: "C"}, {roomNumber: "C 2522", building: "C"},
      {roomNumber: "C 2524", building: "C"}, {roomNumber: "C 2529", building: "C"},
      {roomNumber: "C 2547", building: "C"}, {roomNumber: "C 2558", building: "C"},
      {roomNumber: "C 2609", building: "C"}, {roomNumber: "C 2637", building: "C"},
      {roomNumber: "C 2641", building: "C"}, {roomNumber: "C 2847", building: "C"},
      {roomNumber: "C 2861", building: "C"}, {roomNumber: "C 2921", building: "C"},
      {roomNumber: "C 2923", building: "C"}, {roomNumber: "C 2936", building: "C"},
      {roomNumber: "C 2947", building: "C"}, {roomNumber: "C 2961", building: "C"},
      {roomNumber: "C 3421", building: "C"}, {roomNumber: "C 3423", building: "C"},
      {roomNumber: "C 3425", building: "C"}, {roomNumber: "C 3428", building: "C"},
      {roomNumber: "C 3431", building: "C"}, {roomNumber: "C 3437", building: "C"},
      {roomNumber: "C 3439", building: "C"}, {roomNumber: "C 3441", building: "C"},
      {roomNumber: "C 3611", building: "C"}, {roomNumber: "C 3834", building: "C"},
      {roomNumber: "C 3928", building: "C"}, {roomNumber: "C 3937", building: "C"},
      {roomNumber: "C 4011", building: "C"}, {roomNumber: "C 4638", building: "C"},
      {roomNumber: "C 4704", building: "C"}, {roomNumber: "C 4706", building: "C"},
      {roomNumber: "D1 3414", building: "D1"}, {roomNumber: "D1 3416", building: "D1"},
      {roomNumber: "D1 3418", building: "D1"}, {roomNumber: "D2 3727", building: "D2"}
    ];
    
    const ITEMS = [
      {category: "აბაზანის აქსესუარები", itemName: "აბაზანის სარკე", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "ნაგვის ურნა", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "ნიჟარა შემრევით", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "საშხაპე დუშითა და შემრევით", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "ტუალეტის ქაღალდის საკიდი", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "უნიტაზი", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "უნიტაზის ჯაგრისი", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "ფენი", defaultQuantity: 1},
      {category: "აბაზანის აქსესუარები", itemName: "წყლის გამაცხელებელი", defaultQuantity: 1},
      {category: "ავეჯი და ტექსტილი", itemName: "აივნის მაგიდა", defaultQuantity: 1},
      {category: "ავეჯი და ტექსტილი", itemName: "აივნის სკამი", defaultQuantity: 4},
      {category: "ავეჯი და ტექსტილი", itemName: "ბალიში", defaultQuantity: 3},
      {category: "ავეჯი და ტექსტილი", itemName: "ბალიშის ჩიხოლი", defaultQuantity: 3},
      {category: "ავეჯი და ტექსტილი", itemName: "დივანი გასაშლელი", defaultQuantity: 1},
      {category: "ავეჯი და ტექსტილი", itemName: "ზეწარი", defaultQuantity: 2},
      {category: "ავეჯი და ტექსტილი", itemName: "ხის კალათა", defaultQuantity: 1}
    ];
    
    let roomsInserted = 0, itemsInserted = 0;
    
    // Insert rooms
    for (const r of ROOMS) {
      try {
        const floor = parseInt(r.roomNumber.match(/\d+/)?.[0]?.slice(0, -2) || "1");
        await db.insert(rooms).values({
          roomNumber: r.roomNumber,
          building: r.building,
          floor,
          roomType: "studio",
          status: "available"
        }).onDuplicateKeyUpdate({ set: { building: r.building } });
        roomsInserted++;
      } catch (e) {}
    }
    
    // Insert standard items
    for (const item of ITEMS) {
      try {
        await db.insert(standardInventoryItems).values({
          itemName: item.itemName,
          category: item.category,
          defaultQuantity: item.defaultQuantity,
          isRequired: true
        }).onDuplicateKeyUpdate({ set: { category: item.category } });
        itemsInserted++;
      } catch (e) {}
    }
    
    return { success: true, roomsInserted, itemsInserted };
  }),
  
  // ============================================================================
  // RECENT CHANGES (for realtime notifications polling)
  // ============================================================================
  
  recentChanges: protectedProcedure
    .input(z.object({ since: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const sinceDate = input.since ? new Date(input.since) : new Date(Date.now() - 60000); // Last minute
      
      const changes = await db
        .select()
        .from(activityLogs)
        .where(
          and(
            eq(activityLogs.module, "logistics"),
            sql`${activityLogs.createdAt} > ${sinceDate}`
          )
        )
        .orderBy(desc(activityLogs.createdAt))
        .limit(20);
      
      return changes;
    }),
});
