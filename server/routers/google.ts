import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { fetchGoogleBusinessReviews, replyToGoogleReview, deleteGoogleReviewReply } from "../googleBusinessProfile";
import { getGA4Metrics, getGA4RealTimeMetrics } from "../googleAnalytics";
import { createBookingCalendarEvent, updateBookingCalendarEvent, deleteBookingCalendarEvent, processBookingEmail, type BookingEvent } from "../googleCalendar";

export const googleRouter = router({
  // Get Google Business Profile reviews
  getReviews: publicProcedure
    .input(
      z.object({
        locationId: z.string().optional(),
        pageSize: z.number().min(1).max(50).default(10),
        pageToken: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const locationId = input.locationId || process.env.GOOGLE_BUSINESS_LOCATION_ID || "default";
      return await fetchGoogleBusinessReviews(locationId, input.pageSize, input.pageToken);
    }),

  // Reply to a review
  replyToReview: publicProcedure
    .input(
      z.object({
        reviewName: z.string(),
        replyText: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ input }) => {
      const success = await replyToGoogleReview(input.reviewName, input.replyText);
      return { success };
    }),

  // Delete a review reply
  deleteReply: publicProcedure
    .input(
      z.object({
        reviewName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await deleteGoogleReviewReply(input.reviewName);
      return { success };
    }),

  // Get Google Analytics 4 metrics
  getAnalytics: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getGA4Metrics(input.startDate, input.endDate);
    }),

  // Get real-time GA4 metrics
  getRealTimeMetrics: publicProcedure.query(async () => {
    return await getGA4RealTimeMetrics();
  }),

  // Create calendar event for booking
  createCalendarEvent: publicProcedure
    .input(
      z.object({
        guestName: z.string(),
        guestEmail: z.string().email(),
        checkIn: z.string().transform((val) => new Date(val)),
        checkOut: z.string().transform((val) => new Date(val)),
        roomNumber: z.string(),
        confirmationNumber: z.string(),
        channel: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createBookingCalendarEvent(input as BookingEvent);
    }),

  // Update calendar event
  updateCalendarEvent: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        guestName: z.string().optional(),
        guestEmail: z.string().email().optional(),
        checkIn: z.string().transform((val) => new Date(val)).optional(),
        checkOut: z.string().transform((val) => new Date(val)).optional(),
        roomNumber: z.string().optional(),
        confirmationNumber: z.string().optional(),
        channel: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { eventId, ...updates } = input;
      return await updateBookingCalendarEvent(eventId, updates as Partial<BookingEvent>);
    }),

  // Delete calendar event
  deleteCalendarEvent: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteBookingCalendarEvent(input.eventId);
    }),

  // Process booking email and create calendar event
  processBookingEmail: publicProcedure
    .input(
      z.object({
        emailContent: z.string(),
        subject: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await processBookingEmail(input.emailContent, input.subject);
    }),
});
