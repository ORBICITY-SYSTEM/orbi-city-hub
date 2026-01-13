import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as reservationDb from "../reservationDb";

export const reservationsRouter = router({
  // List all reservations with filters
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        channel: z.string().optional(),
        checkInFrom: z.string().optional(), // ISO date string
        checkInTo: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const filters: any = {};

      if (input.status) filters.status = input.status;
      if (input.channel) filters.channel = input.channel;
      if (input.checkInFrom) filters.checkInFrom = new Date(input.checkInFrom);
      if (input.checkInTo) filters.checkInTo = new Date(input.checkInTo);
      if (input.search) filters.search = input.search;

      const reservations = await reservationDb.getAllReservations(filters);

      return reservations;
    }),

  // Get reservation by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const reservation = await reservationDb.getReservationById(input.id);

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      return reservation;
    }),

  // Create reservation
  create: protectedProcedure
    .input(
      z.object({
        guestId: z.number().optional(),
        guestName: z.string().min(1),
        checkIn: z.string(), // ISO date
        checkOut: z.string(),
        roomNumber: z.string().optional(),
        price: z.number().optional(),
        currency: z.string().default("GEL"),
        channel: z.enum(["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]),
        bookingId: z.string().min(1),
        status: z.enum(["confirmed", "pending", "cancelled", "checked-in", "checked-out"]).default("confirmed"),
        guestEmail: z.string().email().optional(),
        guestPhone: z.string().optional(),
        numberOfGuests: z.number().default(1),
        specialRequests: z.string().optional(),
        source: z.string().default("manual"),
      })
    )
    .mutation(async ({ input }) => {
      // Check if booking ID already exists
      const existing = await reservationDb.getReservationByBookingId(input.bookingId);
      if (existing) {
        throw new Error("Booking ID already exists");
      }

      const reservation = await reservationDb.createReservation({
        ...input,
        checkIn: new Date(input.checkIn),
        checkOut: new Date(input.checkOut),
      });

      return reservation;
    }),

  // Update reservation
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        guestName: z.string().optional(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        roomNumber: z.string().optional(),
        price: z.number().optional(),
        currency: z.string().optional(),
        channel: z.enum(["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]).optional(),
        status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).optional(),
        guestEmail: z.string().email().optional(),
        guestPhone: z.string().optional(),
        numberOfGuests: z.number().optional(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const updateData: any = { ...data };

      if (data.checkIn) updateData.checkIn = new Date(data.checkIn);
      if (data.checkOut) updateData.checkOut = new Date(data.checkOut);

      const reservation = await reservationDb.updateReservation(id, updateData);

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      return reservation;
    }),

  // Delete reservation
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await reservationDb.deleteReservation(input.id);

      return { success: true };
    }),

  // Get upcoming check-ins
  upcomingCheckIns: protectedProcedure
    .input(z.object({ days: z.number().default(7) }))
    .query(async ({ input }) => {
      const reservations = await reservationDb.getUpcomingCheckIns(input.days);

      return reservations;
    }),

  // Get current guests
  currentGuests: protectedProcedure.query(async () => {
    const reservations = await reservationDb.getCurrentGuests();

    return reservations;
  }),

  // Get reservations by date range
  byDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const reservations = await reservationDb.getReservationsByDateRange(
        new Date(input.startDate),
        new Date(input.endDate)
      );

      return reservations;
    }),

  // Get statistics
  stats: protectedProcedure.query(async () => {
    const stats = await reservationDb.getReservationStats();

    return stats;
  }),

  // Import from Gmail
  importFromGmail: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
        maxResults: z.number().default(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // This will be called from the frontend after fetching Gmail bookings
      // For now, return placeholder
      return {
        success: true,
        message: "Use gmail.fetchRecentBookings first, then create reservations from parsed data",
      };
    }),
});
