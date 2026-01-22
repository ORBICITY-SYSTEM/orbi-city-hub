/**
 * Google Apps Script - Web Data Extraction Webhook
 *
 * This script receives extracted web data from n8n and writes it to Google Sheets.
 * Deploy as Web App with "Anyone" access.
 *
 * Sheet ID: 1NQV34YjQeT6J9mkUKEg_5ULRw8ttRsaUen02t46d1-o
 */

const SPREADSHEET_ID = '1NQV34YjQeT6J9mkUKEg_5ULRw8ttRsaUen02t46d1-o';
const SHEET_NAME = 'Web Data Extraction';
const SECRET_KEY = 'OrbiWebDataSecret2025';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate secret key
    if (data.secretKey !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid secret key'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers
      const headers = ['Timestamp', 'Source Name', 'Source URL', 'Title', 'Description', 'Raw Data'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Process extracted data
    const extractedData = data.extractedData || [];
    const rows = [];

    for (const item of extractedData) {
      const row = [
        new Date().toISOString(),
        item.sourceName || '',
        item.sourceUrl || '',
        item.title || '',
        item.description || '',
        JSON.stringify(item)
      ];
      rows.push(row);
    }

    // Append rows
    if (rows.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `${rows.length} records written to Google Sheets`,
      sheetName: SHEET_NAME,
      recordsWritten: rows.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Web Data Extraction Webhook is running',
    usage: 'POST extracted data to this URL'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Test function
function testWrite() {
  const testData = {
    secretKey: SECRET_KEY,
    extractedData: [
      {
        sourceName: 'Test Source',
        sourceUrl: 'https://example.com',
        title: 'Test Title',
        description: 'Test Description'
      }
    ]
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}
