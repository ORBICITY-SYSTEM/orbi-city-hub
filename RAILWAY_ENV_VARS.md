# 🔐 Railway Environment Variables - ORBI City Hub

## ✅ CRITICAL - დაამატეთ ეს variables Railway-ზე

### 1. OAuth & Authentication
```bash
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-manus-app-id
JWT_SECRET=generate-random-secret-here
```

### 2. Manus API Keys
```bash
# Backend (Server-side)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sk-QjjcyRHkTRVCAwaCl4qkt4JpVwvLwmL2g86qYKCBLOBnzw5rmYsZ_R-qgqTLBDMeeSqX7pVxnlT_WK_QkGTSkSmwSgyd

# Frontend (Client-side)
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=sk-QjjcyRHkTRVCAwaCl4qkt4JpVwvLwmL2g86qYKCBLOBnzw5rmYsZ_R-qgqTLBDMeeSqX7pVxnlT_WK_QkGTSkSmwSgyd
```

### 3. Google Gemini AI
```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Database (Railway MySQL)
```bash
DATABASE_URL=mysql://root:password@mysql.railway.internal:3306/railway
# ↑ Railway-ს MySQL service-დან აიღეთ ეს URL
```

### 5. Owner Information
```bash
OWNER_OPEN_ID=your-manus-openid
OWNER_NAME=TAMAR MAKHARADZE
```

### 6. App Configuration
```bash
VITE_APP_TITLE=ORBI City Hub
VITE_APP_LOGO=https://your-logo-url.com/logo.png
NODE_ENV=production
PORT=8080
```

### 7. Analytics (Optional)
```bash
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

---

## 📋 როგორ დავამატოთ Railway-ზე?

1. გადადით: https://railway.com/project/2d59337c-f8c7-4c41-8793-f9e677dac342
2. დააჭირეთ **orbi-city-hub** service-ს
3. გადადით **Variables** tab-ზე
4. დააჭირეთ **+ New Variable**
5. დაამატეთ თითოეული variable ზემოდან
6. Railway ავტომატურად გააკეთებს **Redeploy**

---

## ⚠️ რა უნდა შეცვალოთ?

### DATABASE_URL
Railway-ს MySQL service-ში:
1. გადადით MySQL service-ზე
2. Variables tab → `DATABASE_URL` დააკოპირეთ
3. ჩასვით orbi-city-hub Variables-ში

### JWT_SECRET
Generate random string:
```bash
openssl rand -base64 32
```

### VITE_APP_ID
Manus dashboard-დან აიღეთ თქვენი App ID

### OWNER_OPEN_ID
Manus dashboard-დან აიღეთ თქვენი OpenID

---

## ✅ როდესაც ყველა Variable დაამატეთ:

1. Railway ავტომატურად დაიწყებს **Redeploy**
2. დაელოდეთ 2-3 წუთს
3. შეამოწმეთ: https://orbi-city-hub-production.up.railway.app
4. Dashboard უნდა გაიხსნას წარმატებით! 🎉

---

## 🔍 Debug Commands

თუ კვლავ error-ია:

### Railway Logs-ის შემოწმება:
```
Railway → orbi-city-hub → Deployments → View Logs
```

### ძებნა logs-ში:
- `ERROR`
- `ENOENT`
- `undefined`
- `Missing environment variable`

---

## 📞 Support

თუ პრობლემა გრძელდება:
- Email: info@orbicitybatumi.com
- Railway Support: help.railway.app
