import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { housekeepingSchedules } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Mock data for room statuses (in production, this would come from database)
const mockRoomStatuses = Array.from({ length: 60 }, (_, i) => ({
  roomNumber: `${501 + i}`,
  status: (i % 3 === 0 ? "dirty" : i % 3 === 1 ? "clean" : "in-progress") as "dirty" | "clean" | "in-progress",
  lastCleaned: i % 3 === 1 ? new Date() : null,
  assignedTo: i % 3 === 2 ? "Staff" : null,
}));

export const housekeepingRouter = router({
  // Get all room statuses (public - accessible with PIN)
  getRoomStatuses: publicProcedure.query(async () => {
    // In production, fetch from database
    // For now, return mock data
    return mockRoomStatuses;
  }),

  // Mark room as clean
  markRoomClean: publicProcedure
    .input(
      z.object({
        roomNumber: z.string(),
        staffName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { roomNumber, staffName } = input;

      // Update mock data
      const room = mockRoomStatuses.find(r => r.roomNumber === roomNumber);
      if (room) {
        room.status = "clean";
        room.lastCleaned = new Date();
        room.assignedTo = staffName;
      }

      // In production, update database
      const db = await getDb();
      if (db) {
        try {
          await db.insert(housekeepingSchedules).values({
            scheduledDate: new Date().toISOString().split('T')[0],
            rooms: [roomNumber],
            totalRooms: 1,
            status: "completed",
            notes: `Cleaned by ${staffName} via mobile app`,
          });
        } catch (error) {
          console.error("[Housekeeping] Failed to log task:", error);
        }
      }

      return {
        success: true,
        roomNumber,
        status: "clean",
      };
    }),

  // Get cleaning statistics (for admin dashboard)
  getCleaningStats: protectedProcedure.query(async () => {
    const dirty = mockRoomStatuses.filter(r => r.status === "dirty").length;
    const clean = mockRoomStatuses.filter(r => r.status === "clean").length;
    const inProgress = mockRoomStatuses.filter(r => r.status === "in-progress").length;

    return {
      dirty,
      clean,
      inProgress,
      total: mockRoomStatuses.length,
      occupancyRate: ((clean + inProgress) / mockRoomStatuses.length) * 100,
    };
  }),
});
