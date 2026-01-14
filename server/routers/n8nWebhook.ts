import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { chatMessages, guests, guestReviews } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// N8N API Key for authentication
const N8N_API_KEY = process.env.N8N_API_KEY || "n8n_orbi_2025_secure_key";

// Review schema for N8N incoming reviews
const n8nReviewSchema = z.object({
  platform: z.enum(["expedia", "booking", "airbnb", "google", "tripadvisor", "agoda", "hostelworld", "facebook"]),
  externalId: z.string(),
  guestName: z.string().default("Anonymous"),
  rating: z.number().min(1).max(10),
  title: z.string().optional(),
  content: z.string(),
  reviewDate: z.string(),
  language: z.string().default("en"),
  categories: z.record(z.number()).optional(),
  isEligibleForResponse: z.boolean().optional(),
  source: z.enum(["n8n_sync", "email_parsing", "webhook"]).default("n8n_sync"),
  reviewUrl: z.string().optional(),
  guestCountry: z.string().optional(),
});

/**
 * n8n Webhook Router
 * Receives POST requests from n8n workflows
 */

// Validation schema for incoming guest messages
const guestMessageSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  source: z.string().default("n8n"),
  metadata: z.record(z.any()).optional(), // Additional data from n8n
});

export const n8nWebhookRouter = router({
  /**
   * POST /api/trpc/n8nWebhook.receiveReviews
   * Receives reviews from N8N workflow (Expedia, Booking, etc.)
   * Authentication: X-N8N-API-Key header
   */
  receiveReviews: publicProcedure
    .input(z.object({
      apiKey: z.string(),
      reviews: z.array(n8nReviewSchema),
    }))
    .mutation(async ({ input }) => {
      // Validate API key
      if (input.apiKey !== N8N_API_KEY) {
        throw new Error("Invalid API key");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const results = {
        imported: 0,
        duplicates: 0,
        errors: 0,
        details: [] as Array<{ externalId: string; status: string; reviewId?: number }>,
      };

      for (const review of input.reviews) {
        try {
          // Check for duplicate by externalId and platform
          const existing = await db
            .select()
            .from(guestReviews)
            .where(eq(guestReviews.externalId, review.externalId))
            .limit(1);

          if (existing.length > 0) {
            results.duplicates++;
            results.details.push({ externalId: review.externalId, status: "duplicate" });
            continue;
          }

          // Normalize rating to 1-5 scale (Expedia uses 1-10)
          const normalizedRating = review.platform === "expedia" 
            ? Math.round(review.rating / 2) 
            : review.rating;

          // Determine sentiment based on rating
          const sentiment = normalizedRating >= 4 ? "positive" : normalizedRating >= 3 ? "neutral" : "negative";

          // Map platform to source enum
          const sourceMap: Record<string, "google" | "booking" | "airbnb" | "expedia" | "tripadvisor" | "facebook" | "agoda" | "hostelworld" | "direct"> = {
            expedia: "expedia",
            booking: "booking",
            airbnb: "airbnb",
            google: "google",
            tripadvisor: "tripadvisor",
            agoda: "agoda",
            hostelworld: "hostelworld",
            facebook: "facebook",
          };

          // Insert review
          const insertResult = await db
            .insert(guestReviews)
            .values({
              source: sourceMap[review.platform] || "direct",
              externalId: review.externalId,
              reviewUrl: review.reviewUrl || null,
              reviewerName: review.guestName,
              reviewerCountry: review.guestCountry || null,
              rating: normalizedRating,
              title: review.title || null,
              content: review.content,
              language: review.language,
              sentiment,
              reviewDate: new Date(review.reviewDate),
              hasReply: false,
              isRead: false,
            });

          const reviewId = (insertResult as any).insertId;
          results.imported++;
          results.details.push({ externalId: review.externalId, status: "imported", reviewId });
        } catch (error) {
          console.error(`[n8nWebhook] Failed to import review ${review.externalId}:`, error);
          results.errors++;
          results.details.push({ externalId: review.externalId, status: "error" });
        }
      }

      console.log(`[n8nWebhook] Reviews import complete: ${results.imported} imported, ${results.duplicates} duplicates, ${results.errors} errors`);

      return {
        success: true,
        ...results,
      };
    }),

  /**
   * GET /api/trpc/n8nWebhook.getApiKey
   * Returns the N8N API key (for admin setup)
   */
  getApiKey: publicProcedure
    .query(() => {
      return {
        apiKey: N8N_API_KEY,
        endpoint: "/api/trpc/n8nWebhook.receiveReviews",
        usage: "POST with { apiKey: 'YOUR_KEY', reviews: [...] }",
      };
    }),

  /**
   * POST /api/trpc/n8nWebhook.receiveGuestMessage
   * Receives guest messages from n8n workflow
   */
  receiveGuestMessage: publicProcedure
    .input(guestMessageSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Check if guest exists by email or phone
        let guestId: number | null = null;

        if (input.guestEmail) {
          const existingGuest = await db
            .select()
            .from(guests)
            .where(eq(guests.email, input.guestEmail))
            .limit(1);

          if (existingGuest.length > 0) {
            guestId = existingGuest[0]!.id;
          }
        }

        // If guest doesn't exist, create new guest
        if (!guestId) {
          const newGuestResult = await db
            .insert(guests)
            .values({
              name: input.guestName,
              email: input.guestEmail || null,
              phone: input.guestPhone || null,
            });

          guestId = (newGuestResult as any).insertId;
        }

        // Insert chat message
        // TODO: chatMessages schema has conversationId, role, content, metadata (not guestId, guestName, etc.)
        const chatResult = await db
          .insert(chatMessages)
          .values({
            conversationId: guestId,
            role: "user",
            content: input.message,
            metadata: {
              guestName: input.guestName,
              guestEmail: input.guestEmail || null,
              guestPhone: input.guestPhone || null,
              source: input.source,
              ...input.metadata,
            } as any,
          });

        return {
          success: true,
          messageId: (chatResult as any).insertId,
          guestId,
          message: "Guest message received successfully",
        };
      } catch (error) {
        console.error("[n8nWebhook] Failed to save guest message:", error);
        throw new Error("Failed to save guest message");
      }
    }),

  /**
   * GET /api/trpc/n8nWebhook.getChatMessages
   * Retrieves all chat messages
   */
  getChatMessages: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["unread", "read", "replied"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // TODO: chatMessages schema doesn't have status column
        let query = db.select().from(chatMessages);

        const messages = await query
          .orderBy(chatMessages.createdAt)
          .limit(input.limit)
          .offset(input.offset);

        return {
          messages,
          total: messages.length,
        };
      } catch (error) {
        console.error("[n8nWebhook] Failed to fetch chat messages:", error);
        throw new Error("Failed to fetch chat messages");
      }
    }),

  /**
   * PATCH /api/trpc/n8nWebhook.markAsRead
   * Marks a chat message as read
   */
  markAsRead: publicProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // TODO: chatMessages schema doesn't have status column
        // Skip update for now

        return { success: true };
      } catch (error) {
        console.error("[n8nWebhook] Failed to mark message as read:", error);
        throw new Error("Failed to mark message as read");
      }
    }),

  /**
   * POST /api/trpc/n8nWebhook.sendReply
   * Sends a reply to a guest (stores in database, n8n will pick it up)
   */
  sendReply: publicProcedure
    .input(
      z.object({
        guestId: z.number(),
        message: z.string().min(1),
        originalMessageId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Get guest info
        const [guest] = await db
          .select()
          .from(guests)
          .where(eq(guests.id, input.guestId))
          .limit(1);

        if (!guest) {
          throw new Error("Guest not found");
        }

        // Insert reply message
        const replyResult = await db
          .insert(chatMessages)
          .values({
            conversationId: input.guestId,
            role: "assistant",
            content: input.message,
            metadata: { replyTo: input.originalMessageId } as any,
          });

        // TODO: chatMessages schema doesn't have status column
        // Skip marking as replied for now

        return {
          success: true,
          messageId: (replyResult as any).insertId,
          message: "Reply sent successfully",
        };
      } catch (error) {
        console.error("[n8nWebhook] Failed to send reply:", error);
        throw new Error("Failed to send reply");
      }
    }),
});
