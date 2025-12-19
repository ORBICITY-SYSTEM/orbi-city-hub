import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const reviewsData = JSON.parse(fs.readFileSync('/home/ubuntu/tripadvisor_reviews.json', 'utf8'));

if (reviewsData.status !== 'Success' || !reviewsData.data) {
  console.log('No data to import');
  process.exit(1);
}

// TripAdvisor data structure: data[0] is array of reviews
const reviews = Array.isArray(reviewsData.data[0]) ? reviewsData.data[0] : reviewsData.data[0].reviews_data || [];
console.log(`Found ${reviews.length} TripAdvisor reviews to import`);

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Try various formats
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [_, month, day, year, hour, min, sec] = match;
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  }
  
  // Try ISO format
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 19).replace('T', ' ');
    }
  } catch (e) {}
  
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

let inserted = 0;
for (const review of reviews) {
  try {
    const reviewId = review.review_id || review.id || `ta_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Check if exists
    const [existing] = await connection.execute(
      'SELECT id FROM guest_reviews WHERE review_id = ?',
      [reviewId]
    );
    
    if (existing.length > 0) {
      continue;
    }
    
    const rating = review.rating || review.review_rating || 5;
    const createdAt = parseDate(review.published_date || review.review_datetime_utc);
    
    await connection.execute(`
      INSERT INTO guest_reviews 
      (review_id, platform, reviewer_name, rating, review_text, language, sentiment, has_reply, reply_text, created_at, replied_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reviewId,
      'tripadvisor',
      review.author || review.author_title || 'Anonymous',
      rating,
      review.text || review.review_text || '',
      'en',
      rating >= 4 ? 'positive' : (rating <= 2 ? 'negative' : 'neutral'),
      review.owner_response ? 1 : 0,
      review.owner_response || null,
      createdAt,
      null
    ]);
    inserted++;
  } catch (e) {
    console.error('Error inserting review:', e.message);
  }
}

await connection.end();
console.log(`Successfully imported ${inserted} new TripAdvisor reviews`);
