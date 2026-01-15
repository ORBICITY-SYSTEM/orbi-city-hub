import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { guestReviews, notifications } from "../../drizzle/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { format } from "date-fns";

const buildWhereClause = (conditions: any[]) =>
  conditions.length > 0 ? and(conditions[0], ...conditions.slice(1)) : undefined;

/**
 * Helper functions for review processing
 */
function detectLanguage(text: string): string {
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka'; // Georgian
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Cyrillic (Russian)
  if (/[\u00C0-\u017F]/.test(text) && /ş|ğ|ı|ö|ü|ç/i.test(text)) return 'tr'; // Turkish
  if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(text)) return 'ja'; // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
  return 'en';
}

function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  const topicKeywords: Record<string, string[]> = {
    'cleanliness': ['clean', 'чист', 'temiz', 'სუფთა', 'sauber', 'propre'],
    'service': ['service', 'staff', 'персонал', 'сервис', 'hizmet', 'მომსახურება', 'personal'],
    'location': ['location', 'расположен', 'konum', 'მდებარეობა', 'lage', 'ubicación'],
    'view': ['view', 'вид', 'manzara', 'ხედი', 'море', 'sea', 'deniz', 'aussicht', 'vista'],
    'value': ['price', 'value', 'цена', 'fiyat', 'ucuz', 'ფასი', 'preis', 'precio'],
    'wifi': ['wifi', 'internet', 'интернет', 'wi-fi'],
    'noise': ['noise', 'noisy', 'шум', 'gürültü', 'laut', 'ruido'],
    'comfort': ['comfort', 'комфорт', 'rahat', 'კომფორტი', 'bequem', 'cómodo'],
    'breakfast': ['breakfast', 'завтрак', 'kahvaltı', 'frühstück', 'desayuno'],
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      topics.push(topic);
    }
  }
  
  return topics.length > 0 ? topics : ['general'];
}

function determineSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive';
  if (rating >= 3) return 'neutral';
  return 'negative';
}

/**
 * Reviews Router - Comprehensive review management API
 * Handles reviews from Outscraper webhook and all platforms
 */
export const reviewsRouter = router({
  /**
   * Outscraper Webhook - Receives reviews from Outscraper
   * This is a PUBLIC endpoint for webhook access
   */
  receiveOutscraperWebhook: publicProcedure
    .input(z.object({
      // Outscraper sends reviews in this format
      reviews: z.array(z.object({
        author_title: z.string().optional(),
        review_rating: z.number().optional(),
        review_text: z.string().optional(),
        review_datetime_utc: z.string().optional(),
        review_id: z.string().optional(),
        owner_answer: z.string().optional(),
        owner_answer_timestamp_datetime_utc: z.string().optional(),
        review_link: z.string().optional(),
        author_image: z.string().optional(),
      })).optional(),
      // Alternative format - single review
      author_title: z.string().optional(),
      review_rating: z.number().optional(),
      review_text: z.string().optional(),
      review_datetime_utc: z.string().optional(),
      review_id: z.string().optional(),
      owner_answer: z.string().optional(),
      owner_answer_timestamp_datetime_utc: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let imported = 0;
      let skipped = 0;
      const newReviews: any[] = [];

      // Handle both array and single review formats
      const reviewsToProcess = input.reviews || (input.author_title ? [input] : []);

      for (const review of reviewsToProcess) {
        const externalId = `outscraper_${review.review_id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if review already exists
        const existing = await db
          .select()
          .from(guestReviews)
          .where(eq(guestReviews.externalId, externalId))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const rating = review.review_rating || 5;
        const content = review.review_text || '';
        const sentiment = determineSentiment(rating);
        const topics = extractTopics(content);
        const language = detectLanguage(content);

        // Insert new review
        const [insertedReview] = await db.insert(guestReviews).values({
          source: 'google',
          externalId,
          reviewerName: review.author_title || 'Anonymous',
          rating,
          content,
          language,
          sentiment,
          topics,
          reviewDate: review.review_datetime_utc ? new Date(review.review_datetime_utc) : new Date(),
          hasReply: !!review.owner_answer,
          replyContent: review.owner_answer || null,
          replyDate: review.owner_answer_timestamp_datetime_utc 
            ? new Date(review.owner_answer_timestamp_datetime_utc) 
            : null,
        }).$returningId();

        imported++;
        newReviews.push({
          id: insertedReview.id,
          reviewerName: review.author_title,
          rating,
          sentiment,
        });

        // Create notification for new review
        const notificationType = rating <= 2 ? 'error' : rating <= 3 ? 'warning' : 'info';
        const notificationPriority = rating <= 2 ? 'urgent' : rating <= 3 ? 'high' : 'normal';
        
        await db.insert(notifications).values({
          type: notificationType,
          title: rating <= 2 
            ? `⚠️ უარყოფითი მიმოხილვა: ${rating}★` 
            : `ახალი მიმოხილვა: ${rating}★`,
          message: `${review.author_title || 'Anonymous'}: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
          priority: notificationPriority,
          actionUrl: '/reservations/guests',
          actionLabel: 'მიმოხილვის ნახვა',
        });
      }

      return {
        success: true,
        imported,
        skipped,
        total: reviewsToProcess.length,
        newReviews,
      };
    }),

  /**
   * Get Outscraper connection status
   */
  getOutscraperStatus: protectedProcedure.query(async () => {
    // Check if we have any reviews from outscraper
    const db = await getDb();
    if (!db) return { connected: false, lastSync: null, totalReviews: 0 };

    const result = await db
      .select({ 
        count: sql<number>`COUNT(*)`,
        lastDate: sql<string>`MAX(createdAt)`,
      })
      .from(guestReviews)
      .where(eq(guestReviews.source, 'google'));

    return {
      connected: true,
      webhookUrl: '/api/trpc/reviews.receiveOutscraperWebhook',
      lastSync: result[0]?.lastDate || null,
      totalGoogleReviews: result[0]?.count || 0,
    };
  }),

  /**
   * Get all reviews with filtering and pagination
   */
  getAll: protectedProcedure
    .input(z.object({
      source: z.enum(["all", "google", "booking", "airbnb", "expedia", "tripadvisor", "facebook", "agoda", "hostelworld", "direct"]).default("all"),
      sentiment: z.enum(["all", "positive", "neutral", "negative"]).default("all"),
      rating: z.enum(["all", "5", "4", "3", "2", "1"]).default("all"),
      hasReply: z.enum(["all", "yes", "no"]).default("all"),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filters = (input ?? {}) as NonNullable<typeof input>;
      const conditions: any[] = [];

      if (filters?.source && filters.source !== "all") {
        conditions.push(eq(guestReviews.source, filters.source as any));
      }
      if (filters?.sentiment && filters.sentiment !== "all") {
        conditions.push(eq(guestReviews.sentiment, filters.sentiment as any));
      }
      if (filters?.rating && filters.rating !== "all") {
        conditions.push(eq(guestReviews.rating, parseInt(String(filters.rating))));
      }
      if (filters?.hasReply === "yes") {
        conditions.push(eq(guestReviews.hasReply, true));
      } else if (filters?.hasReply === "no") {
        conditions.push(eq(guestReviews.hasReply, false));
      }
      if (filters?.dateFrom) {
        conditions.push(gte(guestReviews.reviewDate, new Date(filters.dateFrom)));
      }
      if (filters?.dateTo) {
        conditions.push(lte(guestReviews.reviewDate, new Date(filters.dateTo)));
      }
      if (filters?.search) {
        conditions.push(
          sql`(${guestReviews.content} LIKE ${`%${filters.search}%`} OR ${guestReviews.reviewerName} LIKE ${`%${filters.search}%`})`
        );
      }

      const whereClause = buildWhereClause(conditions);

      const reviews = await db
        .select()
        .from(guestReviews)
        .where(whereClause)
        .orderBy(desc(guestReviews.reviewDate))
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(guestReviews)
        .where(whereClause);

      return {
        reviews,
        total: countResult[0]?.count || 0,
        hasMore: (filters?.offset || 0) + reviews.length < (countResult[0]?.count || 0),
      };
    }),

  /**
   * Get review statistics
   */
  getStats: publicProcedure
    .input(z.object({
      source: z.enum(["all", "google", "booking", "airbnb", "expedia", "tripadvisor", "facebook", "agoda", "hostelworld", "direct"]).default("all"),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filters = (input ?? {}) as NonNullable<typeof input>;
      const conditions: any[] = [];

      if (filters?.source && filters.source !== "all") {
        conditions.push(eq(guestReviews.source, filters.source as any));
      }
      if (filters?.dateFrom) {
        conditions.push(gte(guestReviews.reviewDate, new Date(filters.dateFrom)));
      }
      if (filters?.dateTo) {
        conditions.push(lte(guestReviews.reviewDate, new Date(filters.dateTo)));
      }

      const whereClause = buildWhereClause(conditions);

      // Get total count and average rating
      const statsResult = await db
        .select({
          total: sql<number>`COUNT(*)`,
          avgRating: sql<number>`AVG(${guestReviews.rating})`,
          positiveCount: sql<number>`SUM(CASE WHEN ${guestReviews.sentiment} = 'positive' THEN 1 ELSE 0 END)`,
          neutralCount: sql<number>`SUM(CASE WHEN ${guestReviews.sentiment} = 'neutral' THEN 1 ELSE 0 END)`,
          negativeCount: sql<number>`SUM(CASE WHEN ${guestReviews.sentiment} = 'negative' THEN 1 ELSE 0 END)`,
          repliedCount: sql<number>`SUM(CASE WHEN ${guestReviews.hasReply} = true THEN 1 ELSE 0 END)`,
          pendingCount: sql<number>`SUM(CASE WHEN ${guestReviews.hasReply} = false THEN 1 ELSE 0 END)`,
        })
        .from(guestReviews)
        .where(whereClause);

      const stats = statsResult[0];
      console.log('[Reviews Stats] Raw stats result:', JSON.stringify(statsResult));
      const total = Number(stats?.total) || 0;

      // Get trend (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentConditions = [...conditions, gte(guestReviews.reviewDate, thirtyDaysAgo)];
      const previousConditions = [
        ...conditions,
        gte(guestReviews.reviewDate, sixtyDaysAgo),
        lte(guestReviews.reviewDate, thirtyDaysAgo),
      ];

      const [recentResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(guestReviews)
        .where(buildWhereClause(recentConditions));

      const [previousResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(guestReviews)
        .where(buildWhereClause(previousConditions));

      const recentCount = recentResult?.count || 0;
      const previousCount = previousResult?.count || 0;
      const change = recentCount - previousCount;

      return {
        total,
        avgRating: stats?.avgRating ? parseFloat(Number(stats.avgRating).toFixed(1)) : 0,
        positiveCount: Number(stats?.positiveCount) || 0,
        neutralCount: Number(stats?.neutralCount) || 0,
        negativeCount: Number(stats?.negativeCount) || 0,
        repliedCount: Number(stats?.repliedCount) || 0,
        pendingCount: Number(stats?.pendingCount) || 0,
        responseRate: total > 0 ? Math.round((Number(stats?.repliedCount || 0) / total) * 100) : 0,
        positiveRate: total > 0 ? Math.round((Number(stats?.positiveCount || 0) / total) * 100) : 0,
        trend: {
          change,
          percentage: previousCount > 0 ? Math.round((change / previousCount) * 100) : 0,
        },
      };
    }),

  /**
   * Get single review by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(guestReviews)
        .where(eq(guestReviews.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Reply to a review
   */
  reply: protectedProcedure
    .input(z.object({
      id: z.number(),
      replyContent: z.string().min(1).max(4000),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(guestReviews)
        .set({
          hasReply: true,
          replyContent: input.replyContent,
          replyDate: new Date(),
          repliedBy: ctx.user?.id,
        })
        .where(eq(guestReviews.id, input.id));

      return { success: true };
    }),

  /**
   * Delete reply from a review
   */
  deleteReply: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(guestReviews)
        .set({
          hasReply: false,
          replyContent: null,
          replyDate: null,
          repliedBy: null,
        })
        .where(eq(guestReviews.id, input.id));

      return { success: true };
    }),

  /**
   * Generate AI reply suggestion
   */
  generateAiReply: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const review = await db
        .select()
        .from(guestReviews)
        .where(eq(guestReviews.id, input.id))
        .limit(1);

      if (!review[0]) throw new Error("Review not found");

      // Generate AI reply based on review content and sentiment
      const r = review[0];
      let aiReply = "";

      if (r.sentiment === "positive") {
        aiReply = `Dear ${r.reviewerName || "Guest"},\n\nThank you so much for your wonderful ${r.rating}-star review! We are thrilled to hear that you enjoyed your stay at ORBI City. Your kind words about ${(r.topics as string[])?.slice(0, 2).join(" and ") || "our service"} mean a lot to our team.\n\nWe look forward to welcoming you back to Batumi soon!\n\nWarm regards,\nORBI City Team`;
      } else if (r.sentiment === "negative") {
        aiReply = `Dear ${r.reviewerName || "Guest"},\n\nThank you for taking the time to share your feedback. We sincerely apologize for the issues you experienced during your stay. Your concerns about ${(r.topics as string[])?.slice(0, 2).join(" and ") || "your experience"} have been noted and we are taking immediate steps to address them.\n\nWe would love the opportunity to make things right. Please contact us directly so we can discuss how to improve your next visit.\n\nSincerely,\nORBI City Management`;
      } else {
        aiReply = `Dear ${r.reviewerName || "Guest"},\n\nThank you for sharing your experience with us. We appreciate your feedback about ${(r.topics as string[])?.slice(0, 2).join(" and ") || "your stay"} and will use it to continue improving our services.\n\nWe hope to have the pleasure of hosting you again in the future!\n\nBest regards,\nORBI City Team`;
      }

      return { aiReply };
    }),

  /**
   * Get topics analysis
   */
  getTopicsAnalysis: protectedProcedure
    .input(z.object({
      source: z.enum(["all", "google", "booking", "airbnb", "expedia", "tripadvisor", "facebook", "agoda", "hostelworld", "direct"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filters = (input ?? {}) as NonNullable<typeof input>;
      const conditions: any[] = [];
      
      if (filters?.source && filters.source !== "all") {
        conditions.push(eq(guestReviews.source, filters.source as any));
      }

      const whereClause = buildWhereClause(conditions);

      const reviews = await db
        .select({ topics: guestReviews.topics, sentiment: guestReviews.sentiment })
        .from(guestReviews)
        .where(whereClause);

      // Aggregate topics
      const topicStats: Record<string, { total: number; positive: number; negative: number; neutral: number }> = {};

      for (const review of reviews) {
        const topics = (review.topics as string[]) || [];
        for (const topic of topics) {
          if (!topicStats[topic]) {
            topicStats[topic] = { total: 0, positive: 0, negative: 0, neutral: 0 };
          }
          topicStats[topic].total++;
          if (review.sentiment === 'positive') topicStats[topic].positive++;
          else if (review.sentiment === 'negative') topicStats[topic].negative++;
          else topicStats[topic].neutral++;
        }
      }

      return Object.entries(topicStats)
        .map(([topic, stats]) => ({
          topic,
          ...stats,
          positiveRate: stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);
    }),

  /**
   * Manual sync - imports demo data for testing
   */
  syncDemoReviews: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Demo reviews for testing
    const demoReviews = [
      {
        source: "google" as const,
        externalId: "demo_google_1",
        reviewerName: "კობა ჩივლაური",
        rating: 5,
        content: "შესანიშნავი ადგილი! ძალიან კმაყოფილი ვარ.",
        language: "ka",
        sentiment: "positive" as const,
        topics: ["service", "cleanliness"],
        reviewDate: new Date("2024-12-13"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "demo_google_2",
        reviewerName: "Berkay Cihan",
        rating: 5,
        content: "Gayet ucuz ve temiz ama direkt oraya gidince oda yok diyorlar anlayamadım dışarıda kiralıyorlar tavsiye ederim",
        language: "tr",
        sentiment: "positive" as const,
        topics: ["cleanliness", "value"],
        reviewDate: new Date("2024-12-12"),
        hasReply: false,
      },
    ];

    let imported = 0;
    let skipped = 0;

    for (const review of demoReviews) {
      const existing = await db
        .select()
        .from(guestReviews)
        .where(eq(guestReviews.externalId, review.externalId))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await db.insert(guestReviews).values(review);
      imported++;
    }

    return { success: true, imported, skipped, total: demoReviews.length };
  }),

  /**
   * Get platform breakdown statistics
   */
  getPlatformBreakdown: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const breakdown = await db
      .select({
        source: guestReviews.source,
        count: sql<number>`COUNT(*)`,
        avgRating: sql<number>`AVG(${guestReviews.rating})`,
      })
      .from(guestReviews)
      .groupBy(guestReviews.source);

    return breakdown.map(item => ({
      source: item.source,
      count: Number(item.count) || 0,
      avgRating: item.avgRating ? parseFloat(Number(item.avgRating).toFixed(1)) : 0,
    }));
  }),

  /**
   * Get response time metrics
   */
  getResponseTimeMetrics: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all reviews that have replies
    const repliedReviews = await db
      .select({
        reviewDate: guestReviews.reviewDate,
        replyDate: guestReviews.replyDate,
      })
      .from(guestReviews)
      .where(eq(guestReviews.hasReply, true));

    if (repliedReviews.length === 0) {
      return {
        avgResponseTimeHours: 0,
        avgResponseTimeDays: 0,
        fastestResponseHours: 0,
        slowestResponseHours: 0,
        totalReplied: 0,
        respondedWithin24h: 0,
        respondedWithin48h: 0,
        respondedWithin7d: 0,
      };
    }

    let totalHours = 0;
    let fastestHours = Infinity;
    let slowestHours = 0;
    let within24h = 0;
    let within48h = 0;
    let within7d = 0;

    for (const review of repliedReviews) {
      if (!review.reviewDate || !review.replyDate) continue;
      
      const reviewTime = new Date(review.reviewDate).getTime();
      const replyTime = new Date(review.replyDate).getTime();
      const diffHours = (replyTime - reviewTime) / (1000 * 60 * 60);
      
      if (diffHours >= 0) {
        totalHours += diffHours;
        if (diffHours < fastestHours) fastestHours = diffHours;
        if (diffHours > slowestHours) slowestHours = diffHours;
        if (diffHours <= 24) within24h++;
        if (diffHours <= 48) within48h++;
        if (diffHours <= 168) within7d++; // 7 days = 168 hours
      }
    }

    const avgHours = repliedReviews.length > 0 ? totalHours / repliedReviews.length : 0;

    return {
      avgResponseTimeHours: Math.round(avgHours * 10) / 10,
      avgResponseTimeDays: Math.round((avgHours / 24) * 10) / 10,
      fastestResponseHours: fastestHours === Infinity ? 0 : Math.round(fastestHours * 10) / 10,
      slowestResponseHours: Math.round(slowestHours * 10) / 10,
      totalReplied: repliedReviews.length,
      respondedWithin24h: within24h,
      respondedWithin48h: within48h,
      respondedWithin7d: within7d,
    };
  }),

  /**
   * Get last sync timestamp
   */
  getLastSyncTime: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // TODO: guestReviews schema doesn't have createdAt column
    // Should use reviewDate or importedAt instead
    const result = await db
      .select({ reviewDate: guestReviews.reviewDate })
      .from(guestReviews)
      .orderBy(desc(guestReviews.reviewDate))
      .limit(1);

    return {
      lastSync: result[0]?.reviewDate || null,
    };
  }),

  /**
   * Export reviews data for PDF/Excel
   */
  exportReviews: publicProcedure
    .input(z.object({
      format: z.enum(["json", "csv"]),
      source: z.enum(["all", "google", "booking", "airbnb", "tripadvisor"]).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];
      
      if (input.source && input.source !== "all") {
        conditions.push(eq(guestReviews.source, input.source));
      }
      
      if (input.dateFrom) {
        conditions.push(gte(guestReviews.reviewDate, new Date(input.dateFrom)));
      }
      
      if (input.dateTo) {
        conditions.push(lte(guestReviews.reviewDate, new Date(input.dateTo)));
      }

      const reviews = await db
        .select({
          id: guestReviews.id,
          source: guestReviews.source,
          reviewerName: guestReviews.reviewerName,
          rating: guestReviews.rating,
          content: guestReviews.content,
          sentiment: guestReviews.sentiment,
          reviewDate: guestReviews.reviewDate,
          hasReply: guestReviews.hasReply,
          replyContent: guestReviews.replyContent,
          replyDate: guestReviews.replyDate,
        })
        .from(guestReviews)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(guestReviews.reviewDate));

      if (input.format === "csv") {
        // Generate CSV string
        const headers = ["ID", "Source", "Reviewer", "Rating", "Content", "Sentiment", "Date", "Has Reply", "Reply Content", "Reply Date"];
        const rows = reviews.map(r => [
          r.id,
          r.source,
          r.reviewerName || "",
          r.rating,
          `"${(r.content || "").replace(/"/g, '""')}"`,
          r.sentiment,
          r.reviewDate ? format(new Date(r.reviewDate), 'yyyy-MM-dd') : "",
          r.hasReply ? "Yes" : "No",
          `"${(r.replyContent || "").replace(/"/g, '""')}"`,
          r.replyDate ? format(new Date(r.replyDate), 'yyyy-MM-dd') : "",
        ]);
        
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        return { format: "csv", data: csv, count: reviews.length };
      }

      return { format: "json", data: reviews, count: reviews.length };
    }),

  /**
   * Get rating trend over time (monthly)
   */
  getRatingTrend: publicProcedure
    .input(z.object({
      months: z.number().min(1).max(24).default(12),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const monthsBack = input?.months || 12;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      const reviews = await db
        .select({
          rating: guestReviews.rating,
          reviewDate: guestReviews.reviewDate,
        })
        .from(guestReviews)
        .where(gte(guestReviews.reviewDate, startDate));

      // Group by month
      const monthlyData: Record<string, { total: number; sum: number; count: number }> = {};

      for (const review of reviews) {
        if (!review.reviewDate) continue;
        const monthKey = format(new Date(review.reviewDate), 'yyyy-MM');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, sum: 0, count: 0 };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].sum += review.rating || 0;
      }

      return Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          avgRating: data.count > 0 ? parseFloat((data.sum / data.count).toFixed(1)) : 0,
          reviewCount: data.count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    }),
});
