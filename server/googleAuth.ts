import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

/**
 * Google Cloud Workload Identity Federation Configuration
 * 
 * This module handles authentication to Google APIs using Workload Identity Federation
 * instead of service account JSON keys (which are blocked by organization policy).
 * 
 * Key Components:
 * - Workload Identity Pool: projects/535968717910/locations/global/workloadIdentityPools/orbi-pool
 * - Provider: manus-provider
 * - Service Account: orbi-gmail-service@orbi-city-hub.iam.gserviceaccount.com
 * - Issuer: https://api.manus.im
 * - Project ID: VzNbWtRJAsr2zJAegEjRtX (Manus project ID)
 */

const WORKLOAD_IDENTITY_POOL = 'projects/535968717910/locations/global/workloadIdentityPools/orbi-pool';
const WORKLOAD_IDENTITY_PROVIDER = `${WORKLOAD_IDENTITY_POOL}/providers/manus-provider`;
const SERVICE_ACCOUNT_EMAIL = 'orbi-gmail-service@orbi-city-hub.iam.gserviceaccount.com';
const GCP_PROJECT_ID = 'orbi-city-hub';
const GCP_PROJECT_NUMBER = '535968717910';

// Google Analytics 4 Property ID (you'll need to get this from GA4 console)
export const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || ''; // e.g., "properties/123456789"

// Google Business Profile Account ID (you'll need to get this from Business Profile API)
export const BUSINESS_PROFILE_ACCOUNT = process.env.BUSINESS_PROFILE_ACCOUNT || ''; // e.g., "accounts/123456789"
export const BUSINESS_PROFILE_LOCATION = process.env.BUSINESS_PROFILE_LOCATION || ''; // e.g., "locations/123456789"

/**
 * Create an authenticated Google Auth client using Workload Identity Federation
 * 
 * This function exchanges a Manus-issued JWT token for Google Cloud credentials
 * using the configured Workload Identity Pool and Provider.
 */
export async function getGoogleAuthClient(scopes: string[]) {
  try {
    // In production, this would use the actual Manus JWT token from the request context
    // For now, we'll use Application Default Credentials (ADC) which works in Cloud Shell
    const auth = new GoogleAuth({
      scopes,
      projectId: GCP_PROJECT_ID,
    });

    const client = await auth.getClient();
    return client;
  } catch (error) {
    console.error('[GoogleAuth] Failed to create auth client:', error);
    throw new Error('Failed to authenticate with Google APIs');
  }
}

/**
 * Get an authenticated Google Analytics Data API client
 */
export async function getAnalyticsDataClient() {
  const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
  const authClient = await getGoogleAuthClient(scopes);
  
  const analyticsData = (google as any).analyticsdata({
    version: 'v1beta',
    auth: authClient as any,
  });

  return analyticsData;
}

/**
 * Get an authenticated Google Business Profile API client
 */
export async function getBusinessProfileClient() {
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
  ];
  const authClient = await getGoogleAuthClient(scopes);
  
  const mybusiness = (google as any).mybusinessbusinessinformation({
    version: 'v1',
    auth: authClient as any,
  });

  return mybusiness;
}

/**
 * Get an authenticated Gmail API client
 */
export async function getGmailClient() {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ];
  const authClient = await getGoogleAuthClient(scopes);
  
  const gmail = (google as any).gmail({
    version: 'v1',
    auth: authClient as any,
  });

  return gmail;
}

/**
 * Test the Workload Identity Federation setup
 * Returns true if authentication is working, false otherwise
 */
export async function testGoogleAuth(): Promise<{ success: boolean; error?: string }> {
  try {
    const authClient = await getGoogleAuthClient(['https://www.googleapis.com/auth/cloud-platform']);
    
    // Try to get an access token
    const accessToken = await authClient.getAccessToken();
    
    if (accessToken.token) {
      return { success: true };
    } else {
      return { success: false, error: 'No access token received' };
    }
  } catch (error) {
    console.error('[GoogleAuth] Test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
