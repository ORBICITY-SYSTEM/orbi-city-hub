import { describe, it, expect } from 'vitest';

describe('Outscraper API Integration', () => {
  it('should have valid OUTSCRAPER_API_KEY environment variable', async () => {
    const apiKey = process.env.OUTSCRAPER_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(20);
  });

  it('should successfully authenticate with Outscraper API', async () => {
    const apiKey = process.env.OUTSCRAPER_API_KEY;
    if (!apiKey) {
      throw new Error('OUTSCRAPER_API_KEY not set');
    }

    // Test API with a simple request
    const response = await fetch(
      'https://api.outscraper.com/google-maps-reviews?query=test&limit=1',
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      }
    );

    // Outscraper returns 200 for valid API key (even with pending status)
    expect([200, 202]).toContain(response.status);
    
    const data = await response.json();
    // Valid response should have status field
    expect(data).toHaveProperty('status');
    expect(['Pending', 'Success']).toContain(data.status);
  });
});
