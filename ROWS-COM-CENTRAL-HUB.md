# ROWS.COM - Central Data Hub Architecture
## ORBICITY SYSTEM-ის მონაცემთა ბირთვი

---

## კონცეფცია

**ROWS.COM** = ყველა მონაცემის **Single Source of Truth**

```
┌────────────────────────────────────────────────────────────────────┐
│                        ROWS.COM (Central Hub)                       │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   OtelMS Data   │  │   Logistics     │  │    Finance      │    │
│  │   (Calendar,    │  │   (Inventory,   │  │   (Reports,     │    │
│  │    Bookings)    │  │   Housekeeping) │  │    Analytics)   │    │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘    │
│           │                    │                    │              │
│           ▼                    ▼                    ▼              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Spreadsheet Tables (API Accessible)             │  │
│  │  • Calendar Bookings      • Room Inventory                   │  │
│  │  • Daily Status           • Housekeeping Logs                │  │
│  │  • RList Reports          • Maintenance Records              │  │
│  │  • Revenue Data           • Activity Logs                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                    │                           ▲
                    │    ROWS.COM API           │
                    │    (Bidirectional)        │
                    ▼                           │
┌────────────────────────────────────────────────────────────────────┐
│                      ORBICITY Applications                          │
│                                                                     │
│  ┌─────────────────┐      ┌─────────────────┐                      │
│  │  OtelMS Scraper │      │   orbi-city-hub │                      │
│  │    (Python)     │      │   (React/tRPC)  │                      │
│  │                 │      │                 │                      │
│  │  WRITES TO:     │      │  READS FROM:    │                      │
│  │  • Calendar     │      │  • OtelMS data  │                      │
│  │  • Status       │      │  • Finance      │                      │
│  │  • RList        │      │                 │                      │
│  │                 │      │  WRITES TO:     │                      │
│  │  (Cloud Run)    │      │  • Logistics    │                      │
│  └─────────────────┘      │  • Activity     │                      │
│                           └─────────────────┘                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. OtelMS → ROWS.COM (Python Scraper)

**Source**: `otelms-calendar-api` (Cloud Run)
**Frequency**: ყოველ 15-30 წუთში (cron trigger)

| Endpoint | ROWS Table | მონაცემები |
|----------|------------|------------|
| `/scrape` | Calendar | booking_id, guest, dates, balance |
| `/scrape/status` | Status | today's arrivals/departures |
| `/scrape/rlist` | RList (x3) | by created/checkin/checkout |

### 2. Logistics → ROWS.COM (App Writes)

**Source**: orbi-city-hub Frontend
**Trigger**: თანამშრომლის action (save, update, complete)

| Action | ROWS Table | მონაცემები |
|--------|------------|------------|
| ინვენტარის განახლება | Inventory | room, item, quantity, condition |
| Housekeeping დასრულება | Housekeeping | room, date, status, notes |
| Maintenance დამატება | Maintenance | room, issue, priority, cost |
| Activity Log | ActivityLog | user, action, timestamp |

### 3. ROWS.COM → App (App Reads)

**Source**: ROWS.COM API
**Usage**: Finance dashboards, Reports, Analytics

| ROWS Table | App Component | გამოყენება |
|------------|---------------|------------|
| Calendar | FinanceDashboard | revenue, occupancy |
| RList | MonthlyReports | detailed bookings |
| Inventory | LogisticsDashboard | shortage alerts |

---

## ROWS.COM Spreadsheet Structure

### რეკომენდებული სტრუქტურა

```
ORBICITY Master Spreadsheet
├── Page 1: OtelMS Calendar
│   └── Table: calendar_bookings
│       Columns: booking_id, guest_name, room, check_in, check_out,
│                source, amount, balance, status, extracted_at
│
├── Page 2: OtelMS Status
│   └── Table: daily_status
│       Columns: booking_id, room, column (arrival/departure),
│                text, extracted_at
│
├── Page 3: RList - Created
│   └── Table: rlist_created
│       Columns: room, guest, source, check_in, nights, check_out,
│                amount, paid, balance, created_at, extracted_at
│
├── Page 4: RList - Check-in
│   └── Table: rlist_checkin
│       (same schema as Page 3)
│
├── Page 5: RList - Stay Days
│   └── Table: rlist_staydays
│       (same schema as Page 3)
│
├── Page 6: Logistics Inventory
│   └── Table: room_inventory
│       Columns: room_number, item_name, category, quantity,
│                condition, last_checked, notes, updated_by
│
├── Page 7: Housekeeping
│   └── Table: housekeeping_log
│       Columns: room_number, scheduled_date, status,
│                completed_at, cleaner_name, notes, media_url
│
├── Page 8: Maintenance
│   └── Table: maintenance_log
│       Columns: room_number, issue, priority, status,
│                cost, reported_at, completed_at, technician
│
├── Page 9: Activity Log
│   └── Table: activity_log
│       Columns: timestamp, user_email, action, entity_type,
│                entity_id, changes_json
│
└── Page 10: Finance Summary
    └── Table: monthly_summary
        Columns: month, year, revenue, expenses, profit,
                 occupancy, adr, revpar
```

---

## API Integration Code

### Environment Variables

```bash
# ROWS.COM Configuration
ROWS_API_KEY=your_api_key_here
ROWS_SPREADSHEET_ID=your_spreadsheet_id

# Table IDs (get from ROWS.COM UI)
ROWS_CALENDAR_TABLE_ID=xxx
ROWS_STATUS_TABLE_ID=xxx
ROWS_INVENTORY_TABLE_ID=xxx
ROWS_HOUSEKEEPING_TABLE_ID=xxx
ROWS_MAINTENANCE_TABLE_ID=xxx
ROWS_ACTIVITY_TABLE_ID=xxx
```

### TypeScript Helper (server/lib/rowsClient.ts)

```typescript
/**
 * ROWS.COM Unified Client
 * Bidirectional sync for ORBICITY
 */

const ROWS_API_BASE = 'https://api.rows.com/v1';

interface RowsConfig {
  apiKey: string;
  spreadsheetId: string;
  tableIds: {
    calendar: string;
    status: string;
    inventory: string;
    housekeeping: string;
    maintenance: string;
    activity: string;
  };
}

const config: RowsConfig = {
  apiKey: process.env.ROWS_API_KEY || '',
  spreadsheetId: process.env.ROWS_SPREADSHEET_ID || '',
  tableIds: {
    calendar: process.env.ROWS_CALENDAR_TABLE_ID || '',
    status: process.env.ROWS_STATUS_TABLE_ID || '',
    inventory: process.env.ROWS_INVENTORY_TABLE_ID || '',
    housekeeping: process.env.ROWS_HOUSEKEEPING_TABLE_ID || '',
    maintenance: process.env.ROWS_MAINTENANCE_TABLE_ID || '',
    activity: process.env.ROWS_ACTIVITY_TABLE_ID || '',
  }
};

// === READ Operations ===

export async function readFromRows(tableId: string, range?: string): Promise<any[]> {
  const url = range
    ? `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}/tables/${tableId}/values/${range}`
    : `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}/tables/${tableId}/values`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
    }
  });

  if (!response.ok) {
    throw new Error(`ROWS read failed: ${response.status}`);
  }

  const data = await response.json();
  return data.values || [];
}

// === WRITE Operations ===

export async function appendToRows(tableId: string, rows: any[][]): Promise<boolean> {
  const width = Math.max(...rows.map(r => r.length));
  const range = `A:${columnLetter(width)}`;

  const url = `${ROWS_API_BASE}/spreadsheets/${config.spreadsheetId}/tables/${tableId}/values/${encodeURIComponent(range)}:append`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: rows })
  });

  return response.ok;
}

// === Logistics Sync Functions ===

export async function syncInventoryToRows(data: {
  roomNumber: string;
  itemName: string;
  category: string;
  quantity: number;
  condition: string;
  notes?: string;
  updatedBy: string;
}): Promise<boolean> {
  const row = [
    data.roomNumber,
    data.itemName,
    data.category,
    data.quantity.toString(),
    data.condition,
    new Date().toISOString(),
    data.notes || '',
    data.updatedBy,
  ];

  return appendToRows(config.tableIds.inventory, [row]);
}

export async function syncHousekeepingToRows(data: {
  roomNumber: string;
  scheduledDate: string;
  status: string;
  completedAt?: string;
  cleanerName?: string;
  notes?: string;
  mediaUrl?: string;
}): Promise<boolean> {
  const row = [
    data.roomNumber,
    data.scheduledDate,
    data.status,
    data.completedAt || '',
    data.cleanerName || '',
    data.notes || '',
    data.mediaUrl || '',
    new Date().toISOString(),
  ];

  return appendToRows(config.tableIds.housekeeping, [row]);
}

export async function syncMaintenanceToRows(data: {
  roomNumber: string;
  issue: string;
  priority: string;
  status: string;
  cost?: number;
  technician?: string;
}): Promise<boolean> {
  const row = [
    data.roomNumber,
    data.issue,
    data.priority,
    data.status,
    data.cost?.toString() || '',
    new Date().toISOString(),
    '',
    data.technician || '',
  ];

  return appendToRows(config.tableIds.maintenance, [row]);
}

export async function logActivityToRows(data: {
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: object;
}): Promise<boolean> {
  const row = [
    new Date().toISOString(),
    data.userEmail,
    data.action,
    data.entityType,
    data.entityId || '',
    JSON.stringify(data.changes || {}),
  ];

  return appendToRows(config.tableIds.activity, [row]);
}

// === Finance Read Functions ===

export async function getCalendarBookings(): Promise<any[]> {
  return readFromRows(config.tableIds.calendar);
}

export async function getDailyStatus(): Promise<any[]> {
  return readFromRows(config.tableIds.status);
}

// === Utility ===

function columnLetter(n: number): string {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}
```

---

## Integration Points

### 1. Logistics Module (Supabase → ROWS.COM)

**შეცვალე** `useLogisticsActivity.ts`:

```typescript
import { syncInventoryToRows, logActivityToRows } from '@/lib/rowsClient';

export const useLogisticsActivity = () => {
  const logActivity = async (params: LogActivityParams) => {
    // Existing Supabase write
    await supabase.from("logistics_activity_log").insert({...});

    // NEW: Sync to ROWS.COM
    await logActivityToRows({
      userEmail: user.email,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: params.changes,
    });
  };

  return { logActivity };
};
```

### 2. Housekeeping Module

**შეცვალე** `HousekeepingModule.tsx`:

```typescript
import { syncHousekeepingToRows } from '@/lib/rowsClient';

const handleComplete = async (schedule) => {
  // Existing Supabase update
  await supabase.from("housekeeping_schedules").update({...});

  // NEW: Sync to ROWS.COM
  await syncHousekeepingToRows({
    roomNumber: schedule.rooms.join(', '),
    scheduledDate: schedule.scheduled_date,
    status: 'completed',
    completedAt: new Date().toISOString(),
    notes: schedule.notes,
  });
};
```

### 3. Finance Dashboard

**შეცვალე** `realFinanceRouter.ts`:

```typescript
import { getCalendarBookings } from '@/lib/rowsClient';

export const realFinanceRouter = router({
  getBookingsFromRows: publicProcedure.query(async () => {
    const bookings = await getCalendarBookings();

    // Transform ROWS data to app format
    return bookings.map(row => ({
      bookingId: row[0],
      guestName: row[1],
      room: row[2],
      checkIn: row[3],
      checkOut: row[4],
      source: row[5],
      amount: parseFloat(row[6]) || 0,
      balance: parseFloat(row[7]) || 0,
    }));
  }),
});
```

---

## Data Flow Diagram

```
                                   ROWS.COM
                              (Central Data Hub)
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          │                          ▼
    ┌─────────────┐                   │                   ┌─────────────┐
    │   OtelMS    │                   │                   │   Finance   │
    │   Scraper   │      WRITES       │      READS        │  Dashboard  │
    │   (Python)  │ ──────────────►   │   ◄────────────── │   (React)   │
    │             │   Calendar,       │     Revenue,      │             │
    │  Cloud Run  │   Status,         │     Bookings      │ orbi-city-  │
    │             │   RList           │                   │    hub      │
    └─────────────┘                   │                   └─────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          │                          ▼
    ┌─────────────┐                   │                   ┌─────────────┐
    │  Logistics  │                   │                   │  Analytics  │
    │   Module    │      WRITES       │      READS        │   Reports   │
    │   (React)   │ ──────────────►   │   ◄────────────── │   (React)   │
    │             │   Inventory,      │    Historical     │             │
    │  Employee   │   Housekeeping,   │      Data         │   Owner/    │
    │   Input     │   Maintenance     │                   │   Manager   │
    └─────────────┘                   │                   └─────────────┘
                                      │
                               ┌──────┴──────┐
                               │   Manual    │
                               │   Access    │
                               │             │
                               │  Tamara &   │
                               │  Team can   │
                               │  view/edit  │
                               │  directly   │
                               └─────────────┘
```

---

## უპირატესობები

### 1. Transparency
- ყველა მონაცემი ხილულია spreadsheet-ში
- არა-ტექნიკურ თანამშრომლებსაც ესმით

### 2. Backup
- ROWS.COM ავტომატურად ინახავს ისტორიას
- Version control spreadsheet-ის დონეზე

### 3. Flexibility
- ხელით შესწორება შესაძლებელია
- Formula-ებით დამატებითი analytics

### 4. Integration
- API ხელმისაწვდომია
- Multiple apps can read/write

### 5. Cost Effective
- No separate database needed for analytics
- ROWS.COM free tier საკმარისია

---

## Next Steps

1. **ROWS.COM Setup**
   - შექმენი Master Spreadsheet
   - დაამატე ყველა საჭირო Page და Table
   - დააკოპირე Table IDs

2. **Environment Config**
   - დაამატე ROWS_* env variables Vercel-ში
   - დაამატე Cloud Run-ში (scraper-ისთვის)

3. **Code Integration**
   - შექმენი `server/lib/rowsClient.ts`
   - დაამატე sync calls Logistics components-ში
   - დაამატე read calls Finance dashboard-ში

4. **Testing**
   - ტესტი: Logistics → ROWS.COM write
   - ტესტი: ROWS.COM → Finance read
   - ტესტი: OtelMS scraper → ROWS.COM

---

*შექმნილია Claude Opus 4.5-ის მიერ ORBICITY SYSTEM-ისთვის*
