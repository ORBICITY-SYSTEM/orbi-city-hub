/**
 * Booking Revenue Tracker
 * Extracts booking data from emails and auto-updates Finance Dashboard
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";

export interface BookingData {
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  studioNumber: string;
  totalPrice: number;
  currency: string;
  bookingSource: string;
}

const BOOKING_EXTRACTION_PROMPT = `You are an AI assistant that extracts booking information from emails.

Extract the following information from the email:
- Guest name
- Check-in date
- Check-out date
- Studio/room number (format: A 3041, C 2641, D 3418, etc.)
- Total price
- Currency (GEL, USD, EUR, etc.)
- Booking source (Booking.com, Airbnb, Expedia, Direct, etc.)

**Common booking sources:**
- Booking.com
- Airbnb
- Expedia
- Agoda
- Hostelworld
- ostrovok.ru
- sutochno.com
- Direct booking

Respond ONLY with valid JSON in this exact format:
{
  "guestName": "John Smith",
  "checkInDate": "2024-12-15",
  "checkOutDate": "2024-12-20",
  "studioNumber": "A 3041",
  "totalPrice": 450.00,
  "currency": "GEL",
  "bookingSource": "Booking.com"
}

If any information is missing, use null for that field.

**Email to analyze:**
Subject: {{subject}}
From: {{from}}
Content: {{content}}`;

/**
 * Extract booking data from email using Gemini AI
 */
export async function extractBookingData(email: {
  subject: string;
  from: string;
  content: string;
}): Promise<BookingData | null> {
  try {
    const prompt = BOOKING_EXTRACTION_PROMPT.replace("{{subject}}", email.subject || "")
      .replace("{{from}}", email.from || "")
      .replace("{{content}}", email.content.substring(0, 3000));

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting structured booking information from emails. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "booking_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              guestName: { type: ["string", "null"] },
              checkInDate: { type: ["string", "null"] },
              checkOutDate: { type: ["string", "null"] },
              studioNumber: { type: ["string", "null"] },
              totalPrice: { type: ["number", "null"] },
              currency: { type: ["string", "null"] },
              bookingSource: { type: ["string", "null"] },
            },
            required: [
              "guestName",
              "checkInDate",
              "checkOutDate",
              "studioNumber",
              "totalPrice",
              "currency",
              "bookingSource",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    const result = JSON.parse(content);

    // Validate required fields
    if (
      !result.guestName ||
      !result.checkInDate ||
      !result.checkOutDate ||
      !result.totalPrice
    ) {
      return null;
    }

    return {
      guestName: result.guestName,
      checkInDate: new Date(result.checkInDate),
      checkOutDate: new Date(result.checkOutDate),
      studioNumber: result.studioNumber || "Unknown",
      totalPrice: result.totalPrice,
      currency: result.currency || "GEL",
      bookingSource: result.bookingSource || "Unknown",
    };
  } catch (error) {
    console.error("Booking extraction failed:", error);
    return null;
  }
}

/**
 * Save booking revenue to database and update Finance Dashboard
 */
export async function saveBookingRevenue(
  messageId: number,
  bookingData: BookingData
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Save to email_booking_revenue table
    await db.insert(db.schema.gmailBookingRevenue).values({
      messageId,
      guestName: bookingData.guestName,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      studioNumber: bookingData.studioNumber,
      totalPrice: bookingData.totalPrice.toString(),
      currency: bookingData.currency,
      bookingSource: bookingData.bookingSource,
      extractedAt: new Date(),
    });

    // Update financial_monthly table
    await updateFinancialMonthly(bookingData);

    console.log(`✅ Saved booking revenue: ${bookingData.guestName} - ${bookingData.totalPrice} ${bookingData.currency}`);
  } catch (error) {
    console.error("Failed to save booking revenue:", error);
    throw error;
  }
}

/**
 * Update financial_monthly table with booking revenue
 */
async function updateFinancialMonthly(bookingData: BookingData): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get month from check-in date
    const checkInDate = new Date(bookingData.checkInDate);
    const month = checkInDate.toLocaleString("en-US", { month: "long" });
    const year = checkInDate.getFullYear();
    const monthYear = `${month} ${year}`;

    // Check if record exists for this month
    const [existing] = await db
      .select()
      .from(db.schema.financialMonthly)
      .where(eq(db.schema.financialMonthly.month, monthYear))
      .limit(1);

    if (existing) {
      // Update existing record
      const newRevenue = parseFloat(existing.revenue) + bookingData.totalPrice;
      const newBookings = existing.bookings + 1;

      await db
        .update(db.schema.financialMonthly)
        .set({
          revenue: newRevenue.toString(),
          bookings: newBookings,
        })
        .where(eq(db.schema.financialMonthly.id, existing.id));

      console.log(`✅ Updated ${monthYear}: +${bookingData.totalPrice} ${bookingData.currency}`);
    } else {
      // Create new record for this month
      await db.insert(db.schema.financialMonthly).values({
        month: monthYear,
        revenue: bookingData.totalPrice.toString(),
        expenses: "0",
        profit: bookingData.totalPrice.toString(),
        studios: 60,
        occupancy: 0,
        avgPrice: bookingData.totalPrice,
        bookings: 1,
      });

      console.log(`✅ Created ${monthYear}: ${bookingData.totalPrice} ${bookingData.currency}`);
    }
  } catch (error) {
    console.error("Failed to update financial_monthly:", error);
  }
}

/**
 * Process email for booking data extraction
 */
export async function processEmailForBooking(email: {
  id: number;
  subject: string;
  fromEmail: string;
  bodyText: string;
  category?: string;
}): Promise<BookingData | null> {
  // Only process booking-related emails
  if (email.category && email.category !== "booking") {
    return null;
  }

  // Check if email is from known booking sources
  const bookingSources = [
    "booking.com",
    "airbnb",
    "expedia",
    "agoda",
    "hostelworld",
    "ostrovok.ru",
    "sutochno.com",
  ];

  const isBookingEmail = bookingSources.some((source) =>
    email.fromEmail?.toLowerCase().includes(source)
  );

  if (!isBookingEmail && email.category !== "booking") {
    return null;
  }

  // Extract booking data
  const bookingData = await extractBookingData({
    subject: email.subject || "",
    from: email.fromEmail || "",
    content: email.bodyText || "",
  });

  if (bookingData) {
    // Save to database
    await saveBookingRevenue(email.id, bookingData);
  }

  return bookingData;
}

// Import eq function
import { eq } from "drizzle-orm";
