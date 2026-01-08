# 🚀 Cloud Shell - მარტივი Push ინსტრუქცია

## ❗ პრობლემა:
Script-ს სჭირდება:
1. **რეალური GitHub Token** (არა "YOUR_TOKEN_HERE")
2. **Repository folder-ში იყოს** (სადაც არის ფაილები)
3. **jq installed** (JSON parser)

## ✅ მარტივი გზა - Git პირდაპირ:

### 1. იპოვე რა folder-ში ხარ:
```bash
pwd
ls -la
```

### 2. იპოვე repository folder:
```bash
find ~ -name "orbi-city-hub-main" -type d 2>/dev/null
# ან
find ~ -name "AIDirectorsShowcase.tsx" 2>/dev/null
```

### 3. Navigate to repository:
```bash
cd ~/orbi-city-hub-main/orbi-city-hub-main
# ან სადაც აღმოჩნდა
```

### 4. Check Git Status:
```bash
git status
```

### 5. თუ Git არ არის initialized:
```bash
git init
git remote add origin https://YOUR_REAL_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git
```

### 6. Add, Commit, Push:
```bash
# Add all files
git add .

# Commit
git commit -m "✨ Add 5D AI Directors Showcase with stunning effects"

# Push (გამოიყენე რეალური token!)
git push https://YOUR_REAL_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git main
```

---

## 🔑 GitHub Token-ის მიღება:

1. გადადი: https://github.com/settings/tokens
2. **"Generate new token (classic)"**
3. დაურქმე: `orbi-city-hub-push`
4. Select scope: ✅ **`repo`** (Full control)
5. **Generate token**
6. **დააკოპირე token** (ერთხელ იჩვენება!)

---

## 📋 Checklist:

- [ ] იპოვე repository folder
- [ ] Navigate to folder (cd)
- [ ] Check git status
- [ ] შექმენი GitHub token
- [ ] Add files (git add .)
- [ ] Commit (git commit)
- [ ] Push with real token

---

## 🎯 სწრაფი Commands (Copy-Paste):

```bash
# 1. Find repository
find ~ -name "orbi-city-hub-main" -type d 2>/dev/null | head -1

# 2. Navigate (replace PATH with result above)
cd ~/orbi-city-hub-main/orbi-city-hub-main

# 3. Check Git
git status

# 4. Initialize if needed
git init
git remote add origin https://YOUR_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git

# 5. Add & Commit
git add .
git commit -m "✨ Add 5D AI Directors Showcase"

# 6. Push (REPLACE YOUR_TOKEN with real token!)
git push https://YOUR_TOKEN@github.com/ORBICITY-SYSTEM/orbi-city-hub.git main
```

---

## ⚠️ Important:

**"YOUR_TOKEN_HERE" არის placeholder!** გჭირდება რეალური GitHub token!
