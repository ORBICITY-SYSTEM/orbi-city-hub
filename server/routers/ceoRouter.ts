/**
 * CEO AI Router - tRPC endpoints for CEO chat functionality
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import {
  askCEO,
  executeAction,
  getQuickActions,
  getStats,
  gatherContext
} from '../services/ceoAI';
import {
  checkForAlerts,
  generateSmartSuggestions,
  sendTelegramMessage,
  sendDailyReportToTelegram,
  generateScheduledReport
} from '../services/ceoAlerts';

export const ceoRouter = router({
  /**
   * Send a chat message to CEO AI
   */
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        history: z
          .array(
            z.object({
              role: z.string(),
              content: z.string()
            })
          )
          .optional()
          .default([])
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await askCEO(input.message, input.history);
        return {
          success: true,
          response: result.response,
          toolsUsed: result.toolsUsed,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('CEO Chat Error:', error);
        return {
          success: false,
          response: 'შეცდომა მოხდა. გთხოვთ სცადოთ თავიდან.',
          toolsUsed: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    }),

  /**
   * Execute a quick action
   */
  execute: publicProcedure
    .input(
      z.object({
        action: z.string(),
        params: z.record(z.any()).optional().default({})
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await executeAction(input.action, input.params);
        return {
          success: true,
          result,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('CEO Execute Error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    }),

  /**
   * Get real-time stats for chat header
   */
  getStats: publicProcedure.query(async () => {
    try {
      const stats = await getStats();
      return {
        success: true,
        ...stats
      };
    } catch (error) {
      console.error('CEO Stats Error:', error);
      return {
        success: false,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        occupancy: 0,
        revenue: 0,
        pendingReviews: 0
      };
    }
  }),

  /**
   * Get available quick actions
   */
  getQuickActions: publicProcedure.query(() => {
    return getQuickActions();
  }),

  /**
   * Get full context (for debugging/admin)
   */
  getContext: publicProcedure.query(async () => {
    try {
      const context = await gatherContext();
      return {
        success: true,
        context,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('CEO Context Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  /**
   * Generate a daily report
   */
  dailyReport: publicProcedure.query(async () => {
    try {
      const result = await executeAction('daily_report');
      return {
        success: true,
        report: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  /**
   * Generate AI reply for a review
   */
  generateReviewReply: publicProcedure
    .input(
      z.object({
        reviewId: z.string().optional(),
        reviewText: z.string().min(1)
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await executeAction('reply_review', {
          reviewId: input.reviewId,
          reviewText: input.reviewText
        });
        return {
          success: true,
          ...result
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Get proactive alerts
   */
  getAlerts: publicProcedure.query(async () => {
    try {
      const alerts = await checkForAlerts();
      return {
        success: true,
        alerts
      };
    } catch (error) {
      console.error('CEO Alerts Error:', error);
      return {
        success: false,
        alerts: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  /**
   * Get smart suggestions
   */
  getSuggestions: publicProcedure.query(async () => {
    try {
      const suggestions = await generateSmartSuggestions();
      return {
        success: true,
        suggestions
      };
    } catch (error) {
      console.error('CEO Suggestions Error:', error);
      return {
        success: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }),

  /**
   * Send message to Telegram
   */
  sendToTelegram: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        chatId: z.string().optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await sendTelegramMessage(input.message, input.chatId);
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Send daily report to Telegram
   */
  sendDailyReportTelegram: publicProcedure
    .input(
      z.object({
        chatId: z.string().optional()
      }).optional()
    )
    .mutation(async ({ input }) => {
      try {
        await sendDailyReportToTelegram(input?.chatId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }),

  /**
   * Generate scheduled report (daily/weekly/monthly)
   */
  getScheduledReport: publicProcedure
    .input(
      z.object({
        type: z.enum(['daily', 'weekly', 'monthly'])
      })
    )
    .query(async ({ input }) => {
      try {
        const report = await generateScheduledReport(input.type);
        return {
          success: true,
          report
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
});
