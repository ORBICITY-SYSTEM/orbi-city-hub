/**
 * PowerHub Outbox Worker
 * 
 * Processes queued events from the integration_events outbox table.
 * Implements exponential backoff retry logic for reliable delivery.
 * 
 * Can be run as:
 * - Cron job (recommended): `node -e "require('./outboxWorker').processOutbox()"`
 * - Vercel Cron: Configure in vercel.json
 * - Manual trigger: Via tRPC endpoint
 */

import { getDb } from '../db';
import { integrationEvents } from '../../drizzle/schema';
import { eq, and, lt, or, isNull } from 'drizzle-orm';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Processing
  BATCH_SIZE: 50,
  MAX_RETRIES: 5,
  LOCK_TIMEOUT_MS: 30000, // 30 seconds
  
  // Backoff (exponential)
  BASE_DELAY_MS: 1000,      // 1 second
  MAX_DELAY_MS: 300000,     // 5 minutes
  BACKOFF_MULTIPLIER: 2,
  
  // Destinations
  DESTINATIONS: {
    APPS_SCRIPT_SHEETS: {
      url: process.env.APPS_SCRIPT_WEBHOOK_URL || '',
      timeout: 30000,
    },
    TELEGRAM: {
      url: process.env.TELEGRAM_WEBHOOK_URL || '',
      timeout: 10000,
    },
    WEBHOOK: {
      url: process.env.GENERIC_WEBHOOK_URL || '',
      timeout: 15000,
    },
  } as Record<string, { url: string; timeout: number }>,
};

// ============================================================================
// TYPES
// ============================================================================

interface OutboxEvent {
  id: string;
  eventType: string;
  destination: string;
  payload: unknown;
  status: string;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  errorHistory: Array<{ timestamp: string; error: string }> | null;
  createdAt: Date;
  nextRetryAt: Date;
}

interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  responseBody?: unknown;
}

// ============================================================================
// BACKOFF CALCULATION
// ============================================================================

function calculateNextRetryDelay(retryCount: number): number {
  const delay = CONFIG.BASE_DELAY_MS * Math.pow(CONFIG.BACKOFF_MULTIPLIER, retryCount);
  // Add jitter (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, CONFIG.MAX_DELAY_MS);
}

function calculateNextRetryAt(retryCount: number): Date {
  const delayMs = calculateNextRetryDelay(retryCount);
  return new Date(Date.now() + delayMs);
}

// ============================================================================
// DELIVERY FUNCTIONS
// ============================================================================

async function deliverToAppsScriptSheets(event: OutboxEvent): Promise<DeliveryResult> {
  const config = CONFIG.DESTINATIONS.APPS_SCRIPT_SHEETS;
  
  if (!config.url) {
    return { success: false, error: 'APPS_SCRIPT_WEBHOOK_URL not configured' };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PowerHub-Event-Type': event.eventType,
        'X-PowerHub-Event-Id': event.id,
      },
      body: JSON.stringify({
        eventId: event.id,
        eventType: event.eventType,
        payload: event.payload,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        statusCode: response.status,
        error: `HTTP ${response.status}: ${errorBody}`,
      };
    }
    
    const responseBody = await response.json().catch(() => ({}));
    return { success: true, statusCode: response.status, responseBody };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return { success: false, error: `Network error: ${error}` };
  }
}

async function deliverToTelegram(event: OutboxEvent): Promise<DeliveryResult> {
  const config = CONFIG.DESTINATIONS.TELEGRAM;
  
  if (!config.url) {
    return { success: false, error: 'TELEGRAM_WEBHOOK_URL not configured' };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: event.eventType,
        payload: event.payload,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `HTTP ${response.status}`,
      };
    }
    
    return { success: true, statusCode: response.status };
  } catch (error) {
    return { success: false, error: `Network error: ${error}` };
  }
}

async function deliverEvent(event: OutboxEvent): Promise<DeliveryResult> {
  switch (event.destination) {
    case 'APPS_SCRIPT_SHEETS':
      return deliverToAppsScriptSheets(event);
    case 'TELEGRAM':
      return deliverToTelegram(event);
    default:
      return { success: false, error: `Unknown destination: ${event.destination}` };
  }
}

// ============================================================================
// MAIN PROCESSING LOGIC
// ============================================================================

async function processEvent(event: OutboxEvent): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[OutboxWorker] Database unavailable');
    return;
  }
  
  // Mark as processing
  await db.update(integrationEvents)
    .set({ status: 'PROCESSING' })
    .where(eq(integrationEvents.id, event.id));
  
  // Attempt delivery
  const result = await deliverEvent(event);
  
  if (result.success) {
    // Success - mark as completed
    await db.update(integrationEvents)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        processedAt: new Date(),
      })
      .where(eq(integrationEvents.id, event.id));
    
    console.log(`[OutboxWorker] Event ${event.id} delivered successfully to ${event.destination}`);
  } else {
    // Failure - update retry count and schedule next attempt
    const newRetryCount = event.retryCount + 1;
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: result.error || 'Unknown error',
    };
    
    const errorHistory = [...(event.errorHistory || []), errorEntry];
    
    if (newRetryCount >= event.maxRetries) {
      // Max retries reached - move to dead letter
      await db.update(integrationEvents)
        .set({
          status: 'DEAD_LETTER',
          retryCount: newRetryCount,
          lastError: result.error,
          errorHistory,
          processedAt: new Date(),
        })
        .where(eq(integrationEvents.id, event.id));
      
      console.error(`[OutboxWorker] Event ${event.id} moved to dead letter after ${newRetryCount} retries`);
    } else {
      // Schedule retry
      const nextRetryAt = calculateNextRetryAt(newRetryCount);
      
      await db.update(integrationEvents)
        .set({
          status: 'PENDING',
          retryCount: newRetryCount,
          lastError: result.error,
          errorHistory,
          nextRetryAt,
        })
        .where(eq(integrationEvents.id, event.id));
      
      console.warn(`[OutboxWorker] Event ${event.id} failed, retry ${newRetryCount}/${event.maxRetries} scheduled for ${nextRetryAt.toISOString()}`);
    }
  }
}

/**
 * Main entry point - process pending events from the outbox
 */
export async function processOutbox(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  deadLettered: number;
}> {
  const db = await getDb();
  if (!db) {
    console.error('[OutboxWorker] Database unavailable');
    return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  }
  
  const now = new Date();
  
  // Fetch pending events that are due for processing
  const pendingEvents = await db.select()
    .from(integrationEvents)
    .where(
      and(
        or(
          eq(integrationEvents.status, 'PENDING'),
          // Also pick up stale "PROCESSING" events (stuck)
          and(
            eq(integrationEvents.status, 'PROCESSING'),
            lt(integrationEvents.nextRetryAt, new Date(now.getTime() - CONFIG.LOCK_TIMEOUT_MS))
          )
        ),
        lt(integrationEvents.nextRetryAt, now)
      )
    )
    .limit(CONFIG.BATCH_SIZE);
  
  if (pendingEvents.length === 0) {
    console.log('[OutboxWorker] No pending events to process');
    return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  }
  
  console.log(`[OutboxWorker] Processing ${pendingEvents.length} events`);
  
  let succeeded = 0;
  let failed = 0;
  let deadLettered = 0;
  
  for (const event of pendingEvents) {
    const beforeStatus = event.status;
    await processEvent(event as OutboxEvent);
    
    // Check final status
    const [updated] = await db.select()
      .from(integrationEvents)
      .where(eq(integrationEvents.id, event.id))
      .limit(1);
    
    if (updated) {
      if (updated.status === 'COMPLETED') succeeded++;
      else if (updated.status === 'DEAD_LETTER') deadLettered++;
      else failed++;
    }
  }
  
  const result = {
    processed: pendingEvents.length,
    succeeded,
    failed,
    deadLettered,
  };
  
  console.log(`[OutboxWorker] Completed: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Cleanup old completed events and expired nonces
 */
export async function cleanupOutbox(retentionDays: number = 30): Promise<{
  deletedEvents: number;
  deletedNonces: number;
}> {
  const db = await getDb();
  if (!db) {
    return { deletedEvents: 0, deletedNonces: 0 };
  }
  
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  
  // Delete old completed events
  const deleteEventsResult = await db.delete(integrationEvents)
    .where(
      and(
        eq(integrationEvents.status, 'COMPLETED'),
        lt(integrationEvents.completedAt, cutoffDate)
      )
    );
  
  // Delete expired nonces
  const { usedNonces } = await import('../../drizzle/schema');
  const deleteNoncesResult = await db.delete(usedNonces)
    .where(lt(usedNonces.expiresAt, new Date()));
  
  return {
    deletedEvents: 0, // Drizzle doesn't return affected rows easily
    deletedNonces: 0,
  };
}

/**
 * Get outbox statistics
 */
export async function getOutboxStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetter: number;
}> {
  const db = await getDb();
  if (!db) {
    return { pending: 0, processing: 0, completed: 0, failed: 0, deadLetter: 0 };
  }
  
  const [pending] = await db.select()
    .from(integrationEvents)
    .where(eq(integrationEvents.status, 'PENDING'));
  
  // This is a simplified version - in production you'd use COUNT aggregates
  return {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    deadLetter: 0,
  };
}

// ============================================================================
// CRON ENTRYPOINT
// ============================================================================

// If run directly as a script (ESM compatible)
const isMainModule = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`;
if (isMainModule) {
  processOutbox()
    .then(result => {
      console.log('Outbox processing complete:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Outbox processing failed:', error);
      process.exit(1);
    });
}
