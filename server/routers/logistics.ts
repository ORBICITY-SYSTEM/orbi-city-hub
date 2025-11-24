import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookings, housekeepingSchedules } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  generateDailyOperations,
  formatOperationTask,
  getOperationsSummary,
  type CalendarEvent,
} from "../../shared/dailyOperations";

export const logisticsRouter = router({
  // Get daily operations based on calendar events
  getDailyOperations: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(), // ISO date, defaults to today
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const targetDate = input.date ? new Date(input.date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Fetch bookings with check-in or check-out on target date
      const relevantBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            gte(bookings.checkIn, targetDate),
            lte(bookings.checkIn, nextDay)
          )
        );

      const checkOutBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            gte(bookings.checkOut, targetDate),
            lte(bookings.checkOut, nextDay)
          )
        );

      // Combine and deduplicate
      const allBookings = [
        ...relevantBookings,
        ...checkOutBookings.filter(
          (b) => !relevantBookings.some((r) => r.id === b.id)
        ),
      ];

      // Convert to CalendarEvent format
      const events: CalendarEvent[] = allBookings.map((b) => ({
        id: b.id,
        roomNumber: b.roomNumber || "Unknown",
        guestName: `Guest #${b.guestId}`,
        checkIn: new Date(b.checkIn),
        checkOut: new Date(b.checkOut),
        status: b.status,
      }));

      // Generate operations
      const operations = generateDailyOperations(events, targetDate);

      // Format for display
      const tasks = operations.map((op) => ({
        ...op,
        formatted: formatOperationTask(op),
      }));

      const summary = getOperationsSummary(operations);

      return {
        date: targetDate.toISOString(),
        operations: tasks,
        summary,
      };
    }),

  // Auto-create cleaning tasks (called by cron or manually)
  autoCreateCleaningTasks: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const targetDate = input.date ? new Date(input.date) : new Date();
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find check-outs for today
      const checkOutBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            gte(bookings.checkOut, targetDate),
            lte(bookings.checkOut, nextDay),
            eq(bookings.status, "checked_out")
          )
        );

      const createdTasks = [];

      for (const booking of checkOutBookings) {
        if (!booking.roomNumber) continue;

        // Check if task already exists for this date
        const dateStr = targetDate.toISOString().split("T")[0];
        const existing = await db
          .select()
          .from(housekeepingSchedules)
          .where(eq(housekeepingSchedules.scheduledDate, dateStr));

        if (existing.length > 0) continue;

        // Create cleaning task
        await db.insert(housekeepingSchedules).values({
          scheduledDate: dateStr,
          rooms: [booking.roomNumber],
          totalRooms: 1,
          status: "pending",
          notes: `Auto-generated: Guest #${booking.guestId} checked out`,
        });

        createdTasks.push({
          roomNumber: booking.roomNumber,
          guestId: booking.guestId,
        });
      }

      return {
        created: createdTasks.length,
        tasks: createdTasks,
      };
    }),
});
