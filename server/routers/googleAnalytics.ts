import { router, protectedProcedure } from "../_core/trpc";
import { getAnalyticsDataClient, GA4_PROPERTY_ID } from "../googleAuth";
import { z } from "zod";

/**
 * Google Analytics 4 tRPC Router
 * 
 * Provides real-time and historical analytics data from GA4
 * using the Google Analytics Data API v1beta.
 * 
 * Key Metrics:
 * - Real-time active users
 * - Real-time sessions
 * - Page views
 * - Traffic sources
 * - User demographics
 */

export const googleAnalyticsRouter = router({
  /**
   * Get real-time active users count
   * Returns the number of users currently active on the website
   */
  getRealTimeUsers: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error('GA4_PROPERTY_ID not configured');
      }

      const analyticsData = await getAnalyticsDataClient();
      
      const response = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [
            { name: 'activeUsers' },
          ],
        },
      });

      const activeUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || '0';

      return {
        activeUsers: parseInt(activeUsers, 10),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[GA4] Failed to get real-time users:', error);
      throw new Error('Failed to fetch real-time users from Google Analytics');
    }
  }),

  /**
   * Get real-time sessions and page views
   * Returns current active sessions and page view statistics
   */
  getRealTimeMetrics: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error('GA4_PROPERTY_ID not configured');
      }

      const analyticsData = await getAnalyticsDataClient();
      
      const response = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
          ],
          dimensions: [
            { name: 'unifiedScreenName' },
          ],
          limit: 10,
        },
      });

      const data = (response as any).data || {};
      const rows = data.rows || [];
      const totalActiveUsers = rows.reduce((sum: number, row: any) => {
        return sum + parseInt(row.metricValues?.[0]?.value || '0', 10);
      }, 0);

      const totalPageViews = rows.reduce((sum: number, row: any) => {
        return sum + parseInt(row.metricValues?.[1]?.value || '0', 10);
      }, 0);

      const topPages = rows.map((row: any) => ({
        page: row.dimensionValues?.[0]?.value || 'Unknown',
        activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
        pageViews: parseInt(row.metricValues?.[1]?.value || '0', 10),
      }));

      return {
        activeUsers: totalActiveUsers,
        pageViews: totalPageViews,
        topPages,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[GA4] Failed to get real-time metrics:', error);
      throw new Error('Failed to fetch real-time metrics from Google Analytics');
    }
  }),

  /**
   * Get traffic sources for the last 7 days
   * Returns breakdown of where visitors are coming from
   */
  getTrafficSources: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
    }).optional())
    .query(async ({ input }) => {
      try {
        if (!GA4_PROPERTY_ID) {
          throw new Error('GA4_PROPERTY_ID not configured');
        }

        const days = input?.days || 7;
        const analyticsData = await getAnalyticsDataClient();
        
        const response = await analyticsData.properties.runReport({
          property: GA4_PROPERTY_ID,
          requestBody: {
            dateRanges: [
              {
                startDate: `${days}daysAgo`,
                endDate: 'today',
              },
            ],
            dimensions: [
              { name: 'sessionSource' },
              { name: 'sessionMedium' },
            ],
            metrics: [
              { name: 'sessions' },
              { name: 'activeUsers' },
            ],
            orderBys: [
              {
                metric: {
                  metricName: 'sessions',
                },
                desc: true,
              },
            ],
            limit: 10,
          },
        });

      const data = (response as any).data || {};
      const rows = data.rows || [];
      const sources = rows.map((row: any) => ({
        source: row.dimensionValues?.[0]?.value || 'Unknown',
        medium: row.dimensionValues?.[1]?.value || 'Unknown',
        sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
        users: parseInt(row.metricValues?.[1]?.value || '0', 10),
      }));

      const totalSessions = sources.reduce((sum: number, s: any) => sum + s.sessions, 0);
      const totalUsers = sources.reduce((sum: number, s: any) => sum + s.users, 0);

        return {
          sources,
          totalSessions,
          totalUsers,
          period: `Last ${days} days`,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('[GA4] Failed to get traffic sources:', error);
        throw new Error('Failed to fetch traffic sources from Google Analytics');
      }
    }),

  /**
   * Get comprehensive dashboard metrics
   * Returns all key metrics for the CEO dashboard in a single call
   */
  getDashboardMetrics: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error('GA4_PROPERTY_ID not configured');
      }

      const analyticsData = await getAnalyticsDataClient();
      
      // Get real-time data
      const realtimeResponse = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
          ],
        },
      });

      const activeUsers = parseInt(realtimeResponse.data.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
      const realtimePageViews = parseInt(realtimeResponse.data.rows?.[0]?.metricValues?.[1]?.value || '0', 10);

      // Get last 30 days data
      const historicalResponse = await analyticsData.properties.runReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          dateRanges: [
            {
              startDate: '30daysAgo',
              endDate: 'today',
            },
          ],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' },
          ],
        },
      });

      const historicalRow = historicalResponse.data.rows?.[0];
      const totalSessions = parseInt(historicalRow?.metricValues?.[0]?.value || '0', 10);
      const totalUsers = parseInt(historicalRow?.metricValues?.[1]?.value || '0', 10);
      const totalPageViews = parseInt(historicalRow?.metricValues?.[2]?.value || '0', 10);
      const avgSessionDuration = parseFloat(historicalRow?.metricValues?.[3]?.value || '0');

      return {
        realtime: {
          activeUsers,
          pageViews: realtimePageViews,
        },
        last30Days: {
          sessions: totalSessions,
          users: totalUsers,
          pageViews: totalPageViews,
          avgSessionDuration: Math.round(avgSessionDuration),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[GA4] Failed to get dashboard metrics:', error);
      throw new Error('Failed to fetch dashboard metrics from Google Analytics');
    }
  }),

  /**
   * Test GA4 connection
   * Verifies that the GA4 API is accessible and configured correctly
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        return {
          success: false,
          error: 'GA4_PROPERTY_ID not configured. Please set it in environment variables.',
        };
      }

      const analyticsData = await getAnalyticsDataClient();
      
      // Try to fetch a simple metric
      const response = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [{ name: 'activeUsers' }],
        },
      });

      if (response.data) {
        return {
          success: true,
          message: 'Successfully connected to Google Analytics 4',
          propertyId: GA4_PROPERTY_ID,
        };
      } else {
        return {
          success: false,
          error: 'Received empty response from GA4 API',
        };
      }
    } catch (error) {
      console.error('[GA4] Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),
});
