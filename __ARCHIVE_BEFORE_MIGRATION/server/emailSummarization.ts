/**
 * Email Summarization & Natural Language Search
 * AI-powered email summaries and semantic search
 */

import { invokeLLM } from "./_core/llm";

export interface EmailSummaryResult {
  shortSummary: string; // 1-2 sentences
  keyPoints: string[]; // Array of key points
  actionItems: string[]; // Array of action items
  sentiment: "positive" | "neutral" | "negative" | "urgent";
  wordCount: number;
}

export interface EmailData {
  subject: string;
  from: string;
  body: string;
  date?: Date;
}

/**
 * Generate AI summary for an email
 */
export async function summarizeEmail(email: EmailData): Promise<EmailSummaryResult> {
  const wordCount = email.body.split(/\s+/).length;

  // Skip summarization for very short emails (< 50 words)
  if (wordCount < 50) {
    return {
      shortSummary: email.subject || "Short email",
      keyPoints: [],
      actionItems: [],
      sentiment: "neutral",
      wordCount,
    };
  }

  const prompt = `You are an email summarization AI for ORBI City Hub aparthotel.

Analyze the following email and create a comprehensive summary:

**Email Details:**
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date ? email.date.toISOString() : 'Unknown'}

**Email Body:**
${email.body}

**Instructions:**
1. Create a SHORT SUMMARY (1-2 sentences max) capturing the main point
2. Extract KEY POINTS (3-5 bullet points) of important information
3. Identify ACTION ITEMS (if any) - specific tasks or deadlines mentioned
4. Determine SENTIMENT: positive, neutral, negative, or urgent
5. Count approximate word count

**Response Format (JSON):**
{
  "shortSummary": "Brief 1-2 sentence summary of the email",
  "keyPoints": [
    "First key point",
    "Second key point",
    "Third key point"
  ],
  "actionItems": [
    "Action item 1 with deadline if mentioned",
    "Action item 2"
  ],
  "sentiment": "positive|neutral|negative|urgent",
  "wordCount": ${wordCount}
}

**Examples:**

**Booking Email:**
{
  "shortSummary": "New booking confirmation from Booking.com for Room A 3041, check-in March 15, 2025.",
  "keyPoints": [
    "Guest: John Smith",
    "Room: A 3041 (Sea View Studio)",
    "Dates: March 15-20, 2025 (5 nights)",
    "Price: ₾450 total",
    "Special request: Late check-in after 10 PM"
  ],
  "actionItems": [
    "Prepare room A 3041 for March 15",
    "Arrange late check-in access"
  ],
  "sentiment": "positive",
  "wordCount": 150
}

**Finance Email:**
{
  "shortSummary": "OTELMS daily report for November 29, 2025 showing ₾12,450 revenue from 8 check-ins.",
  "keyPoints": [
    "Total revenue: ₾12,450",
    "Check-ins: 8 guests",
    "Check-outs: 5 guests",
    "Occupancy: 85%",
    "Top channel: Direct bookings (5)"
  ],
  "actionItems": [
    "Review financial report",
    "Update revenue dashboard"
  ],
  "sentiment": "positive",
  "wordCount": 200
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert email summarization AI. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              shortSummary: {
                type: "string",
                description: "1-2 sentence summary"
              },
              keyPoints: {
                type: "array",
                items: { type: "string" },
                description: "Array of key points"
              },
              actionItems: {
                type: "array",
                items: { type: "string" },
                description: "Array of action items"
              },
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative", "urgent"],
                description: "Email sentiment"
              },
              wordCount: {
                type: "number",
                description: "Approximate word count"
              }
            },
            required: ["shortSummary", "keyPoints", "actionItems", "sentiment", "wordCount"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const result = JSON.parse(content) as EmailSummaryResult;
    return result;
  } catch (error) {
    console.error("[EmailSummarization] Error:", error);
    
    // Fallback: basic summary
    return {
      shortSummary: email.subject || "Email summary unavailable",
      keyPoints: [],
      actionItems: [],
      sentiment: "neutral",
      wordCount,
    };
  }
}

/**
 * Natural Language Search
 * Convert user query to semantic search
 */
export interface SearchQuery {
  originalQuery: string;
  searchTerms: string[];
  filters: {
    category?: string;
    dateRange?: { start: Date; end: Date };
    sender?: string;
    hasAttachment?: boolean;
  };
  intent: "find_booking" | "find_financial" | "find_by_date" | "find_by_sender" | "general_search";
}

export async function parseNaturalLanguageQuery(query: string): Promise<SearchQuery> {
  const prompt = `You are a natural language search parser for an email management system.

Parse the following user query into structured search parameters:

**User Query:** "${query}"

**Instructions:**
1. Extract SEARCH TERMS (keywords to search for)
2. Identify FILTERS (category, date range, sender, attachments)
3. Determine INTENT (what user is trying to find)

**Available Categories:**
- bookings (reservations, check-ins, Booking.com, Airbnb)
- finance (invoices, payments, OTELMS reports)
- marketing (newsletters, promotions)
- spam
- important (urgent matters)
- general

**Intent Types:**
- find_booking: Looking for reservation/booking emails
- find_financial: Looking for financial reports/invoices
- find_by_date: Searching by specific date/time period
- find_by_sender: Searching by email sender
- general_search: General keyword search

**Response Format (JSON):**
{
  "originalQuery": "${query}",
  "searchTerms": ["keyword1", "keyword2"],
  "filters": {
    "category": "bookings|finance|marketing|spam|important|general",
    "dateRange": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    },
    "sender": "booking.com",
    "hasAttachment": true
  },
  "intent": "find_booking|find_financial|find_by_date|find_by_sender|general_search"
}

**Examples:**

Query: "find booking emails from last week"
{
  "originalQuery": "find booking emails from last week",
  "searchTerms": ["booking", "reservation"],
  "filters": {
    "category": "bookings",
    "dateRange": {
      "start": "2025-11-22T00:00:00Z",
      "end": "2025-11-29T23:59:59Z"
    }
  },
  "intent": "find_booking"
}

Query: "show me OTELMS reports from November"
{
  "originalQuery": "show me OTELMS reports from November",
  "searchTerms": ["OTELMS", "report"],
  "filters": {
    "category": "finance",
    "dateRange": {
      "start": "2025-11-01T00:00:00Z",
      "end": "2025-11-30T23:59:59Z"
    },
    "sender": "otelms"
  },
  "intent": "find_financial"
}

Query: "emails from Booking.com about Room A 3041"
{
  "originalQuery": "emails from Booking.com about Room A 3041",
  "searchTerms": ["Room A 3041", "A 3041"],
  "filters": {
    "category": "bookings",
    "sender": "booking.com"
  },
  "intent": "find_by_sender"
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a natural language query parser. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    // Extract JSON from response (in case LLM adds extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]) as SearchQuery;
    return result;
  } catch (error) {
    console.error("[NLP Search] Error:", error);
    
    // Fallback: simple keyword extraction
    return {
      originalQuery: query,
      searchTerms: query.toLowerCase().split(/\s+/).filter(w => w.length > 3),
      filters: {},
      intent: "general_search",
    };
  }
}

/**
 * Batch summarize multiple emails
 */
export async function summarizeEmailsBatch(
  emails: (EmailData & { emailId: string })[]
): Promise<Map<string, EmailSummaryResult>> {
  const results = new Map<string, EmailSummaryResult>();
  
  // Process in parallel with rate limiting (max 3 concurrent for summaries)
  const batchSize = 3;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const promises = batch.map(async (email) => {
      const result = await summarizeEmail(email);
      results.set(email.emailId, result);
    });
    
    await Promise.all(promises);
    
    // Delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  return results;
}
