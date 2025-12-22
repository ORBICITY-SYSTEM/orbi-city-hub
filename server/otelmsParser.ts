/**
 * OtelMS Parser Stub - PowerStack Refactor
 * 
 * This is a stub replacement for the legacy OtelMS email parser.
 * The actual parsing logic has been moved to _LEGACY_ARCHIVE.
 * 
 * This stub provides fallback functionality to prevent build errors
 * while we transition to the Google Sheet data bridge.
 * 
 * @deprecated Use googleSheetService instead
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
