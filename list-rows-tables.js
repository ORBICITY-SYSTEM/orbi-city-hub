// List all tables in Rows.com spreadsheet
import dotenv from 'dotenv';

dotenv.config();

const ROWS_API_KEY = process.env.ROWS_API_KEY;
const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

console.log('\n[*] Finding all tables in Rows.com spreadsheet...\n');

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
  console.log('[OK] Spreadsheet:', data.name);
  console.log('[OK] Total pages:', data.pages?.length || 0);
  console.log('\n[*] All tables in spreadsheet:\n');
  
  const allTables = [];
  
  (data.pages || []).forEach((page, pIdx) => {
    console.log(`Page ${pIdx + 1}: "${page.name}" (ID: ${page.id})`);
    if (page.tables && page.tables.length > 0) {
      page.tables.forEach((table, tIdx) => {
        console.log(`  Table ${tIdx + 1}: "${table.name || 'Unnamed'}" - ID: ${table.id}`);
        allTables.push({
          page: page.name,
          name: table.name || 'Unnamed',
          id: table.id
        });
      });
    } else {
      console.log('  (No tables in this page)');
    }
    console.log('');
  });
  
  console.log('\n[*] Summary: Found', allTables.length, 'tables total');
  
  if (allTables.length > 0) {
    console.log('\n[*] All Table IDs:');
    allTables.forEach((t, idx) => {
      console.log(`  ${idx + 1}. "${t.name}" (Page: ${t.page})`);
      console.log(`     ID: ${t.id}\n`);
    });
    
    // Try to find Instagram-related tables
    const instagramTables = allTables.filter(t => 
      t.name.toLowerCase().includes('metric') ||
      t.name.toLowerCase().includes('post') ||
      t.name.toLowerCase().includes('summary') ||
      t.name.toLowerCase().includes('weekly') ||
      t.name.toLowerCase().includes('instagram') ||
      t.name.toLowerCase().includes('account')
    );
    
    if (instagramTables.length > 0) {
      console.log('\n[*] Potential Instagram Analytics tables:');
      instagramTables.forEach((t, idx) => {
        console.log(`  ${idx + 1}. "${t.name}" - ID: ${t.id}`);
      });
    }
  }
  
  console.log('\n[OK] Test complete!\n');
  process.exit(0);
} catch (error) {
  console.error('[ERROR] Failed to fetch spreadsheet:', error.message);
  if (error.stack) {
    console.error('\n[ERROR] Stack trace:', error.stack);
  }
  process.exit(1);
}
