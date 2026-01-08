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
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [tokenData] = await db
    .select()
    .from(db.schema.gmailGoogleTokens)
    .where(eq(db.schema.gmailGoogleTokens.userId, userId))
    .limit(1);

  if (!tokenData) {
    throw new Error("Google account not connected. Please connect in Settings.");
  }

  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(tokenData.expiresAt);

  if (expiresAt <= now) {
    // Token expired, refresh it
    if (!tokenData.refreshToken) {
      throw new Error("No refresh token available. Please reconnect Google account.");
    }

    const newTokens = await refreshAccessToken(tokenData.refreshToken);

    // Update tokens in database
    await db
      .update(db.schema.gmailGoogleTokens)
      .set({
        accessToken: newTokens.access_token,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        updatedAt: new Date(),
      })
        .where(eq(db.schema.gmailGoogleTokens.userId, userId));

    return newTokens.access_token;
  }

  return tokenData.accessToken;
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

          // Check if message already exists
          const [existing] = await db
            .select()
            .from(db.schema.gmailSyncMessages)
            .where(
            and(
              eq(db.schema.gmailSyncMessages.userId, ctx.user.id),
              eq(db.schema.gmailSyncMessages.messageId, parsedMsg.messageId)
              )
            )
            .limit(1);

          if (existing) {
            // Update existing message
            await db
              .update(db.schema.gmailSyncMessages)
              .set({
                ...parsedMsg,
                updatedAt: new Date(),
              })
              .where(eq(db.schema.gmailSyncMessages.id, existing.id));
            messagesUpdated++;
          } else {
            // Insert new message
            await db.insert(db.schema.gmailSyncMessages).values(parsedMsg);
            messagesNew++;
          }
        }

        // Log sync
        await db.insert(db.schema.gmailSyncLog).values({
          userId: ctx.user.id,
          syncType: "gmail_manual",
          messagesFetched,
          messagesNew,
          messagesUpdated,
          status,
          syncStartedAt: syncStarted,
          syncCompletedAt: new Date(),
        });

        return {
          success: true,
          messagesFetched,
          messagesNew,
          messagesUpdated,
        };
      } catch (error) {
        status = "failed";
        errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Log failed sync
        await db.insert(db.schema.gmailSyncLog).values({
          userId: ctx.user.id,
          syncType: "gmail_manual",
          messagesFetched,
          messagesNew,
          messagesUpdated,
          status,
          errorMessage,
          syncStartedAt: syncStarted,
          syncCompletedAt: new Date(),
        });

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

      const messages = await db
        .select()
        .from(db.schema.gmailMessages)
        .where(eq(db.schema.gmailMessages.userId, ctx.user.id))
        .orderBy(desc(db.schema.gmailMessages.receivedDate))
        .limit(input.limit)
        .offset(input.offset);

      return messages;
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

      const history = await db
        .select()
        .from(db.schema.gmailSyncLog)
        .where(eq(db.schema.gmailSyncLog.userId, ctx.user.id))
        .orderBy(desc(db.schema.gmailSyncLog.syncStartedAt))
        .limit(input.limit);

      return history;
    }),

  /**
   * Check Google connection status
   */
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [tokenData] = await db
      .select()
      .from(db.schema.googleTokens)
      .where(eq(db.schema.googleTokens.userId, ctx.user.id))
      .limit(1);

    if (!tokenData) {
      return {
        connected: false,
        message: "Google account not connected",
      };
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expiresAt);
    const isExpired = expiresAt <= now;

    return {
      connected: true,
      isExpired,
      expiresAt: tokenData.expiresAt,
      hasRefreshToken: !!tokenData.refreshToken,
    };
  }),
});
