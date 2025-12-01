/**
 * Gmail Integration Service
 * Fetches emails from Gmail using MCP and auto-categorizes them
 */

import { exec } from "child_process";
import { promisify } from "util";
import { categorizeEmail } from "./emailCategorization";
import { summarizeEmail } from "./emailSummarization";
import { getDb } from "./db";
import { emailCategories, emailSummaries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const execAsync = promisify(exec);

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  snippet: string;
}

export interface GmailSearchResult {
  messages: GmailMessage[];
  nextPageToken?: string;
  total: number;
}

/**
 * Search Gmail messages using MCP
 */
export async function searchGmailMessages(
  query: string = "",
  maxResults: number = 50,
  pageToken?: string
): Promise<GmailSearchResult> {
  try {
    const args = {
      q: query,
      max_results: maxResults,
      ...(pageToken && { page_token: pageToken }),
    };

    const argsJson = JSON.stringify(args).replace(/"/g, '\\"');
    const command = `manus-mcp-cli tool call gmail_search_messages --server gmail --input "${argsJson}"`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error("[Gmail] Search stderr:", stderr);
    }

    const result = JSON.parse(stdout);

    // Parse the MCP response
    if (result.content && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === "text") {
        const data = JSON.parse(content.text);
        return {
          messages: data.messages || [],
          nextPageToken: data.nextPageToken,
          total: data.resultSizeEstimate || 0,
        };
      }
    }

    return { messages: [], total: 0 };
  } catch (error) {
    console.error("[Gmail] Search error:", error);
    throw new Error(`Failed to search Gmail messages: ${error}`);
  }
}

/**
 * Read Gmail thread by ID using MCP
 */
export async function readGmailThread(threadId: string): Promise<GmailMessage[]> {
  try {
    const args = {
      thread_ids: [threadId],
      include_full_messages: true,
    };

    const argsJson = JSON.stringify(args).replace(/"/g, '\\"');
    const command = `manus-mcp-cli tool call gmail_read_threads --server gmail --input "${argsJson}"`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error("[Gmail] Read thread stderr:", stderr);
    }

    const result = JSON.parse(stdout);

    // Parse the MCP response
    if (result.content && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === "text") {
        const data = JSON.parse(content.text);
        return data.threads?.[0]?.messages || [];
      }
    }

    return [];
  } catch (error) {
    console.error("[Gmail] Read thread error:", error);
    throw new Error(`Failed to read Gmail thread: ${error}`);
  }
}

/**
 * Fetch recent emails and auto-categorize them
 */
export async function fetchAndCategorizeEmails(
  query: string = "newer_than:7d",
  maxResults: number = 50
): Promise<{
  fetched: number;
  categorized: number;
  summarized: number;
  skipped: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stats = {
    fetched: 0,
    categorized: 0,
    summarized: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Search for emails
    const searchResult = await searchGmailMessages(query, maxResults);
    stats.fetched = searchResult.messages.length;

    console.log(`[Gmail] Fetched ${stats.fetched} emails`);

    // Process each message
    for (const message of searchResult.messages) {
      try {
        // Check if already categorized
        const existing = await db
          .select()
          .from(emailCategories)
          .where(eq(emailCategories.emailId, message.id))
          .limit(1);

        if (existing.length > 0) {
          stats.skipped++;
          continue;
        }

        // Categorize email
        const categoryResult = await categorizeEmail({
          subject: message.subject,
          from: message.from,
          body: message.body || message.snippet,
          date: new Date(message.date),
        });

        // Save categorization
        await db.insert(emailCategories).values({
          emailId: message.id,
          emailSubject: message.subject,
          emailFrom: message.from,
          emailDate: new Date(message.date),
          category: categoryResult.category,
          confidence: categoryResult.confidence,
          aiReasoning: categoryResult.reasoning,
          userId: null, // Auto-categorized, no user
        });

        stats.categorized++;

        // Summarize if email is long enough (> 100 words)
        const wordCount = (message.body || message.snippet).split(/\s+/).length;
        if (wordCount > 100) {
          const summaryResult = await summarizeEmail({
            subject: message.subject,
            from: message.from,
            body: message.body || message.snippet,
            date: new Date(message.date),
          });

          // Save summary
          await db.insert(emailSummaries).values({
            emailId: message.id,
            shortSummary: summaryResult.shortSummary,
            keyPoints: summaryResult.keyPoints,
            actionItems: summaryResult.actionItems,
            sentiment: summaryResult.sentiment,
            wordCount: summaryResult.wordCount,
            userId: null,
          });

          stats.summarized++;
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`[Gmail] Error processing message ${message.id}:`, error);
        stats.errors++;
      }
    }

    console.log(`[Gmail] Processing complete:`, stats);
    return stats;
  } catch (error) {
    console.error("[Gmail] Fetch and categorize error:", error);
    throw error;
  }
}

/**
 * Sync emails in background (can be called periodically)
 */
export async function syncGmailEmails(): Promise<void> {
  console.log("[Gmail] Starting background sync...");

  try {
    // Fetch emails from last 7 days
    const stats = await fetchAndCategorizeEmails("newer_than:7d", 100);

    console.log("[Gmail] Background sync complete:", stats);
  } catch (error) {
    console.error("[Gmail] Background sync error:", error);
  }
}

/**
 * Get sync status
 */
export async function getGmailSyncStatus(): Promise<{
  lastSync: Date | null;
  totalEmails: number;
  categorizedEmails: number;
  summarizedEmails: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get total categorized emails
  const categorizedCount = await db
    .select({ count: emailCategories.id })
    .from(emailCategories);

  // Get total summarized emails
  const summarizedCount = await db
    .select({ count: emailSummaries.id })
    .from(emailSummaries);

  // Get last sync time (most recent email date)
  const lastEmail = await db
    .select({ date: emailCategories.emailDate })
    .from(emailCategories)
    .orderBy(emailCategories.emailDate)
    .limit(1);

  return {
    lastSync: lastEmail[0]?.date || null,
    totalEmails: categorizedCount.length,
    categorizedEmails: categorizedCount.length,
    summarizedEmails: summarizedCount.length,
  };
}
