# ✅ SQL Tables შექმნილია!

## 🎉 რა გაკეთდა

1. ✅ SQL Editor-ში ჩავსვი `supabase/setup-database.sql` script
2. ✅ Ctrl+Enter დავაჭირე და SQL script გავუშვი
3. ✅ Tables შექმნილია:
   - `instagram_daily_metrics`
   - `instagram_posts`
   - `instagram_summary`
   - `instagram_weekly_stats`

---

## 📋 შემდეგი ნაბიჯები

### STEP 1: მიიღე API Keys (1 წუთი)

1. **გადადი:** Settings → API
   - URL: `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/settings/api`
2. **დააკოპირე:**
   - **Project URL:** `https://lusagtvxjtfxgfadulgv.supabase.co`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET!)

---

### STEP 2: Deploy Edge Functions (ტერმინალში)

```powershell
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
.\use-nodejs.ps1

# Install Supabase CLI (ერთჯერ)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref lusagtvxjtfxgfadulgv

# Deploy functions
supabase functions deploy instagram-test-connection
supabase functions deploy instagram-sync-cron

# Set secrets
supabase secrets set ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
supabase secrets set ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
supabase secrets set SUPABASE_URL=https://lusagtvxjtfxgfadulgv.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

### STEP 3: Environment Variables

**შექმენი/განაახლე `.env` ფაილი:**

```env
# Supabase (Frontend)
VITE_SUPABASE_URL=https://lusagtvxjtfxgfadulgv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)

# Supabase (Backend - Edge Functions)
SUPABASE_URL=https://lusagtvxjtfxgfadulgv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)

# Rows.com (Edge Functions)
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

---

## ✅ Test

1. **გაუშვი server:**
   ```powershell
   pnpm dev
   ```

2. **გადადი:**
   ```
   http://localhost:3000/marketing/instagram/test
   ```

3. **შეამოწმე:**
   - ✅ Supabase Configuration: **Connected**
   - ✅ Test Rows.com Connection: **Success**

---

**Tables მზადაა! ახლა API Keys-ის მიღება და Edge Functions-ის დეპლოირება!**
