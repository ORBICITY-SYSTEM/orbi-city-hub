/**
 * ORBI City Hub - Gemini AI Review Responder
 * Google AppScript for AI-Powered Review Responses
 * 
 * This script uses Google Gemini API to generate professional
 * review responses for ORBI City Sea view Aparthotel.
 * 
 * Setup Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create new project "ORBI Gemini Responder"
 * 3. Paste this code
 * 4. Add your Gemini API key to Script Properties:
 *    - File > Project properties > Script properties
 *    - Add: GEMINI_API_KEY = your_api_key
 * 5. Run testGeminiConnection() to verify setup
 */

// Configuration
const GEMINI_CONFIG = {
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  MODEL: 'gemini-2.0-flash'
};

// Hotel Knowledge Base
const HOTEL_KNOWLEDGE = {
  name: 'Orbi City Sea view Aparthotel',
  location: 'Batumi, Georgia',
  type: 'Aparthotel with sea view apartments',
  amenities: [
    'Sea view balconies',
    'Fully equipped kitchens',
    'Free WiFi',
    'Swimming pool',
    '24/7 reception',
    'Parking',
    'Air conditioning',
    'Smart TV'
  ],
  nearbyAttractions: [
    'Batumi Boulevard (5 min walk)',
    'Batumi Beach (2 min walk)',
    'Old Town (10 min walk)',
    'Botanical Garden (15 min drive)'
  ],
  policies: {
    checkIn: '14:00',
    checkOut: '12:00',
    pets: 'Allowed on request',
    smoking: 'Non-smoking property'
  },
  manager: 'Mariam',
  ownerSignature: 'ORBI City Team'
};

/**
 * Generate AI response for a review
 * @param {Object} review - Review object with rating, content, guestName, language
 * @returns {string} - AI-generated response
 */
function generateReviewResponse(review) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured in Script Properties');
  }
  
  const prompt = buildPrompt(review);
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      topP: 0.9
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const url = `${GEMINI_CONFIG.API_URL}?key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = JSON.parse(response.getContentText());
    
    if (responseCode === 200 && responseBody.candidates && responseBody.candidates[0]) {
      return responseBody.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API error:', responseBody);
      return generateFallbackResponse(review);
    }
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackResponse(review);
  }
}

/**
 * Build the prompt for Gemini
 */
function buildPrompt(review) {
  const sentiment = review.rating >= 4 ? 'positive' : review.rating >= 3 ? 'neutral' : 'negative';
  
  let languageInstruction = '';
  switch (review.language) {
    case 'ka':
      languageInstruction = 'Respond in Georgian (ქართული).';
      break;
    case 'ru':
      languageInstruction = 'Respond in Russian (Русский).';
      break;
    default:
      languageInstruction = 'Respond in English.';
  }
  
  return `You are the guest relations manager at ${HOTEL_KNOWLEDGE.name}, a premium aparthotel in ${HOTEL_KNOWLEDGE.location}.

HOTEL INFORMATION:
- Type: ${HOTEL_KNOWLEDGE.type}
- Amenities: ${HOTEL_KNOWLEDGE.amenities.join(', ')}
- Nearby: ${HOTEL_KNOWLEDGE.nearbyAttractions.join(', ')}
- Check-in: ${HOTEL_KNOWLEDGE.policies.checkIn}, Check-out: ${HOTEL_KNOWLEDGE.policies.checkOut}

REVIEW TO RESPOND TO:
- Guest Name: ${review.guestName}
- Rating: ${review.rating}/5 (${sentiment})
- Review: "${review.content}"

INSTRUCTIONS:
1. ${languageInstruction}
2. Write a professional, warm, and personalized response.
3. Address specific points mentioned in the review.
4. For positive reviews: Thank the guest sincerely and invite them back.
5. For negative reviews: Apologize genuinely, acknowledge concerns, and offer to make it right.
6. Keep the response between 50-150 words.
7. Sign off as "${HOTEL_KNOWLEDGE.ownerSignature}".
8. Do NOT use generic phrases like "Dear valued guest" - use their name.
9. Do NOT promise specific compensation without manager approval.

Generate the response:`;
}

/**
 * Fallback response when AI is unavailable
 */
function generateFallbackResponse(review) {
  const isPositive = review.rating >= 4;
  
  if (isPositive) {
    return `Dear ${review.guestName},

Thank you so much for your wonderful review and for choosing ${HOTEL_KNOWLEDGE.name}! We are delighted that you enjoyed your stay with us.

Your kind words mean a lot to our team, and we look forward to welcoming you back to Batumi soon!

Warm regards,
${HOTEL_KNOWLEDGE.ownerSignature}`;
  } else {
    return `Dear ${review.guestName},

Thank you for taking the time to share your feedback. We sincerely apologize that your experience did not meet your expectations.

Your comments are valuable to us, and we would like the opportunity to make things right. Please contact us directly so we can address your concerns.

With apologies,
${HOTEL_KNOWLEDGE.ownerSignature}`;
  }
}

/**
 * Test Gemini API connection
 */
function testGeminiConnection() {
  const testReview = {
    guestName: 'Test Guest',
    rating: 5,
    content: 'Amazing stay! The sea view was breathtaking and the apartment was spotless.',
    language: 'en'
  };
  
  console.log('Testing Gemini API connection...');
  
  try {
    const response = generateReviewResponse(testReview);
    console.log('Success! Generated response:');
    console.log(response);
    return response;
  } catch (error) {
    console.error('Test failed:', error);
    return null;
  }
}

/**
 * Batch process pending reviews from ORBI Hub
 * This function can be called via webhook or scheduled trigger
 */
function processPendingReviews() {
  // Fetch pending reviews from ORBI Hub
  const orbiHubUrl = 'https://hub.orbicitybatumi.com/api/trpc/reviews.getPendingForAI';
  
  try {
    const response = UrlFetchApp.fetch(orbiHubUrl, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      console.error('Failed to fetch pending reviews');
      return;
    }
    
    const data = JSON.parse(response.getContentText());
    const pendingReviews = data.result?.data || [];
    
    console.log(`Found ${pendingReviews.length} pending reviews`);
    
    for (const review of pendingReviews) {
      const aiResponse = generateReviewResponse(review);
      
      // Send AI response back to ORBI Hub
      sendAIResponseToOrbiHub(review.id, aiResponse);
    }
    
  } catch (error) {
    console.error('Error processing pending reviews:', error);
  }
}

/**
 * Send AI-generated response back to ORBI Hub
 */
function sendAIResponseToOrbiHub(reviewId, aiResponse) {
  const url = 'https://hub.orbicitybatumi.com/api/trpc/reviews.saveAIResponse';
  
  const payload = {
    reviewId: reviewId,
    aiResponse: aiResponse,
    generatedBy: 'gemini-appscript'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    console.log(`Saved AI response for review ${reviewId}`);
  } catch (error) {
    console.error(`Failed to save AI response for review ${reviewId}:`, error);
  }
}

/**
 * Generate response for a single review (for manual use)
 * @param {number} rating - Review rating (1-5)
 * @param {string} content - Review content
 * @param {string} guestName - Guest name
 * @param {string} language - Language code (en, ka, ru)
 */
function generateSingleResponse(rating, content, guestName, language) {
  const review = {
    rating: rating,
    content: content,
    guestName: guestName || 'Guest',
    language: language || 'en'
  };
  
  return generateReviewResponse(review);
}
