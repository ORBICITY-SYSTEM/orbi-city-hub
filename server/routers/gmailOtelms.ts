import { router, protectedProcedure } from "../_core/trpc";
import { getGmailClient } from "../googleAuth";
import { parseOtelmsEmail, isOtelmsEmail } from "../otelmsParser";
import { getDb } from "../db";
import { otelmsDailyReports } from "../../drizzle/schema";
import { z } from "zod";

/**
 * Gmail OTELMS Router
 * 
 * Handles Gmail API integration for OTELMS email automation
 * - Read emails from INFO@ORBICITYBATUMI.COM
 * - Parse OTELMS daily reports
 * - Sync to database
 * - Mark emails as read
 */

export const gmailOtelmsRouter = router({
  /**
   * Get unread emails from Gmail
   * Returns list of unread emails with subject, body, and metadata
   */
  getUnreadEmails: protectedProcedure
    .input(z.object({
      maxResults: z.number().min(1).max(100).default(50),
      query: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const gmail = await getGmailClient();
        const maxResults = input?.maxResults || 50;
        const query = input?.query || 'is:unread';

        // List messages
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults,
        });

        const messages = response.data.messages || [];

        // Fetch full message details
        const emailDetails = await Promise.all(
          messages.slice(0, 10).map(async (message) => {
            try {
              const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!,
                format: 'full',
              });

              const headers = msg.data.payload?.headers || [];
              const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
              const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown';
              const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';

              // Extract body
              let body = '';
              if (msg.data.payload?.body?.data) {
                body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
              } else if (msg.data.payload?.parts) {
                const textPart = msg.data.payload.parts.find(part => part.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                  body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
              }

              return {
                id: message.id!,
                subject,
                from,
                date,
                body: body.substring(0, 1000), // Limit body size
                snippet: msg.data.snippet || '',
                isOtelms: isOtelmsEmail(subject, body),
              };
            } catch (error) {
              console.error(`[Gmail] Failed to fetch message ${message.id}:`, error);
              return null;
            }
          })
        );

        return {
          emails: emailDetails.filter(e => e !== null),
          totalCount: messages.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('[Gmail] Failed to get unread emails:', error);
        throw new Error('Failed to fetch emails from Gmail');
      }
    }),

  /**
   * Sync OTELMS emails to database
   * Reads unread OTELMS emails, parses them, and saves to otelmsDailyReports table
   */
  syncOtelmsEmails: protectedProcedure.mutation(async () => {
    try {
      const gmail = await getGmailClient();
      const db = await getDb();

      if (!db) {
        throw new Error('Database not available');
      }

      // Search for OTELMS emails
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread (subject:otelms OR subject:ოტელმს OR subject:"daily report")',
        maxResults: 50,
      });

      const messages = response.data.messages || [];
      let syncedCount = 0;
      let errorCount = 0;

      for (const message of messages) {
        try {
          // Get full message
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          });

          const headers = msg.data.payload?.headers || [];
          const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';

          // Extract body
          let body = '';
          if (msg.data.payload?.body?.data) {
            body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
          } else if (msg.data.payload?.parts) {
            const textPart = msg.data.payload.parts.find(part => part.mimeType === 'text/plain');
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
          }

          // Check if it's an OTELMS email
          if (isOtelmsEmail(subject, body)) {
            // Parse email
            const parsed = parseOtelmsEmail(body, subject);

            if (parsed) {
              // Save to database
              await db.insert(otelmsDailyReports).values({
                date: parsed.date,
                totalRevenue: parsed.totalRevenue,
                totalBookings: parsed.totalBookings || 0,
                source: parsed.source,
                channel: parsed.channel || null,
                notes: parsed.notes || null,
                rawEmailContent: parsed.rawText,
                emailId: message.id!,
                syncedAt: new Date(),
              });

              // Mark as read
              await gmail.users.messages.modify({
                userId: 'me',
                id: message.id!,
                requestBody: {
                  removeLabelIds: ['UNREAD'],
                },
              });

              syncedCount++;
            } else {
              console.warn(`[Gmail] Failed to parse OTELMS email: ${message.id}`);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`[Gmail] Failed to process message ${message.id}:`, error);
          errorCount++;
        }
      }

      return {
        success: true,
        syncedCount,
        errorCount,
        totalProcessed: messages.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Gmail] Failed to sync OTELMS emails:', error);
      throw new Error('Failed to sync OTELMS emails');
    }
  }),

  /**
   * Get OTELMS sync history
   * Returns recent synced reports from database
   */
  getOtelmsSyncHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(30),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();

        if (!db) {
          throw new Error('Database not available');
        }

        const limit = input?.limit || 30;

        const reports = await db
          .select()
          .from(otelmsDailyReports)
          .orderBy(otelmsDailyReports.date)
          .limit(limit);

        return {
          reports,
          totalCount: reports.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('[Gmail] Failed to get sync history:', error);
        throw new Error('Failed to fetch OTELMS sync history');
      }
    }),

  /**
   * Test Gmail connection
   * Verifies that Gmail API is accessible
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      const gmail = await getGmailClient();

      // Try to get user profile
      const profile = await gmail.users.getProfile({
        userId: 'me',
      });

      if (profile.data.emailAddress) {
        return {
          success: true,
          message: 'Successfully connected to Gmail API',
          emailAddress: profile.data.emailAddress,
        };
      } else {
        return {
          success: false,
          error: 'Failed to get Gmail profile',
        };
      }
    } catch (error) {
      console.error('[Gmail] Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),
});
