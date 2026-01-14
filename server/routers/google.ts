import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { fetchGoogleBusinessReviews, replyToGoogleReview, deleteGoogleReviewReply } from "../googleBusinessProfile";
import { getGA4Metrics, getGA4RealTimeMetrics } from "../googleAnalytics";
import { createBookingCalendarEvent, updateBookingCalendarEvent, deleteBookingCalendarEvent, processBookingEmail, type BookingEvent } from "../googleCalendar";
import { listDriveFiles, uploadToDrive, downloadFromDrive, deleteFromDrive, createDriveFolder } from "../googleDrive";

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
      const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID || "default";
      const locationId = String(input.locationId || process.env.GOOGLE_BUSINESS_LOCATION_ID || "default");
      return await fetchGoogleBusinessReviews(accountId, locationId, input.pageSize, input.pageToken);
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
      const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID || "default";
      const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID || "default";
      // reviewName format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
      const reviewId = input.reviewName.split('/').pop() || input.reviewName;
      const success = await replyToGoogleReview(accountId, locationId, reviewId, input.replyText);
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
      const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID || "default";
      const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID || "default";
      // reviewName format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
      const reviewId = input.reviewName.split('/').pop() || input.reviewName;
      const success = await deleteGoogleReviewReply(accountId, locationId, reviewId);
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

  // Google Drive - List files
  listDriveFiles: publicProcedure
    .input(
      z.object({
        folderId: z.string().optional(),
        pageSize: z.number().min(1).max(100).default(20),
        pageToken: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await listDriveFiles(input.folderId, input.pageSize, input.pageToken);
    }),

  // Google Drive - Upload file
  uploadToDrive: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileBuffer: z.string(), // Base64 encoded
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBuffer, 'base64');
      return await uploadToDrive(input.fileName, input.mimeType, buffer, input.folderId);
    }),

  // Google Drive - Delete file
  deleteDriveFile: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteFromDrive(input.fileId);
    }),

  // Google Drive - Create folder
  createDriveFolder: publicProcedure
    .input(
      z.object({
        folderName: z.string(),
        parentFolderId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createDriveFolder(input.folderName, input.parentFolderId);
    }),
});
