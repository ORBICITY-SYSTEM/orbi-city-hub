/**
 * Gmail Booking Fetcher using MCP Gmail Tools
 * Automatically fetches and parses booking emails from all distribution channels
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Distribution channels email patterns
export const CHANNEL_PATTERNS: Record<string, { from: string[]; color: string }> = {
  'Booking.com': {
    from: ['noreply@booking.com', 'customer.service@booking.com'],
    color: '#003580',
  },
  'Airbnb': {
    from: ['automated@airbnb.com', 'reservations@airbnb.com'],
    color: '#FF5A5F',
  },
  'Expedia': {
    from: ['expediamail@welcome.expedia.com', 'service@expedia.com'],
    color: '#FFCB00',
  },
  'Agoda': {
    from: ['noreply@agoda.com', 'customerservice@agoda.com'],
    color: '#00A699',
  },
  'Hostelworld': {
    from: ['bookings@hostelworld.com'],
    color: '#F05A28',
  },
  'ostrovok.ru': {
    from: ['noreply@ostrovok.ru'],
    color: '#FF6B6B',
  },
  'sutochno.com': {
    from: ['info@sutochno.com'],
    color: '#4CAF50',
  },
  'bronevik.com': {
    from: ['info@bronevik.com'],
    color: '#2196F3',
  },
  'tvil.ru': {
    from: ['noreply@tvil.ru'],
    color: '#9C27B0',
  },
  'Direct': {
    from: ['info@orbicitybatumi.com', 'reservations@orbicitybatumi.com'],
    color: '#FF9800',
  },
  'TikTok': {
    from: ['noreply@tiktok.com'],
    color: '#000000',
  },
  'YouTube': {
    from: ['noreply@youtube.com'],
    color: '#FF0000',
  },
  'TripAdvisor': {
    from: ['noreply@tripadvisor.com'],
    color: '#00AF87',
  },
  'Facebook': {
    from: ['notification@facebookmail.com'],
    color: '#1877F2',
  },
  'Instagram': {
    from: ['no-reply@mail.instagram.com'],
    color: '#E4405F',
  },
};

interface ParsedBooking {
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
 * Search Gmail messages using MCP
 */
async function searchGmailMessages(query: string, maxResults: number = 50): Promise<any> {
  try {
    const { stdout } = await execAsync(
      `manus-mcp-cli tool call gmail_search_messages --server gmail --input '${JSON.stringify({ q: query, max_results: maxResults })}'`
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error('[Gmail MCP] Search error:', error);
    return { messages: [] };
  }
}

/**
 * Read Gmail threads using MCP
 */
async function readGmailThreads(threadIds: string[]): Promise<any> {
  try {
    const { stdout } = await execAsync(
      `manus-mcp-cli tool call gmail_read_threads --server gmail --input '${JSON.stringify({ thread_ids: threadIds, include_full_messages: true })}'`
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error('[Gmail MCP] Read error:', error);
    return { threads: [] };
  }
}

/**
 * Parse booking details from email content
 */
function parseBookingFromEmail(message: any): ParsedBooking | null {
  try {
    const from = message.from || '';
    const subject = message.subject || '';
    const body = message.body || '';
    const date = message.date || new Date().toISOString();

    // Detect channel
    let channel = 'Unknown';
    for (const [channelName, pattern] of Object.entries(CHANNEL_PATTERNS)) {
      if (pattern.from.some(email => from.toLowerCase().includes(email.toLowerCase()))) {
        channel = channelName;
        break;
      }
    }

    // Extract booking details
    const guestName = extractGuestName(body, subject);
    const guestEmail = extractEmail(body);
    const checkIn = extractCheckIn(body);
    const checkOut = extractCheckOut(body);
    const totalPrice = extractPrice(body);
    const bookingId = extractBookingId(body, subject);

    if (!guestName || !checkIn || !checkOut) {
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
      guests: 2,
      totalPrice: totalPrice || 0,
      currency: '₾',
      bookingId: bookingId || message.id,
      status: 'confirmed',
      rawEmailId: message.id,
      receivedAt: new Date(date),
    };
  } catch (error) {
    console.error('[Gmail Parser] Error:', error);
    return null;
  }
}

// Helper extraction functions
function extractGuestName(body: string, subject: string): string | null {
  const patterns = [
    /Guest(?:\s+Name)?:\s*([A-Za-z\s]+)/i,
    /Name:\s*([A-Za-z\s]+)/i,
    /Гость:\s*([А-Яа-яA-Za-z\s]+)/i,
    /Имя:\s*([А-Яа-яA-Za-z\s]+)/i,
    /for\s+([A-Za-z\s]+)/i,
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
    /Arrival:\s*(\d{4}-\d{2}-\d{2})/i,
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
    /Departure:\s*(\d{4}-\d{2}-\d{2})/i,
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
    /Amount:\s*[₾$€£]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
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

function extractBookingId(body: string, subject: string): string | null {
  const patterns = [
    /Booking\s+(?:ID|Number|Reference):\s*([A-Z0-9-]+)/i,
    /Confirmation\s+(?:ID|Number|Code):\s*([A-Z0-9-]+)/i,
    /Номер\s+бронирования:\s*([A-Z0-9-]+)/i,
    /Reservation\s+(?:ID|Number):\s*([A-Z0-9-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern) || subject.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function normalizeDate(dateStr: string): string {
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

export const gmailRouter = router({
  /**
   * Fetch new bookings from Gmail
   */
  fetchBookings: protectedProcedure
    .input(z.object({
      daysBack: z.number().default(7),
    }))
    .mutation(async ({ input }) => {
      try {
        // Build search query for all booking channels
        const fromQueries = Object.values(CHANNEL_PATTERNS)
          .flatMap(pattern => pattern.from)
          .map(email => `from:${email}`)
          .join(' OR ');
        
        // Search for unread booking emails
        const query = `is:unread (${fromQueries}) newer_than:${input.daysBack}d`;
        
        const searchResult = await searchGmailMessages(query, 100);
        
        if (!searchResult.messages || searchResult.messages.length === 0) {
          return { bookings: [], count: 0 };
        }

        // Extract thread IDs
        const threadIds = searchResult.messages.map((msg: any) => msg.threadId);
        
        // Read full threads
        const threadsResult = await readGmailThreads(threadIds);
        
        if (!threadsResult.threads) {
          return { bookings: [], count: 0 };
        }

        // Parse bookings from emails
        const bookings: ParsedBooking[] = [];
        
        for (const thread of threadsResult.threads) {
          if (thread.messages && thread.messages.length > 0) {
            const message = thread.messages[0]; // Get first message in thread
            const booking = parseBookingFromEmail(message);
            if (booking) {
              bookings.push(booking);
            }
          }
        }

        return {
          bookings,
          count: bookings.length,
        };
      } catch (error) {
        console.error('[Gmail Router] Error fetching bookings:', error);
        throw new Error('Failed to fetch bookings from Gmail');
      }
    }),

  /**
   * Get channel statistics
   */
  getChannelStats: protectedProcedure
    .query(async () => {
      return {
        channels: Object.keys(CHANNEL_PATTERNS).map(name => ({
          name,
          color: CHANNEL_PATTERNS[name].color,
          active: true,
        })),
        totalChannels: Object.keys(CHANNEL_PATTERNS).length,
      };
    }),
});
