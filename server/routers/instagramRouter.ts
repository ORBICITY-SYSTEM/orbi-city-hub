import { z } from "zod";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  instagramDailyMetrics, 
  instagramPosts, 
  instagramSummary, 
  instagramWeeklyStats 
} from "../../drizzle/schema";

// In-memory storage for development mode (when database is not available)
const memoryStore = {
  metrics: [] as any[],
  posts: [] as any[],
  summary: null as any,
  weekly: [] as any[],
  lastSync: null as Date | null,
};

// Rows.com Table IDs (from Instagram Page Analytics Dashboard spreadsheet)
const TABLE_IDS = {
  accountMetrics: '7f6062fa-ab98-4307-8491-94fcecb9efa8', // "Instagram Account Metrics - Last 30 Days (API limit)"
  allPosts: 'b8c2c96b-dd6b-4990-93b5-18bd2664dd9f', // "All posts performance"
  postsSummary: '11e6fa3c-ad2f-4d7f-81e7-d73cf74a4c67', // "Posts Summary (1)"
  weekly: 'b513cbff-82e8-4bf0-9b86-5e44549e9851', // "Weekly post performance (last year)"
};

const METRICS_HEADERS = [
  'Start Date', 'End Date', 'Accounts Engaged', 'Comments',
  'Follows And Unfollows', 'Likes', 'Profile Links Taps', 'Reach',
  'Shares', 'Total Interactions', 'Views'
];

const POSTS_HEADERS = [
  'URL', 'Date', 'Created Time', 'Media Type', 'Column 1', 'Caption',
  'Comments', 'Likes', 'Reach', 'Saved', 'Media Url',
  'Total Watch Time Milliseconds', 'Follows', 'Theme'
];

const SUMMARY_HEADERS = ['Metric', 'Value'];
const WEEKLY_HEADERS = [
  'Week starting', 'Posts', 'Reach', 'Likes', 'Comments', 'Saved',
  'Follows', 'Avg reach / post', 'Engagement rate'
];

async function fetchTableFromRows(tableId: string, headers: string[]) {
  const ROWS_API_KEY = process.env.ROWS_API_KEY;
  const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

  if (!ROWS_API_KEY || !SPREADSHEET_ID) {
    throw new Error("ROWS_API_KEY or ROWS_SPREADSHEET_ID not configured");
  }

  // Encode range like harmony does
  const range = 'A:AZ';
  const encodedRange = encodeURIComponent(range);
  const url = `https://api.rows.com/v1/spreadsheets/${SPREADSHEET_ID}/tables/${tableId}/values/${encodedRange}`;
  
  console.log(`[Instagram Sync] Fetching table: ${tableId} (range=${range})`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ROWS_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Instagram Sync] Rows API error for table ${tableId}:`, response.status, errorText);
    console.error(`[Instagram Sync] URL:`, url);
    
    // Check if it's a 404 (table not found)
    if (response.status === 404) {
      throw new Error(`Table "${tableId}" not found in spreadsheet. Please verify that Instagram Analytics tables exist in your Rows.com spreadsheet.`);
    }
    
    throw new Error(`Rows API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const rows = (data?.items || []) as string[][];
  
  console.log(`[Instagram Sync] Table ${tableId}: fetched ${rows?.length || 0} rows`);

  if (!rows?.length) return [];

  // Find header row
  const headerRowIndex = rows.findIndex(row => 
    headers.some(h => row.some(cell => cell?.trim().includes(h)))
  );

  if (headerRowIndex === -1) return [];

  const headerRow = rows[headerRowIndex].map(c => (c ?? '').trim());
  const headerMap: Record<string, number> = {};
  headers.forEach(h => {
    const idx = headerRow.findIndex(c => c.includes(h));
    if (idx !== -1) headerMap[h] = idx;
  });

  // Parse data rows
  const result: Array<Record<string, string>> = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (row.every(cell => !cell?.trim())) continue;

    const obj: Record<string, string> = {};
    Object.entries(headerMap).forEach(([header, idx]) => {
      obj[header] = row[idx]?.trim() || '';
    });
    result.push(obj);
  }

  return result;
}

export const instagramRouter = router({
  // Sync from Rows.com
  // Use publicProcedure in development mode (when OAuth is not configured)
  syncFromRows: (process.env.NODE_ENV === "development" ? publicProcedure : protectedProcedure)
    .mutation(async () => {
      // In development mode, if database is not configured, sync data to memory/cache only
      const db = await getDb();
      if (!db) {
        // In development mode, return mock sync result if database is not available
        if (process.env.NODE_ENV === "development") {
          console.warn("[Instagram Sync] Database not available - skipping database sync");
          // Still fetch data from Rows.com to verify connection works
          try {
            console.log("[Instagram Sync] Fetching data from Rows.com...");
            console.log("[Instagram Sync] Using spreadsheet:", process.env.ROWS_SPREADSHEET_ID);
            console.log("[Instagram Sync] Table IDs:", JSON.stringify(TABLE_IDS, null, 2));
            
            const [metricsData, postsData, summaryData, weeklyData] = await Promise.all([
              fetchTableFromRows(TABLE_IDS.accountMetrics, METRICS_HEADERS).catch(e => {
                console.error(`[Instagram Sync] Failed to fetch accountMetrics (${TABLE_IDS.accountMetrics}):`, e.message);
                throw new Error(`Account Metrics table not found. ${e.message}`);
              }),
              fetchTableFromRows(TABLE_IDS.allPosts, POSTS_HEADERS).catch(e => {
                console.error(`[Instagram Sync] Failed to fetch allPosts (${TABLE_IDS.allPosts}):`, e.message);
                throw new Error(`All Posts table not found. ${e.message}`);
              }),
              fetchTableFromRows(TABLE_IDS.postsSummary, SUMMARY_HEADERS).catch(e => {
                console.error(`[Instagram Sync] Failed to fetch postsSummary (${TABLE_IDS.postsSummary}):`, e.message);
                throw new Error(`Posts Summary table not found. ${e.message}`);
              }),
              fetchTableFromRows(TABLE_IDS.weekly, WEEKLY_HEADERS).catch(e => {
                console.error(`[Instagram Sync] Failed to fetch weekly (${TABLE_IDS.weekly}):`, e.message);
                throw new Error(`Weekly Stats table not found. ${e.message}`);
              }),
            ]);
            
            console.log(`[Instagram Sync] Fetched: ${metricsData.length} metrics, ${postsData.length} posts, ${summaryData.length} summary, ${weeklyData.length} weekly`);
            
            return {
              success: true,
              synced: {
                metrics: metricsData.length,
                posts: postsData.length,
                weekly: weeklyData.length,
              },
              message: `Data fetched successfully: ${metricsData.length} metrics, ${postsData.length} posts, ${weeklyData.length} weekly stats. Database not configured - data not saved.`,
            };
          } catch (error) {
            console.error("[Instagram Sync] Error fetching from Rows.com:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch from Rows.com';
            
            // Provide helpful error message
            if (errorMessage.includes('not found')) {
              throw new Error(`${errorMessage}\n\nPlease verify that:\n1. Your ROWS_SPREADSHEET_ID is correct\n2. Instagram Analytics tables exist in your spreadsheet\n3. Your ROWS_API_KEY has access to these tables`);
            }
            
            throw new Error(errorMessage);
          }
        }
        throw new Error("Database not available");
      }

      try {
        // Fetch all data from Rows.com
        const [metricsData, postsData, summaryData, weeklyData] = await Promise.all([
          fetchTableFromRows(TABLE_IDS.accountMetrics, METRICS_HEADERS),
          fetchTableFromRows(TABLE_IDS.allPosts, POSTS_HEADERS),
          fetchTableFromRows(TABLE_IDS.postsSummary, SUMMARY_HEADERS),
          fetchTableFromRows(TABLE_IDS.weekly, WEEKLY_HEADERS),
        ]);

        // Sync daily metrics
        let metricsSynced = 0;
        for (const item of metricsData) {
          const startDate = item['Start Date']?.split('T')[0] || item['Start Date'];
          if (!startDate) continue;

          await db.insert(instagramDailyMetrics).values({
            date: startDate,
            reach: parseInt(item['Reach'] || '0') || null,
            accounts_engaged: parseInt(item['Accounts Engaged'] || '0') || null,
            likes: parseInt(item['Likes'] || '0') || null,
            comments: parseInt(item['Comments'] || '0') || null,
            shares: parseInt(item['Shares'] || '0') || null,
            follows: parseInt(item['Follows And Unfollows'] || '0') || null,
            profile_links_taps: parseInt(item['Profile Links Taps'] || '0') || null,
            views: parseInt(item['Views'] || '0') || null,
            total_interactions: parseInt(item['Total Interactions'] || '0') || null,
          }).onDuplicateKeyUpdate({
            set: {
              reach: sql`VALUES(reach)`,
              accounts_engaged: sql`VALUES(accounts_engaged)`,
              likes: sql`VALUES(likes)`,
              comments: sql`VALUES(comments)`,
              shares: sql`VALUES(shares)`,
              follows: sql`VALUES(follows)`,
              profile_links_taps: sql`VALUES(profile_links_taps)`,
              views: sql`VALUES(views)`,
              total_interactions: sql`VALUES(total_interactions)`,
            }
          });
          metricsSynced++;
        }

        // Sync posts (clear old and insert new to avoid duplicates)
        await db.delete(instagramPosts);
        let postsSynced = 0;
        for (const item of postsData) {
          const postDate = item['Date']?.split('T')[0] || item['Date'];
          if (!postDate) continue;

          await db.insert(instagramPosts).values({
            post_url: item['URL'] || null,
            post_date: postDate,
            created_time: item['Created Time'] ? new Date(item['Created Time']) : null,
            caption: item['Caption'] || null,
            likes: parseInt(item['Likes'] || '0') || null,
            reach: parseInt(item['Reach'] || '0') || null,
            comments: parseInt(item['Comments'] || '0') || null,
            saved: parseInt(item['Saved'] || '0') || null,
            follows: parseInt(item['Follows'] || '0') || null,
            media_type: item['Media Type'] || null,
            watch_time_ms: parseInt(item['Total Watch Time Milliseconds'] || '0') || null,
            theme: item['Theme'] || null,
            media_url: item['Media Url'] || null,
          });
          postsSynced++;
        }

        // Sync summary (latest only - clear old)
        await db.delete(instagramSummary);
        if (summaryData.length > 0) {
          const summaryMap: Record<string, string> = {};
          summaryData.forEach(item => {
            summaryMap[item['Metric'] || ''] = item['Value'] || '0';
          });

          await db.insert(instagramSummary).values({
            time_frame: 'all_time',
            posts_count: parseInt(summaryMap['Posts'] || summaryMap['posts_count'] || '0') || null,
            total_reach: parseInt(summaryMap['Total Reach'] || summaryMap['total_reach'] || '0') || null,
            total_likes: parseInt(summaryMap['Total Likes'] || summaryMap['total_likes'] || '0') || null,
            total_comments: parseInt(summaryMap['Total Comments'] || summaryMap['total_comments'] || '0') || null,
            total_saved: parseInt(summaryMap['Total Saved'] || summaryMap['total_saved'] || '0') || null,
            total_follows: parseInt(summaryMap['Total Follows'] || summaryMap['total_follows'] || '0') || null,
            // Convert to string for decimal fields
            avg_reach_per_post: summaryMap['Avg Reach / Post'] || summaryMap['avg_reach_per_post'] || null,
            engagement_rate: summaryMap['Engagement Rate'] || summaryMap['engagement_rate'] || null,
          } as any);
        }

        // Sync weekly stats
        await db.delete(instagramWeeklyStats);
        let weeklySynced = 0;
        for (const item of weeklyData) {
          const weekStarting = item['Week starting']?.split('T')[0] || item['Week starting'];
          if (!weekStarting) continue;

          await db.insert(instagramWeeklyStats).values({
            week_starting: weekStarting,
            posts_count: parseInt(item['Posts'] || '0') || null,
            reach: parseInt(item['Reach'] || '0') || null,
            likes: parseInt(item['Likes'] || '0') || null,
            comments: parseInt(item['Comments'] || '0') || null,
            saved: parseInt(item['Saved'] || '0') || null,
            follows: parseInt(item['Follows'] || '0') || null,
            // Convert to string for decimal fields
            avg_reach_per_post: item['Avg reach / post'] || null,
            engagement_rate: item['Engagement rate'] || null,
          } as any);
          weeklySynced++;
        }

        return {
          success: true,
          synced: {
            metrics: metricsSynced,
            posts: postsSynced,
            weekly: weeklySynced,
          }
        };
      } catch (error) {
        console.error('Instagram sync error:', error);
        throw new Error(error instanceof Error ? error.message : 'Sync failed');
      }
    }),

  // Test Rows.com connection (EXACTLY like harmony - lightweight request)
  testConnection: publicProcedure
    .mutation(async () => {
      const ROWS_API_KEY = process.env.ROWS_API_KEY;
      const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

      if (!ROWS_API_KEY) {
        return { 
          success: false, 
          message: 'ROWS_API_KEY არ არის კონფიგურირებული' 
        };
      }

      if (!SPREADSHEET_ID) {
        return { 
          success: false, 
          message: 'ROWS_SPREADSHEET_ID არ არის კონფიგურირებული' 
        };
      }

      try {
        console.log(`[Instagram Test] Testing connection to spreadsheet: ${SPREADSHEET_ID}`);

        // Make a lightweight request to get spreadsheet info (EXACTLY like harmony)
        const url = `https://api.rows.com/v1/spreadsheets/${SPREADSHEET_ID}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ROWS_API_KEY}`,
            'Accept': 'application/json',
          },
        });

        const responseText = await response.text();
        console.log('[Instagram Test] Rows API response status:', response.status);
        console.log('[Instagram Test] Rows API response:', responseText.substring(0, 500));

        if (!response.ok) {
          let errorMessage = `Rows API error: ${response.status}`;
          
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
            
            // Provide user-friendly error messages (EXACTLY like harmony)
            if (response.status === 401) {
              errorMessage = 'ROWS_API_KEY არასწორია ან ვადაგასული';
            } else if (response.status === 403) {
              errorMessage = 'API Key-ს არ აქვს წვდომა ამ სპრედშიტზე';
            } else if (response.status === 404) {
              errorMessage = 'Spreadsheet ვერ მოიძებნა. შეამოწმეთ ROWS_SPREADSHEET_ID';
            } else if (errorData.message?.includes('spreadsheet_id is invalid')) {
              errorMessage = 'ROWS_SPREADSHEET_ID ფორმატი არასწორია. გამოიყენეთ spreadsheet ID (მაგ: 5HGcWJFcQVVAv4mNTYb2RS) და არა URL';
            }
          } catch {
            // Keep default error message
          }

          return { 
            success: false,
            message: errorMessage,
            details: `Status: ${response.status}`
          };
        }

        // Parse successful response (EXACTLY like harmony)
        let spreadsheetInfo;
        try {
          spreadsheetInfo = JSON.parse(responseText);
        } catch {
          return { 
            success: false, 
            message: 'Rows API-დან არასწორი პასუხი მოვიდა'
          };
        }

        const spreadsheetName = spreadsheetInfo.name || 'Unknown';
        const pagesCount = spreadsheetInfo.pages?.length || 0;
        const tablesCount = spreadsheetInfo.pages?.reduce(
          (sum: number, page: { tables?: unknown[] }) => sum + (page.tables?.length || 0),
          0
        ) || 0;

        console.log(`[Instagram Test] Connection successful! Spreadsheet: ${spreadsheetName}, Pages: ${pagesCount}, Tables: ${tablesCount}`);

        return { 
          success: true,
          message: `კავშირი წარმატებულია! სპრედშიტი: "${spreadsheetName}" (${tablesCount} ცხრილი)`,
          spreadsheet: {
            id: SPREADSHEET_ID,
            name: spreadsheetName,
            pages: pagesCount,
            tables: tablesCount,
          }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Instagram Test] Error:', errorMessage);
        return { 
          success: false, 
          message: `კავშირის შეცდომა: ${errorMessage}`
        };
      }
    }),

  // Get metrics with date range
  // Use publicProcedure in development mode (when OAuth is not configured)
  getMetrics: (process.env.NODE_ENV === "development" ? publicProcedure : protectedProcedure)
    .input(
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // In development mode, return data from memory
        if (process.env.NODE_ENV === "development" && memoryStore.metrics.length > 0) {
          let filtered = memoryStore.metrics;
          if (input?.from) {
            filtered = filtered.filter((m: any) => m['Start Date'] >= input.from);
          }
          if (input?.to) {
            filtered = filtered.filter((m: any) => m['End Date'] <= input.to);
          }
          // Transform to match database schema
          return filtered.map((item: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            date: item['Start Date']?.split('T')[0] || item['Start Date'],
            accounts_engaged: parseInt(item['Accounts Engaged'] || '0') || null,
            comments: parseInt(item['Comments'] || '0') || null,
            follows: parseInt(item['Follows And Unfollows'] || '0') || null,
            likes: parseInt(item['Likes'] || '0') || null,
            profile_links_taps: parseInt(item['Profile Links Taps'] || '0') || null,
            reach: parseInt(item['Reach'] || '0') || null,
            shares: parseInt(item['Shares'] || '0') || null,
            views: parseInt(item['Views'] || '0') || null,
            total_interactions: parseInt(item['Total Interactions'] || '0') || null,
          }));
        }
        return [];
      }

      const whereConditions: any[] = [];
      if (input?.from && typeof input.from === 'string') {
        whereConditions.push(gte(instagramDailyMetrics.date, input.from));
      }
      if (input?.to && typeof input.to === 'string') {
        whereConditions.push(lte(instagramDailyMetrics.date, input.to));
      }

      return await db
        .select()
        .from(instagramDailyMetrics)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(instagramDailyMetrics.date));
    }),

  // Get posts with date range
  // Use publicProcedure in development mode (when OAuth is not configured)
  getPosts: (process.env.NODE_ENV === "development" ? publicProcedure : protectedProcedure)
    .input(
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        limit: z.number().min(1).max(1000).default(1000),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // In development mode, return data from memory
        if (process.env.NODE_ENV === "development" && memoryStore.posts.length > 0) {
          let filtered = memoryStore.posts;
          if (input?.from) {
            filtered = filtered.filter((p: any) => (p['Date']?.split('T')[0] || p['Date']) >= input.from);
          }
          if (input?.to) {
            filtered = filtered.filter((p: any) => (p['Date']?.split('T')[0] || p['Date']) <= input.to);
          }
          const limited = filtered.slice(0, input?.limit || 1000);
          // Transform to match database schema
          return limited.map((item: any, idx: number) => ({
            id: idx + 1,
            post_url: item['URL'] || null,
            post_date: item['Date']?.split('T')[0] || item['Date'] || null,
            created_time: item['Created Time'] ? new Date(item['Created Time']) : null,
            caption: item['Caption'] || null,
            likes: parseInt(item['Likes'] || '0') || null,
            reach: parseInt(item['Reach'] || '0') || null,
            comments: parseInt(item['Comments'] || '0') || null,
            saved: parseInt(item['Saved'] || '0') || null,
            follows: parseInt(item['Follows'] || '0') || null,
            media_type: item['Media Type'] || null,
            watch_time_ms: parseInt(item['Total Watch Time Milliseconds'] || '0') || null,
            theme: item['Theme'] || null,
            media_url: item['Media Url'] || null,
          }));
        }
        return [];
      }

      // Note: MySQL doesn't support dynamic where with .where() chaining
      // We need to build conditions array
      const conditions: any[] = [];
      if (input?.from && typeof input.from === 'string') {
        conditions.push(gte(instagramPosts.post_date, input.from));
      }
      if (input?.to && typeof input.to === 'string') {
        conditions.push(lte(instagramPosts.post_date, input.to));
      }

      return await db
        .select()
        .from(instagramPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(instagramPosts.post_date))
        .limit(input?.limit || 1000);
    }),

  // Get latest summary
  // Use publicProcedure in development mode (when OAuth is not configured)
  getSummary: (process.env.NODE_ENV === "development" ? publicProcedure : protectedProcedure)
    .query(async () => {
      const db = await getDb();
      if (!db) {
        // In development mode, return data from memory
        if (process.env.NODE_ENV === "development" && memoryStore.summary) {
          const summaryMap: Record<string, string> = {};
          (Array.isArray(memoryStore.summary) ? memoryStore.summary : [memoryStore.summary]).forEach((item: any) => {
            summaryMap[item['Metric'] || ''] = item['Value'] || '0';
          });
          return {
            time_frame: 'all_time',
            posts_count: parseInt(summaryMap['Posts'] || summaryMap['posts_count'] || '0') || null,
            total_reach: parseInt(summaryMap['Total Reach'] || summaryMap['total_reach'] || '0') || null,
            total_likes: parseInt(summaryMap['Total Likes'] || summaryMap['total_likes'] || '0') || null,
            total_comments: parseInt(summaryMap['Total Comments'] || summaryMap['total_comments'] || '0') || null,
            total_saved: parseInt(summaryMap['Total Saved'] || summaryMap['total_saved'] || '0') || null,
            total_follows: parseInt(summaryMap['Total Follows'] || summaryMap['total_follows'] || '0') || null,
            avg_reach_per_post: parseFloat(summaryMap['Avg Reach / Post'] || summaryMap['avg_reach_per_post'] || '0') || null,
            engagement_rate: parseFloat(summaryMap['Engagement Rate'] || summaryMap['engagement_rate'] || '0') || null,
          };
        }
        return null;
      }

      const result = await db.select()
        .from(instagramSummary)
        .orderBy(desc(instagramSummary.synced_at))
        .limit(1);

      return result[0] || null;
    }),

  // Get weekly stats
  // Use publicProcedure in development mode (when OAuth is not configured)
  getWeeklyStats: (process.env.NODE_ENV === "development" ? publicProcedure : protectedProcedure)
    .query(async () => {
      const db = await getDb();
      if (!db) {
        // In development mode, return data from memory
        if (process.env.NODE_ENV === "development" && memoryStore.weekly.length > 0) {
          // Transform to match database schema
          return memoryStore.weekly.map((item: any, idx: number) => ({
            id: idx + 1,
            week_starting: item['Week starting']?.split('T')[0] || item['Week starting'] || null,
            posts_count: parseInt(item['Posts'] || '0') || null,
            reach: parseInt(item['Reach'] || '0') || null,
            likes: parseInt(item['Likes'] || '0') || null,
            comments: parseInt(item['Comments'] || '0') || null,
            saved: parseInt(item['Saved'] || '0') || null,
            follows: parseInt(item['Follows'] || '0') || null,
            avg_reach_per_post: parseFloat(item['Avg reach / post'] || '0') || null,
            engagement_rate: parseFloat(item['Engagement rate'] || '0') || null,
          })).sort((a: any, b: any) => (b.week_starting || '').localeCompare(a.week_starting || ''));
        }
        return [];
      }

      return await db.select()
        .from(instagramWeeklyStats)
        .orderBy(desc(instagramWeeklyStats.week_starting));
    }),
});
