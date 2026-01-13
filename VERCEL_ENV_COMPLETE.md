# 🚀 Vercel Environment Variables - სრული სია

## 📋 CRITICAL (Required for Production)

### Database
```env
DATABASE_URL=mysql://user:password@host:port/database
```

### Authentication & Security
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=orbi-city-hub
OWNER_OPEN_ID=your-openid-for-admin-access
```

### Rows.com Integration (Instagram Analytics)
```env
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

---

## 🔧 IMPORTANT (Recommended)

### OTELMS Integration (Channel Manager)
```env
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
OTELMS_API_URL=https://otelms-api.run.app
VITE_OTELMS_API_URL=https://otelms-api.run.app
```

### Google Services
```env
# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]

# Google Business Profile OAuth
GOOGLE_BUSINESS_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_BUSINESS_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
GOOGLE_BUSINESS_REDIRECT_URI=https://orbicityhotel.com/api/google-business/callback
GOOGLE_BUSINESS_LOCATION_ID=your-location-id

# Google Analytics (GA4)
GA4_PROPERTY_ID=properties/123456789
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Google Calendar
GOOGLE_CALENDAR_ID=primary

# Google Business Profile (Alternative)
BUSINESS_PROFILE_ACCOUNT=accounts/123456789
BUSINESS_PROFILE_LOCATION=locations/123456789
```

### AI Services
```env
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
```

### Google Maps API
```env
BUILT_IN_FORGE_API_KEY=[YOUR_GOOGLE_MAPS_API_KEY]
BUILT_IN_FORGE_API_URL=https://maps.googleapis.com/maps/api
```

### Social Media APIs
```env
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
FACEBOOK_ACCESS_TOKEN=your-facebook-access-token
TIKTOK_ACCESS_TOKEN=your-tiktok-access-token
```

### Telegram Bot
```env
TELEGRAM_BOT_TOKEN=[YOUR_TELEGRAM_BOT_TOKEN]
```

---

## 📦 OPTIONAL (Feature-Specific)

### Rows.com Table IDs (Channel Manager)
```env
ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273
ROWS_RLIST_CREATED_TABLE_ID=be9ac7f9-9795-4b0b-b974-d3fac458d834
ROWS_RLIST_CHECKIN_TABLE_ID=0f146429-1ed0-418c-9b8c-b1fd41be44cc
ROWS_RLIST_CHECKOUT_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
ROWS_HISTORY_TABLE_ID=d5c025b0-55cb-473b-9657-f6f0ac3e227c
ROWS_RLIST_STAY_DAYS_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
```

### Rows.com Configuration
```env
VITE_ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
VITE_ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
VITE_ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
VITE_ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273
ROWS_SYNC_MODE=overwrite
ROWS_APPEND_CHUNK_SIZE=500
SKIP_ROWS_IF_UNCHANGED=1
```

### Google Cloud Storage
```env
GCS_BUCKET=otelms-data
```

### Calendar Settings
```env
CALENDAR_RENDER_TIMEOUT=300
CALENDAR_SCAN_SECONDS=90
CALENDAR_MONTH_SHIFTS=-1,0,1
CALENDAR_TODAY=1
```

### RLIST Filters
```env
RLIST_ACTIVE_CATEGORIES=Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room
RLIST_STATUS=ყველა
SCRAPER_PROFILE=prod
```

### Knowledge Base (Obsidian)
```env
VITE_KNOWLEDGE_BASE_URL=https://your-obsidian-publish-url.com
VITE_KNOWLEDGE_STORAGE_PATH=knowledge-base
```

### N8N Webhooks
```env
N8N_API_KEY=n8n_orbi_2025_secure_key
N8N_REVIEW_RESPONSE_WEBHOOK=https://your-n8n-instance.com/webhook/review-response
```

### Encryption & Security
```env
ENCRYPTION_KEY=orbi-city-hub-encryption-key-32b
SERVICE_API_KEY=MySuperSecretKeyForOrbi2025
```

### Monitoring & Logging
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Forge API (Manus Platform)
```env
BUILT_IN_FORGE_API_URL=https://api.manus.computer
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

### App Configuration
```env
VITE_APP_TITLE=ORBI City Hub
VITE_APP_ID=orbi-city-hub
APP_MODE=production
NODE_ENV=production
PORT=3000
```

### Redis Cache (Optional)
```env
REDIS_URL=redis://user:password@host:port
```

---

## 📝 Frontend-Only Variables (VITE_ prefix)

ეს variables მხოლოდ frontend-ში ხელმისაწვდომია:

```env
VITE_ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
VITE_ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
VITE_ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
VITE_ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273
VITE_OTELMS_API_URL=https://otelms-api.run.app
VITE_KNOWLEDGE_BASE_URL=https://your-obsidian-publish-url.com
VITE_APP_TITLE=ORBI City Hub
VITE_APP_ID=orbi-city-hub
VITE_USE_DEMO_DATA=false
```

---

## 🎯 Priority Order for Vercel Setup

### 1. **MUST HAVE** (App won't work without these):
- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_SERVER_URL`
- `VITE_APP_ID`
- `ROWS_API_KEY`
- `ROWS_SPREADSHEET_ID`

### 2. **SHOULD HAVE** (Core features need these):
- `OTELMS_USERNAME`
- `OTELMS_PASSWORD`
- `OTELMS_API_URL`
- `VITE_OTELMS_API_URL`
- `GEMINI_API_KEY`

### 3. **NICE TO HAVE** (Optional features):
- Google Services (if using Google integrations)
- Social Media APIs (if using social media features)
- Telegram Bot (if using Telegram)
- N8N Webhooks (if using automation)
- Sentry (if using error tracking)

---

## ⚠️ Security Notes

1. **NEVER commit** `.env` files to Git
2. Mark **sensitive** variables in Vercel (toggle "Sensitive")
3. Use **different values** for Production, Preview, and Development
4. **Rotate keys** regularly
5. **Limit access** to environment variables

---

## 📋 Quick Copy-Paste for Vercel

### Minimum Required Set:
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=orbi-city-hub
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
OTELMS_API_URL=https://otelms-api.run.app
VITE_OTELMS_API_URL=https://otelms-api.run.app
```

---

**განახლებული**: 2025-01-11
**ვერსია**: 1.0
