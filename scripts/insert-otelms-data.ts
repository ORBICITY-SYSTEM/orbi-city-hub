#!/usr/bin/env tsx
/**
 * Bulk insert OTELMS sample data into database
 */

import { readFileSync } from 'fs';
import { getDb } from '../server/db';

async function main() {
  console.log('📊 Loading OTELMS sample data...');
  
  // Load JSON data
  const jsonData = readFileSync('/home/ubuntu/otelms_sample_data.json', 'utf-8');
  const reports = JSON.parse(jsonData);
  
  console.log(`📝 Found ${reports.length} reports to insert`);
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  console.log('💾 Inserting data...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    
    try {
      // Convert revenue values to integers (cents)
      const totalRevenue = Math.round(report.revenue * 100);
      const adr = Math.round(report.adr * 100);
      const revPAR = Math.round(report.revPAR * 100);
      
      // Escape channel data JSON
      const escapedChannelData = report.channelData.replace(/'/g, "''");
      
      const sql = `INSERT INTO otelmsDailyReports 
        (reportDate, checkIns, checkOuts, cancellations, totalRevenue, adr, occupancyRate, revPAR, totalGuests, roomsOccupied, channelData, createdAt, updatedAt) 
        VALUES ('${report.reportDate}', ${report.checkIns}, ${report.checkOuts}, ${report.cancellations}, ${totalRevenue}, ${adr}, ${report.occupancy}, ${revPAR}, ${report.guests}, ${report.rooms}, '${escapedChannelData}', NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        checkIns=${report.checkIns}, 
        checkOuts=${report.checkOuts}, 
        cancellations=${report.cancellations}, 
        totalRevenue=${totalRevenue}, 
        adr=${adr}, 
        occupancyRate=${report.occupancy}, 
        revPAR=${revPAR}, 
        totalGuests=${report.guests}, 
        roomsOccupied=${report.rooms}, 
        channelData='${escapedChannelData}', 
        updatedAt=NOW()`;
      
      await db.execute(sql);
      
      successCount++;
      
      if ((i + 1) % 50 === 0) {
        console.log(`✅ Progress: ${i + 1}/${reports.length}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error inserting ${report.reportDate}:`, error);
    }
  }
  
  console.log('\n🎉 Complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
