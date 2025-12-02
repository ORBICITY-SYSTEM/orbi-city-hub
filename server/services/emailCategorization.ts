/**
 * AI Email Categorization Service
 * Uses Gemini 2.0 Flash for intelligent email categorization
 */

import { invokeLLM } from "../_core/llm";

export type EmailCategory =
  | "booking"
  | "review"
  | "complaint"
  | "question"
  | "financial"
  | "marketing"
  | "spam"
  | "important"
  | "general";

export type EmailPriority = "urgent" | "high" | "normal" | "low";
export type EmailSentiment = "positive" | "neutral" | "negative" | "urgent";

export interface CategorizationResult {
  category: EmailCategory;
  confidence: number;
  priority: EmailPriority;
  sentiment: EmailSentiment;
  reasoning: string;
  suggestedActions: string[];
}

const CATEGORIZATION_PROMPT = `You are an AI email categorization assistant for ORBI City Batumi, a premium aparthotel with 60 studios.

Analyze the following email and categorize it into ONE of these categories:

**Categories:**
1. **booking** - Reservations, check-in/out, booking confirmations, cancellations
2. **review** - Guest reviews, feedback, ratings (Booking.com, Airbnb, Google)
3. **complaint** - Guest complaints, issues, problems during stay
4. **question** - General inquiries, questions about facilities, services
5. **financial** - Invoices, payments, refunds, financial statements
6. **marketing** - Newsletters, promotions, advertising, partnerships
7. **spam** - Unwanted emails, advertisements, scams
8. **important** - Urgent matters requiring immediate attention
9. **general** - Everything else

**Priority Levels:**
- **urgent** - Requires immediate action (complaints, urgent bookings)
- **high** - Important but not urgent (bookings, financial, reviews)
- **normal** - Standard inquiries and questions
- **low** - Newsletters, marketing, spam

**Sentiment:**
- **positive** - Happy, satisfied, complimentary
- **neutral** - Informational, factual
- **negative** - Unhappy, dissatisfied, complaining
- **urgent** - Requires immediate attention

Respond ONLY with valid JSON in this exact format:
{
  "category": "booking",
  "confidence": 95,
  "priority": "high",
  "sentiment": "positive",
  "reasoning": "Email contains booking confirmation with check-in details",
  "suggestedActions": ["Send welcome email", "Prepare room", "Add to calendar"]
}

**Email to analyze:**
Subject: {{subject}}
From: {{from}}
Content: {{content}}`;

/**
 * Categorize email using Gemini AI
 */
export async function categorizeEmail(email: {
  subject: string;
  from: string;
  content: string;
}): Promise<CategorizationResult> {
  try {
    const prompt = CATEGORIZATION_PROMPT.replace("{{subject}}", email.subject || "No subject")
      .replace("{{from}}", email.from || "Unknown")
      .replace("{{content}}", email.content.substring(0, 2000)); // Limit content length

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert email categorization AI. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_categorization",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: [
                  "booking",
                  "review",
                  "complaint",
                  "question",
                  "financial",
                  "marketing",
                  "spam",
                  "important",
                  "general",
                ],
              },
              confidence: {
                type: "number",
                description: "Confidence score from 0 to 100",
              },
              priority: {
                type: "string",
                enum: ["urgent", "high", "normal", "low"],
              },
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative", "urgent"],
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of the categorization",
              },
              suggestedActions: {
                type: "array",
                items: { type: "string" },
                description: "List of suggested actions to take",
              },
            },
            required: [
              "category",
              "confidence",
              "priority",
              "sentiment",
              "reasoning",
              "suggestedActions",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content) as CategorizationResult;
    return result;
  } catch (error) {
    console.error("AI categorization failed:", error);

    // Fallback to keyword-based categorization
    return fallbackCategorization(email);
  }
}

/**
 * Fallback categorization using keywords (when AI fails)
 */
function fallbackCategorization(email: {
  subject: string;
  from: string;
  content: string;
}): CategorizationResult {
  const text = `${email.subject} ${email.content}`.toLowerCase();

  // Booking keywords
  if (
    /booking|reservation|check-in|check-out|confirmation|cancel/i.test(text)
  ) {
    return {
      category: "booking",
      confidence: 70,
      priority: "high",
      sentiment: "neutral",
      reasoning: "Contains booking-related keywords",
      suggestedActions: ["Review booking details", "Send confirmation"],
    };
  }

  // Review keywords
  if (/review|rating|feedback|experience|stay/i.test(text)) {
    return {
      category: "review",
      confidence: 70,
      priority: "high",
      sentiment: "neutral",
      reasoning: "Contains review-related keywords",
      suggestedActions: ["Read review", "Prepare response"],
    };
  }

  // Complaint keywords
  if (
    /complaint|problem|issue|unhappy|disappointed|terrible|awful/i.test(text)
  ) {
    return {
      category: "complaint",
      confidence: 75,
      priority: "urgent",
      sentiment: "negative",
      reasoning: "Contains complaint-related keywords",
      suggestedActions: ["Address immediately", "Contact guest", "Resolve issue"],
    };
  }

  // Financial keywords
  if (/invoice|payment|refund|receipt|bill|charge/i.test(text)) {
    return {
      category: "financial",
      confidence: 70,
      priority: "high",
      sentiment: "neutral",
      reasoning: "Contains financial keywords",
      suggestedActions: ["Review payment", "Process invoice"],
    };
  }

  // Spam keywords
  if (
    /unsubscribe|click here|limited time|act now|free money|viagra/i.test(text)
  ) {
    return {
      category: "spam",
      confidence: 80,
      priority: "low",
      sentiment: "neutral",
      reasoning: "Contains spam indicators",
      suggestedActions: ["Mark as spam", "Delete"],
    };
  }

  // Question keywords
  if (/question|\?|how|what|when|where|can i|is it possible/i.test(text)) {
    return {
      category: "question",
      confidence: 65,
      priority: "normal",
      sentiment: "neutral",
      reasoning: "Contains question keywords",
      suggestedActions: ["Provide information", "Answer question"],
    };
  }

  // Default to general
  return {
    category: "general",
    confidence: 50,
    priority: "normal",
    sentiment: "neutral",
    reasoning: "No specific category detected",
    suggestedActions: ["Review manually"],
  };
}

/**
 * Batch categorize multiple emails
 */
export async function categorizeEmailsBatch(
  emails: Array<{ id: number; subject: string; from: string; content: string }>
): Promise<Map<number, CategorizationResult>> {
  const results = new Map<number, CategorizationResult>();

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (email) => ({
        id: email.id,
        result: await categorizeEmail(email),
      }))
    );

    batchResults.forEach(({ id, result }) => {
      results.set(id, result);
    });

    // Small delay between batches
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
