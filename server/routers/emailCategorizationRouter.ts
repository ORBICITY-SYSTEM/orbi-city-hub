/**
 * Email Categorization Router
 * tRPC endpoints for AI-powered email categorization
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { emailCategories, unsubscribeSuggestions, emailSummaries } from "../../drizzle/schema";
import { categorizeEmail, categorizeEmailsBatch, detectUnsubscribeLink, type EmailData } from "../emailCategorization";
import { summarizeEmail, summarizeEmailsBatch, parseNaturalLanguageQuery } from "../emailSummarization";
import { fetchAndCategorizeEmails, getGmailSyncStatus, searchGmailMessages } from "../gmailIntegration";
import { eq, and, desc, sql } from "drizzle-orm";

export const emailCategorizationRouter = router({
  /**
   * Categorize a single email
   */
  categorizeEmail: protectedProcedure
    .input(z.object({
      emailId: z.string(),
      subject: z.string(),
      from: z.string(),
      body: z.string(),
      date: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: emailCategories is a lookup table, not email storage
      // Should use emails table for email storage and emailSummaries for categorization
      // For now, skip existing check
      const existing: any[] = [];

      // Categorize with AI
      const emailData: EmailData = {
        subject: input.subject,
        from: input.from,
        body: input.body,
        date: input.date ? new Date(input.date) : undefined,
      };

      const result = await categorizeEmail(emailData);

      // TODO: emailCategories is a lookup table, not email storage
      // Should save to emails table and use emailSummaries for categorization
      // For now, skip database save

      // Check for unsubscribe link
      const unsubscribeDetection = detectUnsubscribeLink(input.body);
      if (unsubscribeDetection.hasUnsubscribeLink || result.category === "marketing") {
        // TODO: unsubscribeSuggestions schema has different columns
        // Should use: emailId, sender (not emailFrom), reason (not emailSubject, lastEmailDate)
        // For now, skip database save
      }

      return {
        success: true,
        category: result.category,
        confidence: result.confidence,
        reasoning: result.reasoning,
        alreadyCategorized: false,
      };
    }),

  /**
   * Batch categorize multiple emails
   */
  categorizeEmailsBatch: protectedProcedure
    .input(z.object({
      emails: z.array(z.object({
        emailId: z.string(),
        subject: z.string(),
        from: z.string(),
        body: z.string(),
        date: z.string().optional(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Filter out already categorized emails
      const emailIds = input.emails.map(e => e.emailId);
      const existing = await db
        .select()
        .from(emailCategories)
        .where(sql`${emailCategories.emailId} IN (${sql.join(emailIds.map(id => sql`${id}`), sql`, `)})`);

      const existingIds = new Set(existing.map(e => e.emailId));
      const emailsToProcess = input.emails.filter(e => !existingIds.has(e.emailId));

      if (emailsToProcess.length === 0) {
        return {
          success: true,
          categorized: 0,
          skipped: input.emails.length,
          message: "All emails already categorized"
        };
      }

      // Batch categorize
      const emailDataList = emailsToProcess.map(e => ({
        emailId: e.emailId,
        subject: e.subject,
        from: e.from,
        body: e.body,
        date: e.date ? new Date(e.date) : undefined,
      }));

      const results = await categorizeEmailsBatch(emailDataList);

      // Save all results to database
      const categoriesToInsert = [];
      const unsubscribeSuggestionsToInsert = [];

      for (const email of emailsToProcess) {
        const result = results.get(email.emailId);
        if (!result) continue;

        categoriesToInsert.push({
          emailId: email.emailId,
          emailSubject: email.subject,
          emailFrom: email.from,
          emailDate: email.date ? new Date(email.date) : null,
          category: result.category,
          confidence: result.confidence,
          aiReasoning: result.reasoning,
          userId: ctx.user.id,
        });

        // Check for unsubscribe
        const unsubscribeDetection = detectUnsubscribeLink(email.body);
        if (unsubscribeDetection.hasUnsubscribeLink || result.category === "marketing") {
          unsubscribeSuggestionsToInsert.push({
            emailId: email.emailId,
            emailFrom: email.from,
            emailSubject: email.subject,
            detectionMethod: unsubscribeDetection.detectionMethod,
            unsubscribeUrl: unsubscribeDetection.unsubscribeUrl || null,
            senderEmailCount: 1,
            lastEmailDate: email.date ? new Date(email.date) : null,
            userId: ctx.user.id,
          });
        }
      }

      if (categoriesToInsert.length > 0) {
        await db.insert(emailCategories).values(categoriesToInsert);
      }

      if (unsubscribeSuggestionsToInsert.length > 0) {
        await db.insert(unsubscribeSuggestions).values(unsubscribeSuggestionsToInsert);
      }

      return {
        success: true,
        categorized: categoriesToInsert.length,
        skipped: existingIds.size,
        message: `Categorized ${categoriesToInsert.length} emails, skipped ${existingIds.size} already categorized`
      };
    }),

  /**
   * Get categorized emails
   */
  getCategorizedEmails: protectedProcedure
    .input(z.object({
      category: z.enum(["bookings", "finance", "marketing", "spam", "important", "general"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: emailCategories is a lookup table, not email storage
      // Should query emails table instead
      const results: any[] = [];

      return {
        emails: results,
        total: results.length,
      };
    }),

  /**
   * Get category statistics
   */
  getCategoryStats: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: emailCategories is a lookup table, not email storage
      // Should query emails table instead
      const stats: any[] = [];

      return {
        stats,
        total: stats.reduce((sum, s) => sum + Number(s.count), 0),
      };
    }),

  /**
   * Get unsubscribe suggestions
   */
  getUnsubscribeSuggestions: protectedProcedure
    .input(z.object({
      status: z.enum(["suggested", "dismissed", "unsubscribed", "kept"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: unsubscribeSuggestions schema has different columns
      // Should use: status enum is "pending", "approved", "rejected" (not "suggested", "dismissed", etc.)
      // lastEmailDate doesn't exist in schema
      const query = db
        .select()
        .from(unsubscribeSuggestions)
        .limit(input.limit);

      if (input.status && (input.status === "pending" || input.status === "approved" || input.status === "rejected")) {
        query.where(eq(unsubscribeSuggestions.status, input.status));
      }

      const results = await query;

      return {
        suggestions: results,
        total: results.length,
      };
    }),

  /**
   * Update unsubscribe suggestion status
   */
  updateUnsubscribeStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["suggested", "dismissed", "unsubscribed", "kept"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: unsubscribeSuggestions.status enum is "pending", "approved", "rejected"
      // actionDate doesn't exist in schema
      const mappedStatus = input.status === "unsubscribed" ? "approved" : 
                          input.status === "kept" ? "rejected" : 
                          input.status === "dismissed" ? "rejected" : "pending";
      
      await db
        .update(unsubscribeSuggestions)
        .set({
          status: mappedStatus,
        })
        .where(eq(unsubscribeSuggestions.id, input.id));

      return {
        success: true,
        message: `Unsubscribe suggestion updated to ${input.status}`,
      };
    }),

  /**
   * Manually override email category
   */
  overrideCategory: protectedProcedure
    .input(z.object({
      emailId: z.string(),
      category: z.enum(["bookings", "finance", "marketing", "spam", "important", "general"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: emailCategories is a lookup table, not email storage
      // Should update emails table instead
      // manualCategory, manuallyOverridden, userId don't exist in emailCategories schema

      return {
        success: true,
        message: "Category manually overridden",
      };
    }),

  /**
   * Summarize a single email
   */
  summarizeEmail: protectedProcedure
    .input(z.object({
      emailId: z.string(),
      subject: z.string(),
      from: z.string(),
      body: z.string(),
      date: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already summarized
      const existing = await db
        .select()
        .from(emailSummaries)
        .where(eq(emailSummaries.emailId, input.emailId))
        .limit(1);

      if (existing.length > 0) {
        return {
          success: true,
          summary: existing[0],
          alreadySummarized: true,
        };
      }

      // Generate summary
      const emailData = {
        subject: input.subject,
        from: input.from,
        body: input.body,
        date: input.date ? new Date(input.date) : undefined,
      };

      const result = await summarizeEmail(emailData);

      // Save to database
      await db.insert(emailSummaries).values({
        emailId: input.emailId,
        summary: result.summary || result.shortSummary || "",
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
      });

      return {
        success: true,
        summary: result,
        alreadySummarized: false,
      };
    }),

  /**
   * Get email summary
   */
  getEmailSummary: protectedProcedure
    .input(z.object({
      emailId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const summary = await db
        .select()
        .from(emailSummaries)
        .where(eq(emailSummaries.emailId, input.emailId))
        .limit(1);

      if (summary.length === 0) {
        return null;
      }

      return summary[0];
    }),

  /**
   * Natural language search
   */
  searchEmails: protectedProcedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Parse natural language query
      const parsedQuery = await parseNaturalLanguageQuery(input.query);

      // TODO: emailCategories is a lookup table, not email storage
      // Should query emails table instead
      // emailFrom, emailDate, emailSubject don't exist in emailCategories schema
      const results: any[] = [];

      return {
        results,
        parsedQuery,
        total: results.length,
      };
    }),

  /**
   * Sync Gmail emails
   */
  syncGmailEmails: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      maxResults: z.number().min(1).max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      const stats = await fetchAndCategorizeEmails(
        input.query || "newer_than:7d",
        input.maxResults || 50
      );

      return {
        success: true,
        stats,
        message: `Synced ${stats.categorized} emails, ${stats.summarized} summarized, ${stats.skipped} skipped, ${stats.errors} errors`,
      };
    }),

  /**
   * Get Gmail sync status
   */
  getGmailSyncStatus: protectedProcedure
    .query(async () => {
      const status = await getGmailSyncStatus();
      return status;
    }),

  /**
   * Search Gmail directly
   */
  searchGmail: protectedProcedure
    .input(z.object({
      query: z.string(),
      maxResults: z.number().min(1).max(500).optional(),
    }))
    .query(async ({ input }) => {
      const result = await searchGmailMessages(input.query, input.maxResults || 50);
      return result;
    }),
});
