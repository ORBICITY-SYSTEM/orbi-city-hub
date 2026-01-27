/**
 * Google Reviews Router
 *
 * tRPC endpoints for Google Reviews management and AI responses.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { invokeLLM } from '../_core/llm';
import {
  syncGoogleReviews,
  getReviewsNeedingResponse,
  updateReviewWithResponse,
  approveReviewResponse,
} from '../services/googleReviews';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lusagtvxjtfxgfadulgv.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg2MzYsImV4cCI6MjA4Mzg4NDYzNn0.D3F6xMDNLm8a9AC6tDMsT68Ad6F6xOlhoXTxEFmtPM8'
);

export const googleReviewsRouter = router({
  /**
   * Sync reviews from Google Places API
   */
  sync: protectedProcedure.mutation(async () => {
    console.log('[GoogleReviews] Starting sync...');
    const result = await syncGoogleReviews();
    return result;
  }),

  /**
   * Get all reviews with optional filters
   */
  getAll: publicProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'posted', 'all']).optional(),
        minRating: z.number().min(1).max(5).optional(),
        limit: z.number().min(1).max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      let query = supabase
        .from('google_reviews')
        .select('*')
        .order('review_time', { ascending: false });

      if (input?.status && input.status !== 'all') {
        query = query.eq('response_status', input.status);
      }

      if (input?.minRating) {
        query = query.gte('rating', input.minRating);
      }

      if (input?.limit) {
        query = query.limit(input.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[GoogleReviews] Query error:', error);
        throw new Error('Failed to fetch reviews');
      }

      return data || [];
    }),

  /**
   * Get review statistics
   */
  getStats: publicProcedure.query(async () => {
    const { data: reviews } = await supabase
      .from('google_reviews')
      .select('rating, response_status');

    if (!reviews || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        pendingResponses: 0,
        approvedResponses: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const pendingResponses = reviews.filter(r => r.response_status === 'pending').length;
    const approvedResponses = reviews.filter(r => r.response_status === 'approved').length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      pendingResponses,
      approvedResponses,
      ratingDistribution,
    };
  }),

  /**
   * Generate AI response for a review
   */
  generateResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        language: z.enum(['en', 'ka', 'ru']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get the review
      const { data: review, error } = await supabase
        .from('google_reviews')
        .select('*')
        .eq('review_id', input.reviewId)
        .single();

      if (error || !review) {
        throw new Error('Review not found');
      }

      // Generate response with ClawdBot (Sonnet 4)
      const systemPrompt = `You are a professional hotel manager responding to guest reviews for ORBI CITY luxury apartments in Batumi, Georgia.

Guidelines:
- Be warm, professional, and genuine
- Thank the guest for their feedback
- For positive reviews (4-5 stars): Express gratitude and invite them back
- For negative reviews (1-3 stars): Apologize sincerely, address concerns, offer to make it right
- Keep responses concise (2-4 sentences)
- Sign as "ORBI CITY Team"
- Respond in ${input.language === 'ka' ? 'Georgian' : input.language === 'ru' ? 'Russian' : 'English'}

Hotel info:
- Location: Orbi City, Batumi, Georgia (seaside)
- Type: Luxury apartments with sea views
- Amenities: Pool, gym, 24/7 reception`;

      const userMessage = `Please write a response to this ${review.rating}-star review:

Author: ${review.author_name}
Rating: ${review.rating}/5 stars
Review: "${review.review_text}"

Write a professional response:`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        });

        const aiResponse = response.choices[0]?.message?.content as string;

        if (!aiResponse) {
          throw new Error('No response generated');
        }

        // Save to database
        await updateReviewWithResponse(input.reviewId, aiResponse);

        return {
          success: true,
          response: aiResponse,
          reviewId: input.reviewId,
        };
      } catch (err) {
        console.error('[GoogleReviews] AI generation error:', err);
        throw new Error('Failed to generate response');
      }
    }),

  /**
   * Generate responses for all pending reviews
   */
  generateAllResponses: protectedProcedure
    .input(
      z.object({
        language: z.enum(['en', 'ka', 'ru']).optional(),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const pendingReviews = await getReviewsNeedingResponse();

      if (pendingReviews.length === 0) {
        return { success: true, generated: 0, message: 'No pending reviews' };
      }

      let generated = 0;
      const errors: string[] = [];

      for (const review of pendingReviews) {
        try {
          const systemPrompt = `You are a professional hotel manager responding to guest reviews for ORBI CITY luxury apartments in Batumi, Georgia. Be warm, professional, and genuine. Keep responses concise (2-4 sentences). Sign as "ORBI CITY Team".`;

          const response = await invokeLLM({
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Write a response to this ${review.rating}-star review from ${review.author_name}: "${review.review_text}"`,
              },
            ],
          });

          const aiResponse = response.choices[0]?.message?.content as string;

          if (aiResponse) {
            await updateReviewWithResponse(review.review_id, aiResponse);
            generated++;
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          errors.push(`Failed for review ${review.review_id}: ${err}`);
        }
      }

      return {
        success: true,
        generated,
        total: pendingReviews.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    }),

  /**
   * Approve or reject a response
   */
  approveResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        approved: z.boolean(),
        approvedBy: z.string().optional(),
        editedResponse: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // If edited, save the edited version
      if (input.editedResponse) {
        await supabase
          .from('google_reviews')
          .update({
            final_response: input.editedResponse,
            updated_at: new Date().toISOString(),
          })
          .eq('review_id', input.reviewId);
      }

      const success = await approveReviewResponse(
        input.reviewId,
        input.approved,
        input.approvedBy || 'admin'
      );

      return { success };
    }),

  /**
   * Get reviews pending approval
   */
  getPendingApproval: protectedProcedure.query(async () => {
    const { data, error } = await supabase
      .from('google_reviews')
      .select('*')
      .eq('response_status', 'pending')
      .not('ai_response', 'is', null)
      .order('review_time', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch pending reviews');
    }

    return data || [];
  }),
});

export default googleReviewsRouter;
