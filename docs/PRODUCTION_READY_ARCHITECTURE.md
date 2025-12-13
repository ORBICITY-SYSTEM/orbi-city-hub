# 🏗️ ORBI City Hub - Production-Ready Architecture Plan

**Date:** December 13, 2024  
**Version:** 2.0 (After Email & Booking.com Migration)  
**Goal:** Transform ORBI City Hub into a **White-Label SaaS Hotel ERP** ready for sale

---

## 📊 Current Status Analysis

### ✅ **What's Already Integrated (Real Data):**

1. **Email Management** ✅
   - Gmail IMAP parser with Gemini AI categorization
   - Emails table in database (Drizzle schema)
   - React UI: EmailAgent.tsx, EmailManagement.tsx
   - Route: `/email-management`
   - **Status:** PRODUCTION READY

2. **Booking.com Automation** ✅
   - Selenium web scraper (v1, v2)
   - Scheduler for daily automation
   - Supabase sync scripts
   - **Status:** PRODUCTION READY

3. **Finance Dashboard** ✅
   - Real data from Excel (₾920,505 total revenue)
   - Database: financial_summary, financial_monthly tables
   - 7 Chart.js visualizations
   - Month/period filters
   - Excel/CSV export
   - **Status:** PRODUCTION READY

4. **Database Schema** ✅
   - 31 tables (users, emails, financial_summary, etc.)
   - Drizzle ORM with MySQL/TiDB
   - **Status:** PRODUCTION READY

---

### 🔴 **What's Still Mock Data (Needs Integration):**

| Module | Status | Mock Data Items | Integration Needed |
|--------|--------|-----------------|-------------------|
| **CEO Dashboard** | 🔴 50% Mock | KPIs, Revenue by Channel, Monthly Forecast | Aggregate from Finance + Reservations |
| **Reservations** | 🔴 80% Mock | Bookings table, Calendar, CRM stats | PMS API (OTELMS), OTA APIs |
| **Marketing** | 🔴 90% Mock | Campaigns, OTA performance, Social media | Google Analytics, Facebook/Instagram APIs |
| **Logistics** | 🔴 95% Mock | Housekeeping schedules, Inventory | Database persistence (already has schema) |
| **Reports & Analytics** | 🔴 90% Mock | Monthly reports, Occupancy heatmap | Aggregate from all modules |

---

## 🎯 Production-Ready Architecture Plan

### **Phase 1: Configuration System (White-Label Foundation)**

**Goal:** Make the system configurable for any hotel

#### 1.1 Hotel Settings Table
```sql
CREATE TABLE hotel_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hotel_name VARCHAR(255) NOT NULL,
  hotel_logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#10b981',
  secondary_color VARCHAR(7) DEFAULT '#3b82f6',
  total_rooms INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'GEL',
  timezone VARCHAR(50) DEFAULT 'Asia/Tbilisi',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.2 Settings UI Component
- `/settings` route
- Hotel name, logo upload (S3)
- Color picker for branding
- Room count configuration
- Currency selector (GEL, USD, EUR, RUB)
- Language selector (Georgian, English, Russian)

#### 1.3 Environment Variables
```bash
# Replace hard-coded values with:
VITE_HOTEL_NAME=${hotel_settings.hotel_name}
VITE_HOTEL_LOGO=${hotel_settings.hotel_logo_url}
VITE_PRIMARY_COLOR=${hotel_settings.primary_color}
```

---

### **Phase 2: Remove Hard-Coded ORBI Data**

#### 2.1 Replace Static Text
- ❌ Remove: "ORBI City Batumi", "60 rooms", "A 3041, C 2641"
- ✅ Replace with: `{hotelSettings.hotel_name}`, `{hotelSettings.total_rooms}`

#### 2.2 Dynamic Room Management
```typescript
// Create rooms table
CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_number VARCHAR(50) NOT NULL,
  room_type ENUM('studio', 'apartment', 'suite') NOT NULL,
  floor INT,
  status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.3 Mock Data Indicators
Add **🔴 red badge** to components with mock data:
```tsx
{isMockData && (
  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
    🔴 Mock Data
  </span>
)}
```

---

### **Phase 3: API Integration Framework**

#### 3.1 Integration Registry
```typescript
// server/integrations/registry.ts
export const integrations = {
  pms: {
    otelms: { enabled: false, credentials: null },
    opera: { enabled: false, credentials: null },
    cloudbeds: { enabled: false, credentials: null }
  },
  ota: {
    booking: { enabled: true, credentials: { email: '...', password: '...' } },
    airbnb: { enabled: false, credentials: null },
    expedia: { enabled: false, credentials: null }
  },
  payment: {
    stripe: { enabled: false, credentials: null },
    tbcpay: { enabled: false, credentials: null },
    bog: { enabled: false, credentials: null }
  },
  marketing: {
    google_analytics: { enabled: false, credentials: null },
    facebook: { enabled: false, credentials: null },
    instagram: { enabled: false, credentials: null }
  }
};
```

#### 3.2 Integration Manager UI
- `/integrations` route
- List of available integrations
- Enable/disable toggle
- Credentials input (encrypted storage)
- Test connection button
- Status indicators (🟢 connected, 🔴 disconnected, 🟡 error)

#### 3.3 Plugin Architecture
```typescript
// server/integrations/base.ts
export abstract class Integration {
  abstract name: string;
  abstract test(): Promise<boolean>;
  abstract sync(): Promise<void>;
  abstract getStatus(): Promise<IntegrationStatus>;
}

// Example: OTELMS Plugin
export class OTELMSIntegration extends Integration {
  name = 'OTELMS';
  
  async test() {
    // Test PMS connection
  }
  
  async sync() {
    // Fetch reservations, sync to database
  }
}
```

---

### **Phase 4: Multi-Tenant Architecture (SaaS Ready)**

#### 4.1 Tenant Isolation
```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subdomain VARCHAR(50) UNIQUE NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  database_name VARCHAR(100) NOT NULL,
  plan ENUM('free', 'basic', 'pro', 'enterprise') DEFAULT 'free',
  status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example:
-- subdomain: 'orbi-city'
-- URL: https://orbi-city.hotelerp.com
-- database: tenant_orbi_city
```

#### 4.2 Tenant Middleware
```typescript
// server/middleware/tenant.ts
export async function getTenantFromRequest(req: Request) {
  const subdomain = req.hostname.split('.')[0];
  const tenant = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
  
  // Switch database connection
  const tenantDb = drizzle(tenant.database_name);
  return { tenant, db: tenantDb };
}
```

#### 4.3 Admin Portal
- `/admin` route (super admin only)
- List all tenants
- Create new tenant (auto-provision database)
- Suspend/activate tenants
- View usage statistics
- Billing management

---

### **Phase 5: Data Migration & Seeding**

#### 5.1 CEO Dashboard (Aggregate Real Data)
```typescript
// server/routers/ceoDashboard.ts
export const ceoDashboardRouter = router({
  getKPIs: publicProcedure.query(async ({ ctx }) => {
    // Aggregate from finance, reservations, logistics
    const revenue = await getMonthlyRevenue(ctx.db);
    const occupancy = await getOccupancyRate(ctx.db);
    const rating = await getAverageRating(ctx.db);
    
    return { revenue, occupancy, rating, isMockData: false };
  })
});
```

#### 5.2 Reservations Module
- **Option A:** PMS API Integration (OTELMS, Opera)
- **Option B:** Gmail IMAP parsing (already implemented)
- **Option C:** Manual CSV import

```typescript
// server/routers/reservations.ts
export const reservationsRouter = router({
  importFromPMS: protectedProcedure.mutation(async ({ ctx }) => {
    const pmsIntegration = await getIntegration('otelms');
    const reservations = await pmsIntegration.fetchReservations();
    
    // Save to database
    await ctx.db.insert(reservations).values(reservations);
  })
});
```

#### 5.3 Marketing Module
- **Google Analytics API:** Real-time visitors, sessions, pageviews
- **Facebook/Instagram API:** Followers, engagement, posts
- **OTA APIs:** Booking.com, Airbnb performance data

#### 5.4 Logistics Module
- **Already has database schema** (housekeepingSchedules, rooms, inventory)
- **Need:** tRPC mutations to persist data
- **Need:** Staff management UI

---

### **Phase 6: Security & Compliance**

#### 6.1 Multi-Tenancy Security
- Row-level security (RLS) per tenant
- Encrypted credentials storage (AES-256)
- API key rotation
- Audit logs for all actions

#### 6.2 RBAC (Role-Based Access Control)
```sql
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  role ENUM('owner', 'admin', 'manager', 'staff', 'viewer') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

#### 6.3 Compliance
- **GDPR:** Data export, deletion, consent management
- **PCI DSS:** Payment data encryption (if handling payments)
- **SOC 2:** Audit logs, access controls

---

## 🚀 Implementation Roadmap

### **Week 1: Configuration System**
- [ ] Create hotel_settings table
- [ ] Build Settings UI component
- [ ] Replace hard-coded "ORBI City" with dynamic values
- [ ] Add color picker for branding
- [ ] Test with 3 different hotel names/logos

### **Week 2: Mock Data Cleanup**
- [ ] Add 🔴 red badges to all mock data components
- [ ] Create rooms table and management UI
- [ ] Remove hard-coded room numbers (A 3041, C 2641, etc.)
- [ ] Document which modules are production-ready vs mock

### **Week 3: Integration Framework**
- [ ] Build integration registry system
- [ ] Create Integration base class
- [ ] Build Integrations UI (/integrations route)
- [ ] Implement OTELMS plugin (if credentials available)
- [ ] Test Booking.com scraper integration

### **Week 4: CEO Dashboard (Real Data)**
- [ ] Aggregate KPIs from Finance module
- [ ] Calculate occupancy from Reservations
- [ ] Fetch ratings from channelPerformance table
- [ ] Remove mock data, mark as production-ready

### **Week 5: Reservations Module**
- [ ] Build PMS integration (OTELMS or Opera)
- [ ] OR: Enhance Gmail IMAP parser for all OTAs
- [ ] Create reservations CRUD UI
- [ ] Calendar view with real bookings
- [ ] Guest CRM integration

### **Week 6: Marketing Module**
- [ ] Google Analytics API integration
- [ ] Facebook/Instagram API integration
- [ ] OTA performance data (Booking.com API)
- [ ] Campaign tracking (database-backed)

### **Week 7: Logistics Module**
- [ ] Build housekeeping CRUD (tRPC + database)
- [ ] Staff management UI
- [ ] Inventory tracking (persist to database)
- [ ] Task assignment system

### **Week 8: Multi-Tenant Architecture**
- [ ] Create tenants table
- [ ] Build tenant middleware
- [ ] Auto-provision databases per tenant
- [ ] Admin portal for tenant management

### **Week 9: Security & Testing**
- [ ] Implement RBAC
- [ ] Encrypt integration credentials
- [ ] Audit logs for all actions
- [ ] Penetration testing
- [ ] Load testing (100 concurrent users)

### **Week 10: Documentation & Launch**
- [ ] API documentation (tRPC endpoints)
- [ ] User manual (PDF)
- [ ] Video tutorials (Loom)
- [ ] Sales landing page
- [ ] Pricing tiers (Free, Basic, Pro, Enterprise)

---

## 💰 Pricing Strategy (SaaS Model)

| Plan | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | $0/month | 10 rooms, 1 user, Email support | Small B&Bs |
| **Basic** | $49/month | 50 rooms, 5 users, Email + Chat support | Boutique hotels |
| **Pro** | $199/month | 200 rooms, Unlimited users, Priority support, API access | Mid-size hotels |
| **Enterprise** | Custom | Unlimited rooms, White-label, Dedicated support, Custom integrations | Hotel chains |

---

## 📈 Success Metrics

### **Technical KPIs:**
- ✅ 0% mock data in production
- ✅ 100% test coverage for core modules
- ✅ < 2s page load time
- ✅ 99.9% uptime SLA

### **Business KPIs:**
- 🎯 10 paying customers in first 3 months
- 🎯 $5,000 MRR (Monthly Recurring Revenue) in 6 months
- 🎯 50 hotels using the platform in 12 months

---

## 🔧 Technology Stack (Final)

### **Frontend:**
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Chart.js + Recharts
- Wouter (routing)

### **Backend:**
- Node.js 22 + Express
- tRPC (type-safe API)
- Drizzle ORM
- MySQL/TiDB (primary database)

### **Integrations:**
- Gmail IMAP (email parsing)
- Selenium (web scraping)
- Gemini AI (email categorization)
- Manus AI (chat agents)

### **Infrastructure:**
- Railway (hosting)
- S3 (file storage)
- GitHub Actions (CI/CD)
- Sentry (error tracking)

---

## 📝 Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on business needs
3. **Assign developers** to each phase
4. **Set deadlines** for each week
5. **Start with Phase 1** (Configuration System)

---

**Status:** 🟡 Ready for Implementation  
**Last Updated:** December 13, 2024  
**Author:** Manus AI Agent
