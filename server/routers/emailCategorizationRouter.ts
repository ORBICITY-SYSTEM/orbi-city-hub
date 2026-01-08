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

      // Check if already categorized
      const existing = await db
        .select()
        .from(emailCategories)
        .where(eq(emailCategories.emailId, input.emailId))
        .limit(1);

      if (existing.length > 0) {
        return {
          success: true,
          category: existing[0].category,
          confidence: existing[0].confidence,
          reasoning: existing[0].aiReasoning,
          alreadyCategorized: true,
        };
      }

      // Categorize with AI
      const emailData: EmailData = {
        subject: input.subject,
        from: input.from,
        body: input.body,
        date: input.date ? new Date(input.date) : undefined,
      };

      const result = await categorizeEmail(emailData);

      // Save to database
      await db.insert(emailCategories).values({
        emailId: input.emailId,
        emailSubject: input.subject,
        emailFrom: input.from,
        emailDate: input.date ? new Date(input.date) : null,
        category: result.category,
        confidence: result.confidence,
        aiReasoning: result.reasoning,
        userId: ctx.user.id,
      });

      // Check for unsubscribe link
      const unsubscribeDetection = detectUnsubscribeLink(input.body);
      if (unsubscribeDetection.hasUnsubscribeLink || result.category === "marketing") {
        await db.insert(unsubscribeSuggestions).values({
          emailId: input.emailId,
          emailFrom: input.from,
          emailSubject: input.subject,
          detectionMethod: unsubscribeDetection.detectionMethod,
          unsubscribeUrl: unsubscribeDetection.unsubscribeUrl || null,
          senderEmailCount: 1,
          lastEmailDate: input.date ? new Date(input.date) : null,
          userId: ctx.user.id,
        });
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

      const query = db
        .select()
        .from(emailCategories)
        .orderBy(desc(emailCategories.emailDate))
        .limit(input.limit)
        .offset(input.offset);

      if (input.category) {
        query.where(eq(emailCategories.category, input.category));
      }

      const results = await query;

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

      const stats = await db
        .select({
          category: emailCategories.category,
          count: sql<number>`COUNT(*)`,
          avgConfidence: sql<number>`AVG(${emailCategories.confidence})`,
        })
        .from(emailCategories)
        .groupBy(emailCategories.category);

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

      const query = db
        .select()
        .from(unsubscribeSuggestions)
        .orderBy(desc(unsubscribeSuggestions.lastEmailDate))
        .limit(input.limit);

      if (input.status) {
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

      await db
        .update(unsubscribeSuggestions)
        .set({
          status: input.status,
          actionDate: new Date(),
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

      await db
        .update(emailCategories)
        .set({
          manualCategory: input.category,
          manuallyOverridden: true,
          userId: ctx.user.id,
        })
        .where(eq(emailCategories.emailId, input.emailId));

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
        shortSummary: result.shortSummary,
        keyPoints: result.keyPoints,
        actionItems: result.actionItems,
        sentiment: result.sentiment,
        wordCount: result.wordCount,
        userId: ctx.user.id,
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

      // Build SQL query based on parsed filters
      let query = db.select().from(emailCategories);

      // Apply category filter
      if (parsedQuery.filters.category) {
        query = query.where(eq(emailCategories.category, parsedQuery.filters.category as any));
      }

      // Apply sender filter
      if (parsedQuery.filters.sender) {
        query = query.where(sql`${emailCategories.emailFrom} LIKE ${`%${parsedQuery.filters.sender}%`}`);
      }

      // Apply date range filter
      if (parsedQuery.filters.dateRange) {
        const { start, end } = parsedQuery.filters.dateRange;
        query = query.where(
          and(
            sql`${emailCategories.emailDate} >= ${start}`,
            sql`${emailCategories.emailDate} <= ${end}`
          )
        );
      }

      // Apply text search on subject and body
      if (parsedQuery.searchTerms.length > 0) {
        const searchConditions = parsedQuery.searchTerms.map(term =>
          sql`${emailCategories.emailSubject} LIKE ${`%${term}%`}`
        );
        query = query.where(sql`(${sql.join(searchConditions, sql` OR `)})`); 
      }

      // Order by date descending
      query = query.orderBy(desc(emailCategories.emailDate)).limit(50);

      const results = await query;

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
