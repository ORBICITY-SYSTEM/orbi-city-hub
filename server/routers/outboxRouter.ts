/**
 * PowerHub Outbox Router
 * 
 * tRPC endpoints for managing the outbox worker.
 * Provides manual trigger, stats, and dead letter management.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../_core/trpc';
import { processOutbox, cleanupOutbox, getOutboxStats } from '../workers/outboxWorker';
import { getDb } from '../db';
import { integrationEvents } from '../../drizzle/schema';
import { eq, desc, and, or } from 'drizzle-orm';

export const outboxRouter = router({
  /**
   * Manually trigger outbox processing
   * Admin only
   */
  process: adminProcedure
    .mutation(async () => {
      try {
        const result = await processOutbox();
        return {
          success: true,
          ...result,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Outbox processing failed: ${error}`,
        });
      }
    }),
  
  /**
   * Get outbox statistics
   */
  stats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable',
        });
      }
      
      // Get counts by status
      const allEvents = await db.select()
        .from(integrationEvents)
        .limit(10000);
      
      const stats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        deadLetter: 0,
        total: allEvents.length,
      };
      
      for (const event of allEvents) {
        switch (event.status) {
          case 'PENDING': stats.pending++; break;
          case 'PROCESSING': stats.processing++; break;
          case 'COMPLETED': stats.completed++; break;
          case 'FAILED': stats.failed++; break;
          case 'DEAD_LETTER': stats.deadLetter++; break;
        }
      }
      
      return stats;
    }),
  
  /**
   * List recent events
   */
  list: adminProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable',
        });
      }
      
      let query = db.select()
        .from(integrationEvents)
        .orderBy(desc(integrationEvents.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      if (input.status) {
        query = db.select()
          .from(integrationEvents)
          .where(eq(integrationEvents.status, input.status))
          .orderBy(desc(integrationEvents.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }
      
      const events = await query;
      
      return {
        events,
        pagination: {
          limit: input.limit,
          offset: input.offset,
          hasMore: events.length === input.limit,
        },
      };
    }),
  
  /**
   * Retry a dead-lettered event
   */
  retry: adminProcedure
    .input(z.object({
      eventId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable',
        });
      }
      
      // Find the event
      const [event] = await db.select()
        .from(integrationEvents)
        .where(eq(integrationEvents.id, input.eventId))
        .limit(1);
      
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }
      
      if (event.status !== 'DEAD_LETTER' && event.status !== 'FAILED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only retry failed or dead-lettered events',
        });
      }
      
      // Reset for retry
      await db.update(integrationEvents)
        .set({
          status: 'PENDING',
          retryCount: 0,
          nextRetryAt: new Date(),
          lastError: null,
        })
        .where(eq(integrationEvents.id, input.eventId));
      
      return { success: true, eventId: input.eventId };
    }),
  
  /**
   * Retry all dead-lettered events
   */
  retryAll: adminProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable',
        });
      }
      
      await db.update(integrationEvents)
        .set({
          status: 'PENDING',
          retryCount: 0,
          nextRetryAt: new Date(),
          lastError: null,
        })
        .where(eq(integrationEvents.status, 'DEAD_LETTER'));
      
      return { success: true };
    }),
  
  /**
   * Delete old completed events
   */
  cleanup: adminProcedure
    .input(z.object({
      retentionDays: z.number().min(1).max(365).default(30),
    }))
    .mutation(async ({ input }) => {
      const result = await cleanupOutbox(input.retentionDays);
      return {
        success: true,
        ...result,
      };
    }),
  
  /**
   * Get event details
   */
  get: adminProcedure
    .input(z.object({
      eventId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable',
        });
      }
      
      const [event] = await db.select()
        .from(integrationEvents)
        .where(eq(integrationEvents.id, input.eventId))
        .limit(1);
      
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }
      
      return event;
    }),
});

export type OutboxRouter = typeof outboxRouter;
