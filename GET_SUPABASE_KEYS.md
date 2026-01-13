# 🔑 როგორ მივიღო Harmony-ს Supabase Keys

## ✅ Harmony-ს Supabase Project

**Project ID:** `eifaludttgnpoesjewlv`  
**Supabase URL:** `https://eifaludttgnpoesjewlv.supabase.co`

---

## 🚀 როგორ მივიღო Keys

### ვარიანტი 1: თუ გაქვს Supabase Account

1. **გადადი:** https://supabase.com/dashboard/project/eifaludttgnpoesjewlv
2. **Sign In** (თუ არ ხარ შესული)
3. **Settings → API:**
   - **Project URL:** `https://eifaludttgnpoesjewlv.supabase.co`
   - **anon public** key → დააკოპირე
   - **service_role** key → დააკოპირე (⚠️ SECRET!)

### ვარიანტი 2: თუ არ გაქვს Access

1. **გადადი:** https://supabase.com/dashboard
2. **Sign Up** ან **Sign In**
3. **დაამატე Project:**
   - დააჭირე "New Project" ან "Add Project"
   - შეიყვანე Project ID: `eifaludttgnpoesjewlv`
   - ან გადადი პირდაპირ: https://supabase.com/dashboard/project/eifaludttgnpoesjewlv

---

## 📋 რა Keys გჭირდება

### Frontend (`.env` ფაილში):

```env
VITE_SUPABASE_URL=https://eifaludttgnpoesjewlv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
```

### Backend (Supabase Edge Functions Secrets):

```env
SUPABASE_URL=https://eifaludttgnpoesjewlv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)
ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
```

---

## ⚠️ მნიშვნელოვანი

- **anon public key** - Frontend-ისთვის (public, შეიძლება გაზიარება)
- **service_role key** - Backend-ისთვის (SECRET! არ გააზიარო!)

---

## ✅ შემდეგი ნაბიჯები

1. ✅ მიიღე keys Supabase Dashboard-დან
2. ✅ დაამატე `.env` ფაილში
3. ✅ Test: `http://localhost:3000/marketing/instagram/test`

---

**განახლებული:** 2025-01-11
