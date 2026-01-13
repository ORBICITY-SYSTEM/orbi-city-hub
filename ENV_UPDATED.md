# ✅ .env ფაილი განახლებულია!

## 🎉 რა გაკეთდა

1. ✅ **VITE_SUPABASE_URL** დამატებულია: `https://lusagtvxjtfxgfadulgv.supabase.co`
2. ✅ **VITE_SUPABASE_PUBLISHABLE_KEY** დამატებულია: `sb_publishable_RnOx2FVP6D5iklmcYamGqQ_UiPBTsbi`
3. ⏳ **SUPABASE_SERVICE_ROLE_KEY** - ჯერ არ არის დამატებული (უნდა მივიღო browser-ში)

---

## 📋 შემდეგი ნაბიჯები

### STEP 1: მიიღე Service Role Key

1. **Browser-ში:** `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/settings/api-keys/legacy`
2. **ვნახე:** "service_role" section (ეს key-ი "bypass Row Level Security"-ს შეუძლია)
3. **დააჭირე:** "Reveal" ღილაკს (თუ key დამალულია)
4. **დააკოპირე:** service_role key

### STEP 2: დაამატე Service Role Key .env-ში

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### STEP 3: Deploy Edge Functions

Edge Functions-ის დეპლოირებისთვის:
1. გადადი: `https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions`
2. დააჭირე "Create a new function"
3. Upload `supabase/functions/instagram-test-connection` და `supabase/functions/instagram-sync-cron`

ან გამოიყენე Supabase CLI (თუ დაყენებულია).

---

**Publishable key დამატებულია! ახლა service_role key-ის მიღება და Edge Functions-ის დეპლოირება!**
