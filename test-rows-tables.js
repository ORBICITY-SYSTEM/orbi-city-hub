// Test script to find table IDs in Rows.com spreadsheet
import dotenv from 'dotenv';

dotenv.config();

const ROWS_API_KEY = process.env.ROWS_API_KEY;
const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

console.log('\n[*] Testing Rows.com spreadsheet tables...\n');

if (!ROWS_API_KEY || !SPREADSHEET_ID) {
  console.error('[ERROR] ROWS_API_KEY or ROWS_SPREADSHEET_ID not configured');
  process.exit(1);
}

try {
  const url = `https://api.rows.com/v1/spreadsheets/${SPREADSHEET_ID}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${ROWS_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ERROR] Rows API error: ${response.status}`);
    console.error(`[ERROR] Response: ${errorText}`);
    process.exit(1);
  }

  const data = await response.json();
  console.log('[OK] Spreadsheet:', data.name || 'N/A');
  console.log('[OK] Spreadsheet ID:', data.id || SPREADSHEET_ID);
  console.log('\n[*] Tables in spreadsheet:\n');
  
  if (data.tables && data.tables.length > 0) {
    data.tables.forEach((table, index) => {
      console.log(`${index + 1}. Table: "${table.name || 'Unnamed'}"`);
      console.log(`   ID: ${table.id}`);
      console.log(`   Type: ${table.type || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('[!] No tables found in spreadsheet');
    console.log('[!] Tables array:', data.tables);
  }

  console.log('[OK] Test complete!\n');
  process.exit(0);
} catch (error) {
  console.error('[ERROR] Failed to fetch spreadsheet:', error.message);
  if (error.stack) {
    console.error('\n[ERROR] Stack trace:', error.stack);
  }
  process.exit(1);
}
