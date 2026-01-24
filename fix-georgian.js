// Fix Georgian Encoding Script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lusagtvxjtfxgfadulgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg2MzYsImV4cCI6MjA4Mzg4NDYzNn0.D3F6xMDNLm8a9AC6tDMsT68Ad6F6xOlhoXTxEFmtPM8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixGeorgianEncoding() {
  console.log('🔧 Fixing Georgian encoding...\n');

  // ============================================
  // FIX HOUSEKEEPING SCHEDULES
  // ============================================
  console.log('📋 Fixing Housekeeping schedules...');

  // Get all housekeeping records
  const { data: housekeeping, error: hkError } = await supabase
    .from('housekeeping_schedules')
    .select('id, scheduled_date, notes');

  if (hkError) {
    console.error('Error fetching housekeeping:', hkError);
    return;
  }

  // Fix each record
  for (const record of housekeeping) {
    const date = record.scheduled_date;
    let newNotes = 'ნანა'; // Default

    // January specific notes
    if (date === '2025-01-20') newNotes = 'ყოველდღიური დასუფთავება';
    else if (date === '2025-01-21') newNotes = 'დასუფთავება';
    else if (date === '2025-01-22') newNotes = 'C კორპუსი';
    else if (date === '2025-01-23') newNotes = '29-ე სართული';
    else if (date === '2025-01-26') newNotes = '34-ე სართული';
    else if (date === '2025-01-27') newNotes = 'D კორპუსი';

    const { error } = await supabase
      .from('housekeeping_schedules')
      .update({ notes: newNotes })
      .eq('id', record.id);

    if (error) {
      console.error(`  ❌ Failed to update ${date}:`, error.message);
    } else {
      console.log(`  ✅ ${date} → ${newNotes}`);
    }
  }

  // ============================================
  // FIX MAINTENANCE SCHEDULES
  // ============================================
  console.log('\n🔧 Fixing Maintenance schedules...');

  const maintenanceFixes = [
    // January 2025
    { room: 'A 1806', date: '2025-01-18', problem: 'ელემენტის შეცვლა' },
    { room: 'C 3421', date: '2025-01-19', problem: 'კარი დაზიანდა' },
    { room: 'D1 3414', date: '2025-01-20', problem: 'წყალი გაჟონა' },
    { room: 'A 2441', date: '2025-01-21', problem: 'წყლის გაჟონვა' },
    { room: 'C 2861', date: '2025-01-22', problem: 'კონდიციონერი არ მუშაობს' },
    { room: 'C 4706', date: '2025-01-23', problem: 'შუქი არ ინთება' },
    { room: 'A 4023', date: '2025-01-26', problem: 'საბარათე დაზიანდა' },
    { room: 'D2 3727', date: '2025-01-27', problem: 'კარი არ იკეტება' },
    // December 2025
    { room: 'C 3611', date: '2025-12-16', problem: 'საბარათე დაზიანდა' },
    { room: 'C 2947', date: '2025-12-13', problem: 'გატყდა დუშის ყურმილი' },
    { room: 'C 1256', date: '2025-12-12', problem: 'C837 საბარათე' },
    { room: 'C 1256', date: '2025-12-10', problem: 'შუქი არ ინთებოდა' },
    { room: 'A 1301', date: '2025-12-04', problem: 'კარის ელემენტი დაჯდა' },
    { room: 'A 1033', date: '2025-12-03', problem: 'აივნის კარი არ იკეტება' },
    // November 2025
    { room: 'C 4704', date: '2025-11-29', problem: 'დაიკარგა ბარათი' },
    { room: 'A 3035', date: '2025-11-22', problem: 'უნიტაზში წყალი ჩადის' },
    { room: 'A 3035', date: '2025-11-21', problem: 'უნიტაზში წყალი ჩადის' },
    { room: 'A 2035', date: '2025-11-20', problem: 'პულტის ელემენტი' },
    { room: 'A 3035', date: '2025-11-19', problem: 'დუშის შლანგი გაფუჭდა' },
  ];

  for (const fix of maintenanceFixes) {
    const { error } = await supabase
      .from('maintenance_schedules')
      .update({ problem: fix.problem })
      .eq('room_number', fix.room)
      .eq('scheduled_date', fix.date);

    if (error) {
      console.error(`  ❌ Failed ${fix.room} ${fix.date}:`, error.message);
    } else {
      console.log(`  ✅ ${fix.room} (${fix.date}) → ${fix.problem}`);
    }
  }

  // ============================================
  // FIX STANDARD INVENTORY ITEMS
  // ============================================
  console.log('\n📦 Fixing Standard inventory items...');

  const inventoryFixes = [
    // აბაზანის აქსესუარები
    { category: 'აბაზანის აქსესუარები', item_name: 'აბაზანის სარკე', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'ნაგვის ურნა', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'ნიჟარა შემრევით', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'საშხაპე დუშითა და შემრევით', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'საშხაპის აქსესუარი', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'ტუალეტის ქაღალდის საკიდი', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'უნიტაზი', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'უნიტაზის ჯაგრისი', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'ფენი', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'წყლის გამაცხელებელი', standard_quantity: 1 },
    { category: 'აბაზანის აქსესუარები', item_name: 'ხის კალათა', standard_quantity: 1 },
    // ავეჯი და ტექსტილი
    { category: 'ავეჯი და ტექსტილი', item_name: 'აივნის მაგიდა', standard_quantity: 1 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'აივნის სკამი', standard_quantity: 4 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'ბალიში (საწოლისთვის და დივნისთვის)', standard_quantity: 3 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'ბალიშის ჩიხოლი (საწოლისთვის და დივნისთვის)', standard_quantity: 3 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'დივანი გასაშლელი', standard_quantity: 1 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'ზეწარი (საწოლისთვის და დივნისთვის)', standard_quantity: 2 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'კარადა სარკით', standard_quantity: 1 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'საწოლი მატრასით', standard_quantity: 1 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'ფარდა', standard_quantity: 2 },
    { category: 'ავეჯი და ტექსტილი', item_name: 'საბანი', standard_quantity: 2 },
    // სამზარეულო
    { category: 'სამზარეულო', item_name: 'მაცივარი', standard_quantity: 1 },
    { category: 'სამზარეულო', item_name: 'მიკროტალღური ღუმელი', standard_quantity: 1 },
    { category: 'სამზარეულო', item_name: 'ელექტრო ქურა', standard_quantity: 1 },
    { category: 'სამზარეულო', item_name: 'ჩაიდანი', standard_quantity: 1 },
  ];

  // First delete all existing standard inventory items
  const { error: deleteError } = await supabase
    .from('standard_inventory_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('  ❌ Failed to clear old items:', deleteError.message);
  } else {
    console.log('  🗑️ Cleared old items');
  }

  // Insert fresh items
  const { error: insertError } = await supabase
    .from('standard_inventory_items')
    .insert(inventoryFixes);

  if (insertError) {
    console.error('  ❌ Failed to insert items:', insertError.message);
  } else {
    console.log(`  ✅ Inserted ${inventoryFixes.length} standard inventory items`);
  }

  // ============================================
  // VERIFY RESULTS
  // ============================================
  console.log('\n📊 Verifying results...');

  const { data: hkVerify } = await supabase
    .from('housekeeping_schedules')
    .select('notes')
    .limit(5);
  console.log('  Housekeeping samples:', hkVerify?.map(h => h.notes).join(', '));

  const { data: mtVerify } = await supabase
    .from('maintenance_schedules')
    .select('problem')
    .limit(5);
  console.log('  Maintenance samples:', mtVerify?.map(m => m.problem).join(', '));

  const { data: invVerify } = await supabase
    .from('standard_inventory_items')
    .select('item_name')
    .limit(5);
  console.log('  Inventory samples:', invVerify?.map(i => i.item_name).join(', '));

  console.log('\n✅ Georgian encoding fix complete!');
}

fixGeorgianEncoding().catch(console.error);
