import type { VercelRequest, VercelResponse } from "@vercel/node";

type CacheEntry = {
  data: DashboardData;
  ts: number;
};

type DashboardData = {
  metrics: any[];
  posts: any[];
  summary: any | null;
  weeklyStats: any[];
  source: "cache" | "live";
  error?: string;
};

const TABLE_IDS = {
  accountMetrics: "7f6062fa-ab98-4307-8491-94fcecb9efa8",
  allPosts: "b8c2c96b-dd6b-4990-93b5-18bd2664dd9f",
  postsSummary: "11e6fa3c-ad2f-4d7f-81e7-d73cf74a4c67",
  weekly: "b513cbff-82e8-4bf0-9b86-5e44549e9851",
};

const METRICS_HEADERS = [
  "Start Date",
  "End Date",
  "Accounts Engaged",
  "Comments",
  "Follows And Unfollows",
  "Likes",
  "Profile Links Taps",
  "Reach",
  "Shares",
  "Total Interactions",
  "Views",
];

const POSTS_HEADERS = [
  "URL",
  "Date",
  "Created Time",
  "Media Type",
  "Column 1",
  "Caption",
  "Comments",
  "Likes",
  "Reach",
  "Saved",
  "Media Url",
  "Total Watch Time Milliseconds",
  "Follows",
  "Theme",
];

const SUMMARY_HEADERS = ["Metric", "Value"];

const WEEKLY_HEADERS = [
  "Week starting",
  "Posts",
  "Reach",
  "Likes",
  "Comments",
  "Saved",
  "Follows",
  "Avg reach / post",
  "Engagement rate",
];

// Optional Upstash Redis cache
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

function toInt(value: string | undefined) {
  return parseInt(value || "0") || null;
}

async function redisGet(key: string): Promise<CacheEntry | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { result } = (await res.json()) as { result: string | null };
    if (!result) return null;
    return JSON.parse(result) as CacheEntry;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: CacheEntry, ttlSeconds: number) {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  try {
    await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: JSON.stringify(value),
        expiration: ttlSeconds,
      }),
    });
  } catch {
    // ignore cache errors
  }
}

async function fetchTableFromRows(tableId: string, headers: string[]) {
  const ROWS_API_KEY = process.env.ROWS_API_KEY;
  const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

  if (!ROWS_API_KEY || !SPREADSHEET_ID) {
    throw new Error("ROWS_API_KEY or ROWS_SPREADSHEET_ID not configured");
  }

  const range = "A:AZ";
  const encodedRange = encodeURIComponent(range);
  const url = `https://api.rows.com/v1/spreadsheets/${SPREADSHEET_ID}/tables/${tableId}/values/${encodedRange}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ROWS_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 404) {
      throw new Error(`Table "${tableId}" not found. Check spreadsheet tables.`);
    }
    throw new Error(`Rows API error ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const rows = (data?.items || []) as string[][];
  if (!rows?.length) return [];

  const headerRowIndex = rows.findIndex((row) =>
    headers.some((h) => row.some((cell) => cell?.trim().includes(h)))
  );
  if (headerRowIndex === -1) return [];

  const headerRow = rows[headerRowIndex].map((c) => (c ?? "").trim());
  const headerMap: Record<string, number> = {};
  headers.forEach((h) => {
    const idx = headerRow.findIndex((c) => c.includes(h));
    if (idx !== -1) headerMap[h] = idx;
  });

  const result: Array<Record<string, string>> = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (row.every((cell) => !cell?.trim())) continue;
    const obj: Record<string, string> = {};
    Object.entries(headerMap).forEach(([header, idx]) => {
      obj[header] = row[idx]?.trim() || "";
    });
    result.push(obj);
  }
  return result;
}

async function fetchDashboardFromRows(): Promise<DashboardData> {
  const [metricsData, postsData, summaryData, weeklyData] = await Promise.all([
    fetchTableFromRows(TABLE_IDS.accountMetrics, METRICS_HEADERS),
    fetchTableFromRows(TABLE_IDS.allPosts, POSTS_HEADERS),
    fetchTableFromRows(TABLE_IDS.postsSummary, SUMMARY_HEADERS),
    fetchTableFromRows(TABLE_IDS.weekly, WEEKLY_HEADERS),
  ]);

  const metrics = metricsData.map((item, idx) => ({
    id: `m-${idx}`,
    date: item["Start Date"]?.split("T")[0] || item["Start Date"] || null,
    reach: toInt(item["Reach"]),
    accounts_engaged: toInt(item["Accounts Engaged"]),
    likes: toInt(item["Likes"]),
    comments: toInt(item["Comments"]),
    shares: toInt(item["Shares"]),
    follows: toInt(item["Follows And Unfollows"]),
    profile_links_taps: toInt(item["Profile Links Taps"]),
    views: toInt(item["Views"]),
    total_interactions: toInt(item["Total Interactions"]),
  }));

  const posts = postsData.map((item, idx) => ({
    id: `p-${idx}`,
    post_url: item["URL"] || null,
    post_date: item["Date"]?.split("T")[0] || item["Date"] || null,
    created_time: item["Created Time"] ? new Date(item["Created Time"]) : null,
    caption: item["Caption"] || null,
    likes: toInt(item["Likes"]),
    reach: toInt(item["Reach"]),
    comments: toInt(item["Comments"]),
    saved: toInt(item["Saved"]),
    follows: toInt(item["Follows"]),
    media_type: item["Media Type"] || null,
    watch_time_ms: toInt(item["Total Watch Time Milliseconds"]),
    theme: item["Theme"] || null,
    media_url: item["Media Url"] || null,
  }));

  let summary: any | null = null;
  if (summaryData.length > 0) {
    const summaryMap: Record<string, string> = {};
    summaryData.forEach((item) => {
      summaryMap[item["Metric"] || ""] = item["Value"] || "0";
    });
    summary = {
      id: "s-rows",
      synced_at: new Date().toISOString(),
      time_frame: "all_time",
      posts_count: toInt(summaryMap["Posts"]) ?? toInt(summaryMap["posts_count"]),
      total_reach: toInt(summaryMap["Total Reach"]) ?? toInt(summaryMap["total_reach"]),
      total_likes: toInt(summaryMap["Total Likes"]) ?? toInt(summaryMap["total_likes"]),
      total_comments: toInt(summaryMap["Total Comments"]) ?? toInt(summaryMap["total_comments"]),
      total_saved: toInt(summaryMap["Total Saved"]) ?? toInt(summaryMap["total_saved"]),
      total_follows: toInt(summaryMap["Total Follows"]) ?? toInt(summaryMap["total_follows"]),
      avg_reach_per_post: summaryMap["Avg Reach / Post"] || summaryMap["avg_reach_per_post"] || null,
      engagement_rate: summaryMap["Engagement Rate"] || summaryMap["engagement_rate"] || null,
    };
  }

  const weeklyStats = weeklyData.map((item, idx) => ({
    id: `w-${idx}`,
    week_starting: item["Week starting"]?.split("T")[0] || item["Week starting"] || null,
    posts_count: toInt(item["Posts"]),
    reach: toInt(item["Reach"]),
    likes: toInt(item["Likes"]),
    comments: toInt(item["Comments"]),
    saved: toInt(item["Saved"]),
    follows: toInt(item["Follows"]),
    avg_reach_per_post: item["Avg reach / post"] || null,
    engagement_rate: item["Engagement rate"] || null,
  }));

  return { metrics, posts, summary, weeklyStats, source: "live" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const refresh = req.query.refresh === "1";

  // Env validation early
  if (!process.env.ROWS_API_KEY || !process.env.ROWS_SPREADSHEET_ID) {
    return res.status(200).json({
      metrics: [],
      posts: [],
      summary: null,
      weeklyStats: [],
      source: "error",
      error: "ROWS_API_KEY or ROWS_SPREADSHEET_ID not configured",
    } satisfies DashboardData);
  }

  const cacheKey = "instagram-dashboard-v1";

  try {
    if (!refresh) {
      const cached = await redisGet(cacheKey);
      if (cached?.data) {
        return res.status(200).json({ ...cached.data, source: "cache" });
      }
    }

    const data = await fetchDashboardFromRows();

    await redisSet(cacheKey, { data, ts: Date.now() }, CACHE_TTL_SECONDS);

    return res.status(200).json(data);
  } catch (error) {
    console.error("[rows instagram-dashboard] error", error);
    return res.status(200).json({
      metrics: [],
      posts: [],
      summary: null,
      weeklyStats: [],
      source: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    } satisfies DashboardData);
  }
}
