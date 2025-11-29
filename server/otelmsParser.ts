/**
 * OTELMS Email Parser
 * 
 * Parses Georgian text from OTELMS daily report emails
 * Extracts revenue, booking numbers, dates, and other metrics
 */

export interface OtelmsData {
  date: Date;
  totalRevenue: number;
  totalBookings: number;
  source: string;
  channel?: string;
  notes?: string;
  rawText: string;
}

/**
 * Parse OTELMS email content (Georgian text)
 * 
 * Expected format examples:
 * - "თარიღი: 2024-01-15"
 * - "შემოსავალი: 4,850 ₾"
 * - "ჯავშნები: 12"
 * - "წყარო: Booking.com"
 */
export function parseOtelmsEmail(emailBody: string, emailSubject: string): OtelmsData | null {
  try {
    const data: Partial<OtelmsData> = {
      rawText: emailBody,
      source: 'OTELMS',
    };

    // Extract date (multiple formats)
    const datePatterns = [
      /თარიღი[:\s]+(\d{4}-\d{2}-\d{2})/i,
      /date[:\s]+(\d{4}-\d{2}-\d{2})/i,
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{4}\.\d{2}\.\d{2})/,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = emailBody.match(pattern) || emailSubject.match(pattern);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        // Try to parse different date formats
        let parsedDate: Date | null = null;
        
        if (dateStr.includes('-')) {
          parsedDate = new Date(dateStr);
        } else if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          parsedDate = new Date(`${year}-${month}-${day}`);
        } else if (dateStr.includes('.')) {
          parsedDate = new Date(dateStr.replace(/\./g, '-'));
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          data.date = parsedDate;
          break;
        }
      }
    }

    // If no date found, use today
    if (!data.date) {
      data.date = new Date();
    }

    // Extract revenue (multiple formats)
    const revenuePatterns = [
      /შემოსავალი[:\s]+([\d,]+)\s*₾/i,
      /revenue[:\s]+([\d,]+)\s*₾/i,
      /თანხა[:\s]+([\d,]+)\s*₾/i,
      /([\d,]+)\s*₾/,
      /([\d,]+)\s*GEL/i,
    ];

    for (const pattern of revenuePatterns) {
      const revenueMatch = emailBody.match(pattern);
      if (revenueMatch) {
        const revenueStr = revenueMatch[1].replace(/,/g, '');
        const revenue = parseFloat(revenueStr);
        if (!isNaN(revenue) && revenue > 0) {
          data.totalRevenue = revenue;
          break;
        }
      }
    }

    // Extract booking count
    const bookingPatterns = [
      /ჯავშნები[:\s]+(\d+)/i,
      /bookings?[:\s]+(\d+)/i,
      /რაოდენობა[:\s]+(\d+)/i,
      /(\d+)\s*ჯავშანი/i,
    ];

    for (const pattern of bookingPatterns) {
      const bookingMatch = emailBody.match(pattern);
      if (bookingMatch) {
        const count = parseInt(bookingMatch[1], 10);
        if (!isNaN(count) && count > 0) {
          data.totalBookings = count;
          break;
        }
      }
    }

    // Extract channel/source
    const channelPatterns = [
      /წყარო[:\s]+([^\n]+)/i,
      /source[:\s]+([^\n]+)/i,
      /channel[:\s]+([^\n]+)/i,
      /პლატფორმა[:\s]+([^\n]+)/i,
    ];

    for (const pattern of channelPatterns) {
      const channelMatch = emailBody.match(pattern);
      if (channelMatch) {
        data.channel = channelMatch[1].trim();
        break;
      }
    }

    // Extract notes (any additional text)
    const notesPatterns = [
      /შენიშვნა[:\s]+([^\n]+)/i,
      /notes?[:\s]+([^\n]+)/i,
      /კომენტარი[:\s]+([^\n]+)/i,
    ];

    for (const pattern of notesPatterns) {
      const notesMatch = emailBody.match(pattern);
      if (notesMatch) {
        data.notes = notesMatch[1].trim();
        break;
      }
    }

    // Validate required fields
    if (!data.totalRevenue || data.totalRevenue <= 0) {
      console.warn('[OtelmsParser] No valid revenue found in email');
      return null;
    }

    return data as OtelmsData;
  } catch (error) {
    console.error('[OtelmsParser] Failed to parse email:', error);
    return null;
  }
}

/**
 * Detect if an email is an OTELMS report
 * 
 * Checks subject line and body for OTELMS keywords
 */
export function isOtelmsEmail(emailSubject: string, emailBody: string): boolean {
  const otelmsKeywords = [
    'otelms',
    'ოტელმს',
    'დღიური ანგარიში',
    'daily report',
    'შემოსავალი',
    'revenue report',
    'booking report',
    'ჯავშნები',
  ];

  const combinedText = `${emailSubject} ${emailBody}`.toLowerCase();

  return otelmsKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()));
}

/**
 * Parse multiple OTELMS emails from a batch
 */
export function parseOtelmsEmailBatch(emails: Array<{ subject: string; body: string }>): OtelmsData[] {
  const results: OtelmsData[] = [];

  for (const email of emails) {
    if (isOtelmsEmail(email.subject, email.body)) {
      const parsed = parseOtelmsEmail(email.body, email.subject);
      if (parsed) {
        results.push(parsed);
      }
    }
  }

  return results;
}
