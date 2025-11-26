const mysql = require('mysql2/promise');

(async () => {
  console.log('🌱 Starting rooms seed...');

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  // 60 ORBI City studio room numbers
  const roomNumbers = [
    // Block A (10 rooms)
    'A 3041', 'A 3042', 'A 3043', 'A 3044', 'A 3045', 'A 3046', 'A 3047', 'A 3048', 'A 3049', 'A 3050',
    // Block B (10 rooms)
    'B 2541', 'B 2542', 'B 2543', 'B 2544', 'B 2545', 'B 2546', 'B 2547', 'B 2548', 'B 2549', 'B 2550',
    // Block C (10 rooms)
    'C 2641', 'C 2642', 'C 2643', 'C 2644', 'C 2645', 'C 2646', 'C 2647', 'C 2648', 'C 2649', 'C 2650',
    // Block D (10 rooms)
    'D 3418', 'D 3419', 'D 3420', 'D 3421', 'D 3422', 'D 3423', 'D 3424', 'D 3425', 'D 3426', 'D 3427',
    // Block E (10 rooms)
    'E 2718', 'E 2719', 'E 2720', 'E 2721', 'E 2722', 'E 2723', 'E 2724', 'E 2725', 'E 2726', 'E 2727',
    // Block F (10 rooms)
    'F 3118', 'F 3119', 'F 3120', 'F 3121', 'F 3122', 'F 3123', 'F 3124', 'F 3125', 'F 3126', 'F 3127',
  ];

  console.log(`📍 Seeding ${roomNumbers.length} rooms...`);

  for (const roomNumber of roomNumbers) {
    await connection.execute(
      'INSERT IGNORE INTO rooms (roomNumber) VALUES (?)',
      [roomNumber]
    );
  }

  console.log(`✅ ${roomNumbers.length} rooms seeded`);

  await connection.end();
  console.log('✅ Seed completed!');
})();
