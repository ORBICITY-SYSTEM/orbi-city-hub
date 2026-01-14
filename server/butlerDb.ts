/**
 * Booking.com Butler - Database Helpers
 * 
 * Database operations for Butler AI Agent system.
 * Uses raw SQL queries for MySQL/TiDB compatibility.
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

// Re-export getDb for use in butlerRouter
export { getDb };

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ButlerTask {
  id: string;
  user_id: number;
  task_type: 'review_response' | 'pricing_update' | 'campaign_create' | 'facility_update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  title: string;
  description?: string;
  ai_suggestion: any; // JSON
  context?: any; // JSON
  approved_by?: number;
  approved_at?: Date;
  rejected_reason?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface BookingReview {
  id: string;
  user_id: number;
  booking_reservation_id?: string;
  guest_name: string;
  guest_country?: string;
  rating: number;
  comment?: string;
  positive_comment?: string;
  negative_comment?: string;
  staff_rating?: number;
  facilities_rating?: number;
  cleanliness_rating?: number;
  comfort_rating?: number;
  value_rating?: number;
  location_rating?: number;
  has_response: boolean;
  response_text?: string;
  response_sent_at?: Date;
  ai_generated_response?: string;
  review_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BookingMetrics {
  id: string;
  user_id: number;
  metric_date: Date;
  occupancy_rate?: number;
  total_bookings: number;
  total_revenue: number;
  average_daily_rate?: number;
  revenue_per_available_room?: number;
  page_views: number;
  conversion_rate?: number;
  search_ranking?: number;
  review_score?: number;
  total_reviews: number;
  new_reviews_today: number;
  area_avg_occupancy?: number;
  area_avg_review_score?: number;
  page_views_vs_competitors?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ButlerApproval {
  id: string;
  user_id: number;
  task_id?: string;
  action: 'approved' | 'rejected' | 'modified' | 'completed';
  action_by: number;
  original_content?: any; // JSON
  modified_content?: any; // JSON
  notes?: string;
  estimated_impact?: any; // JSON
  actual_impact?: any; // JSON
  created_at: Date;
}

// ============================================
// BUTLER TASKS
// ============================================

export async function createButlerTask(task: Omit<ButlerTask, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(
    sql`INSERT INTO butler_tasks (
      user_id, task_type, priority, status, title, description,
      ai_suggestion, context
    ) VALUES (${task.user_id}, ${task.task_type}, ${task.priority}, ${task.status}, ${task.title}, ${task.description || null}, ${JSON.stringify(task.ai_suggestion)}, ${task.context ? JSON.stringify(task.context) : null})`
  );

  return (result as any).insertId;
}

export async function getPendingTasks(userId: number): Promise<ButlerTask[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(
    sql`SELECT * FROM butler_tasks 
     WHERE user_id = ${userId} AND status = 'pending'
     ORDER BY priority DESC, created_at DESC`
  );

  return ((rows as any) as any[]).map((row: any) => ({
    ...row,
    ai_suggestion: JSON.parse(row.ai_suggestion),
    context: row.context ? JSON.parse(row.context) : null
  }));
}

export async function getButlerTaskById(taskId: string): Promise<ButlerTask | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.execute(
    sql`SELECT * FROM butler_tasks WHERE id = ${taskId}`
  );

  const task = ((rows as any) as any[])[0];
  if (!task) return null;

  return {
    ...task,
    ai_suggestion: JSON.parse(task.ai_suggestion),
    context: task.context ? JSON.parse(task.context) : null
  };
}

export async function approveButlerTask(
  taskId: string,
  userId: number,
  modifiedContent?: any
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`UPDATE butler_tasks 
     SET status = 'approved', approved_by = ${userId}, approved_at = NOW()
     WHERE id = ${taskId}`
  );

  // Log approval
  await db.execute(
    sql`INSERT INTO butler_approvals (
      user_id, task_id, action, action_by, modified_content
    ) VALUES (${userId}, ${taskId}, 'approved', ${userId}, ${modifiedContent ? JSON.stringify(modifiedContent) : null})`
  );
}

export async function rejectButlerTask(
  taskId: string,
  userId: number,
  reason: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`UPDATE butler_tasks 
     SET status = 'rejected', rejected_reason = ${reason}
     WHERE id = ${taskId}`
  );

  // Log rejection
  await db.execute(
    sql`INSERT INTO butler_approvals (
      user_id, task_id, action, action_by, notes
    ) VALUES (${userId}, ${taskId}, 'rejected', ${userId}, ${reason})`
  );
}

export async function completeButlerTask(taskId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`UPDATE butler_tasks 
     SET status = 'completed', completed_at = NOW()
     WHERE id = ${taskId}`
  );
}

// ============================================
// BOOKING REVIEWS
// ============================================

export async function createBookingReview(review: Omit<BookingReview, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(
    sql`INSERT INTO booking_reviews (
      user_id, booking_reservation_id, guest_name, guest_country, rating,
      comment, positive_comment, negative_comment,
      staff_rating, facilities_rating, cleanliness_rating,
      comfort_rating, value_rating, location_rating,
      has_response, review_date
    ) VALUES (${review.user_id}, ${review.booking_reservation_id || null}, ${review.guest_name}, ${review.guest_country || null}, ${review.rating}, ${review.comment || null}, ${review.positive_comment || null}, ${review.negative_comment || null}, ${review.staff_rating || null}, ${review.facilities_rating || null}, ${review.cleanliness_rating || null}, ${review.comfort_rating || null}, ${review.value_rating || null}, ${review.location_rating || null}, ${review.has_response}, ${review.review_date})`
  );

  return (result as any).insertId;
}

export async function getReviewsWithoutResponse(userId: number): Promise<BookingReview[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(
    sql`SELECT * FROM booking_reviews 
     WHERE user_id = ${userId} AND has_response = FALSE
     ORDER BY review_date DESC`
  );

  return (rows as any) as BookingReview[];
}

export async function getAllReviews(userId: number, limit: number = 50): Promise<BookingReview[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(
    sql`SELECT * FROM booking_reviews 
     WHERE user_id = ${userId}
     ORDER BY review_date DESC
     LIMIT ${limit}`
  );

  return (rows as any) as BookingReview[];
}

export async function updateReviewResponse(
  reviewId: string,
  responseText: string,
  aiGenerated: boolean = true
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (aiGenerated) {
    await db.execute(
      sql`UPDATE booking_reviews 
       SET has_response = TRUE, 
           response_text = ${responseText},
           ai_generated_response = ${responseText},
           response_sent_at = NOW()
       WHERE id = ${reviewId}`
    );
  } else {
    await db.execute(
      sql`UPDATE booking_reviews 
       SET has_response = TRUE, 
           response_text = ${responseText},
           response_sent_at = NOW()
       WHERE id = ${reviewId}`
    );
  }
}

// ============================================
// BOOKING METRICS
// ============================================

export async function createOrUpdateMetrics(metrics: Omit<BookingMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(
    sql`INSERT INTO booking_metrics (
      user_id, metric_date, occupancy_rate, total_bookings, total_revenue,
      average_daily_rate, revenue_per_available_room, page_views,
      conversion_rate, search_ranking, review_score, total_reviews,
      new_reviews_today, area_avg_occupancy, area_avg_review_score,
      page_views_vs_competitors
    ) VALUES (${metrics.user_id}, ${metrics.metric_date}, ${metrics.occupancy_rate || null}, ${metrics.total_bookings}, ${metrics.total_revenue}, ${metrics.average_daily_rate || null}, ${metrics.revenue_per_available_room || null}, ${metrics.page_views}, ${metrics.conversion_rate || null}, ${metrics.search_ranking || null}, ${metrics.review_score || null}, ${metrics.total_reviews}, ${metrics.new_reviews_today}, ${metrics.area_avg_occupancy || null}, ${metrics.area_avg_review_score || null}, ${metrics.page_views_vs_competitors || null})
    ON DUPLICATE KEY UPDATE
      occupancy_rate = VALUES(occupancy_rate),
      total_bookings = VALUES(total_bookings),
      total_revenue = VALUES(total_revenue),
      average_daily_rate = VALUES(average_daily_rate),
      revenue_per_available_room = VALUES(revenue_per_available_room),
      page_views = VALUES(page_views),
      conversion_rate = VALUES(conversion_rate),
      search_ranking = VALUES(search_ranking),
      review_score = VALUES(review_score),
      total_reviews = VALUES(total_reviews),
      new_reviews_today = VALUES(new_reviews_today),
      area_avg_occupancy = VALUES(area_avg_occupancy),
      area_avg_review_score = VALUES(area_avg_review_score),
      page_views_vs_competitors = VALUES(page_views_vs_competitors),
      updated_at = NOW()`
  );
}

export async function getLatestMetrics(userId: number): Promise<BookingMetrics | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.execute(
    sql`SELECT * FROM booking_metrics 
     WHERE user_id = ${userId}
     ORDER BY metric_date DESC
     LIMIT 1`
  );

  return ((rows as any) as BookingMetrics[])[0] || null;
}

export async function getMetricsHistory(
  userId: number,
  days: number = 30
): Promise<BookingMetrics[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(
    sql`SELECT * FROM booking_metrics 
     WHERE user_id = ${userId} AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
     ORDER BY metric_date DESC`
  );

  return (rows as any) as BookingMetrics[];
}

// ============================================
// BUTLER APPROVALS (Audit Log)
// ============================================

export async function getButlerStats(userId: number, days: number = 30): Promise<{
  totalTasks: number;
  approved: number;
  rejected: number;
  pending: number;
  completed: number;
  timeSaved: number; // hours
  revenueImpact: number; // GEL
}> {
  const db = await getDb();
  if (!db) return {
    totalTasks: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    completed: 0,
    timeSaved: 0,
    revenueImpact: 0
  };

  const rows = await db.execute(
    sql`SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
     FROM butler_tasks
     WHERE user_id = ${userId} AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
  );

  const stats = ((rows as any) as any[])[0];

  // Estimate time saved (30 min per task)
  const timeSaved = (stats.approved + stats.completed) * 0.5;

  // Estimate revenue impact (from completed campaigns)
  const revenueRows = await db.execute(
    sql`SELECT SUM(JSON_EXTRACT(estimated_impact, '$.revenue')) as revenue
     FROM butler_approvals
     WHERE user_id = ${userId} AND action = 'completed'
       AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`
  );

  const revenueImpact = ((revenueRows as any) as any[])[0]?.revenue || 0;

  return {
    totalTasks: stats.total,
    approved: stats.approved,
    rejected: stats.rejected,
    pending: stats.pending,
    completed: stats.completed,
    timeSaved,
    revenueImpact
  };
}
