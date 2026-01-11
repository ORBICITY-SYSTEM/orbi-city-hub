# 🏠 Local Development vs Vercel Deployment

## 🤔 რა განსხვავებაა?

### 🏠 LOCAL DEVELOPMENT (კომპიუტერზე)
- ✅ **მუშაობს შენს კომპიუტერზე** (localhost:3000)
- ✅ **სწრაფი** - ყველა ცვლილება მაშინვე ჩანს
- ✅ **.env ფაილი** - environment variables შენს კომპიუტერზე
- ✅ **Debugging ადვილი** - console.log-ები, breakpoints
- ❌ **არა production** - არ მუშაობს ყველასთვის
- ❌ **მხოლოდ შენ ხედავ** - სხვა ადამიანები ვერ იხილავენ

### ☁️ VERCEL DEPLOYMENT (Production)
- ✅ **ყველასთვის ხელმისაწვდომი** - https://orbicityhotel.com
- ✅ **Production environment** - რეალური მომხმარებლები
- ✅ **Vercel Environment Variables** - სპეციალური დაცული ადგილი
- ✅ **Auto-deploy** - GitHub push-ზე ავტომატურად განახლდება
- ❌ **ცვლილებები სწრაფი არაა** - ყოველთვის deployment-ი სჭირდება
- ❌ **Debugging რთული** - logs Vercel Dashboard-ზე

---

## 📋 როდის რა გამოიყენო?

### 🏠 LOCAL-ზე იმუშავე როცა:
- ✅ ახალ features-ებს აკეთებ
- ✅ bugs-ებს ასწორებ
- ✅ UI-ს იცვლი
- ✅ testing-ს აკეთებ

### ☁️ VERCEL-ზე deploy-ი როცა:
- ✅ production-ში გინდა გაშვება
- ✅ მომხმარებლები უნდა დაინახონ
- ✅ რეალური data-სთვის testing გინდა

---

## 🔧 LOCAL SETUP (.env ფაილი)

### 1. შექმენი `.env` ფაილი პროექტის root-ში:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=orbi-city-hub
OWNER_OPEN_ID=your-openid

# Rows.com (Instagram Analytics) - ⚠️ არ დაამატო "rows-" პრეფიქსი!
# ❌ არასწორი: rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
# ✅ სწორი: 1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_API_KEY=1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
ROWS_SYNC_MODE=overwrite
ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273

# RLIST tables
ROWS_RLIST_CREATED_TABLE_ID=be9ac7f9-9795-4b0b-b974-d3fac458d834
ROWS_RLIST_CHECKIN_TABLE_ID=0f146429-1ed0-418c-9b8c-b1fd41be44cc
ROWS_RLIST_CHECKOUT_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
ROWS_HISTORY_TABLE_ID=d5c025b0-55cb-473b-9657-f6f0ac3e227c
ROWS_RLIST_STAY_DAYS_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41

# RLIST filters
RLIST_ACTIVE_CATEGORIES=Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room
RLIST_STATUS=ყველა
ROWS_APPEND_CHUNK_SIZE=500
SKIP_ROWS_IF_UNCHANGED=1
SCRAPER_PROFILE=prod

# OTELMS
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
OTELMS_API_URL=https://otelms-api.run.app
VITE_OTELMS_API_URL=https://otelms-api.run.app

# Google Cloud Storage
GCS_BUCKET=otelms-data

# Calendar Settings
CALENDAR_RENDER_TIMEOUT=300
CALENDAR_SCAN_SECONDS=90
CALENDAR_MONTH_SHIFTS=-1,0,1
CALENDAR_TODAY=1

# Security
SERVICE_API_KEY=MySuperSecretKeyForOrbi2025
```

### 2. Local-ზე გაშვება:

```bash
# Terminal-ში:
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"

# Install dependencies (თუ პირველად):
pnpm install

# Run development server:
pnpm dev
```

**✅ შედეგი:** http://localhost:3000 - მუშაობს შენს კომპიუტერზე!

---

## ☁️ VERCEL SETUP (Production)

### 1. გადადი Vercel Dashboard-ზე:
https://vercel.com/orbi-city/~/settings/environment-variables

### 2. დამატე **ყველა** ეს variables:

| Key | Value | Sensitive |
|-----|-------|-----------|
| `DATABASE_URL` | `mysql://...` | ✅ |
| `JWT_SECRET` | `...` | ✅ |
| `OAUTH_SERVER_URL` | `https://...` | ❌ |
| `VITE_APP_ID` | `orbi-city-hub` | ❌ |
| `OWNER_OPEN_ID` | `...` | ❌ |
| `ROWS_API_KEY` | `1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC` | ✅ |
| `ROWS_SPREADSHEET_ID` | `6TEX2TmAJXfWwBiRltFBuo` | ❌ |
| `ROWS_SYNC_MODE` | `overwrite` | ❌ |
| `ROWS_CALENDAR_TABLE_ID` | `cb0eed95-0f57-4640-975a-8dc7a053f732` | ❌ |
| `ROWS_STATUS_TABLE_ID` | `9fd54415-7bfd-4e5b-b8bb-17c9e03a5273` | ❌ |
| `ROWS_RLIST_CREATED_TABLE_ID` | `be9ac7f9-9795-4b0b-b974-d3fac458d834` | ❌ |
| `ROWS_RLIST_CHECKIN_TABLE_ID` | `0f146429-1ed0-418c-9b8c-b1fd41be44cc` | ❌ |
| `ROWS_RLIST_CHECKOUT_TABLE_ID` | `ec7c99d8-88b7-430d-98ea-5273e43e9b41` | ❌ |
| `ROWS_HISTORY_TABLE_ID` | `d5c025b0-55cb-473b-9657-f6f0ac3e227c` | ❌ |
| `ROWS_RLIST_STAY_DAYS_TABLE_ID` | `ec7c99d8-88b7-430d-98ea-5273e43e9b41` | ❌ |
| `RLIST_ACTIVE_CATEGORIES` | `Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room` | ❌ |
| `RLIST_STATUS` | `ყველა` | ❌ |
| `ROWS_APPEND_CHUNK_SIZE` | `500` | ❌ |
| `SKIP_ROWS_IF_UNCHANGED` | `1` | ❌ |
| `SCRAPER_PROFILE` | `prod` | ❌ |
| `OTELMS_USERNAME` | `tamunamaxaradze@yahoo.com` | ❌ |
| `OTELMS_PASSWORD` | `Orbicity1234!` | ✅ |
| `OTELMS_API_URL` | `https://otelms-api.run.app` | ❌ |
| `VITE_OTELMS_API_URL` | `https://otelms-api.run.app` | ❌ |
| `GCS_BUCKET` | `otelms-data` | ❌ |
| `CALENDAR_RENDER_TIMEOUT` | `300` | ❌ |
| `CALENDAR_SCAN_SECONDS` | `90` | ❌ |
| `CALENDAR_MONTH_SHIFTS` | `-1,0,1` | ❌ |
| `CALENDAR_TODAY` | `1` | ❌ |
| `SERVICE_API_KEY` | `MySuperSecretKeyForOrbi2025` | ✅ |

### 3. **Save** → **Redeploy**

**✅ შედეგი:** https://orbicityhotel.com - მუშაობს ყველასთვის!

---

## 💡 რეკომენდაცია

### 🎯 როგორ უნდა იმუშაოს:

1. **LOCAL Development:**
   - შექმენი `.env` ფაილი პროექტში
   - დაამატე ყველა variables
   - `pnpm dev` - გაუშვი local-ზე
   - აკეთე ცვლილებები, test-ი local-ზე

2. **Vercel Production:**
   - დამატე **ყველა** variables Vercel-ზე
   - push GitHub-ზე
   - Vercel ავტომატურად deploy-ს აკეთებს
   - production-ში testing

3. **როცა რა გამოიყენო:**
   - **Development (ახალი features):** → LOCAL (.env)
   - **Production (მომხმარებლებისთვის):** → VERCEL (Environment Variables)

---

## ⚠️ მნიშვნელოვანი

1. **ROWS_API_KEY** - **არ დაამატო "rows-" პრეფიქსი!**
   - ❌ არასწორი: `rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`
   - ✅ სწორი: `1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC`

2. **.env ფაილი** - **არ commit-ო Git-ში!**
   - დაამატე `.env` → `.gitignore`-ში

3. **Vercel** - Production-ისთვის აუცილებელია!

---

**განახლებული**: 2025-01-11
**ვერსია**: 1.0
