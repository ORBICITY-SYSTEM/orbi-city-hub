# 🚀 ORBI City Hub - Development Workflow Guide

## ✅ მიმდინარე სტატუსი

- **Live URL:** https://team.orbicitybatumi.com
- **GitHub:** https://github.com/ORBICITY-SYSTEM/orbi-city-hub
- **Railway:** https://railway.com/project/2d59337c-f8c7-4c41-8793-f9e677dac342
- **Tech Stack:** React 19 + tRPC + Express + MySQL + Railway
- **Auto-Deploy:** ✅ GitHub → Railway (ავტომატური)

---

## 🎯 როგორ დავამატო/შევცვალო რამე Dashboard-ზე?

### **3 გზა გაქვთ:**

---

## 📱 **გზა 1: Manus AI-ით (ყველაზე ადვილი)** ⭐ **RECOMMENDED**

**როდის გამოიყენოთ:**
- სწრაფი ცვლილებები (UI tweaks, ახალი გვერდები, bug fixes)
- არ გჭირდებათ local development environment
- AI-მ თვითონ დაწეროს კოდი

**როგორ:**

1. **Manus Chat-ში დაწერეთ:**
   ```
   "დაამატე ახალი გვერდი Dashboard-ზე რომელიც აჩვენებს..."
   "შეცვალე Finance Dashboard-ის ფერები..."
   "დაამატე ახალი ღილაკი რომელიც..."
   ```

2. **Manus AI:**
   - დაწერს კოდს
   - შეამოწმებს
   - GitHub-ზე დაპუშავს
   - Railway ავტომატურად გააკეთებს deploy

3. **შედეგი:**
   - 2-5 წუთში ცვლილებები LIVE-ზე! 🚀

**მაგალითი:**
```
"დაამატე CEO Dashboard-ზე ახალი card რომელიც აჩვენებს 
დღევანდელ check-in-ების რაოდენობას"
```

---

## 💻 **გზა 2: Local Development (თქვენ თვითონ კოდი)** 

**როდის გამოიყენოთ:**
- დიდი ფუნქციონალობის დამატება
- კომპლექსური ლოგიკა
- თქვენ გინდათ კოდის სრული კონტროლი

**Setup (ერთხელ):**

```bash
# 1. Clone repository
git clone https://github.com/ORBICITY-SYSTEM/orbi-city-hub.git
cd orbi-city-hub

# 2. Install dependencies
pnpm install

# 3. Create .env file
cp .env.example .env
# შეავსეთ .env ფაილი Railway-ს variables-ით

# 4. Start development server
pnpm dev
```

**Development Loop:**

```bash
# 1. შექმენით ახალი branch
git checkout -b feature/new-dashboard-card

# 2. გააკეთეთ ცვლილებები
# - client/src/pages/ - ახალი გვერდები
# - client/src/components/ - ახალი კომპონენტები
# - server/routers.ts - ახალი API endpoints

# 3. ტესტირება local-ზე
pnpm dev
# ნახეთ: http://localhost:3000

# 4. Commit & Push
git add .
git commit -m "Add new dashboard card"
git push origin feature/new-dashboard-card

# 5. GitHub-ზე შექმენით Pull Request
# 6. Merge → Railway ავტომატურად deploy-ს გააკეთებს
```

---

## 🔗 **გზა 3: Google Apps Script Integration** 

**როდის გამოიყენოთ:**
- Google Sheets-დან მონაცემების სინქრონიზაცია
- Gmail-დან ავტომატური booking-ების წაკითხვა
- Google Calendar events-ის ინტეგრაცია

**Setup:**

### **A. Google Sheets → Dashboard**

**Use Case:** Google Sheets-ში ფინანსური მონაცემები → Dashboard-ზე real-time განახლება

```javascript
// Google Apps Script (Google Sheets → Railway API)

function syncFinanceData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Finance');
  const data = sheet.getDataRange().getValues();
  
  // Parse data
  const financeData = data.slice(1).map(row => ({
    date: row[0],
    revenue: row[1],
    expenses: row[2],
    profit: row[3]
  }));
  
  // Send to Railway API
  const url = 'https://team.orbicitybatumi.com/api/trpc/finance.syncFromSheets';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ data: financeData }),
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  };
  
  UrlFetchApp.fetch(url, options);
  Logger.log('Finance data synced!');
}

// Trigger: Run every hour
// Edit → Current project's triggers → Add Trigger
// syncFinanceData → Time-driven → Hour timer → Every hour
```

### **B. Gmail → Dashboard (Booking Emails)**

**Use Case:** Booking.com-ის emails → Dashboard-ზე ავტომატური დამატება

```javascript
// Google Apps Script (Gmail → Railway API)

function processBookingEmails() {
  const threads = GmailApp.search('from:noreply@booking.com is:unread');
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    
    messages.forEach(message => {
      const body = message.getPlainBody();
      
      // Extract booking details (AI-ით უკეთესია)
      const bookingData = {
        guestName: extractGuestName(body),
        checkIn: extractCheckIn(body),
        checkOut: extractCheckOut(body),
        roomNumber: extractRoomNumber(body),
        price: extractPrice(body)
      };
      
      // Send to Railway API
      const url = 'https://team.orbicitybatumi.com/api/trpc/reservations.createFromEmail';
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(bookingData),
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY'
        }
      };
      
      UrlFetchApp.fetch(url, options);
      
      // Mark as read
      message.markRead();
    });
  });
}

// Trigger: Run every 15 minutes
```

---

## 🔄 **Auto-Sync Workflow (Best Practice)**

### **Architecture:**

```
Google Sheets/Gmail/Calendar
         ↓
   Apps Script (Trigger)
         ↓
   Railway API (tRPC)
         ↓
   MySQL Database
         ↓
   React Dashboard (Real-time)
```

### **რა უნდა შევქმნათ:**

#### **1. tRPC API Endpoints (Backend)**

`server/routers.ts`:

```typescript
// Add to appRouter
finance: router({
  syncFromSheets: protectedProcedure
    .input(z.object({
      data: z.array(z.object({
        date: z.string(),
        revenue: z.number(),
        expenses: z.number(),
        profit: z.number()
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      // Save to database
      await db.insertFinanceData(input.data);
      return { success: true };
    }),
}),

reservations: router({
  createFromEmail: protectedProcedure
    .input(z.object({
      guestName: z.string(),
      checkIn: z.string(),
      checkOut: z.string(),
      roomNumber: z.string(),
      price: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      // Save booking to database
      await db.insertBooking(input);
      return { success: true };
    }),
}),
```

#### **2. Frontend Real-time Updates**

`client/src/pages/Finance.tsx`:

```typescript
// Auto-refresh every 30 seconds
const { data: financeData } = trpc.finance.getLatest.useQuery(
  undefined,
  {
    refetchInterval: 30000, // 30 seconds
  }
);
```

---

## 🎯 **Railway + GitHub Tandem (Auto-Deploy)**

### **როგორ მუშაობს:**

```
1. თქვენ → Git Push → GitHub
2. GitHub → Webhook → Railway
3. Railway → Auto Build → Auto Deploy
4. team.orbicitybatumi.com → LIVE! ✅
```

### **რას ნიშნავს ეს:**

- ✅ **არ გჭირდებათ manual deploy**
- ✅ **Git Push = Auto Deploy**
- ✅ **Rollback ადვილია** (Railway → Deployments → Rollback)
- ✅ **Version Control** (GitHub commits = deployment history)

### **Best Practices:**

1. **Feature Branches:**
   ```bash
   git checkout -b feature/new-feature
   # Work on feature
   git push origin feature/new-feature
   # Create Pull Request on GitHub
   # Merge → Auto Deploy
   ```

2. **Staging Environment:**
   - Railway-ზე შექმენით **staging** environment
   - Test changes before production

3. **Environment Variables:**
   - Railway Variables-ში ინახება
   - არ დაკომიტოთ `.env` ფაილები GitHub-ზე!

---

## 📊 **Real-time Data Sources Integration**

### **რა წყაროებიდან შეიძლება მონაცემების მიღება:**

1. **Google Sheets** (Finance, Inventory)
   - Apps Script → Railway API
   - Trigger: Every hour

2. **Gmail** (Booking confirmations)
   - Apps Script → Railway API
   - Trigger: Every 15 minutes

3. **Booking.com API** (Direct integration)
   - Railway Cron Job → Booking.com API
   - Trigger: Every 30 minutes

4. **Google Calendar** (Events, Maintenance)
   - Apps Script → Railway API
   - Trigger: Real-time (Calendar webhook)

5. **WhatsApp Business API** (Guest messages)
   - Webhook → Railway API
   - Trigger: Real-time

---

## 🛠️ **Quick Commands**

### **Local Development:**
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm db:push      # Update database schema
```

### **Git Workflow:**
```bash
git status                    # Check changes
git add .                     # Stage all changes
git commit -m "message"       # Commit
git push origin main          # Push to GitHub (auto-deploy!)
```

### **Railway CLI (Optional):**
```bash
npm install -g @railway/cli
railway login
railway up                    # Deploy from local
railway logs                  # View logs
railway run pnpm db:push      # Run commands on Railway
```

---

## 🎓 **რას ვურჩევ:**

### **მცირე ცვლილებებისთვის (UI, Tweaks):**
→ **Manus AI** (ყველაზე სწრაფი)

### **ახალი Features:**
→ **Local Development** (თქვენ თვითონ კოდი)

### **External Data Sync:**
→ **Google Apps Script** (ავტომატური სინქრონიზაცია)

### **Production Workflow:**
```
Google Sheets/Gmail → Apps Script → Railway API → Database → Dashboard
```

---

## 📞 **დახმარება:**

- **GitHub Issues:** https://github.com/ORBICITY-SYSTEM/orbi-city-hub/issues
- **Railway Support:** help.railway.app
- **Manus AI:** უბრალოდ დაწერეთ რა გინდათ!

---

## 🎉 **Next Steps:**

1. ✅ Dashboard LIVE-ია
2. 🔄 Google Sheets integration setup
3. 📧 Gmail booking automation
4. 📊 Real-time data sync
5. 🚀 Continuous improvements!

**გსურთ რომელიმე ინტეგრაციის setup-ი ახლავე?** 🚀
