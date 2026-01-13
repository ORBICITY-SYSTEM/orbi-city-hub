/**
 * Vercel Cron Job for Instagram Sync
 * Runs automatically on schedule defined in vercel.json
 * 
 * This is similar to Lovable's instagram-sync-cron Supabase Edge Function
 * It directly calls Rows.com API and saves to database
 */

// Helper function to fetch table data from Rows.com
async function fetchTableFromRows(tableId: string, headers: string[], spreadsheetId: string, apiKey: string) {
  const range = 'A:AZ';
  const encodedRange = encodeURIComponent(range);
  const url = `https://api.rows.com/v1/spreadsheets/${spreadsheetId}/tables/${tableId}/values/${encodedRange}`;
  
  console.log(`[Instagram Cron] Fetching table: ${tableId} (range=${range})`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Instagram Cron] Rows API error for table ${tableId}:`, response.status, errorText);
    throw new Error(`Rows API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const rows = (data?.items || []) as string[][];
  
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

// Helper to parse integer values
function toIntValue(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value.replace(/[^0-9-]/g, ''), 10);
  return isNaN(parsed) ? null : parsed;
}

// Helper to parse float values
function toNumberValue(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? null : parsed;
}

export default async function handler(req: any, res: any) {
  // Verify this is a cron request (Vercel adds Authorization header)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[Instagram Cron] Starting scheduled sync...');
    
    const ROWS_API_KEY = process.env.ROWS_API_KEY;
    const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

    if (!ROWS_API_KEY || !SPREADSHEET_ID) {
      console.error('[Instagram Cron] Missing environment variables');
      return res.status(500).json({ error: 'Missing configuration' });
    }

    // Table IDs from Instagram Analytics spreadsheet
    const TABLE_IDS = {
      accountMetrics: '7f6062fa-ab98-4307-8491-94fcecb9efa8',
      allPosts: 'b8c2c96b-dd6b-4990-93b5-18bd2664dd9f',
      postsSummary: '11e6fa3c-ad2f-4d7f-81e7-d73cf74a4c67',
      weekly: 'b513cbff-82e8-4bf0-9b86-5e44549e9851',
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

    // Fetch data from Rows.com
    const [metricsData, postsData, summaryData, weeklyData] = await Promise.all([
      fetchTableFromRows(TABLE_IDS.accountMetrics, METRICS_HEADERS, SPREADSHEET_ID, ROWS_API_KEY),
      fetchTableFromRows(TABLE_IDS.allPosts, POSTS_HEADERS, SPREADSHEET_ID, ROWS_API_KEY),
      fetchTableFromRows(TABLE_IDS.postsSummary, SUMMARY_HEADERS, SPREADSHEET_ID, ROWS_API_KEY),
      fetchTableFromRows(TABLE_IDS.weekly, WEEKLY_HEADERS, SPREADSHEET_ID, ROWS_API_KEY),
    ]);

    console.log(`[Instagram Cron] Fetched: ${metricsData.length} metrics, ${postsData.length} posts, ${summaryData.length} summary, ${weeklyData.length} weekly`);

    // Try to save to database if available
    try {
      const { getDb } = await import('../../server/db');
      const { 
        instagramDailyMetrics, 
        instagramPosts, 
        instagramSummary, 
        instagramWeeklyStats 
      } = await import('../../drizzle/schema');
      const { sql } = await import('drizzle-orm');

      const db = await getDb();
      
      if (db) {
        // Sync daily metrics
        let metricsSynced = 0;
        for (const item of metricsData) {
          const startDate = item['Start Date']?.split('T')[0] || item['Start Date'];
          if (!startDate) continue;

          await db.insert(instagramDailyMetrics).values({
            date: startDate,
            reach: toIntValue(item['Reach']),
            accounts_engaged: toIntValue(item['Accounts Engaged']),
            likes: toIntValue(item['Likes']),
            comments: toIntValue(item['Comments']),
            shares: toIntValue(item['Shares']),
            follows: toIntValue(item['Follows And Unfollows']),
            profile_links_taps: toIntValue(item['Profile Links Taps']),
            views: toIntValue(item['Views']),
            total_interactions: toIntValue(item['Total Interactions']),
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

        // Sync posts
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
            likes: toIntValue(item['Likes']),
            reach: toIntValue(item['Reach']),
            comments: toIntValue(item['Comments']),
            saved: toIntValue(item['Saved']),
            follows: toIntValue(item['Follows']),
            media_type: item['Media Type'] || null,
            watch_time_ms: toIntValue(item['Total Watch Time Milliseconds']),
            theme: item['Theme'] || null,
            media_url: item['Media Url'] || null,
          });
          postsSynced++;
        }

        // Sync summary
        await db.delete(instagramSummary);
        if (summaryData.length > 0) {
          const summaryMap: Record<string, string> = {};
          summaryData.forEach(item => {
            summaryMap[item['Metric'] || ''] = item['Value'] || '0';
          });

          await db.insert(instagramSummary).values({
            time_frame: 'all_time',
            posts_count: toIntValue(summaryMap['Posts'] || summaryMap['posts_count']),
            total_reach: toIntValue(summaryMap['Total Reach'] || summaryMap['total_reach']),
            total_likes: toIntValue(summaryMap['Total Likes'] || summaryMap['total_likes']),
            total_comments: toIntValue(summaryMap['Total Comments'] || summaryMap['total_comments']),
            total_saved: toIntValue(summaryMap['Total Saved'] || summaryMap['total_saved']),
            total_follows: toIntValue(summaryMap['Total Follows'] || summaryMap['total_follows']),
            avg_reach_per_post: toNumberValue(summaryMap['Avg Reach / Post'] || summaryMap['avg_reach_per_post']),
            engagement_rate: toNumberValue(summaryMap['Engagement Rate'] || summaryMap['engagement_rate']),
          });
        }

        // Sync weekly stats
        await db.delete(instagramWeeklyStats);
        let weeklySynced = 0;
        for (const item of weeklyData) {
          const weekStarting = item['Week starting']?.split('T')[0] || item['Week starting'];
          if (!weekStarting) continue;

          await db.insert(instagramWeeklyStats).values({
            week_starting: weekStarting,
            posts_count: toIntValue(item['Posts']),
            reach: toIntValue(item['Reach']),
            likes: toIntValue(item['Likes']),
            comments: toIntValue(item['Comments']),
            saved: toIntValue(item['Saved']),
            follows: toIntValue(item['Follows']),
            avg_reach_per_post: toNumberValue(item['Avg reach / post']),
            engagement_rate: toNumberValue(item['Engagement rate']),
          });
          weeklySynced++;
        }

        console.log(`[Instagram Cron] Synced to database: ${metricsSynced} metrics, ${postsSynced} posts, ${weeklySynced} weekly`);

        return res.status(200).json({
          success: true,
          message: 'Instagram sync completed',
          timestamp: new Date().toISOString(),
          synced: {
            metrics: metricsSynced,
            posts: postsSynced,
            weekly: weeklySynced,
          }
        });
      }
    } catch (dbError) {
      console.warn('[Instagram Cron] Database not available, data fetched but not saved:', dbError);
    }

    // If database is not available, still return success (data was fetched)
    return res.status(200).json({
      success: true,
      message: 'Instagram sync completed (data fetched, database not available)',
      timestamp: new Date().toISOString(),
      fetched: {
        metrics: metricsData.length,
        posts: postsData.length,
        weekly: weeklyData.length,
      }
    });
  } catch (error) {
    console.error('[Instagram Cron] Error:', error);
    return res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
