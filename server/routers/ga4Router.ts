/**
 * Google Analytics 4 Router
 *
 * tRPC endpoints for GA4 analytics data
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { fetchGA4Data } from '../services/googleAnalytics';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lusagtvxjtfxgfadulgv.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg2MzYsImV4cCI6MjA4Mzg4NDYzNn0.D3F6xMDNLm8a9AC6tDMsT68Ad6F6xOlhoXTxEFmtPM8'
);

export const ga4Router = router({
  /**
   * Get full GA4 analytics report
   */
  getReport: publicProcedure.query(async () => {
    console.log('[GA4 Router] Fetching analytics report...');
    const report = await fetchGA4Data();
    return report;
  }),

  /**
   * Get just the key metrics
   */
  getMetrics: publicProcedure.query(async () => {
    const report = await fetchGA4Data();
    return report.metrics;
  }),

  /**
   * Get traffic sources
   */
  getTrafficSources: publicProcedure.query(async () => {
    const report = await fetchGA4Data();
    return report.trafficSources;
  }),

  /**
   * Get country breakdown
   */
  getCountries: publicProcedure.query(async () => {
    const report = await fetchGA4Data();
    return report.countries;
  }),

  /**
   * Get top pages
   */
  getTopPages: publicProcedure.query(async () => {
    const report = await fetchGA4Data();
    return report.topPages;
  }),

  /**
   * Get daily trend data
   */
  getDailyTrend: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const report = await fetchGA4Data();
      const days = input?.days || 7;
      return report.dailyData.slice(-days);
    }),

  /**
   * Manual sync/refresh
   */
  sync: protectedProcedure.mutation(async () => {
    console.log('[GA4 Router] Manual sync triggered...');
    const report = await fetchGA4Data();

    // Save to Supabase
    await supabase.from('ga4_analytics').insert({
      property_id: '518261169',
      data: report,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      lastUpdated: report.lastUpdated,
      metrics: report.metrics,
    };
  }),

  /**
   * Get analytics history
   */
  getHistory: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit || 30;

      const { data, error } = await supabase
        .from('ga4_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[GA4] History fetch error:', error);
        return [];
      }

      return data || [];
    }),
});

export default ga4Router;
