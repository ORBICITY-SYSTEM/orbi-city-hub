# Google OAuth & API Setup Guide for ORBI City Hub

This guide will walk you through setting up Google OAuth 2.0 credentials and enabling necessary APIs for ORBI City Hub's Google Workspace integration.

---

## Prerequisites

- Google Workspace Enterprise account
- Admin access to Google Cloud Console
- ORBI City Hub project deployed

---

## Part 1: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Project name: `ORBI City Hub`
4. Organization: Select your Google Workspace organization
5. Click **"Create"**

### Step 2: Enable Required APIs

Navigate to **"APIs & Services"** → **"Library"** and enable the following APIs:

#### A. Google Business Profile API
- Search for "Google Business Profile API" or "My Business API"
- Click **"Enable"**
- **Note**: You may need to request access if not already approved

#### B. Google Analytics Data API
- Search for "Google Analytics Data API"
- Click **"Enable"**
- This allows fetching GA4 metrics programmatically

#### C. Google Calendar API
- Search for "Google Calendar API"
- Click **"Enable"**
- For booking auto-sync functionality

#### D. Gmail API (Already configured via MCP)
- Search for "Gmail API"
- Click **"Enable"**
- For email integration

---

## Part 2: OAuth 2.0 Credentials

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. User Type: Select **"Internal"** (for Google Workspace users only)
3. Click **"Create"**

**Fill in the following:**
- App name: `ORBI City Hub`
- User support email: Your email
- App logo: Upload ORBI logo (optional)
- Authorized domains: Add your domain (e.g., `orbicitybatumi.com`)
- Developer contact: Your email
- Click **"Save and Continue"**

### Step 4: Add OAuth Scopes

Click **"Add or Remove Scopes"** and add:

```
https://www.googleapis.com/auth/business.manage
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/gmail.readonly
```

Click **"Update"** → **"Save and Continue"**

### Step 5: Create OAuth 2.0 Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `ORBI City Hub Web Client`

**Authorized JavaScript origins:**
```
https://3000-ihj8x11ufcd1u5r41evif-c07f8853.manusvm.computer
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
https://3000-ihj8x11ufcd1u5r41evif-c07f8853.manusvm.computer/api/oauth/callback
https://your-production-domain.com/api/oauth/callback
```

5. Click **"Create"**
6. **Download the JSON file** - you'll need the Client ID and Client Secret

---

## Part 3: API Keys

### Step 6: Create API Key for Google Business Profile

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API key"**
3. Name it: `ORBI Business Profile API Key`
4. Click **"Restrict Key"**:
   - Application restrictions: **"HTTP referrers"**
   - Add your website URLs
   - API restrictions: Select **"Google Business Profile API"**
5. Click **"Save"**
6. **Copy the API key**

### Step 7: Get Google Analytics 4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** (bottom left)
4. Under **Property**, click **"Property Settings"**
5. Copy your **Property ID** (format: `123456789`)

### Step 8: Get Google Business Profile Location ID

1. Go to [Google Business Profile](https://business.google.com/)
2. Select your ORBI City location
3. The URL will contain your location ID:
   ```
   https://business.google.com/locations/[ACCOUNT_ID]/[LOCATION_ID]
   ```
4. Copy the `LOCATION_ID`

---

## Part 4: Add Credentials to ORBI City Hub

### Step 9: Configure Environment Variables

You need to add the following secrets to your ORBI City Hub project:

1. Open **Management UI** → **Settings** → **Secrets**
2. Add the following environment variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | Your OAuth Client ID | From Step 5 |
| `GOOGLE_CLIENT_SECRET` | Your OAuth Client Secret | From Step 5 |
| `GOOGLE_BUSINESS_PROFILE_API_KEY` | Your API Key | From Step 6 |
| `GOOGLE_BUSINESS_LOCATION_ID` | Your Location ID | From Step 8 |
| `GA4_PROPERTY_ID` | Your GA4 Property ID | From Step 7 |
| `GOOGLE_CALENDAR_ID` | Your Calendar ID | Usually your email |

3. Click **"Save"** for each variable

---

## Part 5: Testing

### Step 10: Test Google Business Profile Reviews

1. Navigate to **CEO Dashboard** in ORBI City Hub
2. Check the **Google Reviews** widget
3. You should see live reviews from your Google Business Profile
4. Click on a review to test the reply functionality

### Step 11: Test Google Analytics

1. Navigate to **Google** module → **Analytics** tab
2. Verify that real-time metrics are displayed:
   - Total Sessions
   - Total Users
   - Page Views
   - Traffic Sources
3. Compare with your GA4 dashboard to verify accuracy

### Step 12: Test Calendar Auto-Sync

1. Send a test booking email to your Gmail
2. Navigate to **Google** module → **Calendar** tab
3. Open Google Calendar
4. Verify that a calendar event was automatically created

---

## Troubleshooting

### Issue: "Access Denied" when fetching reviews

**Solution:**
- Verify that you've enabled Google Business Profile API
- Check that your OAuth scopes include `https://www.googleapis.com/auth/business.manage`
- Ensure your Google account has access to the Business Profile

### Issue: GA4 metrics not showing

**Solution:**
- Verify `GA4_PROPERTY_ID` is correct
- Check that Google Analytics Data API is enabled
- Ensure your Google account has "Viewer" access to the GA4 property

### Issue: Calendar events not creating

**Solution:**
- Verify Google Calendar API is enabled
- Check that `GOOGLE_CALENDAR_ID` is set correctly
- Ensure Gmail integration is working (test with MCP Gmail tools)

---

## Security Best Practices

1. **Never commit credentials to Git** - Always use environment variables
2. **Rotate API keys regularly** - Update keys every 90 days
3. **Use least privilege** - Only grant necessary OAuth scopes
4. **Monitor API usage** - Check Google Cloud Console for unusual activity
5. **Enable 2FA** - Protect your Google Workspace admin account

---

## Additional Resources

- [Google Business Profile API Documentation](https://developers.google.com/my-business)
- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

---

## Support

If you encounter issues during setup:
1. Check the [ORBI City Hub GitHub Issues](https://github.com/ORBICITY-SYSTEM/orbi-ai-nexus/issues)
2. Contact Google Workspace support for API access issues
3. Review Google Cloud Console audit logs for error details

---

**Setup Complete!** 🎉

Your ORBI City Hub now has full Google Workspace integration with live data from Google Business Profile, Google Analytics 4, and Google Calendar.
