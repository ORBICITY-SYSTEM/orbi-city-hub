import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { guestReviews } from "../../drizzle/schema";
import { eq, desc, sql, and, gte, lte, like } from "drizzle-orm";
import { google } from 'googleapis';

// Google Business Profile OAuth2 configuration
const CLIENT_ID = process.env.GOOGLE_BUSINESS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;

// Store tokens in memory (in production, these should be in database)
let googleTokens: {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
} | null = null;

let googleAccountId: string | null = null;
let googleLocationId: string | null = null;

function getGoogleOAuth2Client() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return null;
  }
  
  const redirectUri = process.env.NODE_ENV === 'production' 
    ? 'https://hub.orbicitybatumi.com/api/google-business/callback'
    : 'http://localhost:3000/api/google-business/callback';
  
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
}

/**
 * Fetch reviews from Google Business Profile API
 */
async function fetchGoogleBusinessReviews(): Promise<Array<{
  source: 'google';
  externalId: string;
  reviewerName: string;
  rating: number;
  content: string;
  language: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  reviewDate: Date;
  hasReply: boolean;
  replyContent?: string;
  replyDate?: Date;
}> | null> {
  const client = getGoogleOAuth2Client();
  
  if (!client || !googleTokens?.refresh_token) {
    console.log('[GoogleBusiness] Not authenticated, using demo data');
    return null;
  }
  
  if (!googleAccountId || !googleLocationId) {
    console.log('[GoogleBusiness] No location selected, using demo data');
    return null;
  }
  
  client.setCredentials(googleTokens);
  
  try {
    const accessToken = await client.getAccessToken();
    
    const url = `https://mybusiness.googleapis.com/v4/${googleAccountId}/${googleLocationId}/reviews?pageSize=100`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[GoogleBusiness] API error:', error);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.reviews || data.reviews.length === 0) {
      console.log('[GoogleBusiness] No reviews found');
      return null;
    }
    
    // Transform Google API response to our format
    return data.reviews.map((review: any) => {
      const rating = convertStarRating(review.starRating);
      const sentiment = rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative';
      const topics = extractTopics(review.comment || '');
      
      return {
        source: 'google' as const,
        externalId: `google_${review.reviewId || review.name?.split('/').pop()}`,
        reviewerName: review.reviewer?.displayName || 'Anonymous',
        rating,
        content: review.comment || '',
        language: detectLanguage(review.comment || ''),
        sentiment,
        topics,
        reviewDate: new Date(review.createTime),
        hasReply: !!review.reviewReply,
        replyContent: review.reviewReply?.comment,
        replyDate: review.reviewReply?.updateTime ? new Date(review.reviewReply.updateTime) : undefined,
      };
    });
  } catch (error) {
    console.error('[GoogleBusiness] Failed to fetch reviews:', error);
    return null;
  }
}

function convertStarRating(rating: string): number {
  const map: Record<string, number> = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5,
  };
  return map[rating] || parseInt(rating) || 0;
}

function detectLanguage(text: string): string {
  // Simple language detection based on character sets
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka'; // Georgian
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Cyrillic (Russian)
  if (/[\u00C0-\u017F]/.test(text) && /ş|ğ|ı|ö|ü|ç/i.test(text)) return 'tr'; // Turkish
  return 'en';
}

function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  const topicKeywords: Record<string, string[]> = {
    'cleanliness': ['clean', 'чист', 'temiz', 'სუფთა'],
    'service': ['service', 'staff', 'персонал', 'сервис', 'hizmet', 'მომსახურება'],
    'location': ['location', 'расположен', 'konum', 'მდებარეობა'],
    'view': ['view', 'вид', 'manzara', 'ხედი', 'море', 'sea', 'deniz'],
    'value': ['price', 'value', 'цена', 'fiyat', 'ucuz', 'ფასი'],
    'wifi': ['wifi', 'internet', 'интернет'],
    'noise': ['noise', 'noisy', 'шум', 'gürültü'],
    'comfort': ['comfort', 'комфорт', 'rahat', 'კომფორტი'],
    'breakfast': ['breakfast', 'завтрак', 'kahvaltı'],
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      topics.push(topic);
    }
  }
  
  return topics.length > 0 ? topics : ['general'];
}

/**
 * Reviews Router - Comprehensive review management API
 * Handles reviews from all platforms: Google, Booking, Airbnb, etc.
 */
export const reviewsRouter = router({
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

      const filters = input || {};
      const conditions: any[] = [];

      if (filters.source && filters.source !== "all") {
        conditions.push(eq(guestReviews.source, filters.source as any));
      }
      if (filters.sentiment && filters.sentiment !== "all") {
        conditions.push(eq(guestReviews.sentiment, filters.sentiment as any));
      }
      if (filters.rating && filters.rating !== "all") {
        conditions.push(eq(guestReviews.rating, parseInt(filters.rating)));
      }
      if (filters.hasReply === "yes") {
        conditions.push(eq(guestReviews.hasReply, true));
      } else if (filters.hasReply === "no") {
        conditions.push(eq(guestReviews.hasReply, false));
      }
      if (filters.dateFrom) {
        conditions.push(gte(guestReviews.reviewDate, new Date(filters.dateFrom)));
      }
      if (filters.dateTo) {
        conditions.push(lte(guestReviews.reviewDate, new Date(filters.dateTo)));
      }
      if (filters.search) {
        conditions.push(
          sql`(${guestReviews.content} LIKE ${`%${filters.search}%`} OR ${guestReviews.reviewerName} LIKE ${`%${filters.search}%`})`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const reviews = await db
        .select()
        .from(guestReviews)
        .where(whereClause)
        .orderBy(desc(guestReviews.reviewDate))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(guestReviews)
        .where(whereClause);

      return {
        reviews,
        total: countResult[0]?.count || 0,
        hasMore: (filters.offset || 0) + reviews.length < (countResult[0]?.count || 0),
      };
    }),

  /**
   * Get review statistics
   */
  getStats: protectedProcedure
    .input(z.object({
      source: z.enum(["all", "google", "booking", "airbnb", "expedia", "tripadvisor", "facebook", "agoda", "hostelworld", "direct"]).default("all"),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const filters = input || {};
      const conditions: any[] = [];

      if (filters.source && filters.source !== "all") {
        conditions.push(eq(guestReviews.source, filters.source as any));
      }
      if (filters.dateFrom) {
        conditions.push(gte(guestReviews.reviewDate, new Date(filters.dateFrom)));
      }
      if (filters.dateTo) {
        conditions.push(lte(guestReviews.reviewDate, new Date(filters.dateTo)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count and average rating
      const statsResult = await db
        .select({
          total: sql<number>`COUNT(*)`,
          avgRating: sql<number>`AVG(rating)`,
          positive: sql<number>`SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END)`,
          neutral: sql<number>`SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END)`,
          negative: sql<number>`SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END)`,
          withReply: sql<number>`SUM(CASE WHEN hasReply = 1 THEN 1 ELSE 0 END)`,
          withoutReply: sql<number>`SUM(CASE WHEN hasReply = 0 THEN 1 ELSE 0 END)`,
        })
        .from(guestReviews)
        .where(whereClause);

      // Get rating distribution
      const ratingDist = await db
        .select({
          rating: guestReviews.rating,
          count: sql<number>`COUNT(*)`,
        })
        .from(guestReviews)
        .where(whereClause)
        .groupBy(guestReviews.rating);

      // Get source distribution
      const sourceDist = await db
        .select({
          source: guestReviews.source,
          count: sql<number>`COUNT(*)`,
          avgRating: sql<number>`AVG(rating)`,
        })
        .from(guestReviews)
        .where(whereClause)
        .groupBy(guestReviews.source);

      // Get recent trend (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(guestReviews)
        .where(gte(guestReviews.reviewDate, thirtyDaysAgo));

      const previousCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(guestReviews)
        .where(and(
          gte(guestReviews.reviewDate, sixtyDaysAgo),
          lte(guestReviews.reviewDate, thirtyDaysAgo)
        ));

      const stats = statsResult[0];
      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingDist.forEach(r => {
        ratingDistribution[r.rating] = r.count;
      });

      return {
        total: stats?.total || 0,
        averageRating: stats?.avgRating ? parseFloat(stats.avgRating.toFixed(2)) : 0,
        sentiment: {
          positive: stats?.positive || 0,
          neutral: stats?.neutral || 0,
          negative: stats?.negative || 0,
        },
        replies: {
          answered: stats?.withReply || 0,
          pending: stats?.withoutReply || 0,
          responseRate: stats?.total ? Math.round((stats.withReply / stats.total) * 100) : 0,
        },
        ratingDistribution,
        sourceDistribution: sourceDist.map(s => ({
          source: s.source,
          count: s.count,
          avgRating: s.avgRating ? parseFloat(s.avgRating.toFixed(2)) : 0,
        })),
        trend: {
          recent: recentCount[0]?.count || 0,
          previous: previousCount[0]?.count || 0,
          change: (recentCount[0]?.count || 0) - (previousCount[0]?.count || 0),
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
        aiReply = `Dear ${r.reviewerName || "Guest"},\n\nThank you for your review and for choosing ORBI City for your stay in Batumi. We appreciate your feedback and are always working to improve our services.\n\nWe hope to welcome you back soon!\n\nBest regards,\nORBI City Team`;
      }

      // Save AI suggestion
      await db
        .update(guestReviews)
        .set({ aiSuggestedReply: aiReply })
        .where(eq(guestReviews.id, input.id));

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

      const filters = input || {};
      const conditions: any[] = [];

      if (filters.source && filters.source !== "all") {
        conditions.push(eq(guestReviews.source, filters.source as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const reviews = await db
        .select({ topics: guestReviews.topics, sentiment: guestReviews.sentiment })
        .from(guestReviews)
        .where(whereClause);

      // Aggregate topics
      const topicStats: Record<string, { total: number; positive: number; negative: number; neutral: number }> = {};

      reviews.forEach(r => {
        const topics = r.topics as string[] | null;
        if (topics) {
          topics.forEach(topic => {
            if (!topicStats[topic]) {
              topicStats[topic] = { total: 0, positive: 0, negative: 0, neutral: 0 };
            }
            topicStats[topic].total++;
            if (r.sentiment === "positive") topicStats[topic].positive++;
            else if (r.sentiment === "negative") topicStats[topic].negative++;
            else topicStats[topic].neutral++;
          });
        }
      });

      return Object.entries(topicStats)
        .map(([topic, stats]) => ({
          topic,
          ...stats,
          positiveRate: stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);
    }),

  /**
   * Sync reviews from Google Business Profile (Live API)
   */
  syncGoogleReviews: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Try to fetch live reviews from Google Business Profile API
    const liveReviews = await fetchGoogleBusinessReviews();
    
    if (liveReviews && liveReviews.length > 0) {
      // Use live data from Google Business Profile
      let imported = 0;
      let skipped = 0;

      for (const review of liveReviews) {
        // Check if review already exists
        const existing = await db
          .select()
          .from(guestReviews)
          .where(eq(guestReviews.externalId, review.externalId))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Insert new review
        await db.insert(guestReviews).values({
          source: review.source,
          externalId: review.externalId,
          reviewerName: review.reviewerName,
          rating: review.rating,
          content: review.content,
          language: review.language || 'en',
          sentiment: review.sentiment,
          topics: review.topics,
          reviewDate: review.reviewDate,
          hasReply: review.hasReply,
          replyContent: review.replyContent,
          replyDate: review.replyDate,
        });
        imported++;
      }

      return {
        success: true,
        imported,
        skipped,
        total: liveReviews.length,
        source: 'live_api',
      };
    }

    // Fallback to demo reviews if API not connected
    const googleReviews = [
      {
        source: "google" as const,
        externalId: "google_koba_1",
        reviewerName: "კობა ჩივლაური",
        rating: 5,
        content: "",
        language: "ka",
        sentiment: "positive" as const,
        topics: ["service"],
        reviewDate: new Date("2024-12-13"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_berkay_2",
        reviewerName: "Berkay Cihan",
        rating: 5,
        content: "Gayet ucuz ve temiz ama direkt oraya gidince oda yok diyorlar anlayamadım dışarıda kiralıyorlar tavsiye ederim",
        language: "tr",
        sentiment: "positive" as const,
        topics: ["cleanliness", "value"],
        reviewDate: new Date("2024-12-12"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_maria_3",
        reviewerName: "Maria Ivanova",
        rating: 4,
        content: "Хорошее место, чисто и уютно. Вид на море потрясающий!",
        language: "ru",
        sentiment: "positive" as const,
        topics: ["cleanliness", "view"],
        reviewDate: new Date("2024-12-10"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_john_4",
        reviewerName: "John Smith",
        rating: 3,
        content: "Average experience. Location is great but room could be cleaner.",
        language: "en",
        sentiment: "neutral" as const,
        topics: ["location", "cleanliness"],
        reviewDate: new Date("2024-12-08"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_anna_5",
        reviewerName: "Anna Petrova",
        rating: 5,
        content: "Отличный отель! Персонал очень дружелюбный, номер чистый и комфортный. Рекомендую!",
        language: "ru",
        sentiment: "positive" as const,
        topics: ["staff", "cleanliness", "comfort"],
        reviewDate: new Date("2024-12-05"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_mehmet_6",
        reviewerName: "Mehmet Yılmaz",
        rating: 4,
        content: "Güzel bir otel, deniz manzarası harika. Fiyat performans açısından iyi.",
        language: "tr",
        sentiment: "positive" as const,
        topics: ["view", "value"],
        reviewDate: new Date("2024-12-03"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_david_7",
        reviewerName: "David Brown",
        rating: 2,
        content: "Not what I expected. Noisy at night and breakfast was disappointing.",
        language: "en",
        sentiment: "negative" as const,
        topics: ["noise", "breakfast"],
        reviewDate: new Date("2024-12-01"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_giorgi_8",
        reviewerName: "გიორგი მამუკაშვილი",
        rating: 5,
        content: "საუკეთესო სასტუმრო ბათუმში! ზღვის ხედი უბრალოდ განსაცვიფრებელია.",
        language: "ka",
        sentiment: "positive" as const,
        topics: ["view", "overall"],
        reviewDate: new Date("2024-11-28"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_elena_9",
        reviewerName: "Elena Kuznetsova",
        rating: 4,
        content: "Очень понравилось! Близко к пляжу, хороший сервис.",
        language: "ru",
        sentiment: "positive" as const,
        topics: ["location", "service"],
        reviewDate: new Date("2024-11-25"),
        hasReply: false,
      },
      {
        source: "google" as const,
        externalId: "google_ali_10",
        reviewerName: "Ali Demir",
        rating: 3,
        content: "Fena değil ama daha iyi olabilirdi. Wifi zayıftı.",
        language: "tr",
        sentiment: "neutral" as const,
        topics: ["wifi"],
        reviewDate: new Date("2024-11-22"),
        hasReply: false,
      },
    ];

    let imported = 0;
    let skipped = 0;

    for (const review of googleReviews) {
      // Check if review already exists
      const existing = await db
        .select()
        .from(guestReviews)
        .where(eq(guestReviews.externalId, review.externalId))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert new review
      await db.insert(guestReviews).values({
        source: review.source,
        externalId: review.externalId,
        reviewerName: review.reviewerName,
        rating: review.rating,
        content: review.content,
        language: review.language,
        sentiment: review.sentiment,
        topics: review.topics,
        reviewDate: review.reviewDate,
        hasReply: review.hasReply,
      });
      imported++;
    }

    return {
      success: true,
      imported,
      skipped,
      total: googleReviews.length,
      source: 'demo',
    };
  }),

  /**
   * Get Google Business Profile connection status
   */
  getGoogleConnectionStatus: protectedProcedure.query(async () => {
    const client = getGoogleOAuth2Client();
    
    if (!client) {
      return {
        connected: false,
        configured: false,
        error: 'OAuth2 credentials not configured. Please set GOOGLE_BUSINESS_CLIENT_ID and GOOGLE_BUSINESS_CLIENT_SECRET.',
      };
    }
    
    if (!googleTokens?.refresh_token) {
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/business.manage'],
        prompt: 'consent',
      });
      
      return {
        connected: false,
        configured: true,
        authUrl,
        error: 'Not authenticated. Please connect your Google Business Profile.',
      };
    }
    
    return {
      connected: true,
      configured: true,
      accountId: googleAccountId,
      locationId: googleLocationId,
    };
  }),

  /**
   * Exchange Google OAuth code for tokens
   */
  exchangeGoogleCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const client = getGoogleOAuth2Client();
      if (!client) {
        throw new Error('OAuth2 credentials not configured');
      }
      
      try {
        const { tokens } = await client.getToken(input.code);
        googleTokens = tokens;
        client.setCredentials(tokens);
        
        return { success: true };
      } catch (error) {
        console.error('[GoogleBusiness] Token exchange failed:', error);
        throw new Error('Failed to exchange authorization code');
      }
    }),

  /**
   * Set active Google Business location
   */
  setGoogleLocation: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      locationId: z.string(),
    }))
    .mutation(async ({ input }) => {
      googleAccountId = input.accountId;
      googleLocationId = input.locationId;
      return { success: true };
    }),

  /**
   * List Google Business accounts
   */
  listGoogleAccounts: protectedProcedure.query(async () => {
    const client = getGoogleOAuth2Client();
    if (!client || !googleTokens?.refresh_token) {
      return { accounts: [], error: 'Not authenticated' };
    }
    
    client.setCredentials(googleTokens);
    
    try {
      const accessToken = await client.getAccessToken();
      
      const response = await fetch(
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
          },
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[GoogleBusiness] List accounts error:', error);
        return { accounts: [], error: `API error: ${response.status}` };
      }
      
      const data = await response.json();
      return { accounts: data.accounts || [] };
    } catch (error) {
      console.error('[GoogleBusiness] Failed to list accounts:', error);
      return { accounts: [], error: 'Failed to list accounts' };
    }
  }),

  /**
   * List locations for a Google Business account
   */
  listGoogleLocations: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input }) => {
      const client = getGoogleOAuth2Client();
      if (!client || !googleTokens?.refresh_token) {
        return { locations: [], error: 'Not authenticated' };
      }
      
      client.setCredentials(googleTokens);
      
      try {
        const accessToken = await client.getAccessToken();
        
        const response = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${input.accountId}/locations`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken.token}`,
            },
          }
        );
        
        if (!response.ok) {
          const error = await response.text();
          console.error('[GoogleBusiness] List locations error:', error);
          return { locations: [], error: `API error: ${response.status}` };
        }
        
        const data = await response.json();
        return { locations: data.locations || [] };
      } catch (error) {
        console.error('[GoogleBusiness] Failed to list locations:', error);
        return { locations: [], error: 'Failed to list locations' };
      }
    }),
});
