/**
 * Telegram Bot Service
 * Handles all Telegram Bot API interactions for guest communication
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  language_code?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface SendMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
}

class TelegramService {
  private token: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  private get apiUrl(): string {
    return `${TELEGRAM_API_BASE}${this.token}`;
  }

  /**
   * Get bot information
   */
  async getMe(): Promise<{ ok: boolean; result?: TelegramUser; description?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      return await response.json();
    } catch (error) {
      console.error('[Telegram] getMe error:', error);
      return { ok: false, description: 'Failed to connect to Telegram API' };
    }
  }

  /**
   * Send a text message to a chat
   */
  async sendMessage(
    chatId: number | string,
    text: string,
    options: SendMessageOptions = {}
  ): Promise<{ ok: boolean; result?: TelegramMessage; description?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options.parse_mode || 'HTML',
          disable_web_page_preview: options.disable_web_page_preview,
          disable_notification: options.disable_notification,
          reply_to_message_id: options.reply_to_message_id,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('[Telegram] sendMessage error:', error);
      return { ok: false, description: 'Failed to send message' };
    }
  }

  /**
   * Get recent updates (messages sent to the bot)
   */
  async getUpdates(offset?: number, limit: number = 100): Promise<{ ok: boolean; result?: TelegramUpdate[]; description?: string }> {
    try {
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`${this.apiUrl}/getUpdates?${params}`);
      return await response.json();
    } catch (error) {
      console.error('[Telegram] getUpdates error:', error);
      return { ok: false, description: 'Failed to get updates' };
    }
  }

  /**
   * Set webhook for receiving updates
   */
  async setWebhook(url: string): Promise<{ ok: boolean; description?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return await response.json();
    } catch (error) {
      console.error('[Telegram] setWebhook error:', error);
      return { ok: false, description: 'Failed to set webhook' };
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(): Promise<{ ok: boolean; description?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/deleteWebhook`);
      return await response.json();
    } catch (error) {
      console.error('[Telegram] deleteWebhook error:', error);
      return { ok: false, description: 'Failed to delete webhook' };
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo(): Promise<{ ok: boolean; result?: any; description?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/getWebhookInfo`);
      return await response.json();
    } catch (error) {
      console.error('[Telegram] getWebhookInfo error:', error);
      return { ok: false, description: 'Failed to get webhook info' };
    }
  }

  /**
   * Send booking confirmation to guest
   */
  async sendBookingConfirmation(
    chatId: number | string,
    guestName: string,
    studioName: string,
    checkIn: string,
    checkOut: string,
    confirmationCode: string
  ): Promise<{ ok: boolean; result?: TelegramMessage; description?: string }> {
    const message = `
🏨 <b>Booking Confirmation</b>

Dear <b>${guestName}</b>,

Your booking has been confirmed!

📍 <b>Property:</b> ${studioName}
📅 <b>Check-in:</b> ${checkIn}
📅 <b>Check-out:</b> ${checkOut}
🔑 <b>Confirmation Code:</b> <code>${confirmationCode}</code>

We look forward to welcoming you!

<i>ORBI City Hub</i>
    `.trim();

    return this.sendMessage(chatId, message);
  }

  /**
   * Send check-in reminder to guest
   */
  async sendCheckInReminder(
    chatId: number | string,
    guestName: string,
    studioName: string,
    checkInDate: string,
    checkInTime: string = '14:00'
  ): Promise<{ ok: boolean; result?: TelegramMessage; description?: string }> {
    const message = `
⏰ <b>Check-in Reminder</b>

Dear <b>${guestName}</b>,

Your check-in is tomorrow!

📍 <b>Property:</b> ${studioName}
📅 <b>Date:</b> ${checkInDate}
🕐 <b>Time:</b> ${checkInTime}

Please let us know your expected arrival time.

<i>ORBI City Hub</i>
    `.trim();

    return this.sendMessage(chatId, message);
  }

  /**
   * Send review request to guest
   */
  async sendReviewRequest(
    chatId: number | string,
    guestName: string,
    studioName: string,
    reviewLink: string
  ): Promise<{ ok: boolean; result?: TelegramMessage; description?: string }> {
    const message = `
⭐ <b>How was your stay?</b>

Dear <b>${guestName}</b>,

Thank you for staying at <b>${studioName}</b>!

We hope you had a wonderful experience. Your feedback helps us improve and helps other travelers make informed decisions.

Would you mind leaving us a review?

🔗 <a href="${reviewLink}">Leave a Review</a>

Thank you for your support!

<i>ORBI City Hub</i>
    `.trim();

    return this.sendMessage(chatId, message);
  }

  /**
   * Send custom notification
   */
  async sendNotification(
    chatId: number | string,
    title: string,
    body: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info'
  ): Promise<{ ok: boolean; result?: TelegramMessage; description?: string }> {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      error: '❌',
    };

    const message = `
${icons[type]} <b>${title}</b>

${body}

<i>ORBI City Hub</i>
    `.trim();

    return this.sendMessage(chatId, message);
  }
}

export const telegramService = new TelegramService();
export type { TelegramUser, TelegramMessage, TelegramUpdate, SendMessageOptions };
