import { drizzle } from 'drizzle-orm/mysql2';
import { standardInventoryItems } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

// Comprehensive inventory items for aparthotel studios (from Lovable + extended)
const inventoryData = [
  // ავეჯი და ტექსტილი (Furniture & Textiles)
  { category: 'Furniture & Textiles', itemName: 'Bedside Table', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Work Desk', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Bed with Mattress', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Sofa Bed (Open)', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Dining Table', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Chair', standardQuantity: 2 },
  { category: 'Furniture & Textiles', itemName: 'Bar Stool', standardQuantity: 4 },
  { category: 'Furniture & Textiles', itemName: 'Bar Table', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Curtains', standardQuantity: 2 },
  { category: 'Furniture & Textiles', itemName: 'Bed Decorative Cover', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Bedside Lamp', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Pillow (Bed & Sofa)', standardQuantity: 3 },
  { category: 'Furniture & Textiles', itemName: 'Pillowcase (Bed & Sofa)', standardQuantity: 3 },
  { category: 'Furniture & Textiles', itemName: 'Mattress Protector', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Duvet (Bed & Sofa)', standardQuantity: 2 },
  { category: 'Furniture & Textiles', itemName: 'Bed Sheet (Bed & Sofa)', standardQuantity: 2 },
  { category: 'Furniture & Textiles', itemName: 'Wardrobe', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Clothes Hangers', standardQuantity: 10 },
  { category: 'Furniture & Textiles', itemName: 'Mirror (Full Length)', standardQuantity: 1 },
  { category: 'Furniture & Textiles', itemName: 'Rug/Carpet', standardQuantity: 1 },
  
  // სამზარეულო (Kitchen)
  { category: 'Kitchen', itemName: 'Refrigerator', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Microwave', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Electric Kettle', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Induction Cooktop', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Cooking Pot (Large)', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Cooking Pot (Small)', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Frying Pan', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Cutting Board', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Kitchen Knife Set', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Plates (Dinner)', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Plates (Dessert)', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Bowls', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Cups/Mugs', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Glasses (Water)', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Wine Glasses', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Forks', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Knives (Table)', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Spoons', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Teaspoons', standardQuantity: 4 },
  { category: 'Kitchen', itemName: 'Serving Spoon', standardQuantity: 2 },
  { category: 'Kitchen', itemName: 'Can Opener', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Corkscrew', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Kitchen Towels', standardQuantity: 3 },
  { category: 'Kitchen', itemName: 'Dish Soap', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Sponge', standardQuantity: 2 },
  { category: 'Kitchen', itemName: 'Trash Bin', standardQuantity: 1 },
  { category: 'Kitchen', itemName: 'Trash Bags', standardQuantity: 10 },
  
  // სააბაზანო (Bathroom)
  { category: 'Bathroom', itemName: 'Bath Towel (Large)', standardQuantity: 2 },
  { category: 'Bathroom', itemName: 'Hand Towel', standardQuantity: 2 },
  { category: 'Bathroom', itemName: 'Face Towel', standardQuantity: 2 },
  { category: 'Bathroom', itemName: 'Bath Mat', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Shower Curtain', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Toilet Paper', standardQuantity: 4 },
  { category: 'Bathroom', itemName: 'Toilet Brush', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Soap Dispenser', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Shampoo', standardQuantity: 2 },
  { category: 'Bathroom', itemName: 'Shower Gel', standardQuantity: 2 },
  { category: 'Bathroom', itemName: 'Hair Dryer', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Bathroom Mirror', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Toothbrush Holder', standardQuantity: 1 },
  { category: 'Bathroom', itemName: 'Soap Bar', standardQuantity: 2 },
  
  // ტექნიკა და ელექტრონიკა (Electronics)
  { category: 'Electronics', itemName: 'TV (Smart TV)', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'TV Remote Control', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'Air Conditioner', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'AC Remote Control', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'Wi-Fi Router', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'Vacuum Cleaner', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'Iron', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'Ironing Board', standardQuantity: 1 },
  { category: 'Electronics', itemName: 'Extension Cord', standardQuantity: 2 },
  { category: 'Electronics', itemName: 'USB Charger', standardQuantity: 1 },
  
  // დასუფთავების საშუალებები (Cleaning Supplies)
  { category: 'Cleaning Supplies', itemName: 'Broom', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Mop', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Bucket', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Dustpan', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'All-Purpose Cleaner', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Glass Cleaner', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Bathroom Cleaner', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Floor Cleaner', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Disinfectant Spray', standardQuantity: 1 },
  { category: 'Cleaning Supplies', itemName: 'Microfiber Cloths', standardQuantity: 5 },
  { category: 'Cleaning Supplies', itemName: 'Rubber Gloves', standardQuantity: 2 },
  
  // სხვა (Other)
  { category: 'Other', itemName: 'Safe Box', standardQuantity: 1 },
  { category: 'Other', itemName: 'Welcome Guide', standardQuantity: 1 },
  { category: 'Other', itemName: 'Door Key', standardQuantity: 2 },
  { category: 'Other', itemName: 'Key Card', standardQuantity: 2 },
  { category: 'Other', itemName: 'Laundry Basket', standardQuantity: 1 },
  { category: 'Other', itemName: 'Clothes Drying Rack', standardQuantity: 1 },
  { category: 'Other', itemName: 'Fire Extinguisher', standardQuantity: 1 },
  { category: 'Other', itemName: 'First Aid Kit', standardQuantity: 1 },
  { category: 'Other', itemName: 'Smoke Detector', standardQuantity: 1 },
  { category: 'Other', itemName: 'Flashlight', standardQuantity: 1 },
  { category: 'Other', itemName: 'Batteries (AA)', standardQuantity: 4 },
  { category: 'Other', itemName: 'Umbrella', standardQuantity: 1 },
];

async function seedInventory() {
  console.log('🌱 Seeding standard inventory items...');
  
  try {
    // Check if items already exist
    const existing = await db.select().from(standardInventoryItems).limit(1);
    
    if (existing.length > 0) {
      console.log('⚠️  Standard inventory items already exist. Skipping seed.');
      console.log('   To re-seed, delete existing items first.');
      return;
    }
    
    // Insert all items
    await db.insert(standardInventoryItems).values(inventoryData);
    
    console.log(`✅ Successfully seeded ${inventoryData.length} standard inventory items!`);
    console.log('\nCategories:');
    const categories = [...new Set(inventoryData.map(item => item.category))];
    categories.forEach(cat => {
      const count = inventoryData.filter(item => item.category === cat).length;
      console.log(`   - ${cat}: ${count} items`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    throw error;
  }
}

seedInventory()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
