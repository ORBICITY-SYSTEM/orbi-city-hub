/**
 * ============================================================================
 * ORBI CITY HUB - POWERSTACK MAIN ENGINE
 * Google Apps Script Backend
 * ============================================================================
 * 
 * This script serves as the "backend" for Orbi City Hub, replacing
 * the traditional Node.js/MySQL architecture with Google Workspace.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create new project: "Orbi City PowerStack"
 * 3. Copy this entire file into Code.gs
 * 4. Deploy → New deployment → Web app
 * 5. Execute as: Me, Access: Anyone
 * 6. Copy the Web App URL to your React app's .env file
 * 
 * REQUIRED SHEETS:
 * Create a Google Sheet named "Orbi_City_Master_DB" with these tabs:
 * - Reservations
 * - Financial_Summary
 * - Unit_Performance
 * - Housekeeping
 * - Reviews
 * - Occupancy
 * - AI_Logs
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Your Master Database Sheet ID (from URL)
  MASTER_DB_SHEET_ID: 'YOUR_SHEET_ID_HERE',
  
  // Tab names
  TABS: {
    RESERVATIONS: 'Reservations',
    FINANCIAL_SUMMARY: 'Financial_Summary',
    UNIT_PERFORMANCE: 'Unit_Performance',
    HOUSEKEEPING: 'Housekeeping',
    REVIEWS: 'Reviews',
    OCCUPANCY: 'Occupancy',
    AI_LOGS: 'AI_Logs',
  },
  
  // Gemini API (Vertex AI)
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY', // Or use PropertiesService
  GEMINI_MODEL: 'gemini-1.5-flash',
  
  // OTELMS Configuration (for future automation)
  OTELMS_EMAIL_LABEL: 'OTELMS',
};

// ============================================================================
// WEB APP ENTRY POINTS
// ============================================================================

/**
 * Handle GET requests - Return data
 */
function doGet(e) {
  const action = e.parameter.action || 'status';
  
  try {
    let result;
    
    switch (action) {
      case 'status':
        result = { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' };
        break;
      case 'reservations':
        result = getReservationsData();
        break;
      case 'financials':
        result = getFinancialData();
        break;
      case 'units':
        result = getUnitPerformanceData();
        break;
      case 'housekeeping':
        result = getHousekeepingData();
        break;
      case 'kpis':
        result = getDashboardKPIs();
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests - Write operations
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    
    let result;
    
    switch (action) {
      case 'updateHousekeeping':
        result = updateHousekeepingStatus(payload.unitId, payload.status);
        break;
      case 'syncOtelMS':
        result = syncOtelMS();
        break;
      case 'generateAIResponse':
        result = generateAIResponse(payload.reviewText, payload.rating, payload.platform);
        break;
      case 'logActivity':
        result = logActivity(payload.activity);
        break;
      default:
        result = { error: 'Unknown action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// SHEET ACCESS UTILITIES
// ============================================================================

/**
 * Get the Master DB spreadsheet
 */
function getMasterDB() {
  return SpreadsheetApp.openById(CONFIG.MASTER_DB_SHEET_ID);
}

/**
 * Get a specific sheet by name
 */
function getSheet(tabName) {
  const ss = getMasterDB();
  let sheet = ss.getSheetByName(tabName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    initializeSheet(sheet, tabName);
  }
  
  return sheet;
}

/**
 * Initialize sheet with headers
 */
function initializeSheet(sheet, tabName) {
  const headers = {
    [CONFIG.TABS.RESERVATIONS]: ['ID', 'Room', 'Guest', 'Source', 'CheckIn', 'CheckOut', 'Nights', 'Amount', 'Paid', 'Balance', 'Created'],
    [CONFIG.TABS.FINANCIAL_SUMMARY]: ['Month', 'Year', 'Revenue', 'Expenses', 'Profit', 'Occupancy', 'ADR', 'RevPAR'],
    [CONFIG.TABS.UNIT_PERFORMANCE]: ['UnitID', 'UnitName', 'Block', 'InceptionDate', 'TotalNights', 'OccupiedNights', 'OccupancyRate', 'Revenue', 'ADR', 'ROI', 'Rank'],
    [CONFIG.TABS.HOUSEKEEPING]: ['UnitID', 'UnitName', 'Status', 'LastCleaned', 'NextCheckIn', 'AssignedTo', 'Priority'],
    [CONFIG.TABS.REVIEWS]: ['ID', 'Platform', 'Author', 'Rating', 'Text', 'Date', 'AIResponse', 'ResponseDate', 'Status'],
    [CONFIG.TABS.OCCUPANCY]: ['Month', 'Day', 'Year', 'OccupancyPercent'],
    [CONFIG.TABS.AI_LOGS]: ['Timestamp', 'Action', 'Input', 'Output', 'Tokens', 'Duration'],
  };
  
  if (headers[tabName]) {
    sheet.getRange(1, 1, 1, headers[tabName].length).setValues([headers[tabName]]);
    sheet.getRange(1, 1, 1, headers[tabName].length).setFontWeight('bold');
  }
}

/**
 * Convert sheet data to array of objects
 */
function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

// ============================================================================
// DATA RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Get all reservations
 */
function getReservationsData() {
  const sheet = getSheet(CONFIG.TABS.RESERVATIONS);
  return sheetToObjects(sheet);
}

/**
 * Get financial summary
 */
function getFinancialData() {
  const sheet = getSheet(CONFIG.TABS.FINANCIAL_SUMMARY);
  return sheetToObjects(sheet);
}

/**
 * Get unit performance with Inception Date logic
 */
function getUnitPerformanceData() {
  const sheet = getSheet(CONFIG.TABS.UNIT_PERFORMANCE);
  const data = sheetToObjects(sheet);
  
  // Sort by ROI descending and update ranks
  data.sort((a, b) => (b.ROI || 0) - (a.ROI || 0));
  data.forEach((unit, index) => {
    unit.Rank = index + 1;
  });
  
  return data;
}

/**
 * Get housekeeping status
 */
function getHousekeepingData() {
  const sheet = getSheet(CONFIG.TABS.HOUSEKEEPING);
  return sheetToObjects(sheet);
}

/**
 * Calculate dashboard KPIs
 */
function getDashboardKPIs() {
  const reservations = getReservationsData();
  const financials = getFinancialData();
  const units = getUnitPerformanceData();
  const housekeeping = getHousekeepingData();
  
  const today = Utilities.formatDate(new Date(), 'GMT+4', 'yyyy-MM-dd');
  const todayReservations = reservations.filter(r => r.CheckIn === today);
  
  const totalRevenue = financials.reduce((sum, f) => sum + (f.Revenue || 0), 0);
  const avgOccupancy = financials.length > 0 
    ? financials.reduce((sum, f) => sum + (f.Occupancy || 0), 0) / financials.length 
    : 0;
  
  const dirtyUnits = housekeeping.filter(h => h.Status === 'dirty').length;
  const cleanUnits = housekeeping.filter(h => h.Status === 'clean').length;
  
  return {
    todayCheckIns: todayReservations.length,
    todayRevenue: todayReservations.reduce((sum, r) => sum + (r.Amount || 0), 0),
    totalRevenue: totalRevenue,
    avgOccupancy: Math.round(avgOccupancy),
    totalUnits: units.length,
    topPerformer: units[0]?.UnitName || 'N/A',
    dirtyUnits: dirtyUnits,
    cleanUnits: cleanUnits,
    pendingTasks: dirtyUnits,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Update housekeeping status for a unit
 */
function updateHousekeepingStatus(unitId, newStatus) {
  const sheet = getSheet(CONFIG.TABS.HOUSEKEEPING);
  const data = sheet.getDataRange().getValues();
  
  // Find the unit row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === unitId) {
      // Update status (column 3)
      sheet.getRange(i + 1, 3).setValue(newStatus);
      
      // Update last cleaned if status is 'clean'
      if (newStatus === 'clean') {
        sheet.getRange(i + 1, 4).setValue(new Date());
      }
      
      return { success: true, unitId: unitId, newStatus: newStatus };
    }
  }
  
  return { success: false, error: 'Unit not found' };
}

/**
 * Log an activity
 */
function logActivity(activity) {
  const sheet = getSheet(CONFIG.TABS.AI_LOGS);
  sheet.appendRow([
    new Date(),
    activity.action || 'unknown',
    activity.input || '',
    activity.output || '',
    activity.tokens || 0,
    activity.duration || 0,
  ]);
  
  return { success: true };
}

// ============================================================================
// OTELMS SYNC FUNCTION
// ============================================================================

/**
 * Sync reservations from OTELMS
 * 
 * This function can be triggered:
 * 1. Manually via Web App POST
 * 2. Via time-based trigger (hourly)
 * 3. Via email trigger (when OTELMS sends reports)
 */
function syncOtelMS() {
  const startTime = new Date();
  
  try {
    // Option 1: Parse OTELMS emails
    // const newReservations = parseOtelMSEmails();
    
    // Option 2: Read from CSV file in Drive
    // const newReservations = parseOtelMSCsv();
    
    // Option 3: For now, return demo data
    const newReservations = generateDemoReservations();
    
    // Write to sheet
    const sheet = getSheet(CONFIG.TABS.RESERVATIONS);
    
    // Clear existing data (keep headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 11).clearContent();
    }
    
    // Write new data
    if (newReservations.length > 0) {
      const rows = newReservations.map(r => [
        r.id, r.room, r.guest, r.source, r.checkIn, r.checkOut,
        r.nights, r.amount, r.paid, r.balance, r.created
      ]);
      sheet.getRange(2, 1, rows.length, 11).setValues(rows);
    }
    
    const duration = (new Date() - startTime) / 1000;
    
    // Log the sync
    logActivity({
      action: 'syncOtelMS',
      input: 'Full sync',
      output: `Synced ${newReservations.length} reservations`,
      duration: duration,
    });
    
    return {
      success: true,
      reservationsCount: newReservations.length,
      duration: duration,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate demo reservations (replace with real OTELMS parsing)
 */
function generateDemoReservations() {
  const sources = ['Booking.com', 'Airbnb.com', 'Expedia', 'Direct', 'Agoda'];
  const rooms = ['A 1033', 'A 1301', 'A 1806', 'C 2520', 'C 2529', 'C 2609', 'C 3421', 'C 3611', 'D 3727'];
  
  const reservations = [];
  
  for (let i = 0; i < 50; i++) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30) - 15);
    
    const nights = 1 + Math.floor(Math.random() * 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    
    const amount = 50 + Math.floor(Math.random() * 150);
    const paid = Math.random() > 0.3 ? amount : 0;
    
    reservations.push({
      id: `RES-${1000 + i}`,
      room: rooms[i % rooms.length],
      guest: `Guest ${i + 1}`,
      source: sources[i % sources.length],
      checkIn: Utilities.formatDate(checkIn, 'GMT+4', 'yyyy-MM-dd'),
      checkOut: Utilities.formatDate(checkOut, 'GMT+4', 'yyyy-MM-dd'),
      nights: nights,
      amount: amount,
      paid: paid,
      balance: paid - amount,
      created: new Date().toISOString(),
    });
  }
  
  return reservations;
}

// ============================================================================
// GEMINI AI INTEGRATION
// ============================================================================

/**
 * Generate AI response for a review using Gemini
 */
function generateAIResponse(reviewText, rating, platform) {
  const startTime = new Date();
  
  // Knowledge base context
  const context = `
You are the AI assistant for Orbi City Sea View Aparthotel in Batumi, Georgia.

PROPERTY INFO:
- Name: Orbi City Sea view Aparthotel
- Location: Batumi, Georgia (Black Sea coast)
- Type: Aparthotel with 60 apartments
- Amenities: Sea view, fully equipped kitchens, balconies, pool, gym
- Style: Modern, family-friendly

RESPONSE GUIDELINES:
1. Always be professional, warm, and grateful
2. Address specific points mentioned in the review
3. If negative, apologize sincerely and offer to make it right
4. Keep responses 2-3 sentences for positive reviews, 3-4 for negative
5. Sign off with "Orbi City Team" or "გუნდი Orbi City"
6. Match the language of the review (English, Russian, Georgian, Turkish, etc.)
`;

  const prompt = `${context}

Platform: ${platform}
Rating: ${rating}/5 stars
Review: "${reviewText}"

Generate a professional response to this review:`;

  try {
    // Call Gemini API
    const response = callGeminiAPI(prompt);
    
    const duration = (new Date() - startTime) / 1000;
    
    // Log the AI call
    logActivity({
      action: 'generateAIResponse',
      input: reviewText.substring(0, 100),
      output: response.substring(0, 100),
      tokens: response.length,
      duration: duration,
    });
    
    return {
      success: true,
      response: response,
      duration: duration,
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Call Gemini API
 */
function callGeminiAPI(prompt) {
  const apiKey = CONFIG.GEMINI_API_KEY || PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    // Return demo response if no API key
    return generateDemoAIResponse(prompt);
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  
  if (json.candidates && json.candidates[0] && json.candidates[0].content) {
    return json.candidates[0].content.parts[0].text;
  }
  
  throw new Error('Invalid Gemini API response');
}

/**
 * Generate demo AI response (when API key not configured)
 */
function generateDemoAIResponse(prompt) {
  const responses = [
    "Thank you so much for your wonderful review! We're thrilled that you enjoyed your stay at Orbi City. Your kind words mean a lot to our team, and we can't wait to welcome you back soon! - Orbi City Team",
    "გმადლობთ თქვენი შესანიშნავი მიმოხილვისთვის! ჩვენ ძალიან მოხარულები ვართ, რომ თქვენ ისიამოვნეთ ყოფნით Orbi City-ში. მოუთმენლად ველით თქვენს კვლავ სტუმრობას! - გუნდი Orbi City",
    "We sincerely apologize for any inconvenience during your stay. Your feedback is valuable to us, and we're committed to improving. Please contact us directly so we can make things right. - Orbi City Team",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================================================
// SCHEDULED TRIGGERS
// ============================================================================

/**
 * Setup time-based triggers
 * Run this function once manually to set up automation
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Sync OTELMS every hour
  ScriptApp.newTrigger('syncOtelMS')
    .timeBased()
    .everyHours(1)
    .create();
  
  // Calculate unit performance daily at 6 AM
  ScriptApp.newTrigger('calculateUnitPerformance')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();
  
  Logger.log('Triggers set up successfully!');
}

/**
 * Calculate unit performance with Inception Date logic
 */
function calculateUnitPerformance() {
  const reservations = getReservationsData();
  const sheet = getSheet(CONFIG.TABS.UNIT_PERFORMANCE);
  
  // Get unique units
  const unitMap = new Map();
  
  reservations.forEach(res => {
    const unitId = res.Room;
    if (!unitId) return;
    
    if (!unitMap.has(unitId)) {
      unitMap.set(unitId, {
        unitId: unitId,
        unitName: unitId,
        block: unitId.charAt(0),
        inceptionDate: res.CheckIn,
        totalNights: 0,
        occupiedNights: 0,
        revenue: 0,
      });
    }
    
    const unit = unitMap.get(unitId);
    
    // Update inception date (earliest booking)
    if (res.CheckIn < unit.inceptionDate) {
      unit.inceptionDate = res.CheckIn;
    }
    
    // Add occupied nights and revenue
    unit.occupiedNights += res.Nights || 0;
    unit.revenue += res.Amount || 0;
  });
  
  // Calculate metrics for each unit
  const today = new Date();
  const units = Array.from(unitMap.values()).map(unit => {
    const inception = new Date(unit.inceptionDate);
    const daysSinceInception = Math.max(1, Math.floor((today - inception) / (1000 * 60 * 60 * 24)));
    
    unit.totalNights = daysSinceInception;
    unit.occupancyRate = Math.round((unit.occupiedNights / daysSinceInception) * 100);
    unit.adr = unit.occupiedNights > 0 ? Math.round(unit.revenue / unit.occupiedNights) : 0;
    unit.roi = Math.round((unit.revenue / 50000) * 100); // Assuming $50k investment
    
    return unit;
  });
  
  // Sort by ROI and assign ranks
  units.sort((a, b) => b.roi - a.roi);
  units.forEach((unit, index) => {
    unit.rank = index + 1;
  });
  
  // Clear and write to sheet
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 11).clearContent();
  }
  
  if (units.length > 0) {
    const rows = units.map(u => [
      u.unitId, u.unitName, u.block, u.inceptionDate,
      u.totalNights, u.occupiedNights, u.occupancyRate,
      u.revenue, u.adr, u.roi, u.rank
    ]);
    sheet.getRange(2, 1, rows.length, 11).setValues(rows);
  }
  
  Logger.log(`Calculated performance for ${units.length} units`);
  return { success: true, unitsProcessed: units.length };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the Master DB with all required sheets
 * Run this function once to set up the database structure
 */
function initializeMasterDB() {
  const ss = getMasterDB();
  
  Object.values(CONFIG.TABS).forEach(tabName => {
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      initializeSheet(sheet, tabName);
      Logger.log(`Created sheet: ${tabName}`);
    }
  });
  
  Logger.log('Master DB initialized successfully!');
  return { success: true };
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test the service
 */
function testService() {
  Logger.log('Testing PowerStack Engine...');
  
  // Test KPIs
  const kpis = getDashboardKPIs();
  Logger.log('KPIs: ' + JSON.stringify(kpis));
  
  // Test AI response
  const aiResponse = generateAIResponse('Great place, loved the sea view!', 5, 'Google');
  Logger.log('AI Response: ' + JSON.stringify(aiResponse));
  
  Logger.log('All tests passed!');
}
