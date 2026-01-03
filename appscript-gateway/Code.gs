/**
 * PowerHub Apps Script Gateway
 * 
 * Integration Gateway for Google Workspace services.
 * Handles Gmail parsing, Sheets sync, Calendar events, and more.
 * 
 * @author Orbi City Team
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Hub endpoint
  HUB_INGEST_URL: PropertiesService.getScriptProperties().getProperty('HUB_INGEST_URL') || 'https://your-hub.vercel.app/api/trpc/ingest.ingest',
  HUB_SECRET: PropertiesService.getScriptProperties().getProperty('HUB_SECRET') || '',
  
  // Source identifier
  SOURCE: 'APPS_SCRIPT_GATEWAY',
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Gmail settings
  GMAIL_LABEL: 'OTELMS', // Label to monitor
  GMAIL_MAX_THREADS: 50,
  
  // Sheets settings
  SHEETS_ID: PropertiesService.getScriptProperties().getProperty('SHEETS_ID') || '',
};

// ============================================================================
// SECURITY - HMAC SIGNATURE
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for payload
 * @param {Object} payload - The payload to sign
 * @param {string} timestamp - Unix timestamp
 * @param {string} nonce - Random nonce
 * @returns {string} Hex-encoded signature
 */
function generateHmacSignature(payload, timestamp, nonce) {
  const message = `${timestamp}.${nonce}.${JSON.stringify(payload)}`;
  const signature = Utilities.computeHmacSha256Signature(message, CONFIG.HUB_SECRET);
  return signature.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Generate a random nonce
 * @returns {string} UUID-like nonce
 */
function generateNonce() {
  return Utilities.getUuid();
}

/**
 * Generate a trace ID for request tracking
 * @returns {string} Trace ID
 */
function generateTraceId() {
  return 'tr_' + Utilities.getUuid().replace(/-/g, '').substring(0, 16);
}

/**
 * Generate an event ID
 * @returns {string} Event ID
 */
function generateEventId() {
  return 'ev_' + Utilities.getUuid().replace(/-/g, '').substring(0, 20);
}

// ============================================================================
// HUB COMMUNICATION
// ============================================================================

/**
 * Send events to Hub with HMAC authentication
 * @param {Array} events - Array of event envelopes
 * @returns {Object} Response from Hub
 */
function sendToHub(events) {
  if (!CONFIG.HUB_SECRET) {
    console.error('[Gateway] HUB_SECRET not configured');
    return { success: false, error: 'HUB_SECRET not configured' };
  }
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();
  const signature = generateHmacSignature(events, timestamp, nonce);
  
  const payload = {
    events: events,
    _auth: {
      signature: signature,
      timestamp: timestamp,
      nonce: nonce,
      source: CONFIG.SOURCE,
    },
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  let lastError = null;
  
  for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
    try {
      const response = UrlFetchApp.fetch(CONFIG.HUB_INGEST_URL, options);
      const statusCode = response.getResponseCode();
      const responseBody = response.getContentText();
      
      if (statusCode >= 200 && statusCode < 300) {
        console.log(`[Gateway] Successfully sent ${events.length} events to Hub`);
        return JSON.parse(responseBody);
      }
      
      lastError = `HTTP ${statusCode}: ${responseBody}`;
      console.warn(`[Gateway] Attempt ${attempt + 1} failed: ${lastError}`);
      
      // Don't retry on auth errors
      if (statusCode === 401 || statusCode === 403) {
        break;
      }
      
    } catch (error) {
      lastError = error.toString();
      console.warn(`[Gateway] Attempt ${attempt + 1} failed: ${lastError}`);
    }
    
    // Wait before retry
    if (attempt < CONFIG.MAX_RETRIES - 1) {
      Utilities.sleep(CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt));
    }
  }
  
  console.error(`[Gateway] Failed to send events after ${CONFIG.MAX_RETRIES} attempts: ${lastError}`);
  return { success: false, error: lastError };
}

// ============================================================================
// EVENT ENVELOPE BUILDER
// ============================================================================

/**
 * Create a standard event envelope
 * @param {string} eventType - Event type (e.g., 'Booking.Upserted')
 * @param {Object} payload - Event payload
 * @param {Object} options - Additional options
 * @returns {Object} Event envelope
 */
function createEventEnvelope(eventType, payload, options = {}) {
  const traceId = options.traceId || generateTraceId();
  
  return {
    eventId: generateEventId(),
    eventType: eventType,
    schemaVersion: 1,
    occurredAt: new Date().toISOString(),
    source: CONFIG.SOURCE,
    producer: 'orbi-appscript-gateway@v1',
    actor: options.actor || {
      type: 'SYSTEM',
      urn: `urn:system:appscript:${options.module || 'gateway'}`,
    },
    entity: options.entity || null,
    trace: {
      traceId: traceId,
      correlationId: options.correlationId || traceId,
      causationId: options.causationId || null,
    },
    dedupeKey: options.dedupeKey || null,
    payload: payload,
  };
}

// ============================================================================
// LOCK SERVICE - CONCURRENCY CONTROL
// ============================================================================

/**
 * Execute a function with a script-level lock
 * Prevents concurrent execution of the same function
 * @param {string} lockName - Name of the lock
 * @param {number} timeoutMs - Lock timeout in milliseconds
 * @param {Function} fn - Function to execute
 * @returns {*} Result of the function
 */
function withLock(lockName, timeoutMs, fn) {
  const lock = LockService.getScriptLock();
  
  try {
    // Try to acquire lock
    const acquired = lock.tryLock(timeoutMs);
    
    if (!acquired) {
      console.warn(`[Lock] Could not acquire lock: ${lockName}`);
      return { success: false, error: 'Could not acquire lock - another process is running' };
    }
    
    console.log(`[Lock] Acquired lock: ${lockName}`);
    return fn();
    
  } finally {
    try {
      lock.releaseLock();
      console.log(`[Lock] Released lock: ${lockName}`);
    } catch (e) {
      // Lock may have already been released
    }
  }
}

// ============================================================================
// GMAIL PARSER
// ============================================================================

/**
 * Parse OTA booking email using regex patterns
 * Falls back to LLM if regex fails
 * @param {GmailMessage} message - Gmail message object
 * @returns {Object|null} Parsed booking data or null
 */
function parseBookingEmail(message) {
  const subject = message.getSubject();
  const body = message.getPlainBody();
  const from = message.getFrom();
  
  // Detect OTA source
  let channel = 'OTHER';
  if (from.includes('booking.com')) channel = 'BOOKING';
  else if (from.includes('airbnb.com')) channel = 'AIRBNB';
  else if (from.includes('expedia.com')) channel = 'EXPEDIA';
  else if (from.includes('agoda.com')) channel = 'AGODA';
  
  // Try regex patterns first
  const booking = tryRegexParsing(subject, body, channel);
  
  if (booking) {
    booking.raw = {
      emailMessageId: message.getId(),
      emailThreadId: message.getThread().getId(),
      parsedConfidence: 0.8,
    };
    return booking;
  }
  
  // TODO: LLM fallback
  // return tryLlmParsing(subject, body, channel);
  
  return null;
}

/**
 * Try to parse booking using regex patterns
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} channel - OTA channel
 * @returns {Object|null} Parsed booking or null
 */
function tryRegexParsing(subject, body, channel) {
  const patterns = {
    // Booking.com patterns
    BOOKING: {
      confirmationNumber: /Confirmation number[:\s]+(\d+)/i,
      guestName: /Guest name[:\s]+([^\n]+)/i,
      checkIn: /Check-in[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
      checkOut: /Check-out[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i,
      totalPrice: /Total price[:\s]+([A-Z]{3})\s*([\d,.]+)/i,
      roomType: /Room type[:\s]+([^\n]+)/i,
      guests: /(\d+)\s+adult/i,
    },
    // Airbnb patterns
    AIRBNB: {
      confirmationNumber: /Confirmation code[:\s]+([A-Z0-9]+)/i,
      guestName: /from\s+([^\n]+)/i,
      checkIn: /Check-in[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
      checkOut: /Checkout[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
      totalPrice: /Total[:\s]+\$?([\d,.]+)/i,
    },
    // Generic patterns
    OTHER: {
      confirmationNumber: /(?:confirmation|booking|reservation)\s*(?:number|#|id)?[:\s]+([A-Z0-9-]+)/i,
      guestName: /(?:guest|name)[:\s]+([^\n]+)/i,
      checkIn: /(?:check-?in|arrival)[:\s]+([^\n]+)/i,
      checkOut: /(?:check-?out|departure)[:\s]+([^\n]+)/i,
    },
  };
  
  const channelPatterns = patterns[channel] || patterns.OTHER;
  const text = subject + '\n' + body;
  
  // Extract confirmation number (required)
  const confMatch = text.match(channelPatterns.confirmationNumber);
  if (!confMatch) return null;
  
  // Extract other fields
  const guestMatch = text.match(channelPatterns.guestName);
  const checkInMatch = text.match(channelPatterns.checkIn);
  const checkOutMatch = text.match(channelPatterns.checkOut);
  const priceMatch = text.match(channelPatterns.totalPrice);
  const guestsMatch = text.match(channelPatterns.guests);
  
  // Parse dates
  let checkIn = null;
  let checkOut = null;
  
  if (checkInMatch) {
    try {
      checkIn = new Date(checkInMatch[1]).toISOString().split('T')[0];
    } catch (e) {}
  }
  
  if (checkOutMatch) {
    try {
      checkOut = new Date(checkOutMatch[1]).toISOString().split('T')[0];
    } catch (e) {}
  }
  
  // Calculate nights
  let nights = 1;
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  }
  
  return {
    bookingId: 'b_' + Utilities.getUuid().replace(/-/g, '').substring(0, 12),
    channelRef: {
      channel: channel,
      externalReservationId: confMatch[1],
    },
    status: 'NEW',
    checkIn: checkIn || new Date().toISOString().split('T')[0],
    checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    nights: nights,
    guest: {
      fullName: guestMatch ? guestMatch[1].trim() : 'Unknown Guest',
    },
    occupancy: {
      adults: guestsMatch ? parseInt(guestsMatch[1]) : 1,
      children: 0,
    },
    pricing: priceMatch ? {
      amount: parseFloat(priceMatch[2] || priceMatch[1]),
      currency: priceMatch[1]?.length === 3 ? priceMatch[1] : 'USD',
    } : null,
  };
}

// ============================================================================
// GMAIL TRIGGER HANDLERS
// ============================================================================

/**
 * Process new emails from monitored label
 * Called by time-driven trigger (every 5-15 minutes)
 */
function processNewEmails() {
  return withLock('processNewEmails', 60000, function() {
    const traceId = generateTraceId();
    console.log(`[Gmail] Starting email processing, traceId: ${traceId}`);
    
    const events = [];
    const processedIds = getProcessedEmailIds();
    
    try {
      // Get threads with the monitored label
      const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
      if (!label) {
        console.warn(`[Gmail] Label not found: ${CONFIG.GMAIL_LABEL}`);
        return { success: true, processed: 0 };
      }
      
      const threads = label.getThreads(0, CONFIG.GMAIL_MAX_THREADS);
      console.log(`[Gmail] Found ${threads.length} threads with label ${CONFIG.GMAIL_LABEL}`);
      
      for (const thread of threads) {
        const messages = thread.getMessages();
        
        for (const message of messages) {
          const messageId = message.getId();
          
          // Skip already processed
          if (processedIds.has(messageId)) {
            continue;
          }
          
          // Try to parse as booking
          const booking = parseBookingEmail(message);
          
          if (booking) {
            // Create Booking.Upserted event
            const event = createEventEnvelope('Booking.Upserted', {
              booking: booking,
            }, {
              traceId: traceId,
              module: 'gmail-parser',
              entity: {
                entityType: 'Booking',
                entityId: booking.bookingId,
              },
              dedupeKey: `booking:${booking.channelRef.channel}:${booking.channelRef.externalReservationId}`,
            });
            
            events.push(event);
            console.log(`[Gmail] Parsed booking from email ${messageId}: ${booking.channelRef.externalReservationId}`);
          }
          
          // Also log the message
          const messageEvent = createEventEnvelope('Message.Logged', {
            message: {
              messageId: 'm_' + messageId.substring(0, 12),
              direction: 'INBOUND',
              channel: 'EMAIL',
              threadId: thread.getId(),
              from: message.getFrom(),
              to: message.getTo(),
              subject: message.getSubject(),
              bodySnippet: message.getPlainBody().substring(0, 500),
              sentAt: message.getDate().toISOString(),
              raw: {
                gmailMessageId: messageId,
              },
              links: booking ? {
                bookingId: booking.bookingId,
              } : null,
            },
          }, {
            traceId: traceId,
            module: 'gmail-parser',
          });
          
          events.push(messageEvent);
          
          // Mark as processed
          markEmailProcessed(messageId);
        }
      }
      
      // Send events to Hub
      if (events.length > 0) {
        const result = sendToHub(events);
        console.log(`[Gmail] Sent ${events.length} events to Hub: ${JSON.stringify(result)}`);
        return { success: result.success, processed: events.length };
      }
      
      return { success: true, processed: 0 };
      
    } catch (error) {
      console.error(`[Gmail] Error processing emails: ${error}`);
      return { success: false, error: error.toString() };
    }
  });
}

// ============================================================================
// PROCESSED EMAIL TRACKING
// ============================================================================

/**
 * Get set of already processed email IDs
 * @returns {Set} Set of processed email IDs
 */
function getProcessedEmailIds() {
  const props = PropertiesService.getScriptProperties();
  const json = props.getProperty('PROCESSED_EMAIL_IDS') || '[]';
  
  try {
    const ids = JSON.parse(json);
    return new Set(ids);
  } catch (e) {
    return new Set();
  }
}

/**
 * Mark an email as processed
 * @param {string} messageId - Gmail message ID
 */
function markEmailProcessed(messageId) {
  const props = PropertiesService.getScriptProperties();
  const ids = getProcessedEmailIds();
  
  ids.add(messageId);
  
  // Keep only last 1000 IDs to prevent property size limit
  const idsArray = Array.from(ids).slice(-1000);
  
  props.setProperty('PROCESSED_EMAIL_IDS', JSON.stringify(idsArray));
}

// ============================================================================
// SHEETS SYNC
// ============================================================================

/**
 * Sync data from Hub to Sheets (read-only mirror)
 * Called by Hub via webhook or manually
 * @param {Object} data - Data to sync
 */
function syncToSheets(data) {
  return withLock('syncToSheets', 30000, function() {
    if (!CONFIG.SHEETS_ID) {
      return { success: false, error: 'SHEETS_ID not configured' };
    }
    
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SHEETS_ID);
      
      // Sync based on data type
      if (data.bookings) {
        syncBookingsSheet(ss, data.bookings);
      }
      
      if (data.tasks) {
        syncTasksSheet(ss, data.tasks);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error(`[Sheets] Sync error: ${error}`);
      return { success: false, error: error.toString() };
    }
  });
}

/**
 * Sync bookings to sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 * @param {Array} bookings - Bookings to sync
 */
function syncBookingsSheet(ss, bookings) {
  let sheet = ss.getSheetByName('Bookings');
  
  if (!sheet) {
    sheet = ss.insertSheet('Bookings');
    // Set headers
    sheet.getRange(1, 1, 1, 10).setValues([[
      'ID', 'Channel', 'Status', 'Guest', 'Check-In', 'Check-Out', 'Nights', 'Unit', 'Amount', 'Updated'
    ]]);
  }
  
  // Clear existing data (except headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 10).clear();
  }
  
  // Write new data
  if (bookings.length > 0) {
    const rows = bookings.map(b => [
      b.id,
      b.channel,
      b.status,
      b.guestName,
      b.checkIn,
      b.checkOut,
      b.nights,
      b.unitCode,
      b.totalAmount,
      b.updatedAt,
    ]);
    
    sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }
}

/**
 * Sync tasks to sheet
 * @param {Spreadsheet} ss - Spreadsheet object
 * @param {Array} tasks - Tasks to sync
 */
function syncTasksSheet(ss, tasks) {
  let sheet = ss.getSheetByName('Tasks');
  
  if (!sheet) {
    sheet = ss.insertSheet('Tasks');
    sheet.getRange(1, 1, 1, 8).setValues([[
      'ID', 'Type', 'Title', 'Priority', 'Status', 'Assigned To', 'Due', 'Updated'
    ]]);
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 8).clear();
  }
  
  if (tasks.length > 0) {
    const rows = tasks.map(t => [
      t.id,
      t.type,
      t.title,
      t.priority,
      t.status,
      t.assignedToName,
      t.dueAt,
      t.updatedAt,
    ]);
    
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }
}

// ============================================================================
// WEB APP ENDPOINTS (doGet, doPost)
// ============================================================================

/**
 * Handle GET requests (health check)
 * @param {Object} e - Event object
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests (webhook from Hub)
 * @param {Object} e - Event object
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Route based on action
    switch (data.action) {
      case 'sync':
        const result = syncToSheets(data.payload);
        return ContentService.createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Unknown action',
        })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// TRIGGER SETUP
// ============================================================================

/**
 * Set up time-driven triggers
 * Run this once to configure automatic processing
 */
function setupTriggers() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'processNewEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Create new trigger - every 10 minutes
  ScriptApp.newTrigger('processNewEmails')
    .timeBased()
    .everyMinutes(10)
    .create();
  
  console.log('[Setup] Created trigger for processNewEmails (every 10 minutes)');
}

/**
 * Test function - manually trigger email processing
 */
function testProcessEmails() {
  const result = processNewEmails();
  console.log('Test result:', JSON.stringify(result));
}

/**
 * Test function - send a test event to Hub
 */
function testSendToHub() {
  const testEvent = createEventEnvelope('Lead.Captured', {
    lead: {
      leadId: 'l_test_' + Date.now(),
      source: 'OTHER',
      contact: {
        name: 'Test Lead',
        email: 'test@example.com',
      },
      intent: 'OTHER',
      message: 'This is a test lead from Apps Script',
    },
  }, {
    module: 'test',
  });
  
  const result = sendToHub([testEvent]);
  console.log('Test result:', JSON.stringify(result));
}
