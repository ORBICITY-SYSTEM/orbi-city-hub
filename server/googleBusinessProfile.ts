/**
 * Google Business Profile API Integration
 * 
 * This module provides integration with Google Business Profile API
 * to fetch reviews, ratings, and business information.
 * 
 * API Documentation: https://developers.google.com/my-business/content/review-data
 */

import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_BUSINESS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_BUSINESS_REDIRECT_URI || 'http://localhost:3000/api/google-business/callback';

// OAuth2 client
let oauth2Client: any = null;

function getOAuth2Client() {
  if (!oauth2Client && CLIENT_ID && CLIENT_SECRET) {
    oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  }
  return oauth2Client;
}

// Store refresh token (in production, save to database)
let storedRefreshToken: string | null = null;

export function setRefreshToken(token: string) {
  storedRefreshToken = token;
  const client = getOAuth2Client();
  if (client) {
    client.setCredentials({ refresh_token: token });
  }
}

export function getRefreshToken(): string | null {
  return storedRefreshToken;
}

export interface GoogleReview {
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
    isAnonymous: boolean;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface GoogleBusinessReviewsResponse {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviewCount: number;
  nextPageToken?: string;
}

/**
 * Get OAuth2 authorization URL
 */
export function getAuthUrl(): string {
  const client = getOAuth2Client();
  if (!client) {
    throw new Error('OAuth2 client not configured');
  }
  
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/business.manage',
    ],
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client();
  if (!client) {
    throw new Error('OAuth2 client not configured');
  }
  
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  
  if (tokens.refresh_token) {
    storedRefreshToken = tokens.refresh_token;
  }
  
  return tokens;
}

/**
 * Fetch reviews from Google Business Profile
 */
export async function fetchGoogleBusinessReviews(
  accountId: string,
  locationId: string,
  pageSize: number = 50,
  pageToken?: string
): Promise<GoogleBusinessReviewsResponse> {
  const client = getOAuth2Client();
  
  if (!client || !storedRefreshToken) {
    console.log('Google Business Profile not authenticated, returning empty reviews');
    return {
      reviews: [],
      averageRating: 0,
      totalReviewCount: 0,
    };
  }

  try {
    // Ensure we have valid credentials
    client.setCredentials({ refresh_token: storedRefreshToken });
    
    // Use the My Business API
    const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth: client });
    
    // For reviews, we need to use the Business Profile Performance API
    // or the older My Business API v4
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?pageSize=${pageSize}${pageToken ? `&pageToken=${pageToken}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${(await client.getAccessToken()).token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Business API error:', error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      reviews: data.reviews || [],
      averageRating: data.averageRating || 0,
      totalReviewCount: data.totalReviewCount || 0,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviewCount: 0,
    };
  }
}

/**
 * List all accounts
 */
export async function listAccounts() {
  const client = getOAuth2Client();
  
  if (!client || !storedRefreshToken) {
    throw new Error('Not authenticated');
  }

  client.setCredentials({ refresh_token: storedRefreshToken });
  
  const response = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    {
      headers: {
        'Authorization': `Bearer ${(await client.getAccessToken()).token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list accounts: ${response.status}`);
  }

  return response.json();
}

/**
 * List locations for an account
 */
export async function listLocations(accountId: string) {
  const client = getOAuth2Client();
  
  if (!client || !storedRefreshToken) {
    throw new Error('Not authenticated');
  }

  client.setCredentials({ refresh_token: storedRefreshToken });
  
  const response = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
    {
      headers: {
        'Authorization': `Bearer ${(await client.getAccessToken()).token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list locations: ${response.status}`);
  }

  return response.json();
}

/**
 * Convert star rating enum to number
 */
export function starRatingToNumber(rating: GoogleReview["starRating"]): number {
  const map = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  return map[rating];
}

/**
 * Reply to a Google Business Profile review
 */
export async function replyToGoogleReview(
  accountId: string,
  locationId: string,
  reviewId: string,
  replyText: string
): Promise<boolean> {
  const client = getOAuth2Client();
  
  if (!client || !storedRefreshToken) {
    throw new Error('Not authenticated');
  }

  client.setCredentials({ refresh_token: storedRefreshToken });
  
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${(await client.getAccessToken()).token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: replyText }),
    }
  );

  return response.ok;
}

/**
 * Delete a reply to a Google Business Profile review
 */
export async function deleteGoogleReviewReply(
  accountId: string,
  locationId: string,
  reviewId: string
): Promise<boolean> {
  const client = getOAuth2Client();
  
  if (!client || !storedRefreshToken) {
    throw new Error('Not authenticated');
  }

  client.setCredentials({ refresh_token: storedRefreshToken });
  
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${(await client.getAccessToken()).token}`,
      },
    }
  );

  return response.ok;
}

/**
 * Check if Google Business Profile is connected
 */
export function isConnected(): boolean {
  return !!(getOAuth2Client() && storedRefreshToken);
}
