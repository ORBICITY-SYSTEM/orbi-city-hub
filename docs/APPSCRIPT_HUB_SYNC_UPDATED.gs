/**
 * ============================================================================
 * ORBI CITY HUB - APPS SCRIPT SYNC MODULE
 * ============================================================================
 * 
 * ეს კოდი უნდა დაემატოს Google Apps Script-ში Hub-თან სინქრონიზაციისთვის.
 * 
 * SETUP:
 * 1. გახსენით Google Sheets → Extensions → Apps Script
 * 2. დააკოპირეთ ეს კოდი
 * 3. შეცვალეთ HUB_CONFIG.API_SECRET თქვენი secret-ით
 * 4. Deploy → New deployment → Web app
 * 
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const HUB_CONFIG = {
  // Hub API Endpoint
  HUB_URL: 'https://orbicityhotel.com/api/appscript',
  
  // API Secret - MUST match APPS_SCRIPT_SECRET in Vercel env
  API_SECRET: 'MySuperSecretKeyForOrbi2025',
  
  // Token expiration (12 hours in milliseconds)
  TOKEN_EXPIRY: 43200000,
};

// ============================================================================
// JWT TOKEN GENERATION
// ============================================================================

/**
 * Generate JWT token for Hub authentication
 */
function generateHubToken(email, role, name) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    email: email || Session.getActiveUser().getEmail() || 'appscript@orbi.city',
    role: role || 'admin',
    name: name || 'Apps Script',
    iat: Date.now(),
    exp: Date.now() + HUB_CONFIG.TOKEN_EXPIRY,
  };
  
  const headerB64 = Utilities.base64EncodeWebSafe(JSON.stringify(header));
  const payloadB64 = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const toSign = headerB64 + '.' + payloadB64;
  
  const signature = Utilities.computeHmacSha256Signature(toSign, HUB_CONFIG.API_SECRET);
  const signatureB64 = Utilities.base64EncodeWebSafe(signature);
  
  return toSign + '.' + signatureB64;
}

// ============================================================================
// HUB API COMMUNICATION
// ============================================================================

/**
 * Send request to Hub API
 */
function callHubAPI(action, data) {
  const token = generateHubToken();
  
  const payload = {
    action: action,
    token: token,
    ...data,
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  try {
    const response = UrlFetchApp.fetch(HUB_CONFIG.HUB_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`[Hub API] ${action} - Status: ${responseCode}`);
    
    if (responseCode === 200) {
      return JSON.parse(responseText);
    } else {
      Logger.log(`[Hub API] Error: ${responseText}`);
      return { status: 'error', message: responseText };
    }
  } catch (error) {
    Logger.log(`[Hub API] Exception: ${error.message}`);
    return { status: 'error', message: error.message };
  }
}

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

/**
 * Check Hub connection health
 */
function checkHubHealth() {
  const result = callHubAPI('health');
  Logger.log('Hub Health: ' + JSON.stringify(result));
  return result;
}

/**
 * Get reservations from Hub
 */
function getReservationsFromHub() {
  const result = callHubAPI('get_reservations');
  
  if (result.status === 'success') {
    Logger.log(`Got ${result.count} reservations from Hub`);
    return result.reservations;
  } else {
    Logger.log('Failed to get reservations: ' + result.message);
    return [];
  }
}

/**
 * Sync reservations to Hub
 */
function syncReservationsToHub(reservations) {
  const result = callHubAPI('sync_reservations_smart', {
    newReservations: reservations,
  });
  
  Logger.log('Sync result: ' + JSON.stringify(result));
  return result;
}

/**
 * Get rooms from Hub
 */
function getRoomsFromHub() {
  const result = callHubAPI('get_rooms');
  
  if (result.status === 'success') {
    Logger.log(`Got ${result.count} rooms from Hub`);
    return result.rooms;
  } else {
    Logger.log('Failed to get rooms: ' + result.message);
    return [];
  }
}

/**
 * Get app schema from Hub
 */
function getAppSchemaFromHub() {
  const result = callHubAPI('get_app_schema');
  Logger.log('App Schema: ' + JSON.stringify(result));
  return result;
}

// ============================================================================
// SHEET SYNC FUNCTIONS
// ============================================================================

/**
 * Sync Reservations sheet with Hub
 */
function syncReservationsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Reservations');
  
  if (!sheet) {
    Logger.log('Reservations sheet not found');
    return;
  }
  
  // Get data from sheet
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Convert to objects
  const reservations = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    const reservation = {};
    headers.forEach((header, index) => {
      reservation[header] = row[index];
    });
    reservations.push(reservation);
  }
  
  // Sync to Hub
  const result = syncReservationsToHub(reservations);
  
  // Show result
  SpreadsheetApp.getUi().alert(
    'Sync Complete',
    `Inserted: ${result.inserted || 0}\nUpdated: ${result.updated || 0}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Import reservations from Hub to Sheet
 */
function importReservationsFromHub() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Reservations');
  
  if (!sheet) {
    sheet = ss.insertSheet('Reservations');
  }
  
  // Get reservations from Hub
  const reservations = getReservationsFromHub();
  
  if (reservations.length === 0) {
    SpreadsheetApp.getUi().alert('No reservations found in Hub');
    return;
  }
  
  // Get headers from first reservation
  const headers = Object.keys(reservations[0]);
  
  // Clear and write data
  sheet.clear();
  sheet.appendRow(headers);
  
  reservations.forEach(res => {
    const row = headers.map(h => res[h] || '');
    sheet.appendRow(row);
  });
  
  SpreadsheetApp.getUi().alert(`Imported ${reservations.length} reservations from Hub`);
}

// ============================================================================
// MENU SETUP
// ============================================================================

/**
 * Create custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏨 Orbi Hub')
    .addItem('🔄 Check Hub Connection', 'checkHubHealth')
    .addSeparator()
    .addItem('📥 Import Reservations from Hub', 'importReservationsFromHub')
    .addItem('📤 Sync Reservations to Hub', 'syncReservationsSheet')
    .addSeparator()
    .addItem('🏠 Get Rooms from Hub', 'getRoomsFromHub')
    .addItem('📋 Get App Schema', 'getAppSchemaFromHub')
    .addToUi();
}

// ============================================================================
// WEB APP ENDPOINT (for external calls)
// ============================================================================

/**
 * Handle GET requests
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'active',
    system: 'ORBI Apps Script Bridge',
    timestamp: new Date().toISOString(),
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch (action) {
      case 'health':
        result = { status: 'active', system: 'ORBI Apps Script' };
        break;
        
      case 'sync_from_hub':
        const reservations = getReservationsFromHub();
        result = { status: 'success', count: reservations.length };
        break;
        
      case 'sync_to_hub':
        result = syncReservationsToHub(data.reservations || []);
        break;
        
      default:
        result = { status: 'error', message: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message,
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test Hub connection
 */
function testHubConnection() {
  Logger.log('=== Testing Hub Connection ===');
  
  // Test health
  const health = checkHubHealth();
  Logger.log('Health: ' + JSON.stringify(health));
  
  // Test get reservations
  const reservations = getReservationsFromHub();
  Logger.log('Reservations count: ' + reservations.length);
  
  // Test get rooms
  const rooms = getRoomsFromHub();
  Logger.log('Rooms count: ' + rooms.length);
  
  Logger.log('=== Test Complete ===');
}
