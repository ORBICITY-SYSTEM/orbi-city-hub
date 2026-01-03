/**
 * PowerHub Ingest Router
 * 
 * Secure endpoint for receiving events from Apps Script Gateway.
 * Implements HMAC verification, nonce-based replay protection, and idempotency.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { 
  integrationEvents, 
  usedNonces, 
  processedEvents,
  bookings,
  tasks,
  messages,
  payments,
  leads,
  units,
} from '../../drizzle/schema';
import { 
  EventEnvelopeSchema, 
  EventTypeRegistry,
  validateEvent,
  type EventType,
  type EventEnvelope,
  BookingUpsertedPayloadSchema,
  TaskUpsertedPayloadSchema,
  MessageLoggedPayloadSchema,
  PaymentRecordedPayloadSchema,
  LeadCapturedPayloadSchema,
  RoomStatusChangedPayloadSchema,
  ReviewIngestedPayloadSchema,
} from '../../shared/powerhub/eventTypes';
import { IngestHeadersSchema, IngestRequestSchema, type IngestResponse } from '../../shared/powerhub/security';
import { eq, and, gt, lt } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const POWERHUB_SECRET = process.env.POWERHUB_SECRET || 'dev-secret-change-in-production';
const NONCE_TTL_SECONDS = 300; // 5 minutes
const MAX_TIMESTAMP_DRIFT_SECONDS = 60; // Allow 1 minute clock drift

// ============================================================================
// HMAC VERIFICATION
// ============================================================================

function generateHmacSignature(
  payload: unknown,
  secret: string,
  timestamp: string,
  nonce: string
): string {
  const message = `${timestamp}.${nonce}.${JSON.stringify(payload)}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

function verifyHmacSignature(
  payload: unknown,
  signature: string,
  secret: string,
  timestamp: string,
  nonce: string
): { valid: boolean; error?: string } {
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  
  if (isNaN(requestTime)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }
  
  if (now - requestTime > NONCE_TTL_SECONDS) {
    return { valid: false, error: 'Request expired (replay attack prevention)' };
  }
  
  if (requestTime > now + MAX_TIMESTAMP_DRIFT_SECONDS) {
    return { valid: false, error: 'Request timestamp is in the future' };
  }
  
  const expectedSignature = generateHmacSignature(payload, secret, timestamp, nonce);
  
  // Constant-time comparison
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Invalid signature' };
    }
  } catch {
    return { valid: false, error: 'Invalid signature format' };
  }
  
  return { valid: true };
}

// ============================================================================
// NONCE MANAGEMENT
// ============================================================================

async function checkAndStoreNonce(nonce: string, source: string): Promise<{ valid: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { valid: false, error: 'Database unavailable' };
  }
  
  try {
    // Check if nonce already exists
    const existing = await db.select()
      .from(usedNonces)
      .where(eq(usedNonces.nonce, nonce))
      .limit(1);
    
    if (existing.length > 0) {
      return { valid: false, error: 'Nonce already used (replay attack prevention)' };
    }
    
    // Store the nonce with TTL
    const expiresAt = new Date(Date.now() + NONCE_TTL_SECONDS * 1000);
    await db.insert(usedNonces).values({
      nonce,
      source,
      expiresAt,
    });
    
    return { valid: true };
  } catch (error) {
    console.error('[Ingest] Nonce check failed:', error);
    return { valid: false, error: 'Nonce verification failed' };
  }
}

// ============================================================================
// IDEMPOTENCY CHECK
// ============================================================================

async function checkIdempotency(eventId: string): Promise<{ processed: boolean; result?: string }> {
  const db = await getDb();
  if (!db) {
    return { processed: false };
  }
  
  try {
    const existing = await db.select()
      .from(processedEvents)
      .where(eq(processedEvents.eventId, eventId))
      .limit(1);
    
    if (existing.length > 0) {
      return { processed: true, result: existing[0].result };
    }
    
    return { processed: false };
  } catch (error) {
    console.error('[Ingest] Idempotency check failed:', error);
    return { processed: false };
  }
}

async function markEventProcessed(
  eventId: string,
  eventType: string,
  source: string,
  entityType?: string,
  entityId?: string,
  result: 'SUCCESS' | 'IGNORED' | 'FAILED' = 'SUCCESS',
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(processedEvents).values({
      eventId,
      eventType,
      source,
      entityType,
      entityId,
      result,
      metadata,
    });
  } catch (error) {
    console.error('[Ingest] Failed to mark event as processed:', error);
  }
}

// ============================================================================
// EVENT PROCESSORS
// ============================================================================

async function processBookingUpserted(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database unavailable' };
  
  const payloadResult = BookingUpsertedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  const { booking } = payloadResult.data;
  
  try {
    // Upsert booking
    await db.insert(bookings).values({
      id: booking.bookingId,
      channel: booking.channelRef?.channel || 'DIRECT',
      externalReservationId: booking.channelRef?.externalReservationId,
      status: booking.status,
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
      nights: booking.nights,
      unitId: booking.unitId,
      unitCode: booking.unitCode,
      guestName: booking.guest.fullName,
      guestEmail: booking.guest.email,
      guestPhone: booking.guest.phone,
      guestCountry: booking.guest.country,
      guestLanguage: booking.guest.language,
      adults: booking.occupancy?.adults || 1,
      children: booking.occupancy?.children || 0,
      totalAmount: booking.pricing?.amount?.toString(),
      currency: booking.pricing?.currency || 'USD',
      notes: booking.notes,
      rawEmailId: booking.raw?.emailMessageId,
      rawData: booking.raw,
      parseConfidence: booking.raw?.parsedConfidence?.toString(),
      lastUpdatedSource: envelope.source,
    }).onDuplicateKeyUpdate({
      set: {
        status: booking.status,
        checkIn: new Date(booking.checkIn),
        checkOut: new Date(booking.checkOut),
        nights: booking.nights,
        unitId: booking.unitId,
        unitCode: booking.unitCode,
        guestName: booking.guest.fullName,
        guestEmail: booking.guest.email,
        guestPhone: booking.guest.phone,
        adults: booking.occupancy?.adults || 1,
        children: booking.occupancy?.children || 0,
        totalAmount: booking.pricing?.amount?.toString(),
        lastUpdatedSource: envelope.source,
      },
    });
    
    return { success: true, entityId: booking.bookingId };
  } catch (error) {
    console.error('[Ingest] Booking upsert failed:', error);
    return { success: false, error: `Database error: ${error}` };
  }
}

async function processTaskUpserted(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database unavailable' };
  
  const payloadResult = TaskUpsertedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  const { task } = payloadResult.data;
  
  try {
    await db.insert(tasks).values({
      id: task.taskId,
      type: task.type,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
      assignedTo: task.assignees?.[0]?.staffId,
      assignedToName: task.assignees?.[0]?.name,
      bookingId: task.links?.bookingId,
      unitId: task.links?.unitId,
      guestId: task.links?.guestId,
      tags: task.tags,
      sourceRef: task.sourceRef,
      lastUpdatedSource: envelope.source,
    }).onDuplicateKeyUpdate({
      set: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
        assignedTo: task.assignees?.[0]?.staffId,
        assignedToName: task.assignees?.[0]?.name,
        lastUpdatedSource: envelope.source,
      },
    });
    
    return { success: true, entityId: task.taskId };
  } catch (error) {
    console.error('[Ingest] Task upsert failed:', error);
    return { success: false, error: `Database error: ${error}` };
  }
}

async function processMessageLogged(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database unavailable' };
  
  const payloadResult = MessageLoggedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  const { message } = payloadResult.data;
  
  try {
    await db.insert(messages).values({
      id: message.messageId,
      channel: message.channel,
      direction: message.direction,
      threadId: message.threadId,
      fromAddress: message.from,
      toAddress: message.to,
      subject: message.subject,
      bodySnippet: message.bodySnippet,
      bodyRef: message.bodyRef,
      attachments: message.attachments,
      bookingId: message.links?.bookingId,
      guestId: message.links?.guestId,
      unitId: message.links?.unitId,
      rawRef: message.raw,
      sentAt: new Date(message.sentAt),
    });
    
    return { success: true, entityId: message.messageId };
  } catch (error) {
    console.error('[Ingest] Message insert failed:', error);
    return { success: false, error: `Database error: ${error}` };
  }
}

async function processPaymentRecorded(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database unavailable' };
  
  const payloadResult = PaymentRecordedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  const { payment } = payloadResult.data;
  
  try {
    await db.insert(payments).values({
      id: payment.paymentId,
      bookingId: payment.bookingId,
      direction: payment.direction,
      amount: payment.amount.toString(),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      providerRef: payment.providerRef,
      note: payment.note,
      paidAt: payment.paidAt ? new Date(payment.paidAt) : undefined,
      lastUpdatedSource: envelope.source,
    }).onDuplicateKeyUpdate({
      set: {
        status: payment.status,
        providerRef: payment.providerRef,
        paidAt: payment.paidAt ? new Date(payment.paidAt) : undefined,
        lastUpdatedSource: envelope.source,
      },
    });
    
    return { success: true, entityId: payment.paymentId };
  } catch (error) {
    console.error('[Ingest] Payment insert failed:', error);
    return { success: false, error: `Database error: ${error}` };
  }
}

async function processLeadCaptured(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database unavailable' };
  
  const payloadResult = LeadCapturedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  const { lead } = payloadResult.data;
  
  try {
    await db.insert(leads).values({
      id: lead.leadId,
      source: lead.source,
      name: lead.contact.name,
      phone: lead.contact.phone,
      email: lead.contact.email,
      intent: lead.intent,
      message: lead.message,
      utmSource: lead.utm?.source,
      utmMedium: lead.utm?.medium,
      utmCampaign: lead.utm?.campaign,
      utmContent: lead.utm?.content,
      utmTerm: lead.utm?.term,
    });
    
    return { success: true, entityId: lead.leadId };
  } catch (error) {
    console.error('[Ingest] Lead insert failed:', error);
    return { success: false, error: `Database error: ${error}` };
  }
}

async function processRoomStatusChanged(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database unavailable' };
  
  const payloadResult = RoomStatusChangedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  const data = payloadResult.data;
  
  try {
    // Update unit status
    await db.update(units)
      .set({
        status: data.toStatus === 'OCCUPIED' ? 'OCCUPIED' : 
                data.toStatus === 'MAINTENANCE' ? 'MAINTENANCE' :
                data.toStatus === 'OUT_OF_SERVICE' ? 'OUT_OF_SERVICE' : 'AVAILABLE',
        cleaningStatus: data.toStatus === 'DIRTY' ? 'DIRTY' :
                        data.toStatus === 'CLEANING' ? 'CLEANING' :
                        data.toStatus === 'CLEAN' ? 'CLEAN' :
                        data.toStatus === 'INSPECTED' ? 'INSPECTED' : undefined,
        lastUpdatedSource: envelope.source,
      })
      .where(eq(units.id, data.unitId));
    
    return { success: true, entityId: data.unitId };
  } catch (error) {
    console.error('[Ingest] Room status update failed:', error);
    return { success: false, error: `Database error: ${error}` };
  }
}

async function processReviewIngested(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  // Reviews are already handled by the existing reviewsRouter
  // This is a passthrough that could trigger additional processing
  const payloadResult = ReviewIngestedPayloadSchema.safeParse(envelope.payload);
  if (!payloadResult.success) {
    return { success: false, error: `Invalid payload: ${payloadResult.error.message}` };
  }
  
  // TODO: Integrate with existing guestReviews table
  return { success: true, entityId: payloadResult.data.review.reviewId };
}

// ============================================================================
// MAIN EVENT PROCESSOR
// ============================================================================

async function processEvent(envelope: EventEnvelope): Promise<{ success: boolean; entityId?: string; error?: string }> {
  const eventType = envelope.eventType as EventType;
  
  switch (eventType) {
    case 'Booking.Upserted':
      return processBookingUpserted(envelope);
    case 'Booking.Cancelled':
      // Handle as a status update
      return processBookingUpserted({
        ...envelope,
        payload: {
          booking: {
            ...(envelope.payload as any),
            status: 'CANCELLED',
          },
        },
      });
    case 'Task.Upserted':
      return processTaskUpserted(envelope);
    case 'Message.Logged':
      return processMessageLogged(envelope);
    case 'Payment.Recorded':
      return processPaymentRecorded(envelope);
    case 'Lead.Captured':
      return processLeadCaptured(envelope);
    case 'RoomStatus.Changed':
      return processRoomStatusChanged(envelope);
    case 'Review.Ingested':
      return processReviewIngested(envelope);
    default:
      console.warn(`[Ingest] Unknown event type: ${eventType}`);
      return { success: false, error: `Unknown event type: ${eventType}` };
  }
}

// ============================================================================
// OUTBOX - Queue events for external delivery
// ============================================================================

async function queueOutboxEvent(
  eventType: string,
  destination: string,
  payload: unknown
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const eventId = `ev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    await db.insert(integrationEvents).values({
      id: eventId,
      eventType,
      destination,
      payload,
      status: 'PENDING',
      nextRetryAt: new Date(),
    });
    
    return eventId;
  } catch (error) {
    console.error('[Outbox] Failed to queue event:', error);
    return null;
  }
}

// ============================================================================
// TRPC ROUTER
// ============================================================================

export const ingestRouter = router({
  /**
   * Main ingest endpoint for Apps Script Gateway
   * Receives batches of events with HMAC authentication
   */
  ingest: publicProcedure
    .input(z.object({
      events: z.array(z.unknown()).min(1).max(100),
      // Headers are passed in the body for Apps Script compatibility
      _auth: z.object({
        signature: z.string(),
        timestamp: z.string(),
        nonce: z.string(),
        source: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }): Promise<IngestResponse> => {
      const { events, _auth } = input;
      const source = _auth.source || 'UNKNOWN';
      
      // 1. Verify HMAC signature
      const signatureResult = verifyHmacSignature(
        events,
        _auth.signature,
        POWERHUB_SECRET,
        _auth.timestamp,
        _auth.nonce
      );
      
      if (!signatureResult.valid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: signatureResult.error || 'Invalid signature',
        });
      }
      
      // 2. Check and store nonce (replay protection)
      const nonceResult = await checkAndStoreNonce(_auth.nonce, source);
      if (!nonceResult.valid) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: nonceResult.error || 'Nonce validation failed',
        });
      }
      
      // 3. Process each event
      let accepted = 0;
      let rejected = 0;
      const errors: Array<{ index: number; eventId?: string; error: string }> = [];
      
      for (let i = 0; i < events.length; i++) {
        const rawEvent = events[i];
        
        // Validate envelope structure
        const envelopeResult = EventEnvelopeSchema.safeParse(rawEvent);
        if (!envelopeResult.success) {
          rejected++;
          errors.push({
            index: i,
            error: `Invalid envelope: ${envelopeResult.error.message}`,
          });
          continue;
        }
        
        const envelope = envelopeResult.data;
        
        // Check idempotency
        const idempotencyResult = await checkIdempotency(envelope.eventId);
        if (idempotencyResult.processed) {
          // Already processed - skip but count as accepted
          accepted++;
          continue;
        }
        
        // Process the event
        const processResult = await processEvent(envelope);
        
        if (processResult.success) {
          accepted++;
          await markEventProcessed(
            envelope.eventId,
            envelope.eventType,
            source,
            envelope.entity?.entityType,
            processResult.entityId,
            'SUCCESS'
          );
          
          // Queue for Sheets mirror (if configured)
          await queueOutboxEvent(
            envelope.eventType,
            'APPS_SCRIPT_SHEETS',
            envelope.payload
          );
        } else {
          rejected++;
          errors.push({
            index: i,
            eventId: envelope.eventId,
            error: processResult.error || 'Processing failed',
          });
          await markEventProcessed(
            envelope.eventId,
            envelope.eventType,
            source,
            envelope.entity?.entityType,
            undefined,
            'FAILED',
            { error: processResult.error }
          );
        }
      }
      
      return {
        success: rejected === 0,
        accepted,
        rejected,
        errors: errors.length > 0 ? errors : undefined,
        processingId: `proc_${Date.now().toString(36)}`,
      };
    }),
  
  /**
   * Health check endpoint for Apps Script
   */
  health: publicProcedure.query(() => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })),
  
  /**
   * Get processing status for a batch
   */
  status: publicProcedure
    .input(z.object({
      processingId: z.string(),
    }))
    .query(async ({ input }) => {
      // TODO: Implement batch status tracking
      return {
        processingId: input.processingId,
        status: 'COMPLETED',
      };
    }),
});

export type IngestRouter = typeof ingestRouter;
