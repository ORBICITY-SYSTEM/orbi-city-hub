/**
 * ORBI CITY HUB - Logistics Data Fix Script
 * Run with: node fix-logistics.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lusagtvxjtfxgfadulgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg2MzYsImV4cCI6MjA4Mzg4NDYzNn0.D3F6xMDNLm8a9AC6tDMsT68Ad6F6xOlhoXTxEFmtPM8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ROOMS = [
  'A 1033', 'A 1258', 'A 1301', 'A 1806', 'A 1821', 'A 1833',
  'A 2035', 'A 2441', 'A 3035', 'A 3041', 'A 4022', 'A 4023',
  'A 4024', 'A 4025', 'A 4026', 'A 4027', 'A 4029', 'A 4035',
  'C 1256', 'C 2107', 'C 2520', 'C 2522', 'C 2524', 'C 2529',
  'C 2547', 'C 2558', 'C 2609', 'C 2637', 'C 2641', 'C 2847',
  'C 2861', 'C 2921', 'C 2923', 'C 2936', 'C 2947', 'C 2961',
  'C 3421', 'C 3423', 'C 3425', 'C 3428', 'C 3431', 'C 3437',
  'C 3439', 'C 3441', 'C 3611', 'C 3834', 'C 3928', 'C 3937',
  'C 4011', 'C 4638', 'C 4704', 'C 4706',
  'D1 3414', 'D1 3416', 'D1 3418', 'D2 3727'
];

const STANDARD_ITEMS = [
  { item_name: 'აბაზანის სარკე', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'ნაგვის ურნა', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'ნიჟარა შემრევით', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'საშხაპე დუშითა და შემრევით', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'საშხაპის აქსესუარი', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'ტუალეტის ქაღალდის საკიდი', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'უნიტაზი', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'უნიტაზის ჯაგრისი', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'ფენი', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'წყლის გამაცხელებელი', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'ხის კალათა', category: 'აბაზანის აქსესუარები', standard_quantity: 1 },
  { item_name: 'აივნის მაგიდა', category: 'ავეჯი და ტექსტილი', standard_quantity: 1 },
  { item_name: 'აივნის სკამი', category: 'ავეჯი და ტექსტილი', standard_quantity: 4 },
  { item_name: 'ბალიში', category: 'ავეჯი და ტექსტილი', standard_quantity: 3 },
  { item_name: 'ბალიშის ჩიხოლი', category: 'ავეჯი და ტექსტილი', standard_quantity: 3 },
  { item_name: 'დივანი გასაშლელი', category: 'ავეჯი და ტექსტილი', standard_quantity: 1 },
  { item_name: 'ზეწარი', category: 'ავეჯი და ტექსტილი', standard_quantity: 2 },
  { item_name: 'ელექტროქურა', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
  { item_name: 'მაცივარი', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
  { item_name: 'მიკროტალღური ღუმელი', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
  { item_name: 'ელექტროჩაიდანი', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
  { item_name: 'ჭურჭლის ნაკრები', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
  { item_name: 'დანა-ჩანგლის ნაკრები', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
  { item_name: 'ქვაბი', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 2 },
  { item_name: 'ტაფა', category: 'სამზარეულოს აღჭურვილობა', standard_quantity: 1 },
];

const HOUSEKEEPING = [
  { scheduled_date: '2025-01-20', rooms: ['A 1033', 'A 1258', 'A 1301', 'A 1806'], total_rooms: 4, notes: 'რეგულარული დასუფთავება', status: 'completed' },
  { scheduled_date: '2025-01-21', rooms: ['A 1821', 'A 1833', 'A 2035', 'A 2441', 'A 3035'], total_rooms: 5, notes: 'რეგულარული დასუფთავება', status: 'completed' },
  { scheduled_date: '2025-01-22', rooms: ['A 3041', 'A 4022', 'A 4023', 'A 4024', 'A 4025'], total_rooms: 5, notes: 'რეგულარული დასუფთავება', status: 'completed' },
  { scheduled_date: '2025-01-23', rooms: ['C 1256', 'C 2107', 'C 2520', 'C 2522', 'C 2524'], total_rooms: 5, notes: 'რეგულარული დასუფთავება', status: 'completed' },
  { scheduled_date: '2025-01-24', rooms: ['C 2529', 'C 2547', 'C 2558', 'C 2609', 'C 2637'], total_rooms: 5, notes: 'რეგულარული დასუფთავება', status: 'pending' },
  { scheduled_date: '2025-01-25', rooms: ['C 2641', 'C 2847', 'C 2861', 'C 2921', 'C 2923'], total_rooms: 5, notes: 'შაბათი - ღრმა დასუფთავება', status: 'pending' },
  { scheduled_date: '2025-01-26', rooms: ['C 2936', 'C 2947', 'C 2961', 'C 3421', 'C 3423'], total_rooms: 5, notes: 'კვირა', status: 'pending' },
  { scheduled_date: '2025-01-27', rooms: ['C 3425', 'C 3428', 'C 3431', 'C 3437', 'C 3439'], total_rooms: 5, notes: 'რეგულარული', status: 'pending' },
  { scheduled_date: '2025-01-28', rooms: ['C 3441', 'C 3611', 'C 3834', 'C 3928', 'C 3937'], total_rooms: 5, notes: 'რეგულარული', status: 'pending' },
  { scheduled_date: '2025-01-29', rooms: ['C 4011', 'C 4638', 'C 4704', 'C 4706'], total_rooms: 4, notes: 'რეგულარული', status: 'pending' },
  { scheduled_date: '2025-01-30', rooms: ['D1 3414', 'D1 3416', 'D1 3418', 'D2 3727'], total_rooms: 4, notes: 'D კორპუსი', status: 'pending' },
  { scheduled_date: '2025-01-31', rooms: ['A 4026', 'A 4027', 'A 4029', 'A 4035'], total_rooms: 4, notes: '40-ე სართული', status: 'pending' },
];

const MAINTENANCE = [
  { scheduled_date: '2025-01-18', room_number: 'A 1033', problem: 'კონდიციონერი არ მუშაობს', notes: 'ტექნიკოსი გამოძახებულია', status: 'completed', cost: 150 },
  { scheduled_date: '2025-01-19', room_number: 'C 2520', problem: 'ონკანი წვეთავს', notes: 'აბაზანის ონკანი შეცვლილია', status: 'completed', cost: 80 },
  { scheduled_date: '2025-01-20', room_number: 'A 1806', problem: 'ტელევიზორის პულტი არ მუშაობს', notes: 'ახალი პულტი დაყენდა', status: 'completed', cost: 25 },
  { scheduled_date: '2025-01-21', room_number: 'C 3421', problem: 'შუშა გაბზარულია', notes: 'მინა შეცვლილია', status: 'completed', cost: 200 },
  { scheduled_date: '2025-01-22', room_number: 'D1 3414', problem: 'წყლის გამაცხელებელი გაფუჭდა', notes: 'ახალი დაყენდა', status: 'completed', cost: 450 },
  { scheduled_date: '2025-01-23', room_number: 'A 2441', problem: 'კარის საკეტი გაფუჭდა', notes: 'შეკეთება მიმდინარეობს', status: 'in_progress', cost: 60 },
  { scheduled_date: '2025-01-24', room_number: 'C 2861', problem: 'ელექტროქურა არ ირთვება', notes: 'დიაგნოსტიკა საჭიროა', status: 'pending', cost: 0 },
  { scheduled_date: '2025-01-25', room_number: 'C 4706', problem: 'დუშის შლანგი გატყდა', notes: 'ახალი შეკვეთილია', status: 'pending', cost: 35 },
  { scheduled_date: '2025-01-26', room_number: 'A 4023', problem: 'მაცივარი ხმაურიანია', notes: 'შემოწმება საჭიროა', status: 'pending', cost: 0 },
  { scheduled_date: '2025-01-27', room_number: 'C 3937', problem: 'აივნის კარი ჭრიალებს', notes: 'საპოხი მასალა საჭიროა', status: 'pending', cost: 15 },
  { scheduled_date: '2025-01-28', room_number: 'D2 3727', problem: 'ვენტილაცია არ მუშაობს', notes: 'ტექნიკოსი გამოიძახება', status: 'pending', cost: 0 },
];

async function fixLogistics() {
  console.log('🚀 Starting Logistics Data Fix...\n');

  try {
    // Step 1: Clear existing data
    console.log('🗑️  Clearing existing data...');
    await supabase.from('room_inventory_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('housekeeping_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('maintenance_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('standard_inventory_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Existing data cleared\n');

    // Step 2: Insert rooms
    console.log('🏠 Inserting 56 rooms...');
    const roomsData = ROOMS.map(room_number => ({ room_number }));
    const { error: roomsError } = await supabase.from('rooms').insert(roomsData);
    if (roomsError) throw new Error(`Rooms error: ${roomsError.message}`);
    console.log('✅ 56 rooms inserted\n');

    // Step 3: Insert standard items
    console.log('📦 Inserting 25 standard inventory items...');
    const { error: itemsError } = await supabase.from('standard_inventory_items').insert(STANDARD_ITEMS);
    if (itemsError) throw new Error(`Standard items error: ${itemsError.message}`);
    console.log('✅ 25 standard items inserted\n');

    // Step 4: Get rooms and items for inventory creation
    console.log('📋 Creating room inventory items...');
    const { data: rooms } = await supabase.from('rooms').select('id, room_number');
    const { data: items } = await supabase.from('standard_inventory_items').select('id, standard_quantity');

    const inventoryItems = [];
    for (const room of rooms) {
      for (const item of items) {
        inventoryItems.push({
          room_id: room.id,
          standard_item_id: item.id,
          actual_quantity: item.standard_quantity,
          condition: 'OK',
          last_checked: new Date().toISOString()
        });
      }
    }

    // Insert in batches of 100
    for (let i = 0; i < inventoryItems.length; i += 100) {
      const batch = inventoryItems.slice(i, i + 100);
      const { error: invError } = await supabase.from('room_inventory_items').insert(batch);
      if (invError) throw new Error(`Inventory error: ${invError.message}`);
      process.stdout.write(`   Batch ${Math.floor(i/100) + 1}/${Math.ceil(inventoryItems.length/100)}...\r`);
    }
    console.log(`\n✅ ${inventoryItems.length} room inventory items inserted\n`);

    // Step 5: Insert housekeeping schedules
    console.log('🧹 Inserting housekeeping schedules...');
    const { error: hkError } = await supabase.from('housekeeping_schedules').insert(HOUSEKEEPING);
    if (hkError) throw new Error(`Housekeeping error: ${hkError.message}`);
    console.log('✅ 12 housekeeping schedules inserted\n');

    // Step 6: Insert maintenance schedules
    console.log('🔧 Inserting maintenance schedules...');
    const { error: maintError } = await supabase.from('maintenance_schedules').insert(MAINTENANCE);
    if (maintError) throw new Error(`Maintenance error: ${maintError.message}`);
    console.log('✅ 11 maintenance schedules inserted\n');

    // Step 7: Create some inventory issues for demo
    console.log('⚠️  Creating demo inventory issues...');
    const roomA1033 = rooms.find(r => r.room_number === 'A 1033');
    const { data: stdItems } = await supabase.from('standard_inventory_items').select('id, item_name');
    const feniItem = stdItems.find(i => i.item_name === 'ფენი');

    if (roomA1033 && feniItem) {
      await supabase.from('room_inventory_items')
        .update({ actual_quantity: 0, condition: 'Missing', notes: 'დაკარგულია' })
        .eq('room_id', roomA1033.id)
        .eq('standard_item_id', feniItem.id);
    }
    console.log('✅ Demo issues created\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ LOGISTICS DATA FIXED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • Rooms: 56`);
    console.log(`   • Standard Items: 25`);
    console.log(`   • Room Inventory Items: ${inventoryItems.length}`);
    console.log(`   • Housekeeping Schedules: 12`);
    console.log(`   • Maintenance Schedules: 11`);
    console.log('\n🌐 გაახალე გვერდი: http://localhost:3004/logistics');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixLogistics();
