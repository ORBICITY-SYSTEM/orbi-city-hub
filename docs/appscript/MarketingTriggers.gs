/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * POWERSTACK MARKETING TRIGGERS - The Content Factory
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the MARKETING AUTOMATION ENGINE for PowerStack HotelOS.
 * It monitors business conditions and triggers automated marketing actions.
 * 
 * WOW FEATURES:
 * 1. "Review Boomerang" - Positive reviews -> Social media posts
 * 2. "Smart Audience Loop" - Guest data -> Facebook Custom Audiences
 * 3. "Panic Button" - Low occupancy -> Flash sale triggers
 * 
 * INTEGRATIONS:
 * - Google Sheets (Data source)
 * - Gemini AI (Content generation)
 * - Make.com (Social media distribution)
 * - Telegram (Manager approvals)
 * 
 * @author PowerStack Team
 * @version 2.0.0 (December 2024)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const MARKETING_CONFIG = {
  // Google Sheet ID
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
  
  // Gemini API Key
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
  
  // Make.com Webhook URLs
  MAKE_WEBHOOKS: {
    INSTAGRAM_POST: 'YOUR_MAKE_INSTAGRAM_WEBHOOK',
    FACEBOOK_POST: 'YOUR_MAKE_FACEBOOK_WEBHOOK',
    FACEBOOK_AUDIENCE: 'YOUR_MAKE_AUDIENCE_WEBHOOK',
  },
  
  // Telegram Bot Token (for manager alerts)
  TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
  TELEGRAM_MANAGER_CHAT: 'YOUR_MANAGER_CHAT_ID',
  
  // Thresholds
  OCCUPANCY_PANIC_THRESHOLD: 30, // Below 30% triggers panic
  REVIEW_POSITIVE_THRESHOLD: 4,  // 4+ stars is positive
  
  // Total apartments
  TOTAL_APARTMENTS: 60,
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRIGGER #1: OCCUPANCY PANIC BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check occupancy and suggest promo if below threshold
 * Run this daily via time-driven trigger
 */
function checkOccupancyAndSuggestPromo() {
  const tomorrow = getTomorrowDate();
  const occupancyData = getOccupancyForDate(tomorrow);
  
  console.log(`Checking occupancy for ${tomorrow}: ${occupancyData.rate}%`);
  
  if (occupancyData.rate < MARKETING_CONFIG.OCCUPANCY_PANIC_THRESHOLD) {
    // Generate promo content with Gemini
    const promoContent = generatePromoContent(occupancyData);
    
    // Log to Marketing_Queue
    logToMarketingQueue({
      type: 'Flash Sale',
      date: tomorrow,
      occupancyRate: occupancyData.rate,
      emptyRooms: occupancyData.emptyRooms,
      content: promoContent,
      status: 'Pending Approval',
    });
    
    // Send Telegram alert to manager
    sendManagerApprovalRequest(occupancyData, promoContent);
    
    return {
      triggered: true,
      occupancy: occupancyData.rate,
      content: promoContent,
    };
  }
  
  return {
    triggered: false,
    occupancy: occupancyData.rate,
    message: 'Occupancy is healthy',
  };
}

/**
 * Get occupancy data for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Occupancy data
 */
function getOccupancyForDate(date) {
  try {
    const ss = SpreadsheetApp.openById(MARKETING_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Reservations');
    
    if (!sheet) {
      return { rate: 0, bookedRooms: 0, emptyRooms: MARKETING_CONFIG.TOTAL_APARTMENTS };
    }
    
    const data = sheet.getDataRange().getValues();
    const targetDate = new Date(date);
    let bookedRooms = 0;
    
    // Count reservations that include the target date
    for (let i = 1; i < data.length; i++) {
      const checkIn = new Date(data[i][2]);
      const checkOut = new Date(data[i][3]);
      const status = data[i][7];
      
      if (status !== 'Cancelled' && targetDate >= checkIn && targetDate < checkOut) {
        bookedRooms++;
      }
    }
    
    const emptyRooms = MARKETING_CONFIG.TOTAL_APARTMENTS - bookedRooms;
    const rate = Math.round((bookedRooms / MARKETING_CONFIG.TOTAL_APARTMENTS) * 100);
    
    return {
      date: date,
      rate: rate,
      bookedRooms: bookedRooms,
      emptyRooms: emptyRooms,
    };
    
  } catch (error) {
    console.error('Error getting occupancy:', error);
    return { rate: 50, bookedRooms: 30, emptyRooms: 30 }; // Default fallback
  }
}

/**
 * Generate promo content using Gemini AI
 * @param {Object} occupancyData - Occupancy data
 * @returns {string} Generated promo content
 */
function generatePromoContent(occupancyData) {
  const prompt = `
You are a marketing copywriter for a luxury apartment hotel in Batumi, Georgia.
Generate a short, engaging Instagram Story caption for a flash sale.

Context:
- We have ${occupancyData.emptyRooms} apartments available for ${occupancyData.date}
- Occupancy is only ${occupancyData.rate}%
- Our apartments have sea views, full kitchens, and are 50m from the beach
- Target audience: Georgian and Russian tourists

Requirements:
- Maximum 100 characters
- Include 1-2 relevant emojis
- Create urgency
- Mention discount (suggest 30-50%)
- Use Georgian or Russian language

Generate 2 options:
`;

  try {
    const response = callGeminiAPI(prompt);
    return response || getDefaultPromoContent(occupancyData);
  } catch (error) {
    console.error('Gemini error:', error);
    return getDefaultPromoContent(occupancyData);
  }
}

/**
 * Default promo content if Gemini fails
 * @param {Object} occupancyData - Occupancy data
 * @returns {string} Default promo content
 */
function getDefaultPromoContent(occupancyData) {
  return `🔥 მხოლოდ დღეს! ${occupancyData.emptyRooms} აპარტამენტი 40% ფასდაკლებით! 🌊 ზღვის ხედი, სრული კომფორტი. დაჯავშნე ახლავე!`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRIGGER #2: REVIEW BOOMERANG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process new positive reviews and create social content
 * Run this hourly or when new reviews are added
 */
function processNewReviewsForSocial() {
  const newReviews = getUnprocessedPositiveReviews();
  
  if (newReviews.length === 0) {
    console.log('No new positive reviews to process');
    return { processed: 0 };
  }
  
  const results = [];
  
  for (const review of newReviews) {
    // Generate social post content
    const socialContent = generateReviewSocialPost(review);
    
    // Log to Marketing_Queue
    logToMarketingQueue({
      type: 'Review Boomerang',
      reviewId: review.id,
      platform: review.platform,
      rating: review.rating,
      content: socialContent,
      status: 'Ready to Post',
    });
    
    // Mark review as processed
    markReviewAsProcessed(review.id);
    
    results.push({
      reviewId: review.id,
      content: socialContent,
    });
  }
  
  // Notify manager
  if (results.length > 0) {
    notifyManagerAboutSocialContent(results);
  }
  
  return { processed: results.length, results: results };
}

/**
 * Get unprocessed positive reviews
 * @returns {Array} Array of positive reviews
 */
function getUnprocessedPositiveReviews() {
  try {
    const ss = SpreadsheetApp.openById(MARKETING_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Reviews');
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const reviews = [];
    
    for (let i = 1; i < data.length; i++) {
      const rating = data[i][2];
      const processed = data[i][6]; // Assuming column G is "Processed for Social"
      
      if (rating >= MARKETING_CONFIG.REVIEW_POSITIVE_THRESHOLD && !processed) {
        reviews.push({
          id: data[i][0],
          guestName: data[i][1],
          rating: rating,
          text: data[i][3],
          platform: data[i][4],
          date: data[i][5],
          rowIndex: i + 1,
        });
      }
    }
    
    return reviews;
  } catch (error) {
    console.error('Error getting reviews:', error);
    return [];
  }
}

/**
 * Generate social post from review using Gemini
 * @param {Object} review - Review data
 * @returns {string} Social post content
 */
function generateReviewSocialPost(review) {
  const stars = '⭐'.repeat(review.rating);
  
  const prompt = `
Create an Instagram post thanking a guest for their review.

Review details:
- Guest: ${review.guestName}
- Rating: ${review.rating}/5 stars
- Review: "${review.text}"
- Platform: ${review.platform}

Requirements:
- Thank the guest by name
- Quote part of their review
- Maximum 150 characters
- Include relevant emojis
- Add a call to action (book now)
- Use Georgian language

Generate the post:
`;

  try {
    const response = callGeminiAPI(prompt);
    return response || `${stars}\n\nმადლობა ${review.guestName}-ს შესანიშნავი შეფასებისთვის!\n\n"${review.text.substring(0, 50)}..."\n\n🏨 დაჯავშნე ახლავე!`;
  } catch (error) {
    return `${stars}\n\nმადლობა ${review.guestName}-ს შესანიშნავი შეფასებისთვის!\n\n🏨 გელოდებით ისევ!`;
  }
}

/**
 * Mark review as processed in sheet
 * @param {string} reviewId - Review ID
 */
function markReviewAsProcessed(reviewId) {
  try {
    const ss = SpreadsheetApp.openById(MARKETING_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Reviews');
    
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === reviewId) {
        sheet.getRange(i + 1, 7).setValue(true); // Column G
        sheet.getRange(i + 1, 8).setValue(new Date()); // Column H - Processed Date
        break;
      }
    }
  } catch (error) {
    console.error('Error marking review:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRIGGER #3: SMART AUDIENCE LOOP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Export high-value guests to Facebook Custom Audience
 * Run this weekly
 */
function exportGuestsToFacebookAudience() {
  const highValueGuests = getHighValueGuests();
  
  if (highValueGuests.length === 0) {
    console.log('No high-value guests to export');
    return { exported: 0 };
  }
  
  // Format for Facebook Custom Audience
  const audienceData = highValueGuests.map(guest => ({
    email: guest.email,
    phone: guest.phone,
    firstName: guest.firstName,
    lastName: guest.lastName,
    country: guest.country,
  }));
  
  // Send to Make.com webhook
  const result = sendToMakeWebhook(
    MARKETING_CONFIG.MAKE_WEBHOOKS.FACEBOOK_AUDIENCE,
    {
      audienceName: `OrbiCity_HighValue_${getTodayDate()}`,
      guests: audienceData,
    }
  );
  
  // Log the export
  logAudienceExport(highValueGuests.length);
  
  return {
    exported: highValueGuests.length,
    result: result,
  };
}

/**
 * Get high-value guests (repeat visitors, high spenders, good reviewers)
 * @returns {Array} Array of guest data
 */
function getHighValueGuests() {
  try {
    const ss = SpreadsheetApp.openById(MARKETING_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Guests');
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const guests = [];
    
    for (let i = 1; i < data.length; i++) {
      const totalSpend = data[i][5] || 0;
      const visitCount = data[i][6] || 0;
      const lastReviewRating = data[i][7] || 0;
      
      // High value criteria: spent > 1000 GEL OR visited 2+ times OR left 5-star review
      if (totalSpend > 1000 || visitCount >= 2 || lastReviewRating >= 5) {
        guests.push({
          email: data[i][2],
          phone: data[i][3],
          firstName: data[i][0],
          lastName: data[i][1],
          country: data[i][4],
          totalSpend: totalSpend,
          visitCount: visitCount,
        });
      }
    }
    
    return guests;
  } catch (error) {
    console.error('Error getting guests:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEMINI AI INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Call Gemini API for content generation
 * @param {string} prompt - The prompt to send
 * @returns {string} Generated content
 */
function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MARKETING_CONFIG.GEMINI_API_KEY}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200,
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
    
    const result = JSON.parse(response.getContentText());
    
    if (result.candidates && result.candidates[0]) {
      return result.candidates[0].content.parts[0].text;
    }
    
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAKE.COM INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send data to Make.com webhook
 * @param {string} webhookUrl - Make.com webhook URL
 * @param {Object} data - Data to send
 * @returns {Object} Response
 */
function sendToMakeWebhook(webhookUrl, data) {
  if (!webhookUrl || webhookUrl.includes('YOUR_MAKE')) {
    console.log('Make.com webhook not configured');
    return { success: false, error: 'Webhook not configured' };
  }
  
  try {
    const response = UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(data),
      muteHttpExceptions: true,
    });
    
    return {
      success: true,
      status: response.getResponseCode(),
      response: response.getContentText(),
    };
  } catch (error) {
    console.error('Make.com webhook error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Post content to Instagram via Make.com
 * @param {string} content - Post content
 * @param {string} imageUrl - Optional image URL
 */
function postToInstagram(content, imageUrl = null) {
  return sendToMakeWebhook(MARKETING_CONFIG.MAKE_WEBHOOKS.INSTAGRAM_POST, {
    content: content,
    imageUrl: imageUrl,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Post content to Facebook via Make.com
 * @param {string} content - Post content
 * @param {string} imageUrl - Optional image URL
 */
function postToFacebook(content, imageUrl = null) {
  return sendToMakeWebhook(MARKETING_CONFIG.MAKE_WEBHOOKS.FACEBOOK_POST, {
    content: content,
    imageUrl: imageUrl,
    timestamp: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEGRAM NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send manager approval request for flash sale
 * @param {Object} occupancyData - Occupancy data
 * @param {string} promoContent - Generated promo content
 */
function sendManagerApprovalRequest(occupancyData, promoContent) {
  const message = `
🚨 <b>LOW OCCUPANCY ALERT!</b>

📅 <b>Date:</b> ${occupancyData.date}
📊 <b>Occupancy:</b> ${occupancyData.rate}%
🏠 <b>Empty Rooms:</b> ${occupancyData.emptyRooms}

<b>Suggested Promo:</b>
<i>${promoContent}</i>

⚠️ Approve to post on Instagram?
`;

  sendTelegramMessage(MARKETING_CONFIG.TELEGRAM_MANAGER_CHAT, message);
}

/**
 * Notify manager about new social content
 * @param {Array} results - Processed content results
 */
function notifyManagerAboutSocialContent(results) {
  const message = `
📱 <b>New Social Content Ready!</b>

${results.length} new posts generated from positive reviews.

Check Marketing_Queue sheet to approve and post.
`;

  sendTelegramMessage(MARKETING_CONFIG.TELEGRAM_MANAGER_CHAT, message);
}

/**
 * Send Telegram message
 * @param {string} chatId - Chat ID
 * @param {string} message - Message text
 */
function sendTelegramMessage(chatId, message) {
  const url = `https://api.telegram.org/bot${MARKETING_CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
      muteHttpExceptions: true,
    });
  } catch (error) {
    console.error('Telegram error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log to Marketing_Queue sheet
 * @param {Object} data - Data to log
 */
function logToMarketingQueue(data) {
  try {
    const ss = SpreadsheetApp.openById(MARKETING_CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName('Marketing_Queue');
    
    if (!sheet) {
      sheet = ss.insertSheet('Marketing_Queue');
      sheet.appendRow(['Timestamp', 'Type', 'Date', 'Content', 'Status', 'Extra Data']);
    }
    
    sheet.appendRow([
      new Date(),
      data.type,
      data.date || '',
      data.content,
      data.status,
      JSON.stringify(data),
    ]);
  } catch (error) {
    console.error('Error logging to queue:', error);
  }
}

/**
 * Log audience export
 * @param {number} count - Number of guests exported
 */
function logAudienceExport(count) {
  try {
    const ss = SpreadsheetApp.openById(MARKETING_CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName('Audience_Exports');
    
    if (!sheet) {
      sheet = ss.insertSheet('Audience_Exports');
      sheet.appendRow(['Timestamp', 'Guest Count', 'Audience Name']);
    }
    
    sheet.appendRow([
      new Date(),
      count,
      `OrbiCity_HighValue_${getTodayDate()}`,
    ]);
  } catch (error) {
    console.error('Error logging export:', error);
  }
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 * @returns {string} Tomorrow's date
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULED TRIGGERS SETUP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Set up all time-driven triggers
 * Run this once to configure automated scheduling
 */
function setupTriggers() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Daily occupancy check at 9 AM
  ScriptApp.newTrigger('checkOccupancyAndSuggestPromo')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
  
  // Hourly review processing
  ScriptApp.newTrigger('processNewReviewsForSocial')
    .timeBased()
    .everyHours(1)
    .create();
  
  // Weekly audience export on Monday at 10 AM
  ScriptApp.newTrigger('exportGuestsToFacebookAudience')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(10)
    .create();
  
  console.log('All triggers configured successfully!');
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test occupancy check
 */
function testOccupancyCheck() {
  const result = checkOccupancyAndSuggestPromo();
  console.log('Occupancy check result:', JSON.stringify(result, null, 2));
}

/**
 * Test review processing
 */
function testReviewProcessing() {
  const result = processNewReviewsForSocial();
  console.log('Review processing result:', JSON.stringify(result, null, 2));
}

/**
 * Test Gemini content generation
 */
function testGeminiContent() {
  const content = generatePromoContent({
    date: getTomorrowDate(),
    rate: 25,
    emptyRooms: 45,
  });
  console.log('Generated content:', content);
}
