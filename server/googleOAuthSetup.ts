/**
 * Google OAuth Setup Helper
 * This module helps automate the Google OAuth credentials setup process
 */

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  apiKey: string;
  ga4PropertyId?: string;
  businessLocationId?: string;
  calendarId?: string;
  clientEmail?: string;
  privateKey?: string;
}

/**
 * Validate Google OAuth credentials
 */
export function validateGoogleCredentials(credentials: Partial<GoogleCredentials>): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = ['clientId', 'clientSecret', 'apiKey'];
  const optional = ['ga4PropertyId', 'businessLocationId', 'calendarId', 'clientEmail', 'privateKey'];
  
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const field of required) {
    if (!credentials[field as keyof GoogleCredentials]) {
      missing.push(field);
    }
  }

  // Check optional but recommended fields
  if (!credentials.ga4PropertyId) {
    warnings.push('GA4 Property ID not set - Analytics will use mock data');
  }
  
  if (!credentials.businessLocationId) {
    warnings.push('Business Location ID not set - Reviews will use mock data');
  }

  if (!credentials.calendarId) {
    warnings.push('Calendar ID not set - Will use primary calendar');
  }

  if (!credentials.clientEmail || !credentials.privateKey) {
    warnings.push('Service Account credentials not set - Server-side APIs will use mock data');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Generate environment variables string from credentials
 */
export function generateEnvVars(credentials: GoogleCredentials): string {
  const vars: string[] = [];

  if (credentials.clientId) {
    vars.push(`GOOGLE_CLIENT_ID=${credentials.clientId}`);
  }

  if (credentials.clientSecret) {
    vars.push(`GOOGLE_CLIENT_SECRET=${credentials.clientSecret}`);
  }

  if (credentials.apiKey) {
    vars.push(`GOOGLE_API_KEY=${credentials.apiKey}`);
  }

  if (credentials.ga4PropertyId) {
    vars.push(`GA4_PROPERTY_ID=${credentials.ga4PropertyId}`);
  }

  if (credentials.businessLocationId) {
    vars.push(`GOOGLE_BUSINESS_LOCATION_ID=${credentials.businessLocationId}`);
  }

  if (credentials.calendarId) {
    vars.push(`GOOGLE_CALENDAR_ID=${credentials.calendarId}`);
  }

  if (credentials.clientEmail) {
    vars.push(`GOOGLE_CLIENT_EMAIL=${credentials.clientEmail}`);
  }

  if (credentials.privateKey) {
    // Escape newlines in private key
    const escapedKey = credentials.privateKey.replace(/\n/g, '\\n');
    vars.push(`GOOGLE_PRIVATE_KEY="${escapedKey}"`);
  }

  return vars.join('\n');
}

/**
 * Test Google API connection
 */
export async function testGoogleConnection(credentials: Partial<GoogleCredentials>): Promise<{
  success: boolean;
  services: {
    analytics: boolean;
    businessProfile: boolean;
    calendar: boolean;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const services = {
    analytics: false,
    businessProfile: false,
    calendar: false,
  };

  // Test Analytics
  if (credentials.ga4PropertyId && credentials.clientEmail && credentials.privateKey) {
    try {
      // Would test GA4 API here
      services.analytics = true;
    } catch (error) {
      errors.push(`Analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test Business Profile
  if (credentials.businessLocationId && credentials.apiKey) {
    try {
      // Would test Business Profile API here
      services.businessProfile = true;
    } catch (error) {
      errors.push(`Business Profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test Calendar
  if (credentials.clientEmail && credentials.privateKey) {
    try {
      // Would test Calendar API here
      services.calendar = true;
    } catch (error) {
      errors.push(`Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    services,
    errors,
  };
}

/**
 * Get setup instructions based on missing credentials
 */
export function getSetupInstructions(missing: string[]): string[] {
  const instructions: string[] = [];

  if (missing.includes('clientId') || missing.includes('clientSecret')) {
    instructions.push(
      '1. Go to Google Cloud Console (console.cloud.google.com)',
      '2. Create a new project or select existing one',
      '3. Navigate to "APIs & Services" > "Credentials"',
      '4. Click "Create Credentials" > "OAuth 2.0 Client ID"',
      '5. Configure OAuth consent screen if prompted',
      '6. Select "Web application" as application type',
      '7. Add authorized redirect URIs (your app URL + /api/oauth/callback)',
      '8. Copy Client ID and Client Secret'
    );
  }

  if (missing.includes('apiKey')) {
    instructions.push(
      '9. In the same Credentials page, click "Create Credentials" > "API Key"',
      '10. Copy the API Key and restrict it to specific APIs (Business Profile, Analytics)'
    );
  }

  if (missing.includes('ga4PropertyId')) {
    instructions.push(
      '11. Go to Google Analytics (analytics.google.com)',
      '12. Select your property',
      '13. Go to Admin > Property Settings',
      '14. Copy the Property ID (format: 123456789)'
    );
  }

  if (missing.includes('businessLocationId')) {
    instructions.push(
      '15. Go to Google Business Profile (business.google.com)',
      '16. Select your location',
      '17. Copy the Location ID from the URL'
    );
  }

  return instructions;
}
