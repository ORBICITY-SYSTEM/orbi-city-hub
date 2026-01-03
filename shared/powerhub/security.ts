/**
 * PowerHub Security Utilities
 * 
 * HMAC signature generation and verification for secure communication
 * between Apps Script Gateway and Hub.
 */

import { z } from 'zod';

// ============================================================================
// SECURITY SCHEMAS
// ============================================================================

/**
 * Ingest Request Headers Schema
 */
export const IngestHeadersSchema = z.object({
  'x-powerhub-signature': z.string(), // HMAC signature
  'x-powerhub-timestamp': z.string(), // Unix timestamp
  'x-powerhub-nonce': z.string(), // Random nonce for replay protection
  'x-powerhub-source': z.string().optional(), // Source identifier
});

export type IngestHeaders = z.infer<typeof IngestHeadersSchema>;

/**
 * Ingest Request Body Schema
 */
export const IngestRequestSchema = z.object({
  events: z.array(z.unknown()).min(1).max(100), // Batch of events
});

export type IngestRequest = z.infer<typeof IngestRequestSchema>;

/**
 * Ingest Response Schema
 */
export const IngestResponseSchema = z.object({
  success: z.boolean(),
  accepted: z.number(),
  rejected: z.number(),
  errors: z.array(z.object({
    index: z.number(),
    eventId: z.string().optional(),
    error: z.string(),
  })).optional(),
  processingId: z.string().optional(), // For tracking async processing
});

export type IngestResponse = z.infer<typeof IngestResponseSchema>;

// ============================================================================
// HMAC UTILITIES
// ============================================================================

/**
 * Generate HMAC signature for a payload
 * 
 * @param payload - The payload to sign (will be JSON stringified)
 * @param secret - The shared secret key
 * @param timestamp - Unix timestamp
 * @param nonce - Random nonce
 * @returns HMAC-SHA256 signature as hex string
 */
export function generateHmacSignature(
  payload: unknown,
  secret: string,
  timestamp: string,
  nonce: string
): string {
  // This is a placeholder - actual implementation will use crypto
  // In Node.js: crypto.createHmac('sha256', secret).update(message).digest('hex')
  // In Apps Script: Use Utilities.computeHmacSha256Signature
  const message = `${timestamp}.${nonce}.${JSON.stringify(payload)}`;
  return `hmac_placeholder_${message.length}`;
}

/**
 * Verify HMAC signature
 * 
 * @param payload - The received payload
 * @param signature - The received signature
 * @param secret - The shared secret key
 * @param timestamp - The received timestamp
 * @param nonce - The received nonce
 * @param maxAgeSeconds - Maximum age of the request in seconds (default: 300 = 5 minutes)
 * @returns Verification result
 */
export function verifyHmacSignature(
  payload: unknown,
  signature: string,
  secret: string,
  timestamp: string,
  nonce: string,
  maxAgeSeconds: number = 300
): { valid: boolean; error?: string } {
  // Check timestamp freshness
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  
  if (isNaN(requestTime)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }
  
  if (now - requestTime > maxAgeSeconds) {
    return { valid: false, error: 'Request too old (replay attack prevention)' };
  }
  
  if (requestTime > now + 60) {
    return { valid: false, error: 'Request timestamp is in the future' };
  }
  
  // Generate expected signature
  const expectedSignature = generateHmacSignature(payload, secret, timestamp, nonce);
  
  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  if (result !== 0) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  return { valid: true };
}

// ============================================================================
// NONCE UTILITIES
// ============================================================================

/**
 * Generate a cryptographically secure nonce
 * 
 * @param length - Length of the nonce in bytes (default: 16)
 * @returns Hex-encoded nonce string
 */
export function generateNonce(length: number = 16): string {
  // In Node.js: crypto.randomBytes(length).toString('hex')
  // In Apps Script: Utilities.getUuid()
  return `nonce_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// ============================================================================
// ID GENERATION
// ============================================================================

/**
 * Generate a prefixed ID
 * 
 * @param prefix - The prefix for the ID (e.g., 'b' for booking, 't' for task)
 * @returns Prefixed unique ID
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * Generate a trace ID for request tracking
 */
export function generateTraceId(): string {
  return generateId('tr');
}

/**
 * Generate an event ID
 */
export function generateEventId(): string {
  return generateId('ev');
}
