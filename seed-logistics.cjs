const mysql = require('mysql2/promise');

// 60 ORBI City studio room numbers (from real data)
const roomNumbers = [
  // Block A
  'A 3041', 'A 3042', 'A 3043', 'A 3044', 'A 3045', 'A 3046', 'A 3047', 'A 3048', 'A 3049', 'A 3050',
  // Block B
  'B 2541', 'B 2542', 'B 2543', 'B 2544', 'B 2545', 'B 2546', 'B 2547', 'B 2548', 'B 2549', 'B 2550',
  // Block C
  'C 2641', 'C 2642', 'C 2643', 'C 2644', 'C 2645', 'C 2646', 'C 2647', 'C 2648', 'C 2649', 'C 2650',
  // Block D
  'D 3418', 'D 3419', 'D 3420', 'D 3421', 'D 3422', 'D 3423', 'D 3424', 'D 3425', 'D 3426', 'D 3427',
  // Block E
  'E 2718', 'E 2719', 'E 2720', 'E 2721', 'E 2722', 'E 2723', 'E 2724', 'E 2725', 'E 2726', 'E 2727',
  // Block F
  'F 3118', 'F 3119', 'F 3120', 'F 3121', 'F 3122', 'F 3123', 'F 3124', 'F 3125', 'F 3126', 'F 3127',
];

// 90+ Standard inventory items for aparthotel studios
const inventoryItems = [
  // FURNITURE (20 items)
  { itemName: 'Double Bed', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Single Bed', category: 'Furniture', standardQuantity: 0 },
  { itemName: 'Sofa Bed', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Wardrobe', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Bedside Table', category: 'Furniture', standardQuantity: 2 },
  { itemName: 'Desk', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Chair', category: 'Furniture', standardQuantity: 2 },
  { itemName: 'Coffee Table', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'TV Stand', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Dining Table', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Dining Chair', category: 'Furniture', standardQuantity: 4 },
  { itemName: 'Shoe Rack', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Mirror (Full Length)', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Mirror (Wall)', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Coat Rack', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Bookshelf', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Ottoman', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Balcony Table', category: 'Furniture', standardQuantity: 1 },
  { itemName: 'Balcony Chair', category: 'Furniture', standardQuantity: 2 },
  { itemName: 'Luggage Rack', category: 'Furniture', standardQuantity: 1 },

  // APPLIANCES & ELECTRONICS (15 items)
  { itemName: 'Smart TV', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Air Conditioner', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Refrigerator', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Microwave', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Electric Kettle', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Hair Dryer', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Iron', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Ironing Board', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Vacuum Cleaner', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Washing Machine', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Wi-Fi Router', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Safe Box', category: 'Appliances', standardQuantity: 1 },
  { itemName: 'Ceiling Light', category: 'Appliances', standardQuantity: 2 },
  { itemName: 'Bedside Lamp', category: 'Appliances', standardQuantity: 2 },
  { itemName: 'Desk Lamp', category: 'Appliances', standardQuantity: 1 },

  // TEXTILES & BEDDING (20 items)
  { itemName: 'Mattress', category: 'Textiles', standardQuantity: 1 },
  { itemName: 'Mattress Protector', category: 'Textiles', standardQuantity: 1 },
  { itemName: 'Pillow', category: 'Textiles', standardQuantity: 4 },
  { itemName: 'Pillow Case', category: 'Textiles', standardQuantity: 4 },
  { itemName: 'Bed Sheet (Fitted)', category: 'Textiles', standardQuantity: 2 },
  { itemName: 'Bed Sheet (Flat)', category: 'Textiles', standardQuantity: 2 },
  { itemName: 'Duvet', category: 'Textiles', standardQuantity: 1 },
  { itemName: 'Duvet Cover', category: 'Textiles', standardQuantity: 2 },
  { itemName: 'Blanket', category: 'Textiles', standardQuantity: 1 },
  { itemName: 'Throw Pillow', category: 'Textiles', standardQuantity: 3 },
  { itemName: 'Curtains', category: 'Textiles', standardQuantity: 2 },
  { itemName: 'Blackout Curtains', category: 'Textiles', standardQuantity: 1 },
  { itemName: 'Bath Towel (Large)', category: 'Textiles', standardQuantity: 4 },
  { itemName: 'Hand Towel', category: 'Textiles', standardQuantity: 4 },
  { itemName: 'Face Towel', category: 'Textiles', standardQuantity: 4 },
  { itemName: 'Bath Mat', category: 'Textiles', standardQuantity: 1 },
  { itemName: 'Bathrobe', category: 'Textiles', standardQuantity: 2 },
  { itemName: 'Slippers (Disposable)', category: 'Textiles', standardQuantity: 2 },
  { itemName: 'Kitchen Towel', category: 'Textiles', standardQuantity: 3 },
  { itemName: 'Rug (Living Area)', category: 'Textiles', standardQuantity: 1 },

  // KITCHEN & DINING (20 items)
  { itemName: 'Dinner Plate', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Salad Plate', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Bowl', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Mug/Cup', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Glass (Water)', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Wine Glass', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Fork', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Knife', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Spoon', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Teaspoon', category: 'Kitchen', standardQuantity: 4 },
  { itemName: 'Cooking Pot (Large)', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Cooking Pot (Small)', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Frying Pan', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Cutting Board', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Kitchen Knife Set', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Spatula', category: 'Kitchen', standardQuantity: 2 },
  { itemName: 'Ladle', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Can Opener', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Corkscrew', category: 'Kitchen', standardQuantity: 1 },
  { itemName: 'Trash Bin', category: 'Kitchen', standardQuantity: 1 },

  // BATHROOM (15 items)
  { itemName: 'Shower Head', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Toilet Paper Holder', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Towel Rack', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Soap Dispenser', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Toothbrush Holder', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Bathroom Mirror', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Toilet Brush', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Plunger', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Shower Curtain', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Bathroom Scale', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Waste Basket', category: 'Bathroom', standardQuantity: 1 },
  { itemName: 'Shampoo (Welcome)', category: 'Bathroom', standardQuantity: 2 },
  { itemName: 'Conditioner (Welcome)', category: 'Bathroom', standardQuantity: 2 },
  { itemName: 'Body Wash (Welcome)', category: 'Bathroom', standardQuantity: 2 },
  { itemName: 'Toilet Paper Roll', category: 'Bathroom', standardQuantity: 4 },
];

async function seedLogistics() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('🌱 Starting Logistics seed...\n');
    
    // 1. Seed rooms
    console.log('📍 Seeding 60 rooms...');
    for (const roomNumber of roomNumbers) {
      await connection.execute(
        'INSERT IGNORE INTO rooms (roomNumber) VALUES (?)',
        [roomNumber]
      );
    }
    console.log(`✅ ${roomNumbers.length} rooms seeded\n`);
    
    // 2. Seed standard inventory items
    console.log('📦 Seeding ${inventoryItems.length} standard inventory items...');
    for (const item of inventoryItems) {
      await connection.execute(
        'INSERT IGNORE INTO standardInventoryItems (itemName, category, standardQuantity) VALUES (?, ?, ?)',
        [item.itemName, item.category, item.standardQuantity]
      );
    }
    console.log(`✅ ${inventoryItems.length} inventory items seeded\n`);
    
    // 3. Get all rooms and items for creating room inventory
    const [rooms] = await connection.execute('SELECT id, roomNumber FROM rooms');
    const [items] = await connection.execute('SELECT id, itemName, standardQuantity FROM standardInventoryItems');
    
    console.log('🏠 Creating room inventory for all rooms...');
    let inventoryCount = 0;
    for (const room of rooms) {
      for (const item of items) {
        // Create inventory item for each room with standard quantity
        await connection.execute(
          'INSERT IGNORE INTO roomInventoryItems (roomId, standardItemId, actualQuantity, `condition`) VALUES (?, ?, ?, ?)',
          [room.id, item.id, item.standardQuantity, 'good']
        );
        inventoryCount++;
      }
    }
    console.log(`✅ ${inventoryCount} room inventory items created\n`);
    
    // 4. Create sample housekeeping schedules
    console.log('🧹 Creating sample housekeeping schedules...');
    const housekeepingData = [
      {
        scheduledDate: '2024-01-15',
        rooms: JSON.stringify(['A 3041', 'A 3042', 'A 3043', 'A 3044', 'A 3045']),
        totalRooms: 5,
        status: 'completed',
        assignedTo: 'Maria K.',
        notes: 'Deep cleaning completed'
      },
      {
        scheduledDate: '2024-01-16',
        rooms: JSON.stringify(['B 2541', 'B 2542', 'B 2543', 'B 2544', 'B 2545']),
        totalRooms: 5,
        status: 'in_progress',
        assignedTo: 'Ana G.',
        notes: 'Regular cleaning in progress'
      },
      {
        scheduledDate: '2024-01-17',
        rooms: JSON.stringify(['C 2641', 'C 2642', 'C 2643', 'C 2644', 'C 2645']),
        totalRooms: 5,
        status: 'pending',
        assignedTo: 'Nino T.',
        notes: 'Scheduled for tomorrow'
      }
    ];
    
    for (const schedule of housekeepingData) {
      await connection.execute(
        'INSERT INTO housekeepingSchedules (scheduledDate, rooms, totalRooms, status, assignedTo, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [schedule.scheduledDate, schedule.rooms, schedule.totalRooms, schedule.status, schedule.assignedTo, schedule.notes]
      );
    }
    console.log(`✅ ${housekeepingData.length} housekeeping schedules created\n`);
    
    // 5. Create sample maintenance issues
    console.log('🔧 Creating sample maintenance issues...');
    const maintenanceData = [
      {
        roomNumber: 'A 3041',
        scheduledDate: '2024-01-16',
        problem: 'Air conditioning not working',
        priority: 'high',
        status: 'in_progress',
        estimatedCost: 150.00,
        assignedTo: 'Giorgi M.'
      },
      {
        roomNumber: 'C 2641',
        scheduledDate: '2024-01-17',
        problem: 'Leaking faucet in bathroom',
        priority: 'medium',
        status: 'scheduled',
        estimatedCost: 75.50,
        assignedTo: 'Luka P.'
      },
      {
        roomNumber: 'D 3418',
        scheduledDate: '2024-01-18',
        problem: 'Broken window lock',
        priority: 'low',
        status: 'pending',
        estimatedCost: 45.00
      }
    ];
    
    for (const issue of maintenanceData) {
      await connection.execute(
        'INSERT INTO maintenanceSchedules (roomNumber, scheduledDate, problem, priority, status, estimatedCost, assignedTo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [issue.roomNumber, issue.scheduledDate, issue.problem, issue.priority, issue.status, issue.estimatedCost, issue.assignedTo || null]
      );
    }
    console.log(`✅ ${maintenanceData.length} maintenance issues created\n`);
    
    console.log('🎉 Logistics seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${roomNumbers.length} rooms`);
    console.log(`   - ${inventoryItems.length} standard inventory items`);
    console.log(`   - ${inventoryCount} room inventory items`);
    console.log(`   - ${housekeepingData.length} housekeeping schedules`);
    console.log(`   - ${maintenanceData.length} maintenance issues`);
    
  } catch (error) {
    console.error('❌ Error seeding logistics:', error);
  } finally {
    await connection.end();
  }
}

seedLogistics();
