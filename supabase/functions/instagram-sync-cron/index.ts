import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROWS_API_KEY = Deno.env.get('ROWS_API_KEY');
const SPREADSHEET_ID = Deno.env.get('ROWS_SPREADSHEET_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Table IDs from Rows.com
const TABLE_IDS = {
  accountMetrics: '7f6062fa-ab98-4307-8491-94fcecb9efa8',
  allPosts: 'b8c2c96b-dd6b-4990-93b5-18bd2664dd9f',
  postsSummary: '11e6fa3c-ad2f-4d7f-81e7-d73cf74a4c67',
  weekly: '29d39fdc-47ac-40e3-9862-5f3d836ea8a2',
};

// Updated headers to match actual Rows.com structure
const METRICS_HEADERS = [
  'Start Date',
  'End Date',
  'Accounts Engaged',
  'Comments',
  'Follows And Unfollows',
  'Likes',
  'Profile Links Taps',
  'Reach',
  'Shares',
  'Total Interactions',
  'Views',
];

const POSTS_HEADERS = [
  'URL',
  'Date',
  'Created Time',
  'Media Type',
  'Column 1',
  'Caption',
  'Comments',
  'Likes',
  'Reach',
  'Saved',
  'Media Url',
  'Total Watch Time Milliseconds',
  'Follows',
  'Theme',
];

const SUMMARY_HEADERS = [
  'Metric',
  'Value',
];

const WEEKLY_HEADERS = [
  'Week starting',
  'Posts',
  'Reach',
  'Likes',
  'Comments',
  'Saved',
  'Follows',
  'Avg reach / post',
  'Engagement rate',
];

function rowsToValueObjects(rows: string[][], expectedHeaders: string[]) {
  if (!rows?.length) return [] as Array<{ values: Record<string, string> }>;

  const firstRow = rows[0].map((c) => (c ?? '').trim());
  const headerMatches = expectedHeaders.filter((h) => firstRow.includes(h)).length;
  const hasHeaderRow = headerMatches >= Math.min(2, expectedHeaders.length);

  const headers = hasHeaderRow ? firstRow : expectedHeaders;
  const startIndex = hasHeaderRow ? 1 : 0;

  const items: Array<{ values: Record<string, string> }> = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i] || [];
    const values: Record<string, string> = {};

    for (let col = 0; col < headers.length; col++) {
      const key = headers[col];
      if (!key) continue;
      values[key] = (row[col] ?? '').toString();
    }

    // Skip fully empty rows
    if (Object.values(values).every((v) => !v || v.trim() === '')) continue;

    items.push({ values });
  }

  return items;
}

function toNumberValue(value: unknown) {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/,/g, '').replace(/%/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toIntValue(value: unknown) {
  return Math.trunc(toNumberValue(value));
}

// Parse time string like "10:30:00" or "10:30" to time format
function parseTimeValue(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  
  // Check if it's already a valid time format
  const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    const seconds = timeMatch[3] || '00';
    return `${hours}:${minutes}:${seconds}`;
  }
  
  return null;
}

async function fetchTableItems(tableId: string, expectedHeaders: string[], range = 'A:AZ') {
  const encodedRange = encodeURIComponent(range);
  const url = `https://api.rows.com/v1/spreadsheets/${SPREADSHEET_ID}/tables/${tableId}/values/${encodedRange}`;

  console.log(`Fetching table: ${tableId} (range=${range})`);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ROWS_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Rows API error for table ${tableId}:`, response.status, errorText);
    console.error('Rows URL:', url);
    throw new Error(`Rows API error: ${response.status}`);
  }

  const data = await response.json();
  const rows = (data?.items || []) as string[][];
  return rowsToValueObjects(rows, expectedHeaders);
}

// Parse summary data from Metric/Value format
function parseSummaryData(summaryData: Array<{ values: Record<string, string> }>) {
  const result: Record<string, string> = {};
  for (const item of summaryData) {
    const metric = item.values['Metric'] || item.values['0'];
    const value = item.values['Value'] || item.values['1'];
    if (metric) {
      result[metric] = value || '';
    }
  }
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ROWS_API_KEY || !SPREADSHEET_ID) {
      console.error('Missing environment variables: ROWS_API_KEY or ROWS_SPREADSHEET_ID');
      return new Response(
        JSON.stringify({ error: 'Missing configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting Instagram sync cron job...');

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch data from Rows.com
    const [metricsData, postsData, summaryData, weeklyData] = await Promise.all([
      fetchTableItems(TABLE_IDS.accountMetrics, METRICS_HEADERS),
      fetchTableItems(TABLE_IDS.allPosts, POSTS_HEADERS),
      fetchTableItems(TABLE_IDS.postsSummary, SUMMARY_HEADERS),
      fetchTableItems(TABLE_IDS.weekly, WEEKLY_HEADERS),
    ]);

    console.log(`Fetched: ${metricsData.length} metrics, ${postsData.length} posts, ${summaryData.length} summary rows, ${weeklyData.length} weekly rows`);

    // Sync daily metrics
    let metricsUpserted = 0;
    for (const item of metricsData) {
      const values = item.values;
      const dateValue = values['Start Date'] || values['Date'];
      if (!dateValue) continue;

      const { error } = await supabase
        .from('instagram_daily_metrics')
        .upsert({
          date: dateValue,
          reach: toIntValue(values['Reach']),
          accounts_engaged: toIntValue(values['Accounts Engaged']),
          likes: toIntValue(values['Likes']),
          comments: toIntValue(values['Comments']),
          shares: toIntValue(values['Shares']),
          follows: toIntValue(values['Follows And Unfollows']),
          profile_links_taps: toIntValue(values['Profile Links Taps']),
          views: toIntValue(values['Views']),
          total_interactions: toIntValue(values['Total Interactions']),
        }, { onConflict: 'date' });

      if (error) {
        console.error('Error upserting metric:', error);
      } else {
        metricsUpserted++;
      }
    }
    console.log(`Upserted ${metricsUpserted} daily metrics`);

    // Sync posts - including created_time
    let postsUpserted = 0;
    for (const item of postsData) {
      const values = item.values;
      if (!values['URL']) continue;

      const createdTime = parseTimeValue(values['Created Time']);
      
      // Log first post data for debugging
      if (postsUpserted === 0) {
        console.log('Sample post data:', JSON.stringify(values));
      }

      const { error } = await supabase
        .from('instagram_posts')
        .upsert({
          post_url: values['URL'],
          post_date: values['Date'] || null,
          created_time: createdTime,
          caption: values['Caption'] || null,
          likes: toIntValue(values['Likes']),
          reach: toIntValue(values['Reach']),
          comments: toIntValue(values['Comments']),
          saved: toIntValue(values['Saved']),
          follows: toIntValue(values['Follows']),
          media_type: values['Media Type'] || null,
          watch_time_ms: toIntValue(values['Total Watch Time Milliseconds']),
          theme: values['Theme'] || null,
          media_url: values['Media Url'] || null,
        }, { onConflict: 'post_url' });

      if (error) {
        console.error('Error upserting post:', error, 'post_url:', values['URL']);
      } else {
        postsUpserted++;
      }
    }
    console.log(`Upserted ${postsUpserted} posts`);

    // Parse and sync summary (key-value format)
    const summary = parseSummaryData(summaryData);
    console.log('Parsed summary:', summary);
    
    if (Object.keys(summary).length > 0) {
      const { error } = await supabase
        .from('instagram_summary')
        .insert({
          time_frame: summary['Total time frame'] || null,
          posts_count: toIntValue(summary['# posts']),
          total_reach: toIntValue(summary['Reach']),
          total_likes: toIntValue(summary['Likes']),
          total_comments: toIntValue(summary['Comments']),
          total_saved: toIntValue(summary['Saved']),
          total_follows: toIntValue(summary['Follows']),
          avg_reach_per_post: toNumberValue(summary['Avg reach / post']),
          engagement_rate: toNumberValue(summary['Engagement rate']),
        });

      if (error) {
        console.error('Error inserting summary:', error);
      } else {
        console.log('Inserted summary snapshot');
      }
    }

    // Sync weekly stats
    let weeklyUpserted = 0;
    for (const item of weeklyData) {
      const values = item.values;
      const weekStarting = values['Week starting'];
      if (!weekStarting) continue;

      const { error } = await supabase
        .from('instagram_weekly_stats')
        .upsert({
          week_starting: weekStarting,
          posts_count: toIntValue(values['Posts']),
          reach: toIntValue(values['Reach']),
          likes: toIntValue(values['Likes']),
          comments: toIntValue(values['Comments']),
          saved: toIntValue(values['Saved']),
          follows: toNumberValue(values['Follows']),
          avg_reach_per_post: toNumberValue(values['Avg reach / post']),
          engagement_rate: toNumberValue(String(values['Engagement rate']).replace('%', '')),
        }, { onConflict: 'week_starting' });

      if (error) {
        console.error('Error upserting weekly stat:', error);
      } else {
        weeklyUpserted++;
      }
    }
    console.log(`Upserted ${weeklyUpserted} weekly stats`);

    const result = {
      success: true,
      syncedAt: new Date().toISOString(),
      metrics: metricsUpserted,
      posts: postsUpserted,
      summary: Object.keys(summary).length > 0,
      weekly: weeklyUpserted,
    };

    console.log('Instagram sync completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in instagram-sync-cron:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
