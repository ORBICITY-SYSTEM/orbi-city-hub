import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tawktoMessages } from "../../drizzle/schema";
import { desc, eq, sql, and } from "drizzle-orm";

// Tawk.to webhook payload schema
const tawktoWebhookSchema = z.object({
  event: z.string(),
  chatId: z.string().optional(),
  time: z.string().optional(),
  message: z.object({
    text: z.string().optional(),
    type: z.string().optional(),
    sender: z.object({
      type: z.string().optional(),
    }).optional(),
  }).optional(),
  visitor: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  agent: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  property: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  ticket: z.object({
    id: z.string().optional(),
    humanId: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
}).passthrough();

export const tawktoRouter = router({
  // Webhook endpoint to receive Tawk.to events
  webhook: publicProcedure
    .input(tawktoWebhookSchema)
    .mutation(async ({ input }) => {
      console.log("[Tawk.to Webhook] Received event:", input.event);
      const db = await getDb();
      
      if (!db) {
        console.error("[Tawk.to Webhook] Database not available");
        throw new Error("Database not available");
      }
      
      try {
        let eventType: "chat:start" | "chat:end" | "ticket:create" | "chat:transcript" = "chat:start";
        
        if (input.event === "chat:start") {
          eventType = "chat:start";
        } else if (input.event === "chat:end") {
          eventType = "chat:end";
        } else if (input.event === "ticket:create") {
          eventType = "ticket:create";
        } else if (input.event === "chat:transcript") {
          eventType = "chat:transcript";
        }
        
        await db.insert(tawktoMessages).values({
          chatId: input.chatId || `chat_${Date.now()}`,
          eventType,
          visitorName: input.visitor?.name || null,
          visitorEmail: input.visitor?.email || null,
          visitorPhone: input.visitor?.phone || null,
          visitorCountry: input.visitor?.country || null,
          visitorCity: input.visitor?.city || null,
          message: input.message?.text || input.ticket?.message || null,
          agentName: input.agent?.name || null,
          agentId: input.agent?.id || null,
          propertyId: input.property?.id || null,
          status: input.event === "chat:end" ? "ended" : "active",
          metadata: input as any,
          chatStartedAt: input.event === "chat:start" ? new Date() : null,
          chatEndedAt: input.event === "chat:end" ? new Date() : null,
        });
        
        console.log("[Tawk.to Webhook] Event saved successfully");
        return { success: true };
      } catch (error) {
        console.error("[Tawk.to Webhook] Error:", error);
        throw error;
      }
    }),

  // Get all chats with pagination
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: z.enum(["all", "active", "ended", "missed"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      if (!db) {
        console.warn("[Tawk.to] Database not available");
        return [];
      }
      
      const conditions = [];
      
      if (input.status !== "all") {
        conditions.push(eq(tawktoMessages.status, input.status));
      }
      
      const chats = await db
        .select()
        .from(tawktoMessages)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tawktoMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return chats;
    }),

  // Get chat statistics
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    
    if (!db) {
      return {
        total: 0,
        active: 0,
        ended: 0,
        missed: 0,
        unread: 0,
        todayCount: 0,
      };
    }
    
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        ended: sql<number>`SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END)`,
        missed: sql<number>`SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END)`,
        unread: sql<number>`SUM(CASE WHEN isRead = 0 THEN 1 ELSE 0 END)`,
        todayCount: sql<number>`SUM(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 ELSE 0 END)`,
      })
      .from(tawktoMessages);
    
    return {
      total: Number(stats?.total || 0),
      active: Number(stats?.active || 0),
      ended: Number(stats?.ended || 0),
      missed: Number(stats?.missed || 0),
      unread: Number(stats?.unread || 0),
      todayCount: Number(stats?.todayCount || 0),
    };
  }),

  // Mark chat as read
  markAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      if (!db) {
        throw new Error("Database not available");
      }
      
      await db
        .update(tawktoMessages)
        .set({ isRead: true })
        .where(eq(tawktoMessages.id, input.id));
      return { success: true };
    }),

  // Get recent unread chats for notifications
  getUnread: publicProcedure.query(async () => {
    const db = await getDb();
    
    if (!db) {
      return [];
    }
    
    const unreadChats = await db
      .select()
      .from(tawktoMessages)
      .where(eq(tawktoMessages.isRead, false))
      .orderBy(desc(tawktoMessages.createdAt))
      .limit(10);
    
    return unreadChats;
  }),

  // Get tickets (ticket:create events)
  getTickets: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      if (!db) {
        console.warn("[Tawk.to] Database not available");
        return [];
      }
      
      const tickets = await db
        .select()
        .from(tawktoMessages)
        .where(eq(tawktoMessages.eventType, "ticket:create"))
        .orderBy(desc(tawktoMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return tickets;
    }),

  // Get ticket statistics
  getTicketStats: publicProcedure.query(async () => {
    const db = await getDb();
    
    if (!db) {
      return {
        total: 0,
        open: 0,
        closed: 0,
        todayCount: 0,
      };
    }
    
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        open: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        closed: sql<number>`SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END)`,
        todayCount: sql<number>`SUM(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 ELSE 0 END)`,
      })
      .from(tawktoMessages)
      .where(eq(tawktoMessages.eventType, "ticket:create"));
    
    return {
      total: Number(stats?.total || 0),
      open: Number(stats?.open || 0),
      closed: Number(stats?.closed || 0),
      todayCount: Number(stats?.todayCount || 0),
    };
  }),
});
