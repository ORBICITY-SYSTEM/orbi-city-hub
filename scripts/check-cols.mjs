import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SHOW COLUMNS FROM guest_reviews');
console.log('Columns:', rows.map(r => r.Field).join(', '));
await conn.end();
