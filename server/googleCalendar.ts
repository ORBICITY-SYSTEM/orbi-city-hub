import { google } from 'googleapis';

// Initialize Google Calendar client
let calendarClient: ReturnType<typeof google.calendar> | null = null;

function getCalendarClient() {
  if (!calendarClient && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      calendarClient = google.calendar({ version: 'v3', auth });
    } catch (error) {
      console.warn('[Google Calendar] Failed to initialize client:', error);
      return null;
    }
  }
  return calendarClient;
}

export interface BookingEvent {
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  roomNumber: string;
  confirmationNumber: string;
  channel: string;
  notes?: string;
}

/**
 * Create a calendar event for a booking
 */
export async function createBookingCalendarEvent(
  booking: BookingEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const client = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!client) {
    console.warn('[Google Calendar] Client not initialized - skipping calendar event creation');
    return { success: false, error: 'Calendar client not configured' };
  }

  try {
    const event = {
      summary: `${booking.guestName} - Room ${booking.roomNumber}`,
      description: `
Booking Confirmation: ${booking.confirmationNumber}
Channel: ${booking.channel}
Guest: ${booking.guestName}
Email: ${booking.guestEmail}
Room: ${booking.roomNumber}
${booking.notes ? `\nNotes: ${booking.notes}` : ''}
      `.trim(),
      start: {
        dateTime: booking.checkIn.toISOString(),
        timeZone: 'Asia/Tbilisi',
      },
      end: {
        dateTime: booking.checkOut.toISOString(),
        timeZone: 'Asia/Tbilisi',
      },
      attendees: [
        {
          email: booking.guestEmail,
          displayName: booking.guestName,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
      colorId: '9', // Blue color for bookings
    };

    const response = await client.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    console.log('[Google Calendar] Event created:', response.data.id);
    return {
      success: true,
      eventId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('[Google Calendar] Error creating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing calendar event
 */
export async function updateBookingCalendarEvent(
  eventId: string,
  booking: Partial<BookingEvent>
): Promise<{ success: boolean; error?: string }> {
  const client = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!client) {
    return { success: false, error: 'Calendar client not configured' };
  }

  try {
    const updates: any = {};

    if (booking.guestName || booking.roomNumber) {
      updates.summary = `${booking.guestName} - Room ${booking.roomNumber}`;
    }

    if (booking.checkIn) {
      updates.start = {
        dateTime: booking.checkIn.toISOString(),
        timeZone: 'Asia/Tbilisi',
      };
    }

    if (booking.checkOut) {
      updates.end = {
        dateTime: booking.checkOut.toISOString(),
        timeZone: 'Asia/Tbilisi',
      };
    }

    await client.events.patch({
      calendarId,
      eventId,
      requestBody: updates,
      sendUpdates: 'all',
    });

    console.log('[Google Calendar] Event updated:', eventId);
    return { success: true };
  } catch (error) {
    console.error('[Google Calendar] Error updating event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a calendar event (for cancelled bookings)
 */
export async function deleteBookingCalendarEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!client) {
    return { success: false, error: 'Calendar client not configured' };
  }

  try {
    await client.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify attendees of cancellation
    });

    console.log('[Google Calendar] Event deleted:', eventId);
    return { success: true };
  } catch (error) {
    console.error('[Google Calendar] Error deleting event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse booking details from Gmail message
 * This function extracts booking information from email content
 */
export function parseBookingFromEmail(emailContent: string, subject: string): BookingEvent | null {
  try {
    // Common patterns for booking emails from various platforms
    const patterns = {
      // Booking.com
      bookingCom: {
        confirmationNumber: /Booking\.com confirmation number:\s*(\d+)/i,
        guestName: /Guest name:\s*([^\n]+)/i,
        checkIn: /Check-in:\s*(\d{4}-\d{2}-\d{2})/i,
        checkOut: /Check-out:\s*(\d{4}-\d{2}-\d{2})/i,
      },
      // Airbnb
      airbnb: {
        confirmationNumber: /Confirmation code:\s*([A-Z0-9]+)/i,
        guestName: /Guest:\s*([^\n]+)/i,
        checkIn: /Check in:\s*([^\n]+)/i,
        checkOut: /Check out:\s*([^\n]+)/i,
      },
      // Generic patterns
      generic: {
        email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
        dates: /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      },
    };

    // Determine channel from subject or content
    let channel = 'Direct';
    if (emailContent.includes('Booking.com') || subject.includes('Booking.com')) {
      channel = 'Booking.com';
    } else if (emailContent.includes('Airbnb') || subject.includes('Airbnb')) {
      channel = 'Airbnb';
    } else if (emailContent.includes('Expedia') || subject.includes('Expedia')) {
      channel = 'Expedia';
    } else if (emailContent.includes('Agoda') || subject.includes('Agoda')) {
      channel = 'Agoda';
    }

    // Extract confirmation number
    const confirmationMatch = 
      emailContent.match(patterns.bookingCom.confirmationNumber) ||
      emailContent.match(patterns.airbnb.confirmationNumber);
    
    if (!confirmationMatch) {
      console.warn('[Google Calendar] Could not extract confirmation number from email');
      return null;
    }

    const confirmationNumber = confirmationMatch[1];

    // Extract guest name
    const guestNameMatch =
      emailContent.match(patterns.bookingCom.guestName) ||
      emailContent.match(patterns.airbnb.guestName);
    
    const guestName = guestNameMatch ? guestNameMatch[1].trim() : 'Guest';

    // Extract guest email
    const emailMatch = emailContent.match(patterns.generic.email);
    const guestEmail = emailMatch ? emailMatch[0] : '';

    // Extract check-in and check-out dates
    const checkInMatch = emailContent.match(patterns.bookingCom.checkIn);
    const checkOutMatch = emailContent.match(patterns.bookingCom.checkOut);

    if (!checkInMatch || !checkOutMatch) {
      console.warn('[Google Calendar] Could not extract dates from email');
      return null;
    }

    const checkIn = new Date(checkInMatch[1]);
    const checkOut = new Date(checkOutMatch[1]);

    // Extract room number (if available)
    const roomMatch = emailContent.match(/Room\s*#?\s*([A-Z]?\d+)/i);
    const roomNumber = roomMatch ? roomMatch[1] : 'TBD';

    return {
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      roomNumber,
      confirmationNumber,
      channel,
      notes: `Auto-imported from ${channel} email`,
    };
  } catch (error) {
    console.error('[Google Calendar] Error parsing booking from email:', error);
    return null;
  }
}

/**
 * Process new booking email and create calendar event
 * This is called by the Gmail webhook/polling system
 */
export async function processBookingEmail(
  emailContent: string,
  subject: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const booking = parseBookingFromEmail(emailContent, subject);

  if (!booking) {
    return {
      success: false,
      error: 'Could not parse booking details from email',
    };
  }

  return await createBookingCalendarEvent(booking);
}
