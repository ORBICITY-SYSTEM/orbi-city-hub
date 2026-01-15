/**
 * OtelMS Parser - DEPRECATED
 * 
 * ⚠️ DEPRECATED: Email parsing is no longer used.
 * OTELMS data now comes from Python API (otelms-api.run.app) via server/routers/otelms.ts
 * 
 * This file is kept only for backward compatibility during migration.
 * All email parsing functionality has been removed.
 * 
 * @deprecated Use Python API integration instead (otelmsRouter.syncCalendar)
 */

export interface OtelmsReservation {
  reservationId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  source: string;
  totalPrice: number;
  status: string;
}

/**
 * Check if email is from OtelMS - Stub implementation
 * @deprecated Use Google Sheet service instead
 */
export function isOtelmsEmail(emailSubject: string, emailFrom: string): boolean {
  console.warn('[OtelmsParser] DEPRECATED: isOtelmsEmail called. Use Google Sheet service instead.');
  
  // Return false to skip email parsing
  return false;
}

/**
 * Parse OtelMS email - Stub implementation
 * @deprecated Use Google Sheet service instead
 */
export async function parseOtelmsEmail(
  emailBody: string,
  emailSubject: string
): Promise<OtelmsReservation | null> {
  console.warn('[OtelmsParser] DEPRECATED: parseOtelmsEmail called. Use Google Sheet service instead.');
  
  // Return null to indicate no parsing
  return null;
}

/**
 * Get reservation from OtelMS - Stub implementation
 * @deprecated Use Google Sheet service instead
 */
export async function getOtelmsReservation(
  reservationId: string
): Promise<OtelmsReservation | null> {
  console.warn('[OtelmsParser] DEPRECATED: getOtelmsReservation called. Use Google Sheet service instead.');
  
  // Return null - data should come from Google Sheet
  return null;
}

export default {
  isOtelmsEmail,
  parseOtelmsEmail,
  getOtelmsReservation,
};
