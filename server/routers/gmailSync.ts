/**
 * Gmail Sync tRPC Router
 * Adapted from NEXUS Supabase Edge Function
 * Handles Gmail OAuth and message syncing
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";

// Gmail API types
interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ mimeType: string; body?: { data?: string } }>;
  };
  internalDate: string;
}

/**
 * Refresh Google OAuth access token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return await response.json();
}

/**
 * Get valid access token (refresh if expired)
 */
async function getValidAccessToken(userId: number): Promise<string> {
  // TODO: Implement Gmail token storage in database
  // For now, throw error - tokens should be stored in integrations table or separate table
  throw new Error("Gmail token storage not implemented. Please configure Gmail integration in Settings.");
}

/**
 * Fetch messages from Gmail API
 */
async function fetchGmailMessages(
  accessToken: string,
  maxResults: number = 50
): Promise<GmailMessage[]> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Gmail messages: ${error}`);
  }

  const data = await response.json();

  if (!data.messages || data.messages.length === 0) {
    return [];
  }

  // Fetch details for each message
  const messageDetails = await Promise.all(
    data.messages.map(async (msg: { id: string }) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return await detailResponse.json();
    })
  );

  return messageDetails;
}

/**
 * Parse Gmail message to database format
 */
function parseGmailMessage(msg: GmailMessage, userId: number) {
  const headers = msg.payload.headers;
  const subject = headers.find((h) => h.name === "Subject")?.value || "";
  const from = headers.find((h) => h.name === "From")?.value || "";
  const to = headers.find((h) => h.name === "To")?.value || "";

  // Extract body text
  let bodyText = "";
  let bodyHtml = "";

  if (msg.payload.body?.data) {
    bodyText = Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
  } else if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        bodyText = Buffer.from(part.body.data, "base64").toString("utf-8");
      } else if (part.mimeType === "text/html" && part.body?.data) {
        bodyHtml = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
  }

  return {
    userId,
    messageId: msg.id,
    threadId: msg.threadId,
    subject,
    fromEmail: from,
    toEmail: to,
    snippet: msg.snippet,
    bodyText,
    bodyHtml,
    receivedDate: new Date(parseInt(msg.internalDate)),
    labels: JSON.stringify(msg.labelIds || []),
    isRead: !msg.labelIds?.includes("UNREAD"),
    isStarred: msg.labelIds?.includes("STARRED") || false,
  };
}

export const gmailSyncRouter = router({
  /**
   * Sync Gmail messages
   */
  syncMessages: protectedProcedure
    .input(
      z.object({
        maxResults: z.number().min(1).max(100).default(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const syncStarted = new Date();
      let messagesFetched = 0;
      let messagesNew = 0;
      let messagesUpdated = 0;
      let status: "success" | "partial" | "failed" = "success";
      let errorMessage: string | null = null;

      try {
        // Get valid access token
        const accessToken = await getValidAccessToken(ctx.user.id);

        // Fetch messages from Gmail
        const messages = await fetchGmailMessages(accessToken, input.maxResults);
        messagesFetched = messages.length;

        // Store messages in database
        for (const msg of messages) {
          const parsedMsg = parseGmailMessage(msg, ctx.user.id);

          // TODO: Gmail sync tables not in schema yet
          // For now, just count messages
          messagesNew++;
        }

        // TODO: Gmail sync log table not in schema yet
        // Log sync skipped

        return {
          success: true,
          messagesFetched,
          messagesNew,
          messagesUpdated,
        };
      } catch (error) {
        status = "failed";
        errorMessage = error instanceof Error ? error.message : "Unknown error";

        // TODO: Gmail sync log table not in schema yet
        // Log failed sync skipped

        throw error;
      }
    }),

  /**
   * Get Gmail messages
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Gmail messages table not in schema yet
      return [];
    }),

  /**
   * Get sync history
   */
  getSyncHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Gmail sync log table not in schema yet
      return [];
    }),

  /**
   * Check Google connection status
   */
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // TODO: Google tokens table not in schema yet
    return {
      connected: false,
      message: "Google account not connected - token storage not implemented",
    };
  }),
});
