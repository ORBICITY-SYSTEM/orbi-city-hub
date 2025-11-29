/**
 * AI Email Categorization System
 * Uses LLM to intelligently categorize emails into predefined categories
 */

import { invokeLLM } from "./_core/llm";

export type EmailCategory = "bookings" | "finance" | "marketing" | "spam" | "important" | "general";

export interface EmailCategorizationResult {
  category: EmailCategory;
  confidence: number; // 0-100
  reasoning: string;
}

export interface EmailData {
  subject: string;
  from: string;
  body: string;
  date?: Date;
}

/**
 * Categorize a single email using AI
 */
export async function categorizeEmail(email: EmailData): Promise<EmailCategorizationResult> {
  const prompt = `You are an email categorization AI for ORBI City Hub, a 60-studio aparthotel in Batumi, Georgia.

Analyze the following email and categorize it into ONE of these categories:

**Categories:**
1. **bookings** - Booking confirmations, modifications, cancellations, guest inquiries about reservations
2. **finance** - Invoices, payment confirmations, financial reports, accounting documents, tax documents
3. **marketing** - Newsletters, promotional emails, marketing campaigns, advertisements
4. **spam** - Unwanted emails, phishing attempts, obvious spam
5. **important** - Urgent matters, legal notices, critical business communications
6. **general** - General correspondence that doesn't fit other categories

**Email Details:**
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date ? email.date.toISOString() : 'Unknown'}

Body (first 1000 characters):
${email.body.substring(0, 1000)}

**Instructions:**
1. Analyze the email content carefully
2. Choose the MOST APPROPRIATE category
3. Provide a confidence score (0-100) based on how certain you are
4. Explain your reasoning in 1-2 sentences

**Response Format (JSON):**
{
  "category": "bookings|finance|marketing|spam|important|general",
  "confidence": 85,
  "reasoning": "This email is from Booking.com confirming a new reservation for Room A 3041 from March 15-20, 2025."
}

**Important Notes:**
- Booking.com, Airbnb, Expedia, Agoda emails → "bookings"
- OTELMS daily reports → "finance"
- Newsletters, promotions → "marketing"
- Suspicious or unwanted → "spam"
- Urgent legal/critical → "important"
- Everything else → "general"

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert email categorization AI. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
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
                enum: ["bookings", "finance", "marketing", "spam", "important", "general"],
                description: "The email category"
              },
              confidence: {
                type: "number",
                description: "Confidence score from 0 to 100"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of the categorization"
              }
            },
            required: ["category", "confidence", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const result = JSON.parse(content) as EmailCategorizationResult;
    
    // Validate confidence is between 0-100
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    
    return result;
  } catch (error) {
    console.error("[EmailCategorization] Error:", error);
    
    // Fallback: basic keyword-based categorization
    return fallbackCategorization(email);
  }
}

/**
 * Fallback categorization when AI fails
 * Uses simple keyword matching
 */
function fallbackCategorization(email: EmailData): EmailCategorizationResult {
  const subject = email.subject.toLowerCase();
  const from = email.from.toLowerCase();
  const body = email.body.toLowerCase();
  
  // Booking keywords
  if (
    from.includes("booking.com") ||
    from.includes("airbnb") ||
    from.includes("expedia") ||
    from.includes("agoda") ||
    subject.includes("reservation") ||
    subject.includes("booking") ||
    body.includes("check-in") ||
    body.includes("check-out")
  ) {
    return {
      category: "bookings",
      confidence: 70,
      reasoning: "Detected booking-related keywords (fallback method)"
    };
  }
  
  // Finance keywords
  if (
    subject.includes("invoice") ||
    subject.includes("payment") ||
    subject.includes("receipt") ||
    from.includes("otelms") ||
    body.includes("₾") ||
    body.includes("GEL") ||
    body.includes("revenue")
  ) {
    return {
      category: "finance",
      confidence: 70,
      reasoning: "Detected financial keywords (fallback method)"
    };
  }
  
  // Marketing keywords
  if (
    subject.includes("newsletter") ||
    subject.includes("unsubscribe") ||
    subject.includes("promotion") ||
    subject.includes("offer") ||
    subject.includes("discount") ||
    body.includes("click here") ||
    body.includes("limited time")
  ) {
    return {
      category: "marketing",
      confidence: 70,
      reasoning: "Detected marketing keywords (fallback method)"
    };
  }
  
  // Spam indicators
  if (
    subject.includes("urgent") ||
    subject.includes("winner") ||
    subject.includes("claim") ||
    subject.includes("verify your account") ||
    body.includes("click here immediately")
  ) {
    return {
      category: "spam",
      confidence: 60,
      reasoning: "Detected spam indicators (fallback method)"
    };
  }
  
  // Default to general
  return {
    category: "general",
    confidence: 50,
    reasoning: "No specific category matched (fallback method)"
  };
}

/**
 * Batch categorize multiple emails
 */
export async function categorizeEmailsBatch(
  emails: (EmailData & { emailId: string })[]
): Promise<Map<string, EmailCategorizationResult>> {
  const results = new Map<string, EmailCategorizationResult>();
  
  // Process in parallel with rate limiting (max 5 concurrent)
  const batchSize = 5;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const promises = batch.map(async (email) => {
      const result = await categorizeEmail(email);
      results.set(email.emailId, result);
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Detect unsubscribe links in email
 */
export interface UnsubscribeDetection {
  hasUnsubscribeLink: boolean;
  unsubscribeUrl?: string;
  detectionMethod: "unsubscribe_link" | "list_unsubscribe" | "pattern_match" | "ai_detection";
}

export function detectUnsubscribeLink(
  emailBody: string,
  emailHeaders?: Record<string, string>
): UnsubscribeDetection {
  // Check List-Unsubscribe header (RFC 2369)
  if (emailHeaders?.["list-unsubscribe"]) {
    const match = emailHeaders["list-unsubscribe"].match(/<(https?:\/\/[^>]+)>/);
    if (match) {
      return {
        hasUnsubscribeLink: true,
        unsubscribeUrl: match[1],
        detectionMethod: "list_unsubscribe"
      };
    }
  }
  
  // Check for unsubscribe link in body
  const unsubscribePatterns = [
    /unsubscribe.*?(https?:\/\/[^\s<>"]+)/i,
    /click here to unsubscribe.*?(https?:\/\/[^\s<>"]+)/i,
    /<a[^>]+href=["'](https?:\/\/[^"']+unsubscribe[^"']*)/i
  ];
  
  for (const pattern of unsubscribePatterns) {
    const match = emailBody.match(pattern);
    if (match) {
      return {
        hasUnsubscribeLink: true,
        unsubscribeUrl: match[1],
        detectionMethod: "unsubscribe_link"
      };
    }
  }
  
  // Check for marketing email patterns (no explicit unsubscribe link)
  const marketingPatterns = [
    /newsletter/i,
    /promotional/i,
    /marketing/i,
    /this email was sent to/i
  ];
  
  const hasMarketingPattern = marketingPatterns.some(pattern => pattern.test(emailBody));
  if (hasMarketingPattern) {
    return {
      hasUnsubscribeLink: false,
      detectionMethod: "pattern_match"
    };
  }
  
  return {
    hasUnsubscribeLink: false,
    detectionMethod: "ai_detection"
  };
}
