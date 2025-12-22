import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Initialize GA4 client
let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (!analyticsClient && process.env.GA4_PROPERTY_ID) {
    try {
      analyticsClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
      });
    } catch (error) {
      console.warn('[Google Analytics] Failed to initialize client:', error);
      return null;
    }
  }
  return analyticsClient;
}

export interface GA4Metrics {
  sessions: number;
  users: number;
  pageviews: number;
  avgSessionDuration: number;
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    avgTime: number;
  }>;
}

export async function getGA4Metrics(
  startDate: string,
  endDate: string
): Promise<GA4Metrics> {
  const client = getAnalyticsClient();
  const propertyId = process.env.GA4_PROPERTY_ID;

  // If no credentials or property ID, return mock data
  if (!client || !propertyId) {
    console.warn('[Google Analytics] Using mock data - configure GA4_PROPERTY_ID and credentials');
    return getMockGA4Data();
  }

  try {
    // Fetch basic metrics
    const [metricsResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
    });

    // Fetch traffic sources
    const [trafficResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 5,
    });

    // Fetch top pages
    const [pagesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    // Parse metrics
    const sessions = parseInt(metricsResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const users = parseInt(metricsResponse.rows?.[0]?.metricValues?.[1]?.value || '0');
    const pageviews = parseInt(metricsResponse.rows?.[0]?.metricValues?.[2]?.value || '0');
    const avgSessionDuration = parseFloat(metricsResponse.rows?.[0]?.metricValues?.[3]?.value || '0');

    // Parse traffic sources
    const totalSessions = sessions;
    const trafficSources = (trafficResponse.rows || []).map((row) => {
      const source = row.dimensionValues?.[0]?.value || 'Unknown';
      const sourceSessions = parseInt(row.metricValues?.[0]?.value || '0');
      return {
        source,
        sessions: sourceSessions,
        percentage: Math.round((sourceSessions / totalSessions) * 100),
      };
    });

    // Parse top pages
    const topPages = (pagesResponse.rows || []).map((row) => {
      const path = row.dimensionValues?.[0]?.value || '/';
      const views = parseInt(row.metricValues?.[0]?.value || '0');
      const avgTime = Math.round(parseFloat(row.metricValues?.[1]?.value || '0'));
      return { path, views, avgTime };
    });

    return {
      sessions,
      users,
      pageviews,
      avgSessionDuration,
      trafficSources,
      topPages,
    };
  } catch (error) {
    console.error('[Google Analytics] Error fetching metrics:', error);
    return getMockGA4Data();
  }
}

// Mock data for development/testing
function getMockGA4Data(): GA4Metrics {
  return {
    sessions: 12847,
    users: 9234,
    pageviews: 45621,
    avgSessionDuration: 245,
    trafficSources: [
      { source: 'Booking.com', sessions: 4523, percentage: 35 },
      { source: 'Google Organic', sessions: 3854, percentage: 30 },
      { source: 'Direct', sessions: 2569, percentage: 20 },
      { source: 'Airbnb', sessions: 1285, percentage: 10 },
      { source: 'Social Media', sessions: 616, percentage: 5 },
    ],
    topPages: [
      { path: '/', views: 15234, avgTime: 145 },
      { path: '/apartments', views: 8765, avgTime: 234 },
      { path: '/booking', views: 6543, avgTime: 312 },
      { path: '/contact', views: 4321, avgTime: 89 },
      { path: '/about', views: 3210, avgTime: 156 },
    ],
  };
}

// Real-time metrics (uses Real-Time Reporting API)
export async function getGA4RealTimeMetrics(): Promise<{
  activeUsers: number;
  screenPageViews: number;
  eventCount: number;
}> {
  const client = getAnalyticsClient();
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!client || !propertyId) {
    return {
      activeUsers: 42,
      screenPageViews: 156,
      eventCount: 324,
    };
  }

  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
    });

    return {
      activeUsers: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0'),
      screenPageViews: parseInt(response.rows?.[0]?.metricValues?.[1]?.value || '0'),
      eventCount: parseInt(response.rows?.[0]?.metricValues?.[2]?.value || '0'),
    };
  } catch (error) {
    console.error('[Google Analytics] Error fetching real-time metrics:', error);
    return {
      activeUsers: 42,
      screenPageViews: 156,
      eventCount: 324,
    };
  }
}
