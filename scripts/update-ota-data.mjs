import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const data = [
  { channel: 'Booking.com', month: '2024-12', bookings: 3, revenue: 461.0, nights: 6 },
  { channel: 'Booking.com', month: '2025-04', bookings: 63, revenue: 9262.81, nights: 177 },
  { channel: 'Booking.com', month: '2025-05', bookings: 31, revenue: 11159.41, nights: 163 },
  { channel: 'Booking.com', month: '2025-06', bookings: 87, revenue: 27908.58, nights: 305 },
  { channel: 'Booking.com', month: '2025-07', bookings: 91, revenue: 64098.99, nights: 386 },
  { channel: 'Booking.com', month: '2025-08', bookings: 70, revenue: 75067.0, nights: 356 },
  { channel: 'Booking.com', month: '2025-09', bookings: 47, revenue: 57802.0, nights: 245 },
  { channel: 'Booking.com', month: '2025-10', bookings: 38, revenue: 50127.0, nights: 214 },
  { channel: 'Booking.com', month: '2025-11', bookings: 20, revenue: 27632.0, nights: 134 },
  { channel: 'Booking.com', month: '2025-12', bookings: 18, revenue: 28426.0, nights: 114 },
  { channel: 'Booking.com', month: '2026-01', bookings: 5, revenue: 10068.0, nights: 42 },
  { channel: 'Booking.com', month: '2026-02', bookings: 2, revenue: 5880.0, nights: 28 },
  { channel: 'Booking.com', month: '2026-03', bookings: 1, revenue: 3920.0, nights: 14 },
  { channel: 'Booking.com', month: '2026-04', bookings: 1, revenue: 3920.0, nights: 14 },
  { channel: 'Booking.com', month: '2026-05', bookings: 1, revenue: 3920.0, nights: 14 },
  { channel: 'Booking.com', month: '2026-06', bookings: 2, revenue: 33516.5, nights: 91 },
  { channel: 'Booking.com', month: '2026-07', bookings: 1, revenue: 21000.0, nights: 30 },
  { channel: 'Expedia', month: '2024-12', bookings: 1, revenue: 161.0, nights: 1 },
  { channel: 'Expedia', month: '2025-01', bookings: 1, revenue: 168.0, nights: 2 },
  { channel: 'Expedia', month: '2025-04', bookings: 8, revenue: 1792.0, nights: 24 },
  { channel: 'Expedia', month: '2025-05', bookings: 22, revenue: 7098.0, nights: 68 },
  { channel: 'Expedia', month: '2025-06', bookings: 53, revenue: 27606.0, nights: 178 },
  { channel: 'Expedia', month: '2025-07', bookings: 80, revenue: 61180.0, nights: 283 },
  { channel: 'Expedia', month: '2025-08', bookings: 75, revenue: 85582.0, nights: 318 },
  { channel: 'Expedia', month: '2025-09', bookings: 78, revenue: 92694.0, nights: 354 },
  { channel: 'Expedia', month: '2025-10', bookings: 56, revenue: 64590.0, nights: 278 },
  { channel: 'Expedia', month: '2025-11', bookings: 23, revenue: 29330.0, nights: 132 },
  { channel: 'Expedia', month: '2025-12', bookings: 14, revenue: 24640.0, nights: 88 },
  { channel: 'Expedia', month: '2026-01', bookings: 4, revenue: 8960.0, nights: 32 },
  { channel: 'Expedia', month: '2026-02', bookings: 2, revenue: 4480.0, nights: 16 },
  { channel: 'Expedia', month: '2026-03', bookings: 1, revenue: 2240.0, nights: 8 },
  { channel: 'Expedia', month: '2026-04', bookings: 1, revenue: 2240.0, nights: 8 },
  { channel: 'Expedia', month: '2026-05', bookings: 1, revenue: 2240.0, nights: 8 },
  { channel: 'Expedia', month: '2026-06', bookings: 2, revenue: 21399.0, nights: 54 },
  { channel: 'Expedia', month: '2026-07', bookings: 1, revenue: 3000.0, nights: 10 },
  { channel: 'Agoda', month: '2025-07', bookings: 21, revenue: 10038.0, nights: 64 },
  { channel: 'Agoda', month: '2025-08', bookings: 13, revenue: 5856.0, nights: 31 },
  { channel: 'Agoda', month: '2025-09', bookings: 115, revenue: 24892.25, nights: 343 },
  { channel: 'Agoda', month: '2025-10', bookings: 72, revenue: 15167.3, nights: 322 },
  { channel: 'Agoda', month: '2025-11', bookings: 8, revenue: 2124.3, nights: 21 },
  { channel: 'Agoda', month: '2025-12', bookings: 16, revenue: 5838.0, nights: 52 },
  { channel: 'Agoda', month: '2026-01', bookings: 7, revenue: 1917.0, nights: 16 },
  { channel: 'Agoda', month: '2026-02', bookings: 2, revenue: 336.0, nights: 4 },
  { channel: 'Agoda', month: '2026-04', bookings: 2, revenue: 238.0, nights: 2 },
  { channel: 'Agoda', month: '2026-06', bookings: 16, revenue: 12357.0, nights: 159 },
  { channel: 'Agoda', month: '2026-07', bookings: 3, revenue: 1680.0, nights: 21 },
  { channel: 'Agoda', month: '2026-08', bookings: 3, revenue: 2960.0, nights: 37 },
  { channel: 'Agoda', month: '2026-09', bookings: 14, revenue: 10648.0, nights: 154 },
  { channel: 'Ostrovok', month: '2025-06', bookings: 7, revenue: 1449.75, nights: 12 },
  { channel: 'Ostrovok', month: '2025-07', bookings: 34, revenue: 16071.77, nights: 118 },
  { channel: 'Ostrovok', month: '2025-08', bookings: 21, revenue: 14950.09, nights: 100 },
  { channel: 'Ostrovok', month: '2025-09', bookings: 16, revenue: 7575.53, nights: 64 },
  { channel: 'Ostrovok', month: '2025-10', bookings: 11, revenue: 1147.52, nights: 16 },
  { channel: 'Ostrovok', month: '2025-11', bookings: 3, revenue: 913.8, nights: 14 },
  { channel: 'Ostrovok', month: '2025-12', bookings: 3, revenue: 1487.6, nights: 24 },
  { channel: 'Ostrovok', month: '2026-02', bookings: 1, revenue: 140.25, nights: 1 },
  { channel: 'Ostrovok', month: '2026-03', bookings: 1, revenue: 385.56, nights: 6 },
  { channel: 'Ostrovok', month: '2026-05', bookings: 1, revenue: 635.46, nights: 6 },
  { channel: 'Ostrovok', month: '2026-07', bookings: 3, revenue: 3979.53, nights: 27 },
  { channel: 'Ostrovok', month: '2026-08', bookings: 1, revenue: 4250.0, nights: 10 },
  { channel: 'Airbnb', month: '2025-06', bookings: 10, revenue: 1500, nights: 21 },
  { channel: 'Airbnb', month: '2025-07', bookings: 12, revenue: 2880, nights: 27 },
  { channel: 'Airbnb', month: '2025-08', bookings: 16, revenue: 3295, nights: 27 },
  { channel: 'Airbnb', month: '2025-09', bookings: 3, revenue: 340, nights: 3 },
  { channel: 'Airbnb', month: '2025-10', bookings: 2, revenue: 260, nights: 4 },
  { channel: 'Airbnb', month: '2025-11', bookings: 36, revenue: 2900, nights: 44 },
  { channel: 'Airbnb', month: '2025-12', bookings: 18, revenue: 1740, nights: 31 },
  { channel: 'Sutochno', month: '2025-08', bookings: 1, revenue: 460.0, nights: 2 },
  { channel: 'Sutochno', month: '2025-09', bookings: 2, revenue: 450.0, nights: 4 },
  { channel: 'Sutochno', month: '2025-10', bookings: 8, revenue: 2554.85, nights: 26 },
  { channel: 'Sutochno', month: '2025-11', bookings: 3, revenue: 270.0, nights: 3 },
  { channel: 'Sutochno', month: '2025-12', bookings: 1, revenue: 200.0, nights: 2 },
  { channel: 'Sutochno', month: '2026-07', bookings: 1, revenue: 1300.5, nights: 9 },
  { channel: 'Sutochno', month: '2026-08', bookings: 1, revenue: 1300.5, nights: 9 },
  { channel: 'Hostelworld', month: '2025-07', bookings: 2, revenue: 410, nights: 4 },
  { channel: 'Hostelworld', month: '2025-08', bookings: 2, revenue: 820, nights: 4 },
  { channel: 'Tvil.ru', month: '2025-12', bookings: 1, revenue: 1417.5, nights: 5 },
  { channel: 'Tvil.ru', month: '2026-07', bookings: 1, revenue: 337.5, nights: 3 },
  { channel: 'Tvil.ru', month: '2026-01', bookings: 1, revenue: 1755.0, nights: 5 },
  { channel: 'Tvil.ru', month: '2026-08', bookings: 1, revenue: 1755.0, nights: 5 },
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected to database');
  
  // Clear existing data
  await connection.execute('DELETE FROM ota_monthly_stats');
  console.log('Cleared old data');
  
  // Insert new data
  for (const row of data) {
    await connection.execute(
      'INSERT INTO ota_monthly_stats (channel, month, bookings, revenue, nights) VALUES (?, ?, ?, ?, ?)',
      [row.channel, row.month, row.bookings, row.revenue, row.nights]
    );
  }
  
  console.log(`Inserted ${data.length} records`);
  
  // Verify
  const [rows] = await connection.execute('SELECT channel, SUM(revenue) as total FROM ota_monthly_stats GROUP BY channel ORDER BY total DESC');
  console.log('\\nVerification - Revenue by channel:');
  for (const row of rows) {
    console.log(`${row.channel}: ₾${Number(row.total).toLocaleString()}`);
  }
  
  const [total] = await connection.execute('SELECT SUM(revenue) as grand_total FROM ota_monthly_stats');
  console.log(`\\nGRAND TOTAL: ₾${Number(total[0].grand_total).toLocaleString()}`);
  
  await connection.end();
}

main().catch(console.error);
