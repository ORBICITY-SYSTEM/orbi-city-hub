/**
 * Gmail Booking Parser
 * Automatically fetches and parses booking emails from all distribution channels
 */

import { google } from 'googleapis';

// Distribution channels email patterns
export const CHANNEL_PATTERNS = {
  'Booking.com': {
    from: ['noreply@booking.com', 'customer.service@booking.com'],
    subject: ['Booking Confirmation', 'New Reservation'],
    color: '#003580',
  },
  'Airbnb': {
    from: ['automated@airbnb.com', 'reservations@airbnb.com'],
    subject: ['Reservation confirmed', 'You have a new reservation'],
    color: '#FF5A5F',
  },
  'Expedia': {
    from: ['expediamail@welcome.expedia.com', 'service@expedia.com'],
    subject: ['Booking Confirmation', 'Reservation Details'],
    color: '#FFCB00',
  },
  'Agoda': {
    from: ['noreply@agoda.com', 'customerservice@agoda.com'],
    subject: ['Booking Confirmed', 'New Booking'],
    color: '#00A699',
  },
  'Hostelworld': {
    from: ['bookings@hostelworld.com'],
    subject: ['Booking Confirmation'],
    color: '#F05A28',
  },
  'ostrovok.ru': {
    from: ['noreply@ostrovok.ru'],
    subject: ['Подтверждение бронирования'],
    color: '#FF6B6B',
  },
  'sutochno.com': {
    from: ['info@sutochno.com'],
    subject: ['Бронирование подтверждено'],
    color: '#4CAF50',
  },
  'bronevik.com': {
    from: ['info@bronevik.com'],
    subject: ['Бронирование'],
    color: '#2196F3',
  },
  'tvil.ru': {
    from: ['noreply@tvil.ru'],
    subject: ['Бронирование'],
    color: '#9C27B0',
  },
  'Direct': {
    from: ['info@orbicitybatumi.com', 'reservations@orbicitybatumi.com'],
    subject: ['Booking Request', 'Reservation'],
    color: '#FF9800',
  },
};

export interface ParsedBooking {
  channel: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomType?: string;
  totalPrice: number;
  currency: string;
  bookingId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  rawEmailId: string;
  receivedAt: Date;
}

/**
 * Initialize Gmail API client
 */
export async function getGmailClient() {
  // In production, use OAuth2 credentials from environment
  // For now, we'll use the MCP Gmail integration
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  auth.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth });
}

/**
 * Fetch unread booking emails
 */
export async function fetchBookingEmails(since?: Date): Promise<any[]> {
  try {
    const gmail = await getGmailClient();
    
    // Build query for all booking channels
    const fromQueries = Object.values(CHANNEL_PATTERNS)
      .flatMap(pattern => pattern.from)
      .map(email => `from:${email}`)
      .join(' OR ');
    
    const query = `is:unread (${fromQueries})`;
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
    });

    if (!response.data.messages) {
      return [];
    }

    // Fetch full message details
    const messages = await Promise.all(
      response.data.messages.map(async (msg) => {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'full',
        });
        return details.data;
      })
    );

    return messages;
  } catch (error) {
    console.error('[Gmail] Error fetching emails:', error);
    return [];
  }
}

/**
 * Parse booking details from email
 */
export function parseBookingEmail(message: any): ParsedBooking | null {
  try {
    const headers = message.payload.headers;
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';

    // Detect channel
    let channel = 'Unknown';
    for (const [channelName, pattern] of Object.entries(CHANNEL_PATTERNS)) {
      if (pattern.from.some(email => from.toLowerCase().includes(email.toLowerCase()))) {
        channel = channelName;
        break;
      }
    }

    // Get email body
    let body = '';
    if (message.payload.parts) {
      const textPart = message.payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    // Extract booking details using regex patterns
    const guestName = extractGuestName(body, channel);
    const guestEmail = extractEmail(body);
    const checkIn = extractCheckIn(body);
    const checkOut = extractCheckOut(body);
    const totalPrice = extractPrice(body);
    const bookingId = extractBookingId(body, channel);

    if (!guestName || !checkIn || !checkOut) {
      console.warn('[Gmail Parser] Incomplete booking data:', { guestName, checkIn, checkOut });
      return null;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      channel,
      guestName,
      guestEmail: guestEmail || '',
      checkIn,
      checkOut,
      nights,
      guests: 2, // Default, can be extracted if available
      totalPrice: totalPrice || 0,
      currency: '₾',
      bookingId: bookingId || message.id,
      status: 'confirmed',
      rawEmailId: message.id,
      receivedAt: new Date(date),
    };
  } catch (error) {
    console.error('[Gmail Parser] Error parsing email:', error);
    return null;
  }
}

// Helper extraction functions
function extractGuestName(body: string, channel: string): string | null {
  const patterns = [
    /Guest(?:\s+Name)?:\s*([A-Za-z\s]+)/i,
    /Name:\s*([A-Za-z\s]+)/i,
    /Гость:\s*([А-Яа-яA-Za-z\s]+)/i,
    /Имя:\s*([А-Яа-яA-Za-z\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

function extractEmail(body: string): string | null {
  const match = body.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractCheckIn(body: string): string | null {
  const patterns = [
    /Check-in:\s*(\d{4}-\d{2}-\d{2})/i,
    /Check-in:\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /Заезд:\s*(\d{2}\.\d{2}\.\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return normalizeDate(match[1]);
  }

  return null;
}

function extractCheckOut(body: string): string | null {
  const patterns = [
    /Check-out:\s*(\d{4}-\d{2}-\d{2})/i,
    /Check-out:\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /Выезд:\s*(\d{2}\.\d{2}\.\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return normalizeDate(match[1]);
  }

  return null;
}

function extractPrice(body: string): number | null {
  const patterns = [
    /Total:\s*[₾$€£]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /Price:\s*[₾$€£]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /Сумма:\s*(\d+(?:\s\d{3})*(?:,\d{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/[,\s]/g, ''));
      return isNaN(price) ? null : price;
    }
  }

  return null;
}

function extractBookingId(body: string, channel: string): string | null {
  const patterns = [
    /Booking\s+(?:ID|Number|Reference):\s*([A-Z0-9-]+)/i,
    /Confirmation\s+(?:ID|Number|Code):\s*([A-Z0-9-]+)/i,
    /Номер\s+бронирования:\s*([A-Z0-9-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function normalizeDate(dateStr: string): string {
  // Try to parse various date formats and return YYYY-MM-DD
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Mark email as read
 */
export async function markEmailAsRead(messageId: string): Promise<void> {
  try {
    const gmail = await getGmailClient();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  } catch (error) {
    console.error('[Gmail] Error marking email as read:', error);
  }
}
