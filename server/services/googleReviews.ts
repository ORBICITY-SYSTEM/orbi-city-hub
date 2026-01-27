/**
 * Google Reviews Service
 *
 * Fetches reviews from Google Places API and stores in Supabase.
 * Uses GOOGLE_API_KEY and GOOGLE_MAPS_PLACE_ID from environment.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyC0kGh7VmeO9QGPMKE9iD1BgUztUA8T-cg';
const PLACE_ID = process.env.GOOGLE_MAPS_PLACE_ID || 'ChIJxf79LQmHZ0ARpmv2Eih-1WE';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lusagtvxjtfxgfadulgv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg2MzYsImV4cCI6MjA4Mzg4NDYzNn0.D3F6xMDNLm8a9AC6tDMsT68Ad6F6xOlhoXTxEFmtPM8';

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface GoogleReview {
  id?: string;
  platform: 'google';
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  language?: string;
  // Response fields
  ai_response?: string;
  ai_response_generated_at?: string;
  response_status: 'pending' | 'approved' | 'rejected' | 'posted';
  approved_by?: string;
  approved_at?: string;
  posted_at?: string;
}

export interface PlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  url: string;
}

/**
 * Fetch reviews from Google Places API
 */
export async function fetchGoogleReviews(): Promise<{
  success: boolean;
  data?: PlaceDetails;
  error?: string;
}> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews,url&key=${GOOGLE_API_KEY}`;

    console.log('[GoogleReviews] Fetching from Places API...');

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[GoogleReviews] API Error:', data.status, data.error_message);
      return { success: false, error: data.error_message || data.status };
    }

    const place = data.result;

    const placeDetails: PlaceDetails = {
      name: place.name,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      url: place.url,
      reviews: (place.reviews || []).map((r: any) => ({
        platform: 'google' as const,
        author_name: r.author_name,
        author_url: r.author_url,
        profile_photo_url: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relative_time_description: r.relative_time_description,
        language: r.language,
        response_status: 'pending' as const,
      })),
    };

    console.log(`[GoogleReviews] Found ${placeDetails.reviews.length} reviews, Rating: ${placeDetails.rating}`);

    return { success: true, data: placeDetails };
  } catch (error) {
    console.error('[GoogleReviews] Fetch error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Save reviews to Supabase
 */
export async function saveReviewsToSupabase(reviews: GoogleReview[]): Promise<{
  success: boolean;
  inserted: number;
  updated: number;
  error?: string;
}> {
  try {
    let inserted = 0;
    let updated = 0;

    for (const review of reviews) {
      // Create unique ID from author + time
      const reviewId = `google_${review.author_name.replace(/\s+/g, '_')}_${review.time}`;

      // Check if exists
      const { data: existing } = await supabase
        .from('google_reviews')
        .select('id')
        .eq('review_id', reviewId)
        .single();

      const reviewData = {
        review_id: reviewId,
        platform: 'google',
        author_name: review.author_name,
        author_url: review.author_url,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        review_text: review.text,
        review_time: new Date(review.time * 1000).toISOString(),
        relative_time: review.relative_time_description,
        language: review.language,
        response_status: review.response_status || 'pending',
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update
        await supabase
          .from('google_reviews')
          .update(reviewData)
          .eq('review_id', reviewId);
        updated++;
      } else {
        // Insert
        await supabase
          .from('google_reviews')
          .insert({
            ...reviewData,
            created_at: new Date().toISOString(),
          });
        inserted++;
      }
    }

    console.log(`[GoogleReviews] Saved to Supabase: ${inserted} inserted, ${updated} updated`);

    return { success: true, inserted, updated };
  } catch (error) {
    console.error('[GoogleReviews] Save error:', error);
    return { success: false, inserted: 0, updated: 0, error: String(error) };
  }
}

/**
 * Fetch and save Google reviews
 */
export async function syncGoogleReviews(): Promise<{
  success: boolean;
  placeInfo?: { name: string; rating: number; totalReviews: number };
  reviewsCount: number;
  error?: string;
}> {
  // Fetch from Google
  const fetchResult = await fetchGoogleReviews();

  if (!fetchResult.success || !fetchResult.data) {
    return { success: false, reviewsCount: 0, error: fetchResult.error };
  }

  // Save to Supabase
  const saveResult = await saveReviewsToSupabase(fetchResult.data.reviews);

  if (!saveResult.success) {
    return { success: false, reviewsCount: 0, error: saveResult.error };
  }

  return {
    success: true,
    placeInfo: {
      name: fetchResult.data.name,
      rating: fetchResult.data.rating,
      totalReviews: fetchResult.data.user_ratings_total,
    },
    reviewsCount: fetchResult.data.reviews.length,
  };
}

/**
 * Get reviews needing response
 */
export async function getReviewsNeedingResponse(): Promise<GoogleReview[]> {
  const { data, error } = await supabase
    .from('google_reviews')
    .select('*')
    .eq('response_status', 'pending')
    .is('ai_response', null)
    .order('review_time', { ascending: false });

  if (error) {
    console.error('[GoogleReviews] Error fetching pending reviews:', error);
    return [];
  }

  return data || [];
}

/**
 * Update review with AI response
 */
export async function updateReviewWithResponse(
  reviewId: string,
  aiResponse: string
): Promise<boolean> {
  const { error } = await supabase
    .from('google_reviews')
    .update({
      ai_response: aiResponse,
      ai_response_generated_at: new Date().toISOString(),
      response_status: 'pending', // pending approval
      updated_at: new Date().toISOString(),
    })
    .eq('review_id', reviewId);

  if (error) {
    console.error('[GoogleReviews] Error updating response:', error);
    return false;
  }

  return true;
}

/**
 * Approve or reject AI response
 */
export async function approveReviewResponse(
  reviewId: string,
  approved: boolean,
  approvedBy: string
): Promise<boolean> {
  const { error } = await supabase
    .from('google_reviews')
    .update({
      response_status: approved ? 'approved' : 'rejected',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('review_id', reviewId);

  if (error) {
    console.error('[GoogleReviews] Error approving response:', error);
    return false;
  }

  return true;
}

export default {
  fetchGoogleReviews,
  saveReviewsToSupabase,
  syncGoogleReviews,
  getReviewsNeedingResponse,
  updateReviewWithResponse,
  approveReviewResponse,
};
