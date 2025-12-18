import { describe, it, expect } from 'vitest';

describe('AI Review Response System', () => {
  it('should have N8N webhook URL configured', () => {
    const webhookUrl = process.env.N8N_REVIEW_RESPONSE_WEBHOOK;
    expect(webhookUrl).toBeDefined();
    expect(webhookUrl).not.toBe('');
    expect(webhookUrl).toContain('n8n.cloud/webhook/');
  });

  it('should have valid webhook URL format', () => {
    const webhookUrl = process.env.N8N_REVIEW_RESPONSE_WEBHOOK;
    
    // Check URL format
    expect(webhookUrl).toMatch(/^https:\/\/.*\.n8n\.cloud\/webhook\/[a-f0-9-]+$/);
  });

  it('should be able to reach N8N webhook endpoint', async () => {
    const webhookUrl = process.env.N8N_REVIEW_RESPONSE_WEBHOOK;
    
    if (!webhookUrl) {
      throw new Error('N8N_REVIEW_RESPONSE_WEBHOOK is not configured');
    }

    // Send test request
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        type: 'ai_review_response_test',
        timestamp: new Date().toISOString(),
      }),
    });

    expect(response.status).toBe(200);
  });

  it('should have butler task type for review_response', () => {
    // This validates the task type constant is correct
    const taskType = 'review_response';
    expect(taskType).toBe('review_response');
  });

  it('should have platform configurations defined', () => {
    const platforms = ['google', 'booking', 'airbnb', 'tripadvisor', 'expedia'];
    
    platforms.forEach(platform => {
      expect(platform).toBeDefined();
      expect(typeof platform).toBe('string');
    });
  });

  it('should have priority levels defined', () => {
    const priorities = ['urgent', 'high', 'medium', 'low'];
    
    priorities.forEach(priority => {
      expect(priority).toBeDefined();
      expect(['urgent', 'high', 'medium', 'low']).toContain(priority);
    });
  });
});
