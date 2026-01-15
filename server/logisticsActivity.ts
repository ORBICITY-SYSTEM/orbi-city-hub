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

    const description = `${params.action} ${params.entityType}${params.entityName ? ` (${params.entityName})` : ""}`;
    await db.insert(logisticsActivityLog).values({
      activityType: params.action,
      description,
      roomNumber: params.entityType === "room" ? String(params.entityId ?? "") : null,
      staffId: params.userId,
      metadata: {
        userEmail: params.userEmail,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        entityName: params.entityName ?? null,
        changes: params.changes ?? null,
      },
    });
  } catch (error) {
    console.error("[Activity Log] Failed to log activity:", error);
    // Don't throw error - logging should not break the main operation
  }
}
