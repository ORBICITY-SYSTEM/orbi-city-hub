// Test script to verify Rows.com API connection
// Run with: node test-rows-connection.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

const ROWS_API_KEY = process.env.ROWS_API_KEY;
const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

console.log('\n[*] Testing Rows.com API Connection...\n');

if (!ROWS_API_KEY) {
  console.error('[ERROR] ROWS_API_KEY is not set in .env file');
  process.exit(1);
}

if (!SPREADSHEET_ID) {
  console.error('[ERROR] ROWS_SPREADSHEET_ID is not set in .env file');
  process.exit(1);
}

console.log('[OK] ROWS_API_KEY found:', ROWS_API_KEY.substring(0, 20) + '...');
console.log('[OK] ROWS_SPREADSHEET_ID found:', SPREADSHEET_ID);
console.log('\n[*] Testing API connection...\n');

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
  console.log('[OK] Connection successful!');
  console.log('[OK] Spreadsheet name:', data.name || 'N/A');
  console.log('[OK] Spreadsheet ID:', data.id || SPREADSHEET_ID);
  console.log('\n[SUCCESS] Rows.com API connection is working correctly!\n');
  process.exit(0);
} catch (error) {
  console.error('[ERROR] Failed to connect to Rows.com API:');
  console.error('[ERROR]', error.message);
  if (error.stack) {
    console.error('\n[ERROR] Stack trace:', error.stack);
  }
  process.exit(1);
}
