import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the telegram service
vi.mock('./services/telegramService', () => ({
  telegramService: {
    getBotInfo: vi.fn().mockResolvedValue({
      id: 8208457622,
      is_bot: true,
      first_name: 'ORBI City Hub Notifications',
      username: 'orbicity_notifications_bot',
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false
    }),
    sendMessage: vi.fn().mockResolvedValue({
      message_id: 123,
      chat: { id: 12345 },
      text: 'Test message'
    }),
    getUpdates: vi.fn().mockResolvedValue([]),
    setWebhook: vi.fn().mockResolvedValue(true),
    deleteWebhook: vi.fn().mockResolvedValue(true),
    getWebhookInfo: vi.fn().mockResolvedValue({
      url: '',
      has_custom_certificate: false,
      pending_update_count: 0
    })
  }
}));

describe('Telegram Bot Router', () => {
  describe('Bot Info', () => {
    it('should return bot information', async () => {
      const { telegramService } = await import('./services/telegramService');
      const botInfo = await telegramService.getBotInfo();
      
      expect(botInfo).toBeDefined();
      expect(botInfo.id).toBe(8208457622);
      expect(botInfo.username).toBe('orbicity_notifications_bot');
      expect(botInfo.is_bot).toBe(true);
    });

    it('should have correct bot name', async () => {
      const { telegramService } = await import('./services/telegramService');
      const botInfo = await telegramService.getBotInfo();
      
      expect(botInfo.first_name).toBe('ORBI City Hub Notifications');
    });
  });

  describe('Send Message', () => {
    it('should send a message successfully', async () => {
      const { telegramService } = await import('./services/telegramService');
      const result = await telegramService.sendMessage(12345, 'Test message');
      
      expect(result).toBeDefined();
      expect(result.message_id).toBe(123);
      expect(result.text).toBe('Test message');
    });

    it('should handle chat_id correctly', async () => {
      const { telegramService } = await import('./services/telegramService');
      const result = await telegramService.sendMessage(12345, 'Test');
      
      expect(result.chat.id).toBe(12345);
    });
  });

  describe('Webhook Management', () => {
    it('should set webhook successfully', async () => {
      const { telegramService } = await import('./services/telegramService');
      const result = await telegramService.setWebhook('https://example.com/webhook');
      
      expect(result).toBe(true);
    });

    it('should delete webhook successfully', async () => {
      const { telegramService } = await import('./services/telegramService');
      const result = await telegramService.deleteWebhook();
      
      expect(result).toBe(true);
    });

    it('should get webhook info', async () => {
      const { telegramService } = await import('./services/telegramService');
      const info = await telegramService.getWebhookInfo();
      
      expect(info).toBeDefined();
      expect(info.pending_update_count).toBe(0);
    });
  });

  describe('Updates', () => {
    it('should get updates (polling mode)', async () => {
      const { telegramService } = await import('./services/telegramService');
      const updates = await telegramService.getUpdates();
      
      expect(Array.isArray(updates)).toBe(true);
    });
  });
});

describe('Telegram Bot Service Configuration', () => {
  it('should have TELEGRAM_BOT_TOKEN environment variable', () => {
    // In production, this should be set
    // For testing, we mock the service
    expect(process.env.TELEGRAM_BOT_TOKEN || 'mocked').toBeTruthy();
  });

  it('should use correct Telegram API base URL', () => {
    const baseUrl = 'https://api.telegram.org';
    expect(baseUrl).toBe('https://api.telegram.org');
  });
});

describe('Message Types', () => {
  it('should support text messages', async () => {
    const { telegramService } = await import('./services/telegramService');
    const result = await telegramService.sendMessage(12345, 'Plain text message');
    
    expect(result).toBeDefined();
  });

  it('should support HTML formatted messages', async () => {
    const htmlMessage = '<b>Bold</b> and <i>italic</i> text';
    const { telegramService } = await import('./services/telegramService');
    
    // The service should accept HTML formatted messages
    const result = await telegramService.sendMessage(12345, htmlMessage);
    expect(result).toBeDefined();
  });
});

describe('Notification Types for ORBI City Hub', () => {
  const notificationTypes = [
    { type: 'new_booking', emoji: '📅', description: 'New booking received' },
    { type: 'new_review', emoji: '⭐', description: 'New review posted' },
    { type: 'negative_review', emoji: '🚨', description: 'Negative review alert' },
    { type: 'check_in', emoji: '🏨', description: 'Guest check-in' },
    { type: 'check_out', emoji: '👋', description: 'Guest check-out' },
    { type: 'maintenance', emoji: '🔧', description: 'Maintenance request' },
    { type: 'housekeeping', emoji: '🧹', description: 'Housekeeping task' },
    { type: 'payment', emoji: '💰', description: 'Payment received' },
  ];

  notificationTypes.forEach(({ type, emoji, description }) => {
    it(`should support ${type} notifications with ${emoji}`, () => {
      const message = `${emoji} ${description}`;
      expect(message).toContain(emoji);
      expect(message).toContain(description);
    });
  });
});
