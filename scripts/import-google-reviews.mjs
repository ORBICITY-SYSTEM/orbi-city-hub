import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const reviewsData = JSON.parse(fs.readFileSync('/home/ubuntu/google_reviews.json', 'utf8'));

if (reviewsData.status !== 'Success' || !reviewsData.data || !reviewsData.data[0]) {
  console.log('No data to import');
  process.exit(1);
}

const reviews = reviewsData.data[0].reviews_data || [];
console.log(`Found ${reviews.length} reviews to import`);

// Parse date from format "MM/DD/YYYY HH:MM:SS" to MySQL format
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Format: "08/02/2025 16:50:44" -> "2025-08-02 16:50:44"
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [_, month, day, year, hour, min, sec] = match;
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  }
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

let inserted = 0;
for (const review of reviews) {
  try {
    const reviewId = review.review_id || '';
    
    // Check if exists
    const [existing] = await connection.execute(
      'SELECT id FROM guest_reviews WHERE review_id = ?',
      [reviewId]
    );
    
    if (existing.length > 0) {
      continue;
    }
    
    const createdAt = parseDate(review.review_datetime_utc);
    const repliedAt = review.owner_answer_timestamp_datetime_utc ? parseDate(review.owner_answer_timestamp_datetime_utc) : null;
    
    await connection.execute(`
      INSERT INTO guest_reviews 
      (review_id, platform, reviewer_name, rating, review_text, language, sentiment, has_reply, reply_text, created_at, replied_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reviewId,
      'google',
      review.author_title || 'Anonymous',
      review.review_rating || 0,
      review.review_text || '',
      'en',
      review.review_rating >= 4 ? 'positive' : (review.review_rating <= 2 ? 'negative' : 'neutral'),
      review.owner_answer ? 1 : 0,
      review.owner_answer || null,
      createdAt,
      repliedAt
    ]);
    inserted++;
  } catch (e) {
    console.error('Error inserting review:', e.message);
  }
}

await connection.end();
console.log(`Successfully imported ${inserted} new Google reviews`);
