/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * POWERSTACK TELEGRAM SERVICE - The Nervous System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the COMMUNICATION ENGINE for PowerStack HotelOS.
 * It handles all Telegram Bot interactions for staff alerts and guest notifications.
 * 
 * FEATURES:
 * - Send alerts to specific Telegram topics/groups
 * - Inline keyboard buttons for quick actions
 * - Webhook handler for button clicks
 * - Status-aware messaging (Clean/Dirty, Approve/Reject)
 * 
 * SETUP:
 * 1. Create a Telegram Bot via @BotFather
 * 2. Get the Bot Token
 * 3. Create a Group/Topic for each department (Housekeeping, Management, etc.)
 * 4. Add the bot to each group as admin
 * 5. Set the webhook URL to this script's deployment URL
 * 
 * @author PowerStack Team
 * @version 2.0.0 (December 2024)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const TELEGRAM_CONFIG = {
  // Bot Token from @BotFather
  BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE', // Replace with actual token
  
  // Telegram API Base URL
  API_URL: 'https://api.telegram.org/bot',
  
  // Chat IDs for different departments (Get these by adding bot to group and using getUpdates)
  CHATS: {
    MANAGEMENT: 'YOUR_MANAGEMENT_CHAT_ID',      // CEO/Manager alerts
    HOUSEKEEPING: 'YOUR_HOUSEKEEPING_CHAT_ID',  // Cleaning staff
    RECEPTION: 'YOUR_RECEPTION_CHAT_ID',        // Front desk
    MAINTENANCE: 'YOUR_MAINTENANCE_CHAT_ID',    // Technical issues
    MARKETING: 'YOUR_MARKETING_CHAT_ID',        // Marketing team
  },
  
  // Topic IDs (if using Forum/Topics in groups)
  TOPICS: {
    URGENT: null,        // Set topic ID if using forums
    BOOKINGS: null,
    HOUSEKEEPING: null,
    REVIEWS: null,
    FINANCIAL: null,
  },
  
  // Google Sheet ID for logging
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ALERT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send a simple text alert to a Telegram chat
 * @param {string} chatId - Target chat ID
 * @param {string} message - Message text (supports HTML formatting)
 * @param {number} topicId - Optional topic ID for forum groups
 * @returns {Object} Telegram API response
 */
function sendAlert(chatId, message, topicId = null) {
  const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
  };
  
  if (topicId) {
    payload.message_thread_id = topicId;
  }
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    logTelegramAction('sendAlert', chatId, message, result.ok);
    return result;
  } catch (error) {
    console.error('Telegram sendAlert error:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * Send an alert with inline keyboard buttons
 * @param {string} chatId - Target chat ID
 * @param {string} message - Message text
 * @param {Array} buttons - Array of button rows [{text: 'Button', callback_data: 'action'}]
 * @param {number} topicId - Optional topic ID
 * @returns {Object} Telegram API response
 */
function sendAlertWithButtons(chatId, message, buttons, topicId = null) {
  const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: buttons,
    },
  };
  
  if (topicId) {
    payload.message_thread_id = topicId;
  }
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    logTelegramAction('sendAlertWithButtons', chatId, message, result.ok);
    return result;
  } catch (error) {
    console.error('Telegram sendAlertWithButtons error:', error);
    return { ok: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT-SPECIFIC ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send housekeeping alert with Clean/Dirty buttons
 * @param {string} roomNumber - Room number
 * @param {string} status - Current status
 * @param {string} note - Optional note
 */
function sendHousekeepingAlert(roomNumber, status, note = '') {
  const statusEmoji = status === 'dirty' ? '🔴' : status === 'clean' ? '🟢' : '🟡';
  
  const message = `
${statusEmoji} <b>Housekeeping Alert</b>

🏠 <b>Room:</b> ${roomNumber}
📊 <b>Status:</b> ${status.toUpperCase()}
${note ? `📝 <b>Note:</b> ${note}` : ''}

⏰ ${new Date().toLocaleString('ka-GE')}
`;

  const buttons = [
    [
      { text: '✅ Mark Clean', callback_data: `clean_${roomNumber}` },
      { text: '🔴 Mark Dirty', callback_data: `dirty_${roomNumber}` },
    ],
    [
      { text: '🔧 Maintenance', callback_data: `maintenance_${roomNumber}` },
      { text: '👤 Occupied', callback_data: `occupied_${roomNumber}` },
    ],
  ];
  
  return sendAlertWithButtons(
    TELEGRAM_CONFIG.CHATS.HOUSEKEEPING,
    message,
    buttons,
    TELEGRAM_CONFIG.TOPICS.HOUSEKEEPING
  );
}

/**
 * Send new booking alert to management
 * @param {Object} booking - Booking data
 */
function sendBookingAlert(booking) {
  const sourceEmoji = {
    'Booking.com': '🔵',
    'Airbnb': '🔴',
    'Expedia': '🟡',
    'Direct': '🟢',
  };
  
  const emoji = sourceEmoji[booking.source] || '⚪';
  
  const message = `
${emoji} <b>New Booking!</b>

👤 <b>Guest:</b> ${booking.guestName}
🏠 <b>Room:</b> ${booking.roomNumber}
📅 <b>Check-in:</b> ${booking.checkIn}
📅 <b>Check-out:</b> ${booking.checkOut}
💰 <b>Total:</b> ₾${booking.totalPrice}
📱 <b>Source:</b> ${booking.source}

⏰ ${new Date().toLocaleString('ka-GE')}
`;

  const buttons = [
    [
      { text: '✅ Confirm', callback_data: `confirm_booking_${booking.reservationId}` },
      { text: '❌ Cancel', callback_data: `cancel_booking_${booking.reservationId}` },
    ],
    [
      { text: '📋 View Details', callback_data: `view_booking_${booking.reservationId}` },
    ],
  ];
  
  return sendAlertWithButtons(
    TELEGRAM_CONFIG.CHATS.MANAGEMENT,
    message,
    buttons,
    TELEGRAM_CONFIG.TOPICS.BOOKINGS
  );
}

/**
 * Send review alert with AI reply option
 * @param {Object} review - Review data
 */
function sendReviewAlert(review) {
  const stars = '⭐'.repeat(review.rating);
  const sentimentEmoji = review.sentiment === 'positive' ? '😊' : 
                         review.sentiment === 'negative' ? '😞' : '😐';
  
  const message = `
${sentimentEmoji} <b>New Review!</b>

${stars} (${review.rating}/5)
👤 <b>Guest:</b> ${review.guestName}
📱 <b>Platform:</b> ${review.platform}

💬 <i>"${review.text}"</i>

⏰ ${new Date().toLocaleString('ka-GE')}
`;

  const buttons = [
    [
      { text: '🤖 Generate AI Reply', callback_data: `ai_reply_${review.id}` },
    ],
    [
      { text: '✅ Mark Responded', callback_data: `responded_${review.id}` },
      { text: '🚨 Flag Issue', callback_data: `flag_${review.id}` },
    ],
  ];
  
  return sendAlertWithButtons(
    TELEGRAM_CONFIG.CHATS.MANAGEMENT,
    message,
    buttons,
    TELEGRAM_CONFIG.TOPICS.REVIEWS
  );
}

/**
 * Send low occupancy panic alert
 * @param {number} occupancyRate - Current occupancy percentage
 * @param {number} emptyRooms - Number of empty rooms
 * @param {string} date - Date for the alert
 */
function sendOccupancyPanicAlert(occupancyRate, emptyRooms, date) {
  const message = `
🚨 <b>LOW OCCUPANCY ALERT!</b>

📅 <b>Date:</b> ${date}
📊 <b>Occupancy:</b> ${occupancyRate}%
🏠 <b>Empty Rooms:</b> ${emptyRooms}

⚠️ Occupancy is below 30%!
Should we launch a flash sale?

⏰ ${new Date().toLocaleString('ka-GE')}
`;

  const buttons = [
    [
      { text: '🔥 YES - Launch Flash Sale', callback_data: `flash_sale_${date}` },
    ],
    [
      { text: '📉 Lower Prices 20%', callback_data: `lower_prices_${date}` },
      { text: '❌ No Action', callback_data: `no_action_${date}` },
    ],
  ];
  
  return sendAlertWithButtons(
    TELEGRAM_CONFIG.CHATS.MANAGEMENT,
    message,
    buttons,
    TELEGRAM_CONFIG.TOPICS.URGENT
  );
}

/**
 * Send daily financial summary
 * @param {Object} summary - Financial summary data
 */
function sendFinancialSummary(summary) {
  const message = `
📊 <b>Daily Financial Summary</b>

💰 <b>Today's Revenue:</b> ₾${summary.todayRevenue.toLocaleString()}
📈 <b>vs Yesterday:</b> ${summary.revenueChange > 0 ? '+' : ''}${summary.revenueChange}%

🏠 <b>Occupancy:</b> ${summary.occupancyRate}%
📅 <b>Check-ins Today:</b> ${summary.checkIns}
📅 <b>Check-outs Today:</b> ${summary.checkOuts}

💵 <b>MTD Revenue:</b> ₾${summary.mtdRevenue.toLocaleString()}
🎯 <b>Target:</b> ₾${summary.monthlyTarget.toLocaleString()} (${summary.targetProgress}%)

⏰ ${new Date().toLocaleString('ka-GE')}
`;

  return sendAlert(
    TELEGRAM_CONFIG.CHATS.MANAGEMENT,
    message,
    TELEGRAM_CONFIG.TOPICS.FINANCIAL
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK HANDLER (Receives button clicks)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle incoming webhook from Telegram (button clicks)
 * @param {Object} e - Event object from Telegram
 * @returns {TextOutput} Response
 */
function doPost(e) {
  try {
    const update = JSON.parse(e.postData.contents);
    
    // Handle callback query (button click)
    if (update.callback_query) {
      return handleCallbackQuery(update.callback_query);
    }
    
    // Handle regular message (if needed)
    if (update.message) {
      return handleMessage(update.message);
    }
    
    return ContentService.createTextOutput('OK');
    
  } catch (error) {
    console.error('Webhook error:', error);
    return ContentService.createTextOutput('Error: ' + error.message);
  }
}

/**
 * Handle button click callback
 * @param {Object} callbackQuery - Callback query data
 */
function handleCallbackQuery(callbackQuery) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const userId = callbackQuery.from.id;
  const userName = callbackQuery.from.first_name || 'User';
  
  let responseText = '';
  let success = false;
  
  // Parse the callback data
  const parts = data.split('_');
  const action = parts[0];
  
  // Handle different actions
  if (data.startsWith('clean_') || data.startsWith('dirty_') || 
      data.startsWith('maintenance_') || data.startsWith('occupied_')) {
    // Housekeeping status update
    const roomNumber = parts[1];
    const newStatus = action;
    
    // Update Google Sheet
    success = updateRoomStatusInSheet(roomNumber, newStatus);
    responseText = success ? 
      `✅ Room ${roomNumber} marked as ${newStatus.toUpperCase()} by ${userName}` :
      `❌ Failed to update room ${roomNumber}`;
      
  } else if (data.startsWith('confirm_booking_')) {
    const bookingId = parts.slice(2).join('_');
    success = updateBookingStatusInSheet(bookingId, 'Confirmed');
    responseText = success ?
      `✅ Booking ${bookingId} confirmed by ${userName}` :
      `❌ Failed to confirm booking`;
      
  } else if (data.startsWith('cancel_booking_')) {
    const bookingId = parts.slice(2).join('_');
    success = updateBookingStatusInSheet(bookingId, 'Cancelled');
    responseText = success ?
      `❌ Booking ${bookingId} cancelled by ${userName}` :
      `❌ Failed to cancel booking`;
      
  } else if (data.startsWith('ai_reply_')) {
    const reviewId = parts.slice(2).join('_');
    responseText = `🤖 Generating AI reply for review ${reviewId}...`;
    // Trigger Gemini AI reply generation (async)
    generateAIReplyForReview(reviewId, chatId);
    
  } else if (data.startsWith('flash_sale_')) {
    const date = parts.slice(2).join('_');
    responseText = `🔥 Flash Sale approved by ${userName}! Preparing marketing content...`;
    // Trigger flash sale workflow
    triggerFlashSale(date, chatId);
    
  } else if (data.startsWith('lower_prices_')) {
    const date = parts.slice(2).join('_');
    responseText = `📉 Price reduction approved by ${userName}. Updating rates...`;
    // Trigger price reduction
    triggerPriceReduction(date, 20, chatId);
    
  } else {
    responseText = `Action received: ${data}`;
  }
  
  // Answer the callback query (removes loading state)
  answerCallbackQuery(callbackQuery.id, responseText);
  
  // Update the original message
  editMessage(chatId, messageId, 
    callbackQuery.message.text + `\n\n✅ <i>${responseText}</i>`
  );
  
  // Log the action
  logTelegramAction('callback', chatId, data, success);
  
  return ContentService.createTextOutput('OK');
}

/**
 * Handle regular text message
 * @param {Object} message - Message data
 */
function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  
  // Simple command handling
  if (text === '/status') {
    sendDashboardStatus(chatId);
  } else if (text === '/help') {
    sendHelpMessage(chatId);
  } else if (text.startsWith('/room ')) {
    const roomNumber = text.replace('/room ', '').trim();
    sendRoomStatus(chatId, roomNumber);
  }
  
  return ContentService.createTextOutput('OK');
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEGRAM API HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Answer a callback query
 * @param {string} callbackQueryId - Callback query ID
 * @param {string} text - Response text
 */
function answerCallbackQuery(callbackQueryId, text) {
  const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/answerCallbackQuery`;
  
  const payload = {
    callback_query_id: callbackQueryId,
    text: text,
    show_alert: false,
  };
  
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

/**
 * Edit an existing message
 * @param {string} chatId - Chat ID
 * @param {number} messageId - Message ID
 * @param {string} newText - New message text
 */
function editMessage(chatId, messageId, newText) {
  const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/editMessageText`;
  
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: newText,
    parse_mode: 'HTML',
  };
  
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

/**
 * Set webhook URL for the bot
 * @param {string} webhookUrl - The deployed AppScript URL
 */
function setWebhook(webhookUrl) {
  const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/setWebhook`;
  
  const payload = {
    url: webhookUrl,
  };
  
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  });
  
  console.log('Webhook set:', response.getContentText());
  return JSON.parse(response.getContentText());
}

/**
 * Get bot updates (for debugging/getting chat IDs)
 */
function getUpdates() {
  const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/getUpdates`;
  
  const response = UrlFetchApp.fetch(url);
  const updates = JSON.parse(response.getContentText());
  
  console.log('Updates:', JSON.stringify(updates, null, 2));
  return updates;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHEET INTEGRATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Update room status in Google Sheet
 * @param {string} roomNumber - Room number
 * @param {string} status - New status
 * @returns {boolean} Success
 */
function updateRoomStatusInSheet(roomNumber, status) {
  try {
    const ss = SpreadsheetApp.openById(TELEGRAM_CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName('Housekeeping');
    
    if (!sheet) {
      sheet = ss.insertSheet('Housekeeping');
      sheet.appendRow(['Room Number', 'Status', 'Last Updated', 'Updated By']);
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(roomNumber)) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 2).setValue(status);
      sheet.getRange(rowIndex, 3).setValue(new Date());
      sheet.getRange(rowIndex, 4).setValue('Telegram Bot');
    } else {
      sheet.appendRow([roomNumber, status, new Date(), 'Telegram Bot']);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating room status:', error);
    return false;
  }
}

/**
 * Update booking status in Google Sheet
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {boolean} Success
 */
function updateBookingStatusInSheet(bookingId, status) {
  try {
    const ss = SpreadsheetApp.openById(TELEGRAM_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Reservations');
    
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        sheet.getRange(i + 1, 8).setValue(status); // Column H is Status
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
}

/**
 * Log Telegram action to sheet
 * @param {string} action - Action type
 * @param {string} chatId - Chat ID
 * @param {string} data - Action data
 * @param {boolean} success - Success status
 */
function logTelegramAction(action, chatId, data, success) {
  try {
    const ss = SpreadsheetApp.openById(TELEGRAM_CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName('Telegram_Log');
    
    if (!sheet) {
      sheet = ss.insertSheet('Telegram_Log');
      sheet.appendRow(['Timestamp', 'Action', 'Chat ID', 'Data', 'Success']);
    }
    
    sheet.appendRow([new Date(), action, chatId, data.substring(0, 500), success]);
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER FUNCTIONS (To be implemented with Gemini/Make.com)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate AI reply for a review using Gemini
 * @param {string} reviewId - Review ID
 * @param {string} chatId - Chat to send response to
 */
function generateAIReplyForReview(reviewId, chatId) {
  // TODO: Implement Gemini API call
  // For now, send a placeholder
  sendAlert(chatId, `🤖 AI Reply generated for review ${reviewId}:\n\n"Dear Guest, thank you for your feedback. We appreciate your stay at Orbi City and hope to welcome you back soon!"`);
}

/**
 * Trigger flash sale workflow
 * @param {string} date - Date for the sale
 * @param {string} chatId - Chat to send updates to
 */
function triggerFlashSale(date, chatId) {
  // TODO: Implement Make.com webhook call
  // Log to Marketing_Queue sheet
  try {
    const ss = SpreadsheetApp.openById(TELEGRAM_CONFIG.SHEET_ID);
    let sheet = ss.getSheetByName('Marketing_Queue');
    
    if (!sheet) {
      sheet = ss.insertSheet('Marketing_Queue');
      sheet.appendRow(['Timestamp', 'Type', 'Date', 'Status', 'Content']);
    }
    
    sheet.appendRow([new Date(), 'Flash Sale', date, 'Pending', '🔥 Flash Sale! 50% off for ' + date]);
    
    sendAlert(chatId, `✅ Flash Sale queued for ${date}!\n\nContent added to Marketing_Queue sheet.\nMake.com will process and post to Instagram.`);
  } catch (error) {
    sendAlert(chatId, `❌ Error creating flash sale: ${error.message}`);
  }
}

/**
 * Trigger price reduction
 * @param {string} date - Date for price change
 * @param {number} percentage - Reduction percentage
 * @param {string} chatId - Chat to send updates to
 */
function triggerPriceReduction(date, percentage, chatId) {
  // TODO: Implement OTA API calls or manual notification
  sendAlert(chatId, `📉 Price reduction of ${percentage}% scheduled for ${date}.\n\nPlease update prices manually on:\n- Booking.com\n- Airbnb\n- Expedia`);
}

/**
 * Send dashboard status summary
 * @param {string} chatId - Chat to send to
 */
function sendDashboardStatus(chatId) {
  // TODO: Fetch real data from sheets
  const message = `
📊 <b>PowerStack Status</b>

🏠 <b>Occupancy:</b> 78%
💰 <b>Today's Revenue:</b> ₾4,500
📅 <b>Check-ins:</b> 5
📅 <b>Check-outs:</b> 3

🟢 System Online
⏰ ${new Date().toLocaleString('ka-GE')}
`;
  
  sendAlert(chatId, message);
}

/**
 * Send help message
 * @param {string} chatId - Chat to send to
 */
function sendHelpMessage(chatId) {
  const message = `
🤖 <b>PowerStack Bot Commands</b>

/status - View dashboard summary
/room [number] - Check room status
/help - Show this message

<i>Tip: Use the inline buttons on alerts for quick actions!</i>
`;
  
  sendAlert(chatId, message);
}

/**
 * Send room status
 * @param {string} chatId - Chat to send to
 * @param {string} roomNumber - Room number
 */
function sendRoomStatus(chatId, roomNumber) {
  // TODO: Fetch from sheet
  sendAlert(chatId, `🏠 Room ${roomNumber}: Status unknown. Please check the dashboard.`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test the Telegram service
 */
function testTelegramService() {
  // Test sending a simple alert
  const result = sendAlert(
    TELEGRAM_CONFIG.CHATS.MANAGEMENT,
    '🧪 <b>Test Alert</b>\n\nThis is a test message from PowerStack!'
  );
  console.log('Test result:', JSON.stringify(result, null, 2));
}

/**
 * Test housekeeping alert
 */
function testHousekeepingAlert() {
  sendHousekeepingAlert('2104', 'dirty', 'Guest checked out');
}

/**
 * Test booking alert
 */
function testBookingAlert() {
  sendBookingAlert({
    reservationId: 'TEST-001',
    guestName: 'Test Guest',
    roomNumber: '2104',
    checkIn: '2024-12-25',
    checkOut: '2024-12-28',
    totalPrice: 450,
    source: 'Booking.com',
  });
}
