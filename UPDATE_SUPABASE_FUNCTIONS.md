# 🔧 Update Supabase Edge Functions for CORS Fix

## ⚠️ CORS პრობლემა

Console-ში ჩანს:
```
Access to fetch at 'https://lusagtvxjtfxgfadulgv.supabase.co/functions/v1/clever-endpoint' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ რა გაკეთდა:

1. **CSP Fixed:** დამატებულია `https://*.supabase.co` `connectSrc`-ში
2. **CORS Headers Updated:** დამატებულია `Access-Control-Allow-Methods` header-ი local files-ში

## 🎯 რა უნდა გააკეთო:

**განაახლე `clever-endpoint` function-ის კოდი Supabase Dashboard-ში:**

1. გადადი: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/functions/clever-endpoint/code
2. Code editor-ში ჩაასვი ახალი კოდი `supabase/functions/instagram-test-connection/index.ts`-დან
3. Deploy update

**ან** გამოიყენე Supabase CLI:
```bash
cd supabase
supabase functions deploy clever-endpoint --no-verify-jwt
supabase functions deploy dynamic-endpoint --no-verify-jwt
```

---

**CORS headers ახლა სწორია local files-ში, მაგრამ Supabase-ში უნდა განახლდეს!**
