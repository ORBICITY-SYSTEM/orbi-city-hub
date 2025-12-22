/**
 * ORBI City Hub - Expedia Email Parser
 * Google AppScript for Gmail Integration
 * 
 * This script automatically parses Expedia review notification emails
 * and sends them to ORBI City Hub webhook endpoint.
 * 
 * Setup Instructions:
 * 1. Open Google Apps Script (script.google.com)
 * 2. Create new project "ORBI Expedia Parser"
 * 3. Paste this code
 * 4. Set up trigger: Edit > Current project's triggers > Add trigger
 *    - Function: checkExpediaEmails
 *    - Event source: Time-driven
 *    - Type: Minutes timer
 *    - Interval: Every 5 minutes
 * 5. Authorize the script when prompted
 */

// Configuration
const CONFIG = {
  ORBI_HUB_WEBHOOK: 'https://hub.orbicitybatumi.com/api/trpc/n8nWebhook.receiveReviews',
  API_KEY: 'n8n_orbi_2025_secure_key',
  EXPEDIA_SENDER: 'noreply@expediapartnercentral.com',
  LABEL_PROCESSED: 'ORBI-Processed',
  SEARCH_QUERY: 'from:expediapartnercentral.com subject:review is:unread'
};

/**
 * Main function - Check for new Expedia review emails
 * Set this as your trigger function
 */
function checkExpediaEmails() {
  const threads = GmailApp.search(CONFIG.SEARCH_QUERY, 0, 10);
  
  if (threads.length === 0) {
    console.log('No new Expedia review emails found');
    return;
  }
  
  console.log(`Found ${threads.length} Expedia email threads to process`);
  
  const reviews = [];
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    
    for (const message of messages) {
      if (message.isUnread()) {
        const review = parseExpediaEmail(message);
        
        if (review) {
          reviews.push(review);
          message.markRead();
          
          // Add processed label
          const label = getOrCreateLabel(CONFIG.LABEL_PROCESSED);
          thread.addLabel(label);
        }
      }
    }
  }
  
  if (reviews.length > 0) {
    sendToOrbiHub(reviews);
  }
}

/**
 * Parse Expedia email to extract review data
 * @param {GmailMessage} message - Gmail message object
 * @returns {Object|null} - Parsed review object or null if parsing fails
 */
function parseExpediaEmail(message) {
  try {
    const subject = message.getSubject();
    const body = message.getPlainBody();
    const date = message.getDate();
    
    // Extract guest name from subject
    // Example: "New review from John D. for Orbi City Sea view Aparthotel"
    const nameMatch = subject.match(/New review from ([^for]+) for/i);
    const guestName = nameMatch ? nameMatch[1].trim() : 'Anonymous Guest';
    
    // Extract rating (Expedia uses 1-10 scale)
    // Look for patterns like "Rating: 8/10" or "Overall: 8.0"
    const ratingMatch = body.match(/(?:Rating|Overall|Score)[:\s]+(\d+(?:\.\d+)?)/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 8;
    
    // Extract review content
    // Look for the main review text between common markers
    const contentMatch = body.match(/(?:Review|Comment|Feedback)[:\s]*\n?([\s\S]+?)(?:\n\n|---|\*\*\*|$)/i);
    const content = contentMatch ? contentMatch[1].trim() : extractMainContent(body);
    
    // Generate unique external ID
    const externalId = `expedia_${message.getId()}_${date.getTime()}`;
    
    // Detect language (simple heuristic)
    const language = detectLanguage(content);
    
    return {
      platform: 'expedia',
      externalId: externalId,
      guestName: guestName,
      rating: rating,
      content: content,
      reviewDate: Utilities.formatDate(date, 'GMT', 'yyyy-MM-dd'),
      language: language,
      source: 'email_parsing'
    };
    
  } catch (error) {
    console.error('Error parsing Expedia email:', error);
    return null;
  }
}

/**
 * Extract main content from email body
 * Fallback when structured parsing fails
 */
function extractMainContent(body) {
  // Remove common email footers and headers
  let content = body
    .replace(/^[\s\S]*?(?:Dear|Hello|Hi)\s+\w+,?\s*/i, '')
    .replace(/(?:Best regards|Sincerely|Thank you)[\s\S]*$/i, '')
    .replace(/\[.*?\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();
  
  // Limit to first 500 characters if too long
  if (content.length > 500) {
    content = content.substring(0, 500) + '...';
  }
  
  return content || 'Review content not available';
}

/**
 * Simple language detection
 */
function detectLanguage(text) {
  // Georgian characters
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka';
  // Russian characters
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  // Default to English
  return 'en';
}

/**
 * Send parsed reviews to ORBI Hub webhook
 */
function sendToOrbiHub(reviews) {
  const payload = {
    apiKey: CONFIG.API_KEY,
    reviews: reviews
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.ORBI_HUB_WEBHOOK, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    if (responseCode === 200) {
      console.log(`Successfully sent ${reviews.length} reviews to ORBI Hub`);
      console.log('Response:', responseBody);
    } else {
      console.error(`Failed to send reviews. Status: ${responseCode}`);
      console.error('Response:', responseBody);
    }
    
  } catch (error) {
    console.error('Error sending to ORBI Hub:', error);
  }
}

/**
 * Get or create Gmail label
 */
function getOrCreateLabel(labelName) {
  let label = GmailApp.getUserLabelByName(labelName);
  
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }
  
  return label;
}

/**
 * Manual trigger for testing
 * Run this function to test with existing emails
 */
function testExpediaParser() {
  console.log('Starting Expedia email parser test...');
  checkExpediaEmails();
  console.log('Test complete');
}

/**
 * Manual import of historical emails
 * Use this to process older emails that weren't caught by the trigger
 */
function importHistoricalExpediaEmails() {
  const searchQuery = 'from:expediapartnercentral.com subject:review older_than:1d';
  const threads = GmailApp.search(searchQuery, 0, 50);
  
  console.log(`Found ${threads.length} historical Expedia email threads`);
  
  const reviews = [];
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    
    for (const message of messages) {
      const review = parseExpediaEmail(message);
      
      if (review) {
        reviews.push(review);
      }
    }
  }
  
  if (reviews.length > 0) {
    console.log(`Parsed ${reviews.length} historical reviews`);
    sendToOrbiHub(reviews);
  }
}
