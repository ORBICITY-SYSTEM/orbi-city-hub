# 🔗 Instagram Analytics - Connection Test Guide

## ✅ რა გაკეთდა

1. ✅ Supabase Client - Lovable-ის მსგავსად
2. ✅ `useInstagramAnalytics` Hook - Supabase Edge Functions-ებთან მუშაობისთვის
3. ✅ Supabase Edge Functions:
   - `instagram-test-connection` - Rows.com-თან კავშირის შემოწმება
   - `instagram-sync-cron` - მონაცემების სინქრონიზაცია
4. ✅ Connection Test Page - `/marketing/instagram/test`

---

## 🚀 როგორ შევამოწმოთ კავშირი

### ნაბიჯი 1: გახსენი Test Page

გადადი browser-ში:
```
http://localhost:3000/marketing/instagram/test
```

ან production-ზე:
```
https://orbicityhotel.com/marketing/instagram/test
```

### ნაბიჯი 2: შეამოწმე Supabase Configuration

Test page-ზე უნდა ჩანდეს:

**✅ Connected (მწვანე):**
- URL: `https://your-project.supabase.co`
- Key: ✅ Set

**❌ Not Connected (წითელი):**
- URL: ❌ Not set
- Key: ❌ Not set

---

## ⚙️ Setup Instructions

### 1. Supabase Project Setup

1. **შექმენი Supabase Project:**
   - გადადი: https://supabase.com
   - დააჭირე "New Project"
   - შეიყვანე project name და password

2. **მიიღე Credentials:**
   - გადადი: Settings → API
   - დააკოპირე:
     - `Project URL` → `VITE_SUPABASE_URL`
     - `anon public` key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (Edge Functions-ისთვის)

### 2. Environment Variables

დაამატე `.env` ფაილში:

```env
# Frontend (Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Backend (Supabase Edge Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

### 3. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy instagram-test-connection
supabase functions deploy instagram-sync-cron

# Set secrets
supabase secrets set ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
supabase secrets set ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Create Database Tables

გაუშვი Supabase SQL Editor-ში:

```sql
-- Daily Metrics
CREATE TABLE IF NOT EXISTS instagram_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  reach INTEGER,
  accounts_engaged INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  follows INTEGER,
  profile_links_taps INTEGER,
  views INTEGER,
  total_interactions INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url TEXT UNIQUE NOT NULL,
  post_date DATE,
  created_time TIME,
  caption TEXT,
  likes INTEGER,
  reach INTEGER,
  comments INTEGER,
  saved INTEGER,
  follows INTEGER,
  media_type TEXT,
  watch_time_ms INTEGER,
  theme TEXT,
  media_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Summary
CREATE TABLE IF NOT EXISTS instagram_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMP DEFAULT NOW(),
  time_frame TEXT,
  posts_count INTEGER,
  total_reach INTEGER,
  total_likes INTEGER,
  total_comments INTEGER,
  total_saved INTEGER,
  total_follows INTEGER,
  avg_reach_per_post NUMERIC,
  engagement_rate NUMERIC
);

-- Weekly Stats
CREATE TABLE IF NOT EXISTS instagram_weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_starting DATE UNIQUE NOT NULL,
  posts_count INTEGER,
  reach INTEGER,
  likes INTEGER,
  comments INTEGER,
  saved INTEGER,
  follows INTEGER,
  avg_reach_per_post NUMERIC,
  engagement_rate NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Test 1: Supabase Connection

1. გადადი: `/marketing/instagram/test`
2. შეამოწმე "Supabase Configuration" სექცია
3. უნდა იყოს: ✅ Connected

### Test 2: Rows.com Connection

1. დააჭირე "Test Rows.com Connection" ღილაკს
2. უნდა გამოჩნდეს: ✅ "Connection successful! Spreadsheet: ..."

### Test 3: Full Sync

1. გადადი: `/marketing/instagram`
2. დააჭირე "Sync" ღილაკს
3. უნდა გამოჩნდეს: ✅ "Data synchronized successfully"

---

## 🔍 Troubleshooting

### Supabase არ არის Connected

**პრობლემა:** `VITE_SUPABASE_URL` ან `VITE_SUPABASE_PUBLISHABLE_KEY` არ არის დაყენებული

**გამოსწორება:**
1. შეამოწმე `.env` ფაილი
2. დარწმუნდი რომ variables-ები იწყება `VITE_` prefix-ით
3. გადატვირთე development server

### Rows.com Test Fails

**პრობლემა:** Edge Function არ მუშაობს

**გამოსწორება:**
1. შეამოწმე რომ Edge Functions დეპლოირებულია
2. შეამოწმე Supabase Edge Function secrets
3. შეამოწმე Supabase Edge Function logs

### "Failed to fetch" Error

**პრობლემა:** CORS ან network error

**გამოსწორება:**
1. შეამოწმე browser console (F12)
2. შეამოწმე Supabase Edge Function logs
3. დარწმუნდი რომ Edge Function CORS headers-ს აბრუნებს

---

## 📋 Checklist

- [ ] Supabase project შექმნილია
- [ ] Environment variables დამატებულია (`.env`)
- [ ] Supabase Edge Functions დეპლოირებულია
- [ ] Database tables შექმნილია
- [ ] Test page-ზე Supabase Connected ✅
- [ ] Rows.com Test წარმატებულია ✅
- [ ] Sync მუშაობს ✅

---

**განახლებული**: 2025-01-11
