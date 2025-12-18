import { describe, it, expect } from 'vitest';

describe('N8N Review Response Webhook', () => {
  it('should have valid N8N_REVIEW_RESPONSE_WEBHOOK URL configured', () => {
    const webhookUrl = process.env.N8N_REVIEW_RESPONSE_WEBHOOK;
    
    // Check that the URL is defined
    expect(webhookUrl).toBeDefined();
    expect(webhookUrl).not.toBe('');
    
    // Check that it's a valid URL format
    expect(webhookUrl).toMatch(/^https:\/\/.*\.n8n\.cloud\/webhook\//);
    
    // Check that it contains a valid UUID path
    expect(webhookUrl).toMatch(/\/webhook\/[a-f0-9-]+$/);
  });

  it('should be able to reach the N8N webhook endpoint', async () => {
    const webhookUrl = process.env.N8N_REVIEW_RESPONSE_WEBHOOK;
    
    if (!webhookUrl) {
      throw new Error('N8N_REVIEW_RESPONSE_WEBHOOK is not configured');
    }

    // Send a test request to verify the webhook is reachable
    // N8N webhooks return 200 OK when they receive valid POST data
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        message: 'Webhook connectivity test from ORBI City Hub',
        timestamp: new Date().toISOString(),
      }),
    });

    // N8N webhook should respond (even if workflow doesn't process the test data)
    // Status 200 means the webhook is active and reachable
    expect(response.status).toBe(200);
  });
});
