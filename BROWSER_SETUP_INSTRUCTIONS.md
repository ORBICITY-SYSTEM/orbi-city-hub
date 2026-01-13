# 🌐 Browser Setup Instructions - Supabase Project

## ✅ რა გაკეთდა

1. ✅ Browser-ში Supabase გახსნილია
2. ✅ Organization-ში ვართ: `info@orbicitybatumi.com`
3. ✅ "New project" form-ზე ვართ

---

## 🚀 შემდეგი ნაბიჯები (Browser-ში)

### STEP 1: შეავსე Form (1 წუთი)

Browser-ში form-ზე:

1. **Project Name:** `orbi-city-hub` (ან რა გინდა)
2. **Database Password:** შეიყვანე ძლიერი პაროლი (მინიმუმ 12 სიმბოლო)
3. **Region:** აირჩიე `Europe West` (ან უახლოესი)
4. **დააჭირე:** "Create new project"

### STEP 2: დაელოდე Project-ის შექმნას (2-3 წუთი)

Supabase შექმნის project-ს. დაელოდე რომ გამოჩნდეს:
- ✅ "Project is ready!"
- ✅ Project dashboard

### STEP 3: მიიღე Keys (1 წუთი)

1. **გადადი:** Settings → API (მარცხენა მენიუში)
2. **დააკოპირე:**
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET!)

### STEP 4: შექმენი Database Tables (1 წუთი)

1. **გადადი:** SQL Editor (მარცხენა მენიუში)
2. **დააჭირე:** "New query"
3. **გახსენი ფაილი:** `supabase/setup-database.sql`
4. **დააკოპირე** მთელი შიგთავსი
5. **ჩასვი** SQL Editor-ში
6. **დააჭირე:** "RUN"
7. **დაადასტურე:** "Success. No rows returned"

---

## 🔧 STEP 5: Deploy Edge Functions (ტერმინალში)

```powershell
cd "C:\Users\tamuna.makharad_Medi\Desktop\ARCHITECTURE ORBI CITY\MTAVARI\github\program\orbi-city-hub-main\orbi-city-hub-main"
.\use-nodejs.ps1

# Install Supabase CLI (ერთჯერ)
npm install -g supabase

# Login
supabase login

# Link project (შეიყვანე project ID - URL-დან)
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy instagram-test-connection
supabase functions deploy instagram-sync-cron

# Set secrets
supabase secrets set ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
supabase secrets set ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 📋 STEP 6: Environment Variables

**შექმენი/განაახლე `.env` ფაილი:**

```env
# Supabase (Frontend)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (Backend - Edge Functions)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

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

**Browser-ში form-ზე ვართ. შეავსე form და დააჭირე "Create new project"!**
