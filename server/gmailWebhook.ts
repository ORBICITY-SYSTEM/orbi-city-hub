import { processBookingEmail } from './googleCalendar';

/**
 * Gmail Webhook Handler for Real-time Booking Sync
 * This module processes incoming Gmail notifications and creates calendar events
 */

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
}

/**
 * Check if email is a booking confirmation
 */
export function isBookingEmail(subject: string, from: string, body: string): boolean {
  const bookingKeywords = [
    'booking confirmation',
    'reservation confirmed',
    'your booking',
    'booking.com',
    'airbnb',
    'expedia',
    'agoda',
    'hostelworld',
    'confirmation number',
    'check-in',
    'check-out',
  ];

  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  const lowerFrom = from.toLowerCase();

  // Check if from known booking platforms
  const knownPlatforms = [
    'booking.com',
    'airbnb.com',
    'expedia.com',
    'agoda.com',
    'hostelworld.com',
    'ostrovok.ru',
    'sutochno.com',
    'bronevik.com',
    'tvil.ru',
  ];

  const isFromBookingPlatform = knownPlatforms.some((platform) =>
    lowerFrom.includes(platform)
  );

  // Check if contains booking keywords
  const hasBookingKeywords = bookingKeywords.some(
    (keyword) => lowerSubject.includes(keyword) || lowerBody.includes(keyword)
  );

  return isFromBookingPlatform || hasBookingKeywords;
}

/**
 * Extract email content from Gmail message
 */
export function extractEmailContent(message: GmailMessage): {
  subject: string;
  from: string;
  body: string;
} {
  // Extract headers
  const headers = message.payload.headers;
  const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '';
  const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';

  // Extract body
  let body = '';

  // Try to get body from main payload
  if (message.payload.body.data) {
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }
  // Try to get body from parts (multipart email)
  else if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      }
    }

    // If no plain text, try HTML
    if (!body) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/html' && part.body.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // Strip HTML tags (basic)
          body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          break;
        }
      }
    }
  }

  return { subject, from, body };
}

/**
 * Process Gmail webhook notification
 * This is called when a new email arrives
 */
export async function handleGmailWebhook(message: GmailMessage): Promise<{
  processed: boolean;
  isBooking: boolean;
  calendarEventCreated: boolean;
  eventId?: string;
  error?: string;
}> {
  try {
    // Extract email content
    const { subject, from, body } = extractEmailContent(message);

    console.log('[Gmail Webhook] Processing email:', {
      messageId: message.id,
      subject,
      from: from.substring(0, 50),
    });

    // Check if it's a booking email
    if (!isBookingEmail(subject, from, body)) {
      console.log('[Gmail Webhook] Not a booking email, skipping');
      return {
        processed: true,
        isBooking: false,
        calendarEventCreated: false,
      };
    }

    console.log('[Gmail Webhook] Detected booking email, processing...');

    // Process booking and create calendar event
    const result = await processBookingEmail(body, subject);

    if (result.success) {
      console.log('[Gmail Webhook] Calendar event created:', result.eventId);
      return {
        processed: true,
        isBooking: true,
        calendarEventCreated: true,
        eventId: result.eventId,
      };
    } else {
      console.error('[Gmail Webhook] Failed to create calendar event:', result.error);
      return {
        processed: true,
        isBooking: true,
        calendarEventCreated: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error('[Gmail Webhook] Error processing webhook:', error);
    return {
      processed: false,
      isBooking: false,
      calendarEventCreated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Setup Gmail push notifications (Pub/Sub)
 * This needs to be called once to enable real-time notifications
 */
export async function setupGmailPushNotifications(): Promise<{
  success: boolean;
  error?: string;
}> {
  // This would use Gmail API to set up push notifications
  // For now, return mock success
  console.log('[Gmail Webhook] Push notifications setup (mock)');
  
  return {
    success: true,
  };
}

/**
 * Webhook endpoint handler
 * This should be exposed as POST /api/webhooks/gmail
 */
export async function gmailWebhookEndpoint(req: {
  body: {
    message: {
      data: string; // Base64 encoded Pub/Sub message
      messageId: string;
      publishTime: string;
    };
  };
}): Promise<{ status: number; body: any }> {
  try {
    // Decode Pub/Sub message
    const data = JSON.parse(
      Buffer.from(req.body.message.data, 'base64').toString('utf-8')
    );

    console.log('[Gmail Webhook] Received notification:', {
      messageId: req.body.message.messageId,
      emailAddress: data.emailAddress,
      historyId: data.historyId,
    });

    // In a real implementation, you would:
    // 1. Fetch the new messages using Gmail API
    // 2. Process each message with handleGmailWebhook()
    // 3. Store the historyId for incremental sync

    return {
      status: 200,
      body: { success: true },
    };
  } catch (error) {
    console.error('[Gmail Webhook] Error in webhook endpoint:', error);
    return {
      status: 500,
      body: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
