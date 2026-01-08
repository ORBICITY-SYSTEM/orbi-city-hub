import { describe, it, expect } from 'vitest';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

describe('Reviews Database Integration', () => {
  it('should have reviews in guestReviews table', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM guestReviews');
    const count = (rows as any)[0].count;
    
    expect(count).toBeGreaterThan(0);
    console.log(`Total reviews in guestReviews: ${count}`);
    
    await conn.end();
  });

  it('should have reviews from multiple platforms', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      'SELECT source, COUNT(*) as count FROM guestReviews GROUP BY source ORDER BY count DESC'
    );
    
    const platforms = rows as any[];
    expect(platforms.length).toBeGreaterThanOrEqual(3);
    
    console.log('Reviews by platform:');
    for (const p of platforms) {
      console.log(`  ${p.source}: ${p.count}`);
    }
    
    await conn.end();
  });

  it('should have Google reviews', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      "SELECT COUNT(*) as count FROM guestReviews WHERE source = 'google'"
    );
    const count = (rows as any)[0].count;
    
    expect(count).toBeGreaterThan(0);
    console.log(`Google reviews: ${count}`);
    
    await conn.end();
  });

  it('should have Booking.com reviews', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      "SELECT COUNT(*) as count FROM guestReviews WHERE source = 'booking'"
    );
    const count = (rows as any)[0].count;
    
    expect(count).toBeGreaterThan(0);
    console.log(`Booking.com reviews: ${count}`);
    
    await conn.end();
  });

  it('should have Airbnb reviews', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      "SELECT COUNT(*) as count FROM guestReviews WHERE source = 'airbnb'"
    );
    const count = (rows as any)[0].count;
    
    expect(count).toBeGreaterThan(0);
    console.log(`Airbnb reviews: ${count}`);
    
    await conn.end();
  });

  it('should have TripAdvisor reviews', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      "SELECT COUNT(*) as count FROM guestReviews WHERE source = 'tripadvisor'"
    );
    const count = (rows as any)[0].count;
    
    expect(count).toBeGreaterThan(0);
    console.log(`TripAdvisor reviews: ${count}`);
    
    await conn.end();
  });

  it('should have valid ratings (1-5 or 1-10)', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      'SELECT MIN(rating) as minRating, MAX(rating) as maxRating, AVG(rating) as avgRating FROM guestReviews'
    );
    const stats = (rows as any)[0];
    
    expect(stats.minRating).toBeGreaterThanOrEqual(1);
    expect(stats.maxRating).toBeLessThanOrEqual(10);
    console.log(`Rating stats: min=${stats.minRating}, max=${stats.maxRating}, avg=${parseFloat(stats.avgRating).toFixed(1)}`);
    
    await conn.end();
  });

  it('should have sentiment analysis', async () => {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    
    const [rows] = await conn.execute(
      'SELECT sentiment, COUNT(*) as count FROM guestReviews GROUP BY sentiment'
    );
    
    const sentiments = rows as any[];
    expect(sentiments.length).toBeGreaterThanOrEqual(2);
    
    console.log('Reviews by sentiment:');
    for (const s of sentiments) {
      console.log(`  ${s.sentiment}: ${s.count}`);
    }
    
    await conn.end();
  });
});
