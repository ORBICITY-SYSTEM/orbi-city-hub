/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ORBI CITY HUB - Apps Script Sync Module
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ეს კოდი უნდა დაამატოთ თქვენს Apps Script პროექტში.
 * ის უზრუნველყოფს Google Sheets-სა და Hub-ს შორის სინქრონიზაციას.
 * 
 * კონფიგურაცია:
 * 1. Script Properties-ში დაამატეთ:
 *    - HUB_URL: https://orbicityhotel.com
 *    - API_SECRET: თქვენი საიდუმლო გასაღები (იგივე რაც Hub-ის env-ში)
 * 
 * გამოყენება:
 * - syncReservationsToHub() - რეზერვაციების სინქრონიზაცია Hub-ში
 * - fetchReservationsFromHub() - რეზერვაციების წამოღება Hub-დან
 * - testHubConnection() - კავშირის ტესტი
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const HUB_CONFIG = {
  // Hub URL - შეცვალეთ თქვენი URL-ით
  HUB_URL: PropertiesService.getScriptProperties().getProperty('HUB_URL') || 'https://orbicityhotel.com',
  
  // API Secret - უნდა ემთხვეოდეს Hub-ის APPS_SCRIPT_SECRET env variable-ს
  API_SECRET: PropertiesService.getScriptProperties().getProperty('API_SECRET') || 'your-secret-key',
  
  // JWT Expiry (12 საათი)
  JWT_EXPIRY: 43200000,
};

// ============================================================================
// JWT TOKEN GENERATION
// ============================================================================

/**
 * შექმნის JWT token-ს Hub-თან კომუნიკაციისთვის
 */
function createHubToken(email, role, name) {
  const secret = HUB_CONFIG.API_SECRET;
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { 
    email: email || 'appscript@orbi.city',
    role: role || 'system',
    name: name || 'Apps Script Sync',
    iat: Date.now(), 
    exp: Date.now() + HUB_CONFIG.JWT_EXPIRY 
  };
  
  const toSign = Utilities.base64EncodeWebSafe(JSON.stringify(header)) + '.' + 
                 Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(toSign, secret)
  );
  
  return toSign + '.' + sig;
}

// ============================================================================
// HUB API CALLS
// ============================================================================

/**
 * გაგზავნის მოთხოვნას Hub-ის Apps Script Bridge endpoint-ზე
 */
function callHubBridge(action, data) {
  const url = HUB_CONFIG.HUB_URL + '/api/trpc/appscriptBridge.handle';
  const token = createHubToken();
  
  const payload = {
    action: action,
    token: token,
    ...data
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    Logger.log('Hub Response [' + code + ']: ' + text.substring(0, 500));
    
    if (code >= 200 && code < 300) {
      const result = JSON.parse(text);
      // tRPC wraps response in result.result
      return result.result?.data || result.result || result;
    } else {
      Logger.log('Hub Error: ' + text);
      return { status: 'error', message: 'HTTP ' + code, details: text };
    }
  } catch (error) {
    Logger.log('Hub Call Failed: ' + error);
    return { status: 'error', message: error.toString() };
  }
}

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

/**
 * ტესტავს კავშირს Hub-თან
 */
function testHubConnection() {
  const result = callHubBridge('health', {});
  Logger.log('Hub Connection Test: ' + JSON.stringify(result));
  
  if (result.status === 'active') {
    SpreadsheetApp.getUi().alert('✅ Hub კავშირი წარმატებულია!\n\nVersion: ' + result.version);
    return true;
  } else {
    SpreadsheetApp.getUi().alert('❌ Hub კავშირი ვერ მოხერხდა!\n\n' + JSON.stringify(result));
    return false;
  }
}

/**
 * სინქრონიზაცია: Sheets → Hub
 * გადააგზავნის Reservations sheet-ის მონაცემებს Hub-ში
 */
function syncReservationsToHub() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservations');
  if (!sheet) {
    Logger.log('Reservations sheet not found');
    return { status: 'error', message: 'Reservations sheet not found' };
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    Logger.log('No reservations to sync');
    return { status: 'success', message: 'No reservations to sync' };
  }
  
  const headers = data[0];
  const reservations = [];
  
  // Map headers to indices
  const idIdx = headers.indexOf('ID');
  const guestIdx = headers.indexOf('GuestName');
  const checkInIdx = headers.indexOf('CheckIn');
  const checkOutIdx = headers.indexOf('CheckOut');
  const roomIdx = headers.indexOf('Room');
  const sourceIdx = headers.indexOf('Source');
  const priceIdx = headers.indexOf('Price');
  const statusIdx = headers.indexOf('Status');
  const phoneIdx = headers.indexOf('Phone');
  const emailIdx = headers.indexOf('Email');
  const notesIdx = headers.indexOf('Notes');
  const nightsIdx = headers.indexOf('Nights');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[idIdx] && !row[guestIdx]) continue; // Skip empty rows
    
    reservations.push({
      ID: row[idIdx] || '',
      GuestName: row[guestIdx] || '',
      CheckIn: formatDateForHub(row[checkInIdx]),
      CheckOut: formatDateForHub(row[checkOutIdx]),
      Room: row[roomIdx] || '',
      Source: row[sourceIdx] || '',
      Price: row[priceIdx] || 0,
      Status: row[statusIdx] || 'confirmed',
      Phone: row[phoneIdx] || '',
      Email: row[emailIdx] || '',
      Notes: row[notesIdx] || '',
      Nights: row[nightsIdx] || 0,
    });
  }
  
  Logger.log('Syncing ' + reservations.length + ' reservations to Hub...');
  
  const result = callHubBridge('sync_reservations_smart', {
    newReservations: reservations
  });
  
  Logger.log('Sync Result: ' + JSON.stringify(result));
  
  if (result.status === 'success') {
    SpreadsheetApp.getUi().alert(
      '✅ სინქრონიზაცია წარმატებულია!\n\n' +
      'დამატებული: ' + (result.inserted || 0) + '\n' +
      'განახლებული: ' + (result.updated || 0)
    );
  }
  
  return result;
}

/**
 * სინქრონიზაცია: Hub → Sheets
 * წამოიღებს რეზერვაციებს Hub-დან და განაახლებს Sheets-ს
 */
function fetchReservationsFromHub() {
  const result = callHubBridge('get_reservations', {});
  
  if (!result.reservations || !Array.isArray(result.reservations)) {
    Logger.log('No reservations received from Hub');
    SpreadsheetApp.getUi().alert('❌ რეზერვაციები ვერ წამოვიდა Hub-დან');
    return result;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservations');
  if (!sheet) {
    Logger.log('Reservations sheet not found');
    return { status: 'error', message: 'Reservations sheet not found' };
  }
  
  // Clear existing data (except headers)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  }
  
  // Write new data
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = result.reservations.map(res => {
    return headers.map(h => res[h] || '');
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  
  Logger.log('Fetched ' + result.reservations.length + ' reservations from Hub');
  SpreadsheetApp.getUi().alert('✅ წამოვიდა ' + result.reservations.length + ' რეზერვაცია Hub-დან');
  
  return result;
}

/**
 * ოთახების სინქრონიზაცია Hub-დან
 */
function fetchRoomsFromHub() {
  const result = callHubBridge('get_rooms', {});
  
  if (!result.rooms || !Array.isArray(result.rooms)) {
    Logger.log('No rooms received from Hub');
    return result;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Rooms');
  if (!sheet) {
    Logger.log('Rooms sheet not found');
    return { status: 'error', message: 'Rooms sheet not found' };
  }
  
  // Clear and write
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = result.rooms.map(room => {
    return headers.map(h => room[h] || '');
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  
  Logger.log('Fetched ' + result.rooms.length + ' rooms from Hub');
  return result;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDateForHub(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(date);
}

// ============================================================================
// MENU
// ============================================================================

/**
 * დაამატეთ მენიუ Spreadsheet-ში
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏨 Hub Sync')
    .addItem('🔗 Test Hub Connection', 'testHubConnection')
    .addSeparator()
    .addItem('⬆️ Sync Reservations TO Hub', 'syncReservationsToHub')
    .addItem('⬇️ Fetch Reservations FROM Hub', 'fetchReservationsFromHub')
    .addSeparator()
    .addItem('⬇️ Fetch Rooms FROM Hub', 'fetchRoomsFromHub')
    .addToUi();
}

// ============================================================================
// TRIGGERS (Optional - for automatic sync)
// ============================================================================

/**
 * ავტომატური სინქრონიზაცია ყოველ საათში
 * გასააქტიურებლად: Edit > Current project's triggers > Add Trigger
 */
function autoSyncToHub() {
  Logger.log('Auto-sync started at ' + new Date().toISOString());
  syncReservationsToHub();
  Logger.log('Auto-sync completed');
}
