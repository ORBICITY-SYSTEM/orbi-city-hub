import { describe, it, expect } from 'vitest';

describe('Telegram Bot Token Validation', () => {
  it('should have TELEGRAM_BOT_TOKEN environment variable set', () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toBeDefined();
    expect(token).not.toBe('');
    expect(token?.length).toBeGreaterThan(20);
  });

  it('should validate Telegram Bot token format', () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    // Telegram bot tokens have format: <bot_id>:<hash>
    // e.g., 8208457622:AAGuSKUOvYwNEQQeGcHjuHZWsRqLK8i7QPg
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
  });

  it('should successfully call Telegram getMe API', async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN not set');
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.ok).toBe(true);
    expect(data.result).toBeDefined();
    expect(data.result.is_bot).toBe(true);
    expect(data.result.id).toBeDefined();
    expect(data.result.username).toBeDefined();
    
    console.log('Telegram Bot Info:', {
      id: data.result.id,
      username: data.result.username,
      first_name: data.result.first_name
    });
  });
});
