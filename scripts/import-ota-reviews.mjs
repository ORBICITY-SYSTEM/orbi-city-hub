import mysql from 'mysql2/promise';
import xlsx from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Import Airbnb reviews
async function importAirbnbReviews() {
  const workbook = xlsx.readFile('/home/ubuntu/airbnb_reviews.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const reviews = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`Found ${reviews.length} Airbnb reviews to import`);
  
  let inserted = 0;
  for (const review of reviews) {
    try {
      const reviewId = `airbnb_${review.id || Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Check if exists
      const [existing] = await connection.execute(
        'SELECT id FROM guest_reviews WHERE review_id = ? OR (platform = ? AND reviewer_name = ? AND review_text = ?)',
        [reviewId, 'airbnb', review.reviewer_first_name || 'Anonymous', review.comments || '']
      );
      
      if (existing.length > 0) {
        continue;
      }
      
      const rating = review.rating || 5;
      const createdAt = review.created_at 
        ? new Date(review.created_at).toISOString().slice(0, 19).replace('T', ' ')
        : new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await connection.execute(`
        INSERT INTO guest_reviews 
        (review_id, platform, reviewer_name, rating, review_text, language, sentiment, has_reply, reply_text, created_at, replied_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reviewId,
        'airbnb',
        review.reviewer_first_name || 'Anonymous',
        rating,
        review.comments || '',
        review.language || 'en',
        rating >= 4 ? 'positive' : (rating <= 2 ? 'negative' : 'neutral'),
        review.response ? 1 : 0,
        review.response || null,
        createdAt,
        null
      ]);
      inserted++;
    } catch (e) {
      console.error('Error inserting Airbnb review:', e.message);
    }
  }
  
  console.log(`Successfully imported ${inserted} new Airbnb reviews`);
  return inserted;
}

// Import Booking.com reviews
async function importBookingReviews() {
  const workbook = xlsx.readFile('/home/ubuntu/booking_reviews.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const reviews = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`Found ${reviews.length} Booking.com reviews to import`);
  
  let inserted = 0;
  for (const review of reviews) {
    try {
      const reviewId = review.review_id || `booking_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Check if exists
      const [existing] = await connection.execute(
        'SELECT id FROM guest_reviews WHERE review_id = ?',
        [reviewId]
      );
      
      if (existing.length > 0) {
        continue;
      }
      
      const rating = review.review_score || 8;
      
      // Parse date
      let createdAt;
      try {
        if (review.review_date) {
          const d = new Date(review.review_date);
          if (!isNaN(d.getTime())) {
            createdAt = d.toISOString().slice(0, 19).replace('T', ' ');
          }
        }
      } catch (e) {}
      if (!createdAt) {
        createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
      
      // Combine liked and disliked text
      const reviewText = [
        review.review_liked_text ? `👍 ${review.review_liked_text}` : '',
        review.review_disliked_text ? `👎 ${review.review_disliked_text}` : ''
      ].filter(Boolean).join('\n\n') || review.review_title || '';
      
      await connection.execute(`
        INSERT INTO guest_reviews 
        (review_id, platform, reviewer_name, rating, review_text, language, sentiment, has_reply, reply_text, created_at, replied_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reviewId,
        'booking',
        review.author_title || 'Anonymous',
        rating,
        reviewText,
        'en',
        rating >= 7 ? 'positive' : (rating <= 4 ? 'negative' : 'neutral'),
        review.review_owner_response ? 1 : 0,
        review.review_owner_response || null,
        createdAt,
        null
      ]);
      inserted++;
    } catch (e) {
      console.error('Error inserting Booking review:', e.message);
    }
  }
  
  console.log(`Successfully imported ${inserted} new Booking.com reviews`);
  return inserted;
}

// Run imports
const airbnbCount = await importAirbnbReviews();
const bookingCount = await importBookingReviews();

// Show final stats
const [stats] = await connection.execute(`
  SELECT platform, COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating 
  FROM guest_reviews 
  GROUP BY platform 
  ORDER BY count DESC
`);

console.log('\n=== Final Review Stats ===');
for (const row of stats) {
  console.log(`${row.platform}: ${row.count} reviews (avg: ${row.avg_rating})`);
}

await connection.end();
