/**
 * PowerHub Event Types
 * 
 * Zod validators for all event types in the PowerHub architecture.
 * These define the contract between Apps Script Gateway and Hub.
 */

import { z } from 'zod';

// ============================================================================
// EVENT ENVELOPE - Common wrapper for all events
// ============================================================================

/**
 * Actor - Who/what triggered the event
 */
export const ActorSchema = z.object({
  type: z.enum(['USER', 'SYSTEM', 'AGENT']),
  id: z.string().optional(),
  name: z.string().optional(),
  urn: z.string().optional(), // e.g., "urn:system:appscript:gmail-parser"
});

/**
 * Entity - What entity this event affects
 */
export const EntitySchema = z.object({
  entityType: z.string(), // e.g., "Booking", "RoomStatus", "Task"
  entityId: z.string(),
  entityVersion: z.number().optional(),
});

/**
 * Trace - For observability and debugging
 */
export const TraceSchema = z.object({
  traceId: z.string(), // End-to-end request tracking
  correlationId: z.string().optional(), // Links events in a workflow
  causationId: z.string().optional(), // The event that caused this one
});

/**
 * Event Envelope - The standard wrapper for all events
 */
export const EventEnvelopeSchema = z.object({
  // Required fields
  eventId: z.string(), // UUID, unique per event
  eventType: z.string(), // e.g., "Booking.Upserted"
  schemaVersion: z.number().default(1),
  occurredAt: z.string().datetime(), // ISO 8601
  
  // Source info
  source: z.string(), // e.g., "APPS_SCRIPT_GMAIL", "HUB_UI", "WEBSITE"
  producer: z.string().optional(), // e.g., "orbi-appscript-gmail@v1"
  
  // Actor and entity
  actor: ActorSchema.optional(),
  entity: EntitySchema.optional(),
  
  // Tracing
  trace: TraceSchema.optional(),
  
  // Deduplication
  dedupeKey: z.string().optional(), // Custom key for deduplication
  
  // The actual event data
  payload: z.record(z.unknown()),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

// ============================================================================
// 1. BOOKING EVENTS
// ============================================================================

export const BookingChannelEnum = z.enum([
  'DIRECT', 'WEBSITE', 'BOOKING', 'AIRBNB', 'EXPEDIA', 'AGODA', 'MANUAL', 'OTHER'
]);

export const BookingStatusEnum = z.enum([
  'NEW', 'CONFIRMED', 'MODIFIED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW'
]);

export const BookingGuestSchema = z.object({
  guestId: z.string().optional(),
  fullName: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
});

export const BookingPricingSchema = z.object({
  amount: z.number(),
  currency: z.string().default('USD'),
});

export const BookingChannelRefSchema = z.object({
  channel: BookingChannelEnum.optional(),
  externalReservationId: z.string().optional(),
});

export const BookingRawSchema = z.object({
  emailMessageId: z.string().optional(),
  emailThreadId: z.string().optional(),
  parsedConfidence: z.number().min(0).max(1).optional(),
});

/**
 * Booking.Upserted - New booking or update to existing booking
 */
export const BookingUpsertedPayloadSchema = z.object({
  booking: z.object({
    bookingId: z.string(),
    channelRef: BookingChannelRefSchema.optional(),
    
    status: BookingStatusEnum,
    checkIn: z.string(), // YYYY-MM-DD
    checkOut: z.string(),
    nights: z.number().int().positive(),
    
    unitId: z.string().optional(),
    unitCode: z.string().optional(),
    
    guest: BookingGuestSchema,
    
    occupancy: z.object({
      adults: z.number().int().min(1).default(1),
      children: z.number().int().min(0).default(0),
    }).optional(),
    
    pricing: BookingPricingSchema.optional(),
    
    notes: z.string().optional(),
    raw: BookingRawSchema.optional(),
  }),
});

export type BookingUpsertedPayload = z.infer<typeof BookingUpsertedPayloadSchema>;

/**
 * Booking.Cancelled - Explicit cancellation event
 */
export const BookingCancelledPayloadSchema = z.object({
  channelRef: BookingChannelRefSchema,
  cancelledAt: z.string().datetime(),
  reason: z.enum(['GUEST_REQUEST', 'NO_SHOW', 'OTA_CANCELLED', 'ADMIN', 'OTHER']),
  raw: BookingRawSchema.optional(),
});

export type BookingCancelledPayload = z.infer<typeof BookingCancelledPayloadSchema>;

// ============================================================================
// 2. ROOM STATUS EVENTS
// ============================================================================

export const RoomStatusEnum = z.enum([
  'VACANT', 'OCCUPIED', 'DIRTY', 'CLEANING', 'CLEAN', 'INSPECTED', 'MAINTENANCE', 'OUT_OF_SERVICE'
]);

export const RoomStatusReasonEnum = z.enum([
  'CHECKOUT', 'CHECKIN', 'MAINTENANCE', 'DEEP_CLEAN', 'MANUAL', 'SCHEDULED', 'OTHER'
]);

/**
 * RoomStatus.Changed - Room/unit status update
 */
export const RoomStatusChangedPayloadSchema = z.object({
  unitId: z.string(),
  unitCode: z.string().optional(),
  
  fromStatus: RoomStatusEnum.optional(),
  toStatus: RoomStatusEnum,
  
  reason: RoomStatusReasonEnum.optional(),
  effectiveAt: z.string().datetime(),
  
  assignedTo: z.object({
    staffId: z.string(),
    name: z.string(),
  }).optional(),
  
  relatedBookingId: z.string().optional(),
  comment: z.string().optional(),
});

export type RoomStatusChangedPayload = z.infer<typeof RoomStatusChangedPayloadSchema>;

// ============================================================================
// 3. TASK EVENTS
// ============================================================================

export const TaskTypeEnum = z.enum([
  'CLEANING', 'MAINTENANCE', 'GUEST_REQUEST', 'ADMIN', 'SALES', 'FINANCE', 'OTHER'
]);

export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const TaskStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED']);

/**
 * Task.Upserted - Task created or updated
 */
export const TaskUpsertedPayloadSchema = z.object({
  task: z.object({
    taskId: z.string(),
    type: TaskTypeEnum,
    title: z.string(),
    description: z.string().optional(),
    
    priority: TaskPriorityEnum.default('MEDIUM'),
    status: TaskStatusEnum.default('OPEN'),
    
    dueAt: z.string().datetime().optional(),
    
    assignees: z.array(z.object({
      staffId: z.string(),
      name: z.string(),
    })).optional(),
    
    links: z.object({
      bookingId: z.string().optional(),
      unitId: z.string().optional(),
      guestId: z.string().optional(),
    }).optional(),
    
    tags: z.array(z.string()).optional(),
    
    sourceRef: z.object({
      sheetRowId: z.string().optional(),
      telegramMsgId: z.string().optional(),
    }).optional(),
  }),
});

export type TaskUpsertedPayload = z.infer<typeof TaskUpsertedPayloadSchema>;

// ============================================================================
// 4. MESSAGE EVENTS
// ============================================================================

export const MessageChannelEnum = z.enum([
  'EMAIL', 'TELEGRAM', 'WHATSAPP', 'SMS', 'PHONE_NOTE', 'WEBSITE_CHAT', 'OTHER'
]);

export const MessageDirectionEnum = z.enum(['INBOUND', 'OUTBOUND']);

/**
 * Message.Logged - Communication logged
 */
export const MessageLoggedPayloadSchema = z.object({
  message: z.object({
    messageId: z.string(),
    direction: MessageDirectionEnum,
    channel: MessageChannelEnum,
    
    threadId: z.string().optional(),
    
    from: z.string(),
    to: z.string(),
    
    subject: z.string().optional(),
    bodySnippet: z.string().optional(),
    bodyRef: z.object({
      driveFileId: z.string().optional(),
    }).optional(),
    
    attachments: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
      size: z.number().optional(),
    })).optional(),
    
    links: z.object({
      bookingId: z.string().optional(),
      guestId: z.string().optional(),
      unitId: z.string().optional(),
    }).optional(),
    
    sentAt: z.string().datetime(),
    
    raw: z.object({
      gmailMessageId: z.string().optional(),
      telegramUpdateId: z.string().optional(),
    }).optional(),
  }),
});

export type MessageLoggedPayload = z.infer<typeof MessageLoggedPayloadSchema>;

// ============================================================================
// 5. PAYMENT EVENTS
// ============================================================================

export const PaymentDirectionEnum = z.enum(['IN', 'OUT']);

export const PaymentMethodEnum = z.enum([
  'CASH', 'CARD', 'BANK', 'ONLINE', 'OTA_PAYOUT', 'OTHER'
]);

export const PaymentStatusEnum = z.enum([
  'PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED'
]);

/**
 * Payment.Recorded - Payment transaction recorded
 */
export const PaymentRecordedPayloadSchema = z.object({
  payment: z.object({
    paymentId: z.string(),
    bookingId: z.string().optional(),
    
    direction: PaymentDirectionEnum,
    amount: z.number(),
    currency: z.string().default('USD'),
    
    method: PaymentMethodEnum,
    status: PaymentStatusEnum.default('PENDING'),
    
    providerRef: z.string().optional(),
    note: z.string().optional(),
    
    paidAt: z.string().datetime().optional(),
  }),
});

export type PaymentRecordedPayload = z.infer<typeof PaymentRecordedPayloadSchema>;

// ============================================================================
// 6. REVIEW EVENTS
// ============================================================================

export const ReviewSourceEnum = z.enum([
  'GOOGLE', 'BOOKING', 'AIRBNB', 'EXPEDIA', 'TRIPADVISOR', 'OTHER'
]);

/**
 * Review.Ingested - Review imported from external source
 */
export const ReviewIngestedPayloadSchema = z.object({
  review: z.object({
    reviewId: z.string(),
    source: ReviewSourceEnum,
    
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    text: z.string().optional(),
    language: z.string().optional(),
    
    authorName: z.string().optional(),
    publishedAt: z.string().datetime(),
    
    url: z.string().url().optional(),
    
    links: z.object({
      unitId: z.string().optional(),
      bookingExternalCode: z.string().optional(),
    }).optional(),
    
    responseStatus: z.enum(['NONE', 'DRAFTED', 'SENT']).default('NONE'),
    responseText: z.string().optional(),
  }),
});

export type ReviewIngestedPayload = z.infer<typeof ReviewIngestedPayloadSchema>;

// ============================================================================
// 7. LEAD EVENTS
// ============================================================================

export const LeadSourceEnum = z.enum([
  'WEBSITE', 'FORM', 'CALL', 'INSTAGRAM', 'WHATSAPP', 'TELEGRAM', 'EMAIL', 'OTHER'
]);

export const LeadIntentEnum = z.enum([
  'BOOKING_QUESTION', 'PRICE_REQUEST', 'AVAILABILITY', 'PARTNERSHIP', 'OTHER'
]);

/**
 * Lead.Captured - New lead captured
 */
export const LeadCapturedPayloadSchema = z.object({
  lead: z.object({
    leadId: z.string(),
    source: LeadSourceEnum,
    
    contact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }),
    
    intent: LeadIntentEnum.default('OTHER'),
    message: z.string().optional(),
    
    utm: z.object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      content: z.string().optional(),
      term: z.string().optional(),
    }).optional(),
  }),
});

export type LeadCapturedPayload = z.infer<typeof LeadCapturedPayloadSchema>;

// ============================================================================
// EVENT TYPE REGISTRY
// ============================================================================

export const EventTypeRegistry = {
  'Booking.Upserted': BookingUpsertedPayloadSchema,
  'Booking.Cancelled': BookingCancelledPayloadSchema,
  'RoomStatus.Changed': RoomStatusChangedPayloadSchema,
  'Task.Upserted': TaskUpsertedPayloadSchema,
  'Message.Logged': MessageLoggedPayloadSchema,
  'Payment.Recorded': PaymentRecordedPayloadSchema,
  'Review.Ingested': ReviewIngestedPayloadSchema,
  'Lead.Captured': LeadCapturedPayloadSchema,
} as const;

export type EventType = keyof typeof EventTypeRegistry;

/**
 * Validate an event envelope with its specific payload schema
 */
export function validateEvent<T extends EventType>(
  eventType: T,
  envelope: unknown
): { success: true; data: EventEnvelope } | { success: false; error: z.ZodError } {
  // First validate the envelope structure
  const envelopeResult = EventEnvelopeSchema.safeParse(envelope);
  if (!envelopeResult.success) {
    return { success: false, error: envelopeResult.error };
  }
  
  // Then validate the payload against the specific event type schema
  const payloadSchema = EventTypeRegistry[eventType];
  if (!payloadSchema) {
    return { success: true, data: envelopeResult.data };
  }
  
  const payloadResult = payloadSchema.safeParse(envelopeResult.data.payload);
  if (!payloadResult.success) {
    return { success: false, error: payloadResult.error };
  }
  
  return { success: true, data: envelopeResult.data };
}
