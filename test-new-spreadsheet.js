// Test new spreadsheet ID
import dotenv from 'dotenv';

dotenv.config();

const ROWS_API_KEY = process.env.ROWS_API_KEY;
const NEW_SPREADSHEET_ID = '590R621oSJPeF4u2jPBPzz';

console.log('\n[*] Testing new spreadsheet ID from URL...\n');

if (!ROWS_API_KEY) {
  console.error('[ERROR] ROWS_API_KEY not configured');
  process.exit(1);
}

try {
  const url = `https://api.rows.com/v1/spreadsheets/${NEW_SPREADSHEET_ID}`;
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
  console.log('[OK] Connection OK!');
  console.log('[OK] Spreadsheet name:', data.name);
  console.log('[OK] Spreadsheet ID:', data.id);
  console.log('[OK] Pages:', data.pages?.length || 0);
  console.log('');
  
  if (data.pages && data.pages.length > 0) {
    console.log('[*] Tables in spreadsheet:\n');
    (data.pages || []).forEach((page, pIdx) => {
      console.log(`Page ${pIdx + 1}: "${page.name}"`);
      if (page.tables && page.tables.length > 0) {
        page.tables.forEach((table, tIdx) => {
          console.log(`  Table ${tIdx + 1}: "${table.name || 'Unnamed'}" - ID: ${table.id}`);
        });
      } else {
        console.log('  (No tables in this page)');
      }
      console.log('');
    });
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
