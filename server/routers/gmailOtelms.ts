import { router, protectedProcedure } from "../_core/trpc";
import { getGmailClient } from "../googleAuth";
import { z } from "zod";

/**
 * Gmail OTELMS Router (DEPRECATED - Email Parsing)
 * 
 * ⚠️ DEPRECATED: OTELMS data now comes from Python API (otelms-api.run.app)
 * This router is kept only for Gmail connection testing.
 * 
 * For OTELMS data syncing, use: server/routers/otelms.ts
 * - syncCalendar: calls Python API /scrape
 * - syncStatus: calls Python API /scrape/status
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

        const messages = (response as any).data?.messages || [];

        // Fetch full message details
        const emailDetails = await Promise.all(
          messages.slice(0, 10).map(async (message) => {
            try {
              const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!,
                format: 'full',
              }) as any;

              const msgData = msg.data || msg;
              const headers = msgData.payload?.headers || [];
              const subject = headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
              const from = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || 'Unknown';
              const date = headers.find((h: any) => h.name?.toLowerCase() === 'date')?.value || '';

              // Extract body
              let body = '';
              if (msgData.payload?.body?.data) {
                body = Buffer.from(msgData.payload.body.data, 'base64').toString('utf-8');
              } else if (msgData.payload?.parts) {
                const textPart = msgData.payload.parts.find((part: any) => part.mimeType === 'text/plain');
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
                snippet: msgData.snippet || '',
                // Note: OTELMS detection removed - data comes from Python API
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
   * @deprecated Email parsing removed - use otelmsRouter.syncCalendar() instead
   * OTELMS data now comes from Python API (otelms-api.run.app)
   */
  syncOtelmsEmails: protectedProcedure.mutation(async () => {
    throw new Error(
      'Email parsing is deprecated. Use otelmsRouter.syncCalendar() to sync from Python API instead.'
    );
  }),

  /**
   * @deprecated Use otelmsRouter.getAll() instead
   */
  getOtelmsSyncHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(30),
    }).optional())
    .query(async () => {
      throw new Error(
        'Use otelmsRouter.getAll() instead. This endpoint is deprecated.'
      );
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
