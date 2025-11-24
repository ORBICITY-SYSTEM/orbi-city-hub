# Phase 2 Setup Guide: External Integrations

This guide will help you set up external API integrations for ORBI City Hub. All integrations are **optional** but highly recommended for full automation.

---

## 📧 1. Gmail Integration (IMAP Sync)

**Purpose:** Automatically parse booking confirmations from OTAs (Booking.com, Airbnb, etc.)

### Steps:

1. **Enable IMAP in Gmail:**
   - Go to Gmail Settings → Forwarding and POP/IMAP
   - Enable IMAP
   - Save changes

2. **Generate App Password:**
   - Go to Google Account → Security
   - Enable 2-Step Verification (if not already enabled)
   - Go to App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "ORBI City Hub"
   - Copy the 16-character password

3. **Add to Manus Secrets:**
   - In Manus UI, go to Settings → Secrets
   - Add new secret:
     - Key: `GMAIL_USER`
     - Value: `your-email@gmail.com`
   - Add another secret:
     - Key: `GMAIL_APP_PASSWORD`
     - Value: `your-16-char-app-password`

4. **Test Connection:**
   - Go to Reservations → Mail Room
   - Click "Sync Now"
   - Verify emails are fetched

**Expected Result:** Booking confirmations automatically parsed and added to system.

---

## 🏨 2. Booking.com API

**Purpose:** Real-time inventory sync, rate updates, reservation management

### Steps:

1. **Register for Booking.com Connectivity:**
   - Go to https://connect.booking.com
   - Sign up as a connectivity partner
   - Fill in property details (ORBI City Batumi, 60 studios)
   - Wait for approval (1-2 weeks)

2. **Get API Credentials:**
   - Once approved, you'll receive:
     - Hotel ID
     - API Key
     - API Secret
   - Save these securely

3. **Add to Manus Secrets:**
   - Key: `BOOKING_COM_HOTEL_ID`
   - Key: `BOOKING_COM_API_KEY`
   - Key: `BOOKING_COM_API_SECRET`

4. **Configure Webhook:**
   - In Booking.com dashboard, set webhook URL:
     - `https://team.orbicitybatumi.com/api/webhooks/booking-com`
   - This will receive real-time reservation updates

**Expected Result:** Automatic 2-way sync with Booking.com.

---

## 🏠 3. Airbnb API

**Purpose:** Sync calendars, rates, and reservations

### Steps:

1. **Apply for Airbnb API Access:**
   - Go to https://www.airbnb.com/partner
   - Apply as a Property Management System (PMS)
   - Provide business details
   - Wait for approval (2-4 weeks)

2. **OAuth Setup:**
   - Once approved, create OAuth app
   - Set redirect URI: `https://team.orbicitybatumi.com/api/oauth/airbnb`
   - Get Client ID and Client Secret

3. **Add to Manus Secrets:**
   - Key: `AIRBNB_CLIENT_ID`
   - Key: `AIRBNB_CLIENT_SECRET`

4. **Connect Listings:**
   - In Marketing → Channel Performance
   - Click "Connect Airbnb"
   - Authorize access to your listings

**Expected Result:** Real-time Airbnb sync.

---

## 🏦 4. Bank API (TBC/BOG)

**Purpose:** Automatic transaction import, reconciliation

### Steps:

1. **Contact Your Bank:**
   - TBC Bank: business@tbcbank.ge
   - Bank of Georgia: corporate@bog.ge
   - Request API access for corporate account

2. **Provide Documents:**
   - Business registration
   - Tax ID
   - Authorized signatory documents

3. **Get API Credentials:**
   - API Key
   - API Secret
   - Account ID

4. **Add to Manus Secrets:**
   - Key: `TBC_API_KEY` (or `BOG_API_KEY`)
   - Key: `TBC_API_SECRET`
   - Key: `TBC_ACCOUNT_ID`

**Expected Result:** Daily automatic transaction sync.

---

## 📱 5. Social Media APIs

### Facebook/Instagram

1. **Create Facebook App:**
   - Go to https://developers.facebook.com
   - Create new app → Business type
   - Add Instagram Graph API

2. **Get Access Token:**
   - Tools → Graph API Explorer
   - Generate User Access Token
   - Request permissions: `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights`

3. **Add to Manus Secrets:**
   - Key: `FACEBOOK_PAGE_ID`
   - Key: `FACEBOOK_ACCESS_TOKEN`
   - Key: `INSTAGRAM_ACCOUNT_ID`

### TikTok

1. **TikTok for Business:**
   - Go to https://business.tiktok.com
   - Create business account
   - Apply for API access

2. **Add Credentials:**
   - Key: `TIKTOK_ACCESS_TOKEN`

**Expected Result:** Social media analytics in Marketing dashboard.

---

## 📊 6. Google Analytics

**Purpose:** Website traffic analysis

### Steps:

1. **Create GA4 Property:**
   - Go to https://analytics.google.com
   - Create new GA4 property for `orbicitybatumi.com`
   - Get Measurement ID (e.g., `G-XXXXXXXXXX`)

2. **Add to Environment:**
   - In Manus UI, Settings → General
   - Add custom env variable:
     - Key: `VITE_GA_MEASUREMENT_ID`
     - Value: `G-XXXXXXXXXX`

3. **Verify Tracking:**
   - Visit website
   - Check GA4 Realtime report

**Expected Result:** Website analytics in Marketing module.

---

## 🔔 7. Push Notifications (Optional)

**Purpose:** Real-time alerts for bookings, reviews, issues

### Steps:

1. **Firebase Setup:**
   - Go to https://console.firebase.google.com
   - Create new project "ORBI City Hub"
   - Add web app
   - Get Firebase config

2. **Add to Manus Secrets:**
   - Key: `FIREBASE_API_KEY`
   - Key: `FIREBASE_PROJECT_ID`
   - Key: `FIREBASE_MESSAGING_SENDER_ID`

**Expected Result:** Browser push notifications.

---

## ✅ Integration Checklist

| Integration | Priority | Setup Time | Status |
|-------------|----------|------------|--------|
| Gmail IMAP | High | 10 min | ⬜ Not started |
| Booking.com API | High | 2-3 weeks | ⬜ Not started |
| Airbnb API | High | 3-4 weeks | ⬜ Not started |
| Bank API | Medium | 1-2 weeks | ⬜ Not started |
| Facebook/Instagram | Medium | 30 min | ⬜ Not started |
| Google Analytics | Low | 15 min | ⬜ Not started |
| Push Notifications | Low | 1 hour | ⬜ Not started |

---

## 🆘 Troubleshooting

### Gmail Not Syncing
- Check IMAP is enabled
- Verify App Password is correct (16 chars, no spaces)
- Check Gmail filters aren't blocking emails

### API Connection Errors
- Verify secrets are added correctly (no extra spaces)
- Check API credentials haven't expired
- Ensure webhook URLs are accessible (not blocked by firewall)

### Rate Limiting
- Most APIs have rate limits (e.g., 100 requests/hour)
- System automatically handles rate limiting with exponential backoff
- Check API dashboard for usage stats

---

## 📞 Support

If you encounter issues:

1. Check Manus UI → Settings → Secrets (verify all keys are present)
2. Check browser console for error messages
3. Contact support: info@orbicitybatumi.com

---

**Note:** All integrations are optional. The system works fully without them, but integrations enable automation and reduce manual work.

**Estimated Total Setup Time:** 1-2 hours (excluding API approval wait times)
