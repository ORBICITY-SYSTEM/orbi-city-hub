/**
 * Booking.com Butler - tRPC Router
 * 
 * API endpoints for Butler AI Agent operations.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as butlerDb from "./butlerDb";
import { BUTLER_KNOWLEDGE, AI_PROMPTS } from "./butler-knowledge";

export const butlerRouter = router({
  // ============================================
  // GET PENDING TASKS
  // ============================================
  getPendingTasks: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await butlerDb.getPendingTasks(ctx.user.id);
    return tasks;
  }),

  // ============================================
  // GET ALL REVIEWS
  // ============================================
  getReviews: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(50),
      withoutResponseOnly: z.boolean().optional().default(false)
    }))
    .query(async ({ ctx, input }) => {
      if (input.withoutResponseOnly) {
        return await butlerDb.getReviewsWithoutResponse(ctx.user.id);
      }
      return await butlerDb.getAllReviews(ctx.user.id, input.limit);
    }),

  // ============================================
  // GENERATE AI RESPONSE FOR REVIEW
  // ============================================
  generateResponse: protectedProcedure
    .input(z.object({
      reviewId: z.string(),
      guestName: z.string(),
      rating: z.number(),
      comment: z.string().optional(),
      negativeComment: z.string().optional(),
      positiveComment: z.string().optional(),
      language: z.enum(['ka', 'en', 'ru']).optional().default('en')
    }))
    .mutation(async ({ input }) => {
      const { guestName, rating, comment, negativeComment, positiveComment, language } = input;

      // Determine review type and select template
      let template;
      let reviewText = comment || negativeComment || positiveComment || '';
      
      if (rating < 5) {
        // Negative review - determine issue type
        const lowerText = reviewText.toLowerCase();
        if (lowerText.includes('clean') || lowerText.includes('dirty') || lowerText.includes('hair')) {
          template = BUTLER_KNOWLEDGE.reviewTemplates.negative.cleanliness[language];
        } else if (lowerText.includes('broken') || lowerText.includes('repair') || lowerText.includes('maintenance')) {
          template = BUTLER_KNOWLEDGE.reviewTemplates.negative.maintenance.en;
        } else {
          template = BUTLER_KNOWLEDGE.reviewTemplates.negative.service.en;
        }
      } else if (rating >= 7) {
        // Positive review
        template = BUTLER_KNOWLEDGE.reviewTemplates.positive.general[language];
      } else {
        // Neutral review
        template = BUTLER_KNOWLEDGE.reviewTemplates.neutral.general.en;
      }

      // Use AI to customize the template
      const prompt = `${AI_PROMPTS.reviewResponse}

Property: ${BUTLER_KNOWLEDGE.property.name}
Guest: ${guestName}
Rating: ${rating}/10
Review: ${reviewText}
Language: ${language}

Base template:
${template}

Customize this template to specifically address the guest's concerns while maintaining the professional tone. Replace {guest_name} with the actual name and {positive_aspect} or {improvement_area} with specific details from the review.`;

      const aiResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are the Booking.com Butler AI. Generate professional, empathetic review responses." },
          { role: "user", content: prompt }
        ]
      });

      const responseText = aiResponse.choices[0]?.message?.content || template.replace('{guest_name}', guestName);

      // Create a Butler task for approval
      const taskId = await butlerDb.createButlerTask({
        user_id: 1, // TODO: use ctx.user.id
        task_type: 'review_response',
        priority: rating < 5 ? 'high' : 'medium',
        status: 'pending',
        title: `Reply to ${guestName}'s ${rating}★ review`,
        description: `Review: "${reviewText.substring(0, 100)}..."`,
        ai_suggestion: {
          reviewId: input.reviewId,
          responseText,
          language
        },
        context: {
          guestName,
          rating,
          reviewText,
          language
        }
      });

      return {
        taskId,
        responseText,
        requiresApproval: true
      };
    }),

  // ============================================
  // APPROVE BUTLER TASK
  // ============================================
  approve: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      modifiedContent: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await butlerDb.approveButlerTask(input.taskId, ctx.user.id, input.modifiedContent);

      // Get task details to execute the action
      const task = await butlerDb.getButlerTaskById(input.taskId);
      if (!task) throw new Error("Task not found");

      // Execute based on task type
      if (task.task_type === 'review_response') {
        const { reviewId, responseText } = task.ai_suggestion;
        await butlerDb.updateReviewResponse(reviewId, responseText, true);
      }

      // Mark as completed
      await butlerDb.completeButlerTask(input.taskId);

      return { success: true };
    }),

  // ============================================
  // REJECT BUTLER TASK
  // ============================================
  reject: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      reason: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await butlerDb.rejectButlerTask(input.taskId, ctx.user.id, input.reason);
      return { success: true };
    }),

  // ============================================
  // GET PERFORMANCE METRICS
  // ============================================
  getMetrics: protectedProcedure
    .input(z.object({
      days: z.number().optional().default(30)
    }))
    .query(async ({ ctx, input }) => {
      const latest = await butlerDb.getLatestMetrics(ctx.user.id);
      const history = await butlerDb.getMetricsHistory(ctx.user.id, input.days);
      
      return {
        latest,
        history,
        trends: {
          occupancyChange: history.length >= 2 
            ? (history[0].occupancy_rate || 0) - (history[1].occupancy_rate || 0)
            : 0,
          revenueChange: history.length >= 2
            ? (history[0].total_revenue || 0) - (history[1].total_revenue || 0)
            : 0,
          reviewScoreChange: history.length >= 2
            ? (history[0].review_score || 0) - (history[1].review_score || 0)
            : 0
        }
      };
    }),

  // ============================================
  // GET AI RECOMMENDATIONS
  // ============================================
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const metrics = await butlerDb.getLatestMetrics(ctx.user.id);
    if (!metrics) {
      return {
        recommendations: [],
        alerts: []
      };
    }

    const recommendations = [];
    const alerts = [];

    // Check occupancy
    if ((metrics.occupancy_rate || 0) < 40) {
      recommendations.push({
        type: 'campaign_create',
        priority: 'high',
        title: 'Create 40% Discount Campaign',
        description: 'Low occupancy detected. A discount campaign can boost bookings.',
        estimatedImpact: '+3,000-5,000 GEL revenue',
        action: 'create_discount_campaign',
        params: { discount: 40, duration: 7 }
      });
    }

    // Check page views
    if ((metrics.page_views_vs_competitors || 0) < -50) {
      alerts.push({
        type: 'visibility',
        severity: 'critical',
        title: 'Page Views 72% Below Competitors',
        description: 'Your property visibility is significantly lower than competitors.',
        suggestions: [
          'Create discount campaign (top of search results)',
          'Update property photos',
          'Add more facilities',
          'Improve review score'
        ]
      });
    }

    // Check reviews without response
    const unrepliedReviews = await butlerDb.getReviewsWithoutResponse(ctx.user.id);
    if (unrepliedReviews.length > 0) {
      recommendations.push({
        type: 'review_response',
        priority: 'high',
        title: `Reply to ${unrepliedReviews.length} Unanswered Reviews`,
        description: 'Responding to reviews improves your reputation and shows you care.',
        estimatedImpact: 'Better review score, increased trust',
        action: 'reply_to_reviews',
        params: { count: unrepliedReviews.length }
      });
    }

    // Check review score
    if ((metrics.review_score || 0) < (metrics.area_avg_review_score || 9.0)) {
      alerts.push({
        type: 'review_score',
        severity: 'warning',
        title: 'Review Score Below Area Average',
        description: `Your score (${metrics.review_score}) is below area average (${metrics.area_avg_review_score}).`,
        suggestions: [
          'Address cleanliness issues',
          'Improve staff training',
          'Respond to all negative reviews',
          'Offer compensation for issues'
        ]
      });
    }

    return {
      recommendations,
      alerts
    };
  }),

  // ============================================
  // GET BUTLER STATS
  // ============================================
  getStats: protectedProcedure
    .input(z.object({
      days: z.number().optional().default(30)
    }))
    .query(async ({ ctx, input }) => {
      return await butlerDb.getButlerStats(ctx.user.id, input.days);
    }),

  // ============================================
  // CHAT WITH BUTLER AI (Universal Assistant)
  // ============================================
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      context: z.object({
        currentPage: z.string().optional(),
        visibleData: z.any().optional()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Get latest metrics for context
      const metrics = await butlerDb.getLatestMetrics(ctx.user.id);
      const pendingTasks = await butlerDb.getPendingTasks(ctx.user.id);
      const unrepliedReviews = await butlerDb.getReviewsWithoutResponse(ctx.user.id);

      // Build context-aware system prompt
      const systemPrompt = `You are the ORBI City Hub AI Assistant with full knowledge of the dashboard.

PROPERTY INFORMATION:
${JSON.stringify(BUTLER_KNOWLEDGE.property, null, 2)}

CURRENT PERFORMANCE:
- Occupancy: ${metrics?.occupancy_rate || 0}%
- Review Score: ${metrics?.review_score || 0}/10
- Total Bookings: ${metrics?.total_bookings || 0}
- Total Revenue: ${metrics?.total_revenue || 0} GEL
- Page Views vs Competitors: ${metrics?.page_views_vs_competitors || 0}%

PENDING TASKS:
- ${pendingTasks.length} tasks awaiting approval
- ${unrepliedReviews.length} reviews without response

CURRENT PAGE: ${input.context?.currentPage || 'unknown'}

You have access to:
- Booking.com Butler (reviews, metrics, campaigns)
- Google Analytics (real-time visitors, traffic sources)
- Reservations (bookings, guests, calendar)
- Finance (P&L, revenue, expenses)
- Logistics (inventory, housekeeping, maintenance)
- Marketing (campaigns, channels, ROI)

Answer questions about any aspect of the business. Be specific, data-driven, and actionable.`;

      const aiResponse = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.message }
        ]
      });

      return {
        response: aiResponse.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.",
        context: {
          metricsUsed: metrics !== null,
          pendingTasksCount: pendingTasks.length,
          unrepliedReviewsCount: unrepliedReviews.length
        }
      };
    })
});
