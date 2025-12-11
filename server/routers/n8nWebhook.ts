import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { chatMessages, guests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
          const [newGuest] = await db
            .insert(guests)
            .values({
              name: input.guestName,
              email: input.guestEmail || null,
              phone: input.guestPhone || null,
            })
            .$returningId();

          guestId = newGuest.id;
        }

        // Insert chat message
        const [chatMessage] = await db
          .insert(chatMessages)
          .values({
            guestId,
            guestName: input.guestName,
            guestEmail: input.guestEmail || null,
            guestPhone: input.guestPhone || null,
            message: input.message,
            source: input.source,
            direction: "incoming",
            status: "unread",
            metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          })
          .$returningId();

        return {
          success: true,
          messageId: chatMessage.id,
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
        let query = db.select().from(chatMessages);

        if (input.status) {
          query = query.where(eq(chatMessages.status, input.status));
        }

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
        await db
          .update(chatMessages)
          .set({ status: "read" })
          .where(eq(chatMessages.id, input.messageId));

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
        const [replyMessage] = await db
          .insert(chatMessages)
          .values({
            guestId: input.guestId,
            guestName: guest.name,
            guestEmail: guest.email,
            guestPhone: guest.phone,
            message: input.message,
            source: "dashboard",
            direction: "outgoing",
            status: "read",
            metadata: JSON.stringify({ replyTo: input.originalMessageId }),
          })
          .$returningId();

        // Mark original message as replied
        await db
          .update(chatMessages)
          .set({ status: "replied" })
          .where(eq(chatMessages.id, input.originalMessageId));

        return {
          success: true,
          messageId: replyMessage.id,
          message: "Reply sent successfully",
        };
      } catch (error) {
        console.error("[n8nWebhook] Failed to send reply:", error);
        throw new Error("Failed to send reply");
      }
    }),
});
