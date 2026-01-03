/**
 * Vercel Serverless Function: Apps Script Bridge
 * 
 * This endpoint allows Google Apps Script to communicate with Hub.
 * It accepts the Apps Script format (action + token + data) and processes requests.
 * 
 * URL: https://orbicityhotel.com/api/appscript
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_SECRET = process.env.APPS_SCRIPT_SECRET || process.env.API_SECRET || 'dev-secret';

// ============================================================================
// JWT VALIDATION
// ============================================================================

interface TokenPayload {
  email: string;
  role: string;
  name: string;
}

function validateAppsScriptToken(token: string): TokenPayload | null {
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
// MOCK DATA (Replace with actual database calls in production)
// ============================================================================

const MOCK_RESERVATIONS = [
  {
    ID: 'RES001',
    GuestName: 'John Smith',
    CheckIn: '2026-01-05',
    CheckOut: '2026-01-08',
    Room: '501',
    Source: 'BOOKING',
    Price: 450,
    Status: 'CONFIRMED',
    Phone: '+1234567890',
    Email: 'john@example.com',
    Notes: 'Late check-in requested',
    Nights: 3,
  },
  {
    ID: 'RES002',
    GuestName: 'Maria Garcia',
    CheckIn: '2026-01-10',
    CheckOut: '2026-01-12',
    Room: '302',
    Source: 'AIRBNB',
    Price: 280,
    Status: 'CONFIRMED',
    Phone: '+9876543210',
    Email: 'maria@example.com',
    Notes: '',
    Nights: 2,
  },
];

const MOCK_ROOMS = [
  { RoomNumber: '501', Block: 'A', Floor: 5, Type: 'Suite', Status: 'Available' },
  { RoomNumber: '502', Block: 'A', Floor: 5, Type: 'Suite', Status: 'Occupied' },
  { RoomNumber: '301', Block: 'B', Floor: 3, Type: 'Standard', Status: 'Available' },
  { RoomNumber: '302', Block: 'B', Floor: 3, Type: 'Standard', Status: 'Occupied' },
];

// ============================================================================
// HANDLERS
// ============================================================================

function handleHealth() {
  return {
    status: 'active',
    version: '1.0.0',
    system: 'ORBI CITY HUB',
    timestamp: new Date().toISOString(),
    features: ['reservations', 'rooms', 'sync'],
  };
}

function handleGetReservations() {
  return {
    status: 'success',
    reservations: MOCK_RESERVATIONS,
    count: MOCK_RESERVATIONS.length,
  };
}

function handleSyncReservationsSmart(newReservations: any[]) {
  if (!Array.isArray(newReservations) || newReservations.length === 0) {
    return { status: 'success', msg: 'No reservations to sync', inserted: 0, updated: 0 };
  }
  
  // In production, this would insert/update database records
  console.log(`[AppsBridge] Would sync ${newReservations.length} reservations`);
  
  return {
    status: 'success',
    inserted: newReservations.length,
    updated: 0,
    message: `Processed ${newReservations.length} reservations`,
  };
}

function handleGetRooms() {
  return {
    status: 'success',
    rooms: MOCK_ROOMS,
    count: MOCK_ROOMS.length,
  };
}

function handleGetAppSchema() {
  return {
    appName: 'Orbi City Hub',
    version: '1.0.0',
    navigation: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', active: true },
      { id: 'reservations', label: 'Reservations', path: '/reservations', active: true },
      { id: 'logistics', label: 'Logistics', path: '/logistics', active: true },
      { id: 'finance', label: 'Finance', path: '/finance', active: true },
    ],
    sheets: ['Reservations', 'Rooms', 'Expenses', 'Owners', 'Tickets'],
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET (health check)
  if (req.method === 'GET') {
    return res.status(200).json(handleHealth());
  }
  
  // Handle POST
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  
  try {
    const body = req.body || {};
    const { action, token, ...data } = body;
    
    console.log(`[AppsBridge] Action: ${action}`);
    
    // Public actions (no auth required)
    if (action === 'health' || action === 'ping') {
      return res.status(200).json(handleHealth());
    }
    
    // Validate token for protected actions
    const user = token ? validateAppsScriptToken(token) : null;
    if (!user) {
      return res.status(401).json({ 
        status: 401, 
        message: 'Unauthorized - Invalid or missing token',
        hint: 'Ensure API_SECRET in Apps Script matches APPS_SCRIPT_SECRET in Hub env',
      });
    }
    
    console.log(`[AppsBridge] Authenticated user: ${user.email}`);
    
    // Route to appropriate handler
    switch (action) {
      case 'get_reservations':
        return res.status(200).json(handleGetReservations());
        
      case 'sync_reservations_smart':
        const reservations = data.newReservations || [];
        return res.status(200).json(handleSyncReservationsSmart(reservations));
        
      case 'get_rooms':
        return res.status(200).json(handleGetRooms());
        
      case 'get_app_schema':
        return res.status(200).json(handleGetAppSchema());
        
      default:
        return res.status(400).json({ 
          status: 'error', 
          message: `Unknown action: ${action}`,
          availableActions: ['health', 'get_reservations', 'sync_reservations_smart', 'get_rooms', 'get_app_schema'],
        });
    }
  } catch (error) {
    console.error('[AppsBridge] Handler error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: (error as Error).message,
    });
  }
}
