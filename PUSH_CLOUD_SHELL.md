# 🚀 Push to GitHub from Cloud Shell

## ✅ სწრაფი ინსტრუქცია:

### 1. Upload Script to Cloud Shell

Cloud Shell-ში გახსენი editor და შექმენი ახალი ფაილი `push-to-github.sh`:

```bash
nano push-to-github.sh
```

დააკოპირე script-ის შიგთავსი `push-to-github.sh` ფაილიდან.

### 2. Make Script Executable

```bash
chmod +x push-to-github.sh
```

### 3. Run Script with Your Token

```bash
./push-to-github.sh YOUR_GITHUB_TOKEN_HERE
```

**ან** თუ token environment variable-ში გაქვს:

```bash
./push-to-github.sh $GITHUB_TOKEN
```

## 🔑 GitHub Token

თუ არ გაქვს token, შექმენი:

1. გადადი: https://github.com/settings/tokens
2. **"Generate new token" → "Generate new token (classic)"**
3. დაურქმე: `orbi-city-hub-push`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. **"Generate token"**
6. **დააკოპირე token** (ერთხელ იჩვენება!)

## 📝 Alternative: Git Commands (თუ Git installed)

```bash
# Navigate to repository
cd orbi-city-hub-main/orbi-city-hub-main

# Configure Git (if not done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add remote (if not exists)
git remote add origin https://YOUR_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git

# Or update existing remote
git remote set-url origin https://YOUR_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git

# Stage all changes
git add .

# Commit
git commit -m "✨ Add 5D AI Directors Showcase with stunning effects

- Created interactive 5D AI Directors Panel with 3D transforms
- CEO AI personalized prototype (182cm, elegant, professional)
- Marketing, Reservations, Finance, Logistics AI Directors
- Scrolling task marquee with real-time data
- Particle effects, glow animations, professional gestures
- Enhanced Integrations page with Development Tools
- Complete bilingual support (English/Georgian)"

# Push
git push origin main
```

## ✅ Files to Push:

- ✅ AIDirectorsShowcase.tsx
- ✅ AIReservationsDirector.tsx
- ✅ AIFinanceDirector.tsx
- ✅ AILogisticsDirector.tsx
- ✅ Backend routers (3 files)
- ✅ Database migrations (3 SQL files)
- ✅ Modified: Home.tsx, Integrations.tsx, App.tsx, etc.

## 🎉 Success!

ყველაფერი მზადაა! Script-ი ავტომატურად:
- ✅ ამოწმებს ფაილების არსებობას
- ✅ Encodes base64-ში
- ✅ Checks if file exists (create vs update)
- ✅ Uploads via GitHub API
- ✅ Shows progress და summary
