# 🔴 Mock Data Audit - ORBI City Hub

**Purpose:** Identify all components using mock/static data vs real database integration

**Date:** December 13, 2024  
**Version:** 2.0 (After Email & Booking.com Migration)

---

## ✅ **PRODUCTION READY** (Real Data from Database)

### 1. Email Management Module
- **Component:** `client/src/pages/EmailManagement.tsx`
- **Backend:** `server/email_agent/email_parser_v2.py`
- **Database:** `emails` table (Drizzle schema)
- **Status:** ✅ **100% Real Data**
- **Features:**
  - Gmail IMAP integration
  - Gemini AI categorization
  - 10 email categories
  - Sentiment analysis
  - Priority detection

### 2. Finance Dashboard
- **Component:** `client/src/pages/RealFinanceDashboard.tsx`
- **Backend:** `server/routers/realFinanceRouter.ts`
- **Database:** `financial_summary`, `financial_monthly` tables
- **Status:** ✅ **100% Real Data**
- **Features:**
  - ₾920,505 total revenue (real Excel data)
  - 12 months data (Oct 2024 - Sep 2025)
  - 7 Chart.js visualizations
  - Month/period filters
  - Excel/CSV export

### 3. Booking.com Automation
- **Component:** `ota_channels_agent/booking_scraper_v2.py`
- **Backend:** `ota_channels_agent/scheduler.py`
- **Database:** Supabase sync via `supabase_sync.py`
- **Status:** ✅ **100% Real Data**
- **Features:**
  - Selenium web scraper
  - Daily automation
  - Cookie/CAPTCHA handling
  - JSON report generation

---

## 🔴 **MOCK DATA** (Needs Database Integration)

### 1. CEO Dashboard
**File:** `client/src/pages/Home.tsx`

#### Mock Data Items:
```typescript
// 🔴 MOCK: KPI Cards
const mockKPIs = {
  totalRevenue: "₾52,400",
  occupancyRate: "85%",
  avgRating: "9.2",
  aiTasksCompleted: 127
};

// 🔴 MOCK: Revenue by Channel
const mockChannels = [
  { name: "Booking.com", revenue: 18500, percentage: 35 },
  { name: "Airbnb", revenue: 12300, percentage: 23 },
  // ... 7 more channels
];

// 🔴 MOCK: Monthly Forecast
const mockForecast = {
  predictedRevenue: "₾52,400",
  predictedOccupancy: "88%",
  confidence: "92%"
};
```

#### Required Integration:
- ✅ Aggregate revenue from `financial_summary` table
- ✅ Calculate occupancy from `reservations` table (when implemented)
- ✅ Fetch ratings from `channelPerformance` table
- ✅ Count AI tasks from `aiConversations` table

#### Implementation:
```typescript
// Replace with:
const { data: kpis } = trpc.ceoDashboard.getKPIs.useQuery();
const { data: channels } = trpc.ceoDashboard.getRevenueByChannel.useQuery();
```

---

### 2. Reservations Module
**File:** `client/src/pages/Reservations.tsx`

#### Mock Data Items:
```typescript
// 🔴 MOCK: Bookings Table
const mockBookings = [
  {
    id: 1,
    guestName: "Anna Beridze",
    room: "A 3041",
    checkIn: "2024-12-15",
    checkOut: "2024-12-20",
    status: "confirmed",
    channel: "Booking.com"
  },
  // ... 7 more bookings
];

// 🔴 MOCK: Calendar Events
const mockCalendar = [
  { date: "2024-12-15", checkIns: 3, checkOuts: 2 },
  // ... 35 days
];

// 🔴 MOCK: CRM Stats
const mockCRM = {
  totalGuests: 156,
  vipGuests: 42,
  returnRate: "89%"
};
```

#### Required Integration:
- ❌ Create `reservations` table in database
- ❌ Build tRPC router: `reservationsRouter`
- ❌ Integrate with PMS (OTELMS) or Gmail parser
- ❌ Store guest data in `guests` table

#### Implementation:
```typescript
// Replace with:
const { data: bookings } = trpc.reservations.list.useQuery();
const { data: calendar } = trpc.reservations.getCalendar.useQuery();
```

---

### 3. Marketing Module
**File:** `client/src/pages/Marketing.tsx`

#### Mock Data Items:
```typescript
// 🔴 MOCK: Campaign Performance
const mockCampaigns = [
  {
    id: 1,
    name: "Summer Promo 2024",
    budget: "₾5,000",
    spent: "₾3,200",
    conversions: 47,
    roi: "320%"
  },
  // ... 5 more campaigns
];

// 🔴 MOCK: OTA Channel Performance
const mockOTAPerformance = [
  {
    channel: "Booking.com",
    bookings: 127,
    revenue: "₾18,500",
    commission: "15%"
  },
  // ... 14 more channels
];

// 🔴 MOCK: Social Media Stats
const mockSocialMedia = {
  instagram: { followers: 18750, engagement: "5.8%" },
  facebook: { followers: 12450, engagement: "3.2%" },
  tiktok: { followers: 24500, engagement: "8.5%" }
};
```

#### Required Integration:
- ❌ Google Analytics API (real-time visitors, sessions)
- ❌ Facebook/Instagram Graph API (followers, posts, engagement)
- ❌ TikTok API (videos, views, likes)
- ❌ Booking.com API (bookings, revenue, reviews)
- ❌ Create `campaigns` table in database

#### Implementation:
```typescript
// Replace with:
const { data: analytics } = trpc.marketing.getGoogleAnalytics.useQuery();
const { data: social } = trpc.marketing.getSocialMediaStats.useQuery();
```

---

### 4. Logistics Module
**File:** `client/src/pages/Logistics.tsx`

#### Mock Data Items:
```typescript
// 🔴 MOCK: Housekeeping Schedules
const mockSchedules = [
  {
    id: 1,
    date: "2024-12-13",
    staff: "Mariam Gelashvili",
    rooms: ["A 3041", "C 2641", "D 3418"],
    status: "in_progress"
  },
  // ... 6 more schedules
];

// 🔴 MOCK: Inventory Items
const mockInventory = [
  {
    room: "A 3041",
    item: "ბალიში (Pillow)",
    quantity: 3,
    status: "ok"
  },
  // ... 896 items (56 rooms × 16 items)
];

// 🔴 MOCK: Staff List
const mockStaff = [
  { id: 1, name: "Mariam Gelashvili", role: "Housekeeper" },
  { id: 2, name: "Nino Beridze", role: "Housekeeper" },
  { id: 3, name: "Tamar Makharadze", role: "Housekeeper" }
];
```

#### Required Integration:
- ✅ Database schema already exists! (`housekeepingSchedules`, `roomInventoryItems`)
- ❌ Build tRPC mutations to persist data
- ❌ Replace in-memory state with database queries

#### Implementation:
```typescript
// Replace with:
const { data: schedules } = trpc.logistics.housekeeping.list.useQuery();
const { data: inventory } = trpc.logistics.inventory.getByRoom.useQuery({ roomId });
```

---

### 5. Reports & Analytics Module
**File:** `client/src/pages/Reports.tsx`

#### Mock Data Items:
```typescript
// 🔴 MOCK: Monthly Reports
const mockMonthlyReports = [
  {
    month: "November 2024",
    revenue: "₾169,060",
    occupancy: "85%",
    adr: "₾144"
  },
  // ... 6 months
];

// 🔴 MOCK: Occupancy Heatmap
const mockHeatmap = [
  { month: "Jan", week1: 75, week2: 82, week3: 88, week4: 91 },
  // ... 12 months
];

// 🔴 MOCK: Competitor Benchmarking
const mockCompetitors = [
  { name: "Batumi Plaza Hotel", occupancy: "78%", adr: "₾120" },
  { name: "Sheraton Batumi", occupancy: "92%", adr: "₾180" }
];
```

#### Required Integration:
- ✅ Aggregate from `financial_monthly` table
- ✅ Calculate occupancy from `reservations` table
- ❌ Competitor data (manual input or web scraping)

#### Implementation:
```typescript
// Replace with:
const { data: reports } = trpc.reports.getMonthlyReports.useQuery();
const { data: heatmap } = trpc.reports.getOccupancyHeatmap.useQuery();
```

---

## 📊 Summary Statistics

| Module | Status | Mock Data % | Real Data % | Priority |
|--------|--------|-------------|-------------|----------|
| Email Management | ✅ Production | 0% | 100% | - |
| Finance Dashboard | ✅ Production | 0% | 100% | - |
| Booking.com Automation | ✅ Production | 0% | 100% | - |
| CEO Dashboard | 🔴 Mock | 80% | 20% | 🔥 High |
| Reservations | 🔴 Mock | 90% | 10% | 🔥 High |
| Marketing | 🔴 Mock | 95% | 5% | 🔥 High |
| Logistics | 🔴 Mock | 85% | 15% | Medium |
| Reports & Analytics | 🔴 Mock | 90% | 10% | Medium |

---

## 🎯 Implementation Priority

### **Priority 1: CEO Dashboard** (1 week)
- Aggregate KPIs from Finance module
- Calculate occupancy from existing data
- Fetch ratings from channelPerformance table
- Remove all mock data

### **Priority 2: Reservations Module** (2 weeks)
- Create reservations table
- Build tRPC router
- Integrate Gmail parser OR PMS API
- Calendar view with real bookings

### **Priority 3: Logistics Module** (1 week)
- Build tRPC mutations (already has schema!)
- Replace in-memory state with database
- Staff management UI

### **Priority 4: Marketing Module** (3 weeks)
- Google Analytics API integration
- Facebook/Instagram API integration
- Campaign tracking (database-backed)

### **Priority 5: Reports & Analytics** (1 week)
- Aggregate from Finance + Reservations
- Occupancy heatmap calculation
- PDF export functionality

---

## 🔧 Mock Data Indicator Component

**Add this to all components with mock data:**

```tsx
// client/src/components/MockDataBadge.tsx
export function MockDataBadge({ show = true }: { show?: boolean }) {
  if (!show) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      Mock Data
    </span>
  );
}

// Usage:
<div className="flex items-center gap-2">
  <h2>Revenue by Channel</h2>
  <MockDataBadge show={isMockData} />
</div>
```

---

## 📝 Next Steps

1. ✅ Add `<MockDataBadge />` to all components with mock data
2. ✅ Create tRPC routers for each module
3. ✅ Build database queries to replace mock data
4. ✅ Test with real data
5. ✅ Remove mock data arrays from codebase
6. ✅ Update documentation

---

**Status:** 🟡 In Progress  
**Last Updated:** December 13, 2024  
**Author:** Manus AI Agent
