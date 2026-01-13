# 🔑 Supabase API Keys - როგორ მივიღო

## 📋 Browser-ში

1. **გადადი:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/settings/api-keys/legacy`
2. **ვნახე:**
   - **anon key** - "This key is safe to use in a browser..."
   - **service_role key** - "This key has the ability to bypass Row Level Security..."
3. **დააჭირე "Reveal"** ღილაკებს (თუ keys-ები დამალულია)
4. **დააკოპირე** keys-ები

---

## 🔧 .env ფაილში დაამატე:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://lusagtvxjtfxgfadulgv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)
```

---

## ⚠️ Supabase CLI Installation

Supabase CLI-ს არ შეიძლია `npm install -g`-ით დაყენება. გამოიყენე:

### Windows (PowerShell):
```powershell
# Option 1: Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Option 2: Direct download
# Download from: https://github.com/supabase/cli/releases
```

### ან გამოიყენე Supabase Dashboard-ის Edge Functions UI:
1. გადადი: `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`
2. დააჭირე "Create a new function"
3. Upload `supabase/functions/instagram-test-connection` და `supabase/functions/instagram-sync-cron`

---

**პირველ რიგში API Keys-ები დაამატე `.env`-ში!**
