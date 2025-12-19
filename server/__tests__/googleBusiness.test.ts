import { describe, it, expect } from 'vitest';

describe('Google Business Profile API Credentials', () => {
  it('should have GOOGLE_BUSINESS_CLIENT_ID set', () => {
    const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).not.toBe('');
    expect(clientId).toContain('.apps.googleusercontent.com');
  });

  it('should have GOOGLE_BUSINESS_CLIENT_SECRET set', () => {
    const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret).not.toBe('');
    expect(clientSecret?.startsWith('GOCSPX-')).toBe(true);
  });
});
