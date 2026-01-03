/**
 * Apps Script Bridge Router
 * 
 * This router provides compatibility layer for Apps Script to communicate with Hub.
 * It accepts the Apps Script format (action + token + data) and translates to Hub's internal format.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { 
  bookings,
  tasks,
  messages,
  payments,
  leads,
  rooms,
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================================
// JWT VALIDATION (Compatible with Apps Script JWT format)
// ============================================================================

const API_SECRET = process.env.APPS_SCRIPT_SECRET || process.env.API_SECRET || 'dev-secret';

function validateAppsScriptToken(token: string): { email: string; role: string; name: string } | null {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode payload (middle part)
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now()) {
      console.log('[AppsBridge] Token expired');
      return null;
    }
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', API_SECRET)
      .update(parts[0] + '.' + parts[1])
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (expectedSig !== parts[2]) {
      console.log('[AppsBridge] Invalid signature');
      return null;
    }
    
    return {
      email: payload.email || '',
      role: payload.role || 'staff',
      name: payload.name || '',
    };
  } catch (error) {
    console.error('[AppsBridge] Token validation error:', error);
    return null;
  }
}

// ============================================================================
// SCHEMAS - Apps Script Format
// ============================================================================

const AppsScriptRequestSchema = z.object({
  action: z.string(),
  token: z.string().optional(),
  // All other fields are passed through
}).passthrough();

const ReservationSchema = z.object({
  id: z.string().optional(),
  ID: z.string().optional(),
  guestName: z.string().optional(),
  GuestName: z.string().optional(),
  checkIn: z.string().optional(),
  CheckIn: z.string().optional(),
  checkOut: z.string().optional(),
  CheckOut: z.string().optional(),
  room: z.string().optional(),
  Room: z.string().optional(),
  source: z.string().optional(),
  Source: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  Price: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  Status: z.string().optional(),
  phone: z.string().optional(),
  Phone: z.string().optional(),
  email: z.string().optional(),
  Email: z.string().optional(),
  notes: z.string().optional(),
  Notes: z.string().optional(),
  nights: z.union([z.string(), z.number()]).optional(),
  Nights: z.union([z.string(), z.number()]).optional(),
  otelmsId: z.string().optional(),
  OtelmsID: z.string().optional(),
}).passthrough();

// ============================================================================
// HANDLERS
// ============================================================================

async function handleGetReservations() {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  
  const result = await db.select().from(bookings).orderBy(bookings.checkIn);
  
  // Transform to Apps Script format
  return {
    reservations: result.map(r => ({
      ID: r.id,
      GuestName: r.guestName,
      CheckIn: r.checkIn?.toISOString().split('T')[0],
      CheckOut: r.checkOut?.toISOString().split('T')[0],
      Room: r.unitCode || r.unitId,
      Source: r.channel,
      Price: r.totalAmount,
      Status: r.status,
      Phone: r.guestPhone,
      Email: r.guestEmail,
      Notes: r.notes,
      Nights: r.nights,
    })),
  };
}

async function handleSyncReservationsSmart(
  newReservations: z.infer<typeof ReservationSchema>[],
  userEmail: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  
  if (!Array.isArray(newReservations) || newReservations.length === 0) {
    return { status: 'success', msg: 'No reservations', inserted: 0, updated: 0 };
  }
  
  let inserted = 0;
  let updated = 0;
  
  for (const res of newReservations) {
    const id = res.id || res.ID || `gs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const guestName = res.guestName || res.GuestName || '';
    const checkIn = res.checkIn || res.CheckIn;
    const checkOut = res.checkOut || res.CheckOut;
    const room = res.room || res.Room || '';
    const source = res.source || res.Source || 'DIRECT';
    const price = res.price || res.Price;
    const status = res.status || res.Status || 'CONFIRMED';
    const phone = res.phone || res.Phone;
    const email = res.email || res.Email;
    const notes = res.notes || res.Notes;
    const nights = res.nights || res.Nights;
    
    try {
      // Check if exists
      const existing = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
      
      if (existing.length > 0) {
        // Update
        await db.update(bookings).set({
          guestName,
          checkIn: checkIn ? new Date(checkIn) : undefined,
          checkOut: checkOut ? new Date(checkOut) : undefined,
          unitCode: room,
          channel: source.toUpperCase(),
          totalAmount: price?.toString(),
          status: status.toUpperCase(),
          guestPhone: phone,
          guestEmail: email,
          notes,
          nights: typeof nights === 'string' ? parseInt(nights) : nights,
          lastUpdatedSource: 'APPS_SCRIPT',
        }).where(eq(bookings.id, id));
        updated++;
      } else {
        // Insert
        await db.insert(bookings).values({
          id,
          guestName,
          checkIn: checkIn ? new Date(checkIn) : new Date(),
          checkOut: checkOut ? new Date(checkOut) : new Date(),
          unitCode: room,
          channel: source.toUpperCase(),
          totalAmount: price?.toString(),
          status: status.toUpperCase(),
          guestPhone: phone,
          guestEmail: email,
          notes,
          nights: typeof nights === 'string' ? parseInt(nights) : nights,
          lastUpdatedSource: 'APPS_SCRIPT',
        });
        inserted++;
      }
    } catch (error) {
      console.error('[AppsBridge] Error syncing reservation:', id, error);
    }
  }
  
  console.log(`[AppsBridge] Sync complete: ${inserted} inserted, ${updated} updated`);
  return { status: 'success', inserted, updated };
}

async function handleGetRooms() {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  
  const result = await db.select().from(rooms).orderBy(rooms.building, rooms.roomNumber);
  
  return {
    rooms: result.map(r => ({
      RoomNumber: r.roomNumber,
      Block: r.building,
      Floor: r.floor,
      Type: r.type,
      Status: r.status,
      Notes: r.notes,
    })),
  };
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appscriptBridgeRouter = router({
  /**
   * Main bridge endpoint - accepts Apps Script format requests
   * POST /api/trpc/appscriptBridge.handle
   */
  handle: publicProcedure
    .input(AppsScriptRequestSchema)
    .mutation(async ({ input }) => {
      const { action, token, ...data } = input;
      
      // Public actions (no auth required)
      if (action === 'health' || action === 'ping') {
        return {
          status: 'active',
          version: '1.0.0',
          system: 'ORBI CITY HUB',
          timestamp: new Date().toISOString(),
        };
      }
      
      // Validate token for protected actions
      const user = token ? validateAppsScriptToken(token) : null;
      if (!user) {
        return { status: 401, message: 'Unauthorized - Invalid or missing token' };
      }
      
      // Route to appropriate handler
      try {
        switch (action) {
          case 'get_reservations':
            return await handleGetReservations();
            
          case 'sync_reservations_smart':
            const reservations = (data as any).newReservations || [];
            return await handleSyncReservationsSmart(reservations, user.email);
            
          case 'get_rooms':
            return await handleGetRooms();
            
          case 'get_app_schema':
            return {
              appName: 'Orbi City Hub',
              version: '1.0.0',
              navigation: [
                { id: 'dashboard', label: 'Dashboard', path: '/dashboard', active: true },
                { id: 'reservations', label: 'Reservations', path: '/reservations', active: true },
                { id: 'logistics', label: 'Logistics', path: '/logistics', active: true },
              ],
            };
            
          default:
            return { status: 'error', message: `Unknown action: ${action}` };
        }
      } catch (error) {
        console.error('[AppsBridge] Handler error:', error);
        return { status: 'error', message: (error as Error).message };
      }
    }),
  
  /**
   * Health check endpoint
   */
  health: publicProcedure.query(() => ({
    status: 'active',
    version: '1.0.0',
    system: 'ORBI CITY HUB - Apps Script Bridge',
    timestamp: new Date().toISOString(),
  })),
});

export type AppscriptBridgeRouter = typeof appscriptBridgeRouter;
