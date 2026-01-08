import { getDb } from "./db";
import { logisticsActivityLog } from "../drizzle/schema";

/**
 * Log activity in logistics module
 * This function records all CRUD operations for audit trail
 */
export async function logActivity(params: {
  userId: number;
  userEmail: string;
  action: "create" | "update" | "delete";
  entityType: "room" | "inventory_item" | "housekeeping_schedule" | "maintenance_schedule";
  entityId?: string | number;
  entityName?: string;
  changes?: Record<string, any>;
}) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Activity Log] Database not available");
      return;
    }

    await db.insert(logisticsActivityLog).values({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId?.toString(),
      entityName: params.entityName,
      changes: params.changes ? JSON.stringify(params.changes) : null,
    });
  } catch (error) {
    console.error("[Activity Log] Failed to log activity:", error);
    // Don't throw error - logging should not break the main operation
  }
}
