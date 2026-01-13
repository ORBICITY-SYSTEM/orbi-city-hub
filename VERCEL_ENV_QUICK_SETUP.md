# 🚀 Vercel Environment Variables - სრული სია (სასწრაფო დაყენება)

## ⚡ STEP 1: CRITICAL (აუცილებელი - App არ იმუშავებს ამის გარეშე)

### Database
```env
DATABASE_URL=mysql://user:password@host:port/database
```

### Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=orbi-city-hub
OWNER_OPEN_ID=your-openid-for-admin-access
```

### Rows.com (Instagram Analytics) - **პირველი ეს!**
```env
ROWS_API_KEY=1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```
**⚠️ მნიშვნელოვანი:** `ROWS_API_KEY` **არ უნდა** დაიწყოს "rows-" პრეფიქსით! მხოლოდ key-ის value-ს დაამატე!

---

## ⚡ STEP 2: IMPORTANT (რეკომენდებული - Core Features)

### OTELMS (Channel Manager)
```env
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
OTELMS_API_URL=https://otelms-api.run.app
VITE_OTELMS_API_URL=https://otelms-api.run.app
```

### AI Services
```env
GEMINI_API_KEY=your-gemini-api-key
```

---

## ⚡ STEP 3: OPTIONAL (თუ გამოიყენება)

### Google Services (თუ Google integrations გჭირდება)
```env
# Google OAuth (Gmail & Business Profile)
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
GOOGLE_BUSINESS_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_BUSINESS_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
GOOGLE_BUSINESS_REDIRECT_URI=https://orbicityhotel.com/api/google-business/callback
GOOGLE_BUSINESS_CLIENT_ID=your-business-client-id
GOOGLE_BUSINESS_CLIENT_SECRET=your-business-client-secret
GOOGLE_BUSINESS_REDIRECT_URI=https://orbicityhotel.com/api/google-business/callback
GA4_PROPERTY_ID=properties/123456789
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_CALENDAR_ID=primary
```

### Social Media APIs (თუ Social Media features გჭირდება)
```env
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
FACEBOOK_ACCESS_TOKEN=your-facebook-access-token
TIKTOK_ACCESS_TOKEN=your-tiktok-access-token
```

### Other Services
```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
REDIS_URL=redis://user:password@host:port
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
N8N_API_KEY=n8n_orbi_2025_secure_key
ENCRYPTION_KEY=orbi-city-hub-encryption-key-32b
SERVICE_API_KEY=MySuperSecretKeyForOrbi2025
```

---

## 📋 VERCEL-ში დამატების ინსტრუქცია

### 1. გადადი Vercel Dashboard-ზე:
https://vercel.com/orbi-city/~/settings/environment-variables

### 2. თითოეული Variable-ისთვის:
1. დააჭირე **"Add Another"** ღილაკს
2. **Key** field-ში შეიყვანე variable-ის სახელი (მაგ: `ROWS_API_KEY`)
3. **Value** field-ში შეიყვანე მნიშვნელობა (მაგ: `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`)
4. **Environments** dropdown-ში აირჩიე: **Production, Preview, and Development**
5. **Sensitive** toggle - ჩართე თუ ეს არის password/token (ROWS_API_KEY, JWT_SECRET, და ა.შ.)

### 3. როცა ყველა variable დაემატება:
1. დააჭირე **"Save"** ღილაკს (შავი ღილაკი მარჯვნივ)
2. გადადი **Deployments** tab-ზე
3. დააჭირე **"..."** → **"Redeploy"** ბოლო deployment-ზე
4. დაელოდე 2-3 წუთს

---

## 🎯 MINIMUM SET (მინიმალური - Test ღილაკისთვის)

თუ მხოლოდ Test ღილაკი გინდა რომ იმუშაოს, დამატე მინიმუმ ეს:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=orbi-city-hub
ROWS_API_KEY=1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```
**⚠️ მნიშვნელოვანი:** `ROWS_API_KEY` - **არ დაამატო "rows-" პრეფიქსი!** მხოლოდ key-ის value!

---

## ⚠️ IMPORTANT NOTES

1. **ROWS_API_KEY** - უნდა იყოს **ერთი ხაზი**, არ უნდა იყოს გატეხილი
2. **Sensitive** toggle - ჩართე password/token-ებისთვის
3. **Environments** - აირჩიე **Production, Preview, and Development** (სამივე)
4. **Save** - არ დაგავიწყდეს "Save" ღილაკის დაჭერა!
5. **Redeploy** - Save-ის შემდეგ **Redeploy** გააკეთე!

---

## 🔍 შემოწმება

1. გადადი: https://orbicityhotel.com/marketing/instagram
2. დააჭირე **"Test"** ღილაკს
3. უნდა გამოჩნდეს: **"Connection successful!"** ან error message
4. თუ error-ია, გახსენი Browser Console (F12) და გამომიგზავნე error message

---

**განახლებული**: 2025-01-11
**ვერსია**: 2.0 - Quick Setup
