# Orbi City Master DB - Google Sheets Template

## Setup Instructions

### Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **Orbi_City_Master_DB**

### Step 2: Create Required Tabs

Create the following tabs (sheets) in order:

| Tab Name | Purpose |
|----------|---------|
| Reservations | OTELMS booking data |
| Financial_Summary | Monthly financial metrics |
| Unit_Performance | 60 apartments with Inception Date |
| Housekeeping | Cleaning status for logistics |
| Reviews | Multi-platform reviews |
| Occupancy | Daily occupancy data |
| AI_Logs | AI activity tracking |

### Step 3: Set Up Headers

#### Tab 1: Reservations
```
ID | Room | Guest | Source | CheckIn | CheckOut | Nights | Amount | Paid | Balance | Created
```

#### Tab 2: Financial_Summary
```
Month | Year | Revenue | Expenses | Profit | Occupancy | ADR | RevPAR
```

#### Tab 3: Unit_Performance
```
UnitID | UnitName | Block | InceptionDate | TotalNights | OccupiedNights | OccupancyRate | Revenue | ADR | ROI | Rank
```

#### Tab 4: Housekeeping
```
UnitID | UnitName | Status | LastCleaned | NextCheckIn | AssignedTo | Priority
```

Status values: `clean`, `dirty`, `in_progress`, `maintenance`
Priority values: `high`, `medium`, `low`

#### Tab 5: Reviews
```
ID | Platform | Author | Rating | Text | Date | AIResponse | ResponseDate | Status
```

Platform values: `Google`, `Booking.com`, `Airbnb`, `TripAdvisor`, `Expedia`
Status values: `pending`, `responded`, `archived`

#### Tab 6: Occupancy
```
Month | Day | Year | OccupancyPercent
```

#### Tab 7: AI_Logs
```
Timestamp | Action | Input | Output | Tokens | Duration
```

### Step 4: Publish as CSV

1. File → Share → Publish to web
2. Select "Entire Document" or specific tabs
3. Format: CSV
4. Click "Publish"
5. Copy the published URL

### Step 5: Get Sheet ID

The Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

Copy the `SHEET_ID_HERE` part.

### Step 6: Configure Environment Variables

Add to your `.env` file:
```env
VITE_GOOGLE_SHEETS_MASTER_DB=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv
VITE_APPSCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## Sample Data

### Unit_Performance (60 Apartments)

| UnitID | UnitName | Block | InceptionDate | TotalNights | OccupiedNights | OccupancyRate | Revenue | ADR | ROI | Rank |
|--------|----------|-------|---------------|-------------|----------------|---------------|---------|-----|-----|------|
| A-1033 | A 1033 | A | 2024-05-15 | 586 | 245 | 42 | 18500 | 76 | 37 | 1 |
| A-1301 | A 1301 | A | 2024-06-01 | 570 | 220 | 39 | 16800 | 76 | 34 | 2 |
| C-2520 | C 2520 | C | 2024-07-10 | 531 | 195 | 37 | 14200 | 73 | 28 | 3 |

### Housekeeping

| UnitID | UnitName | Status | LastCleaned | NextCheckIn | AssignedTo | Priority |
|--------|----------|--------|-------------|-------------|------------|----------|
| A-1033 | A 1033 | clean | 2025-12-22 | 2025-12-23 | Nino | low |
| A-1301 | A 1301 | dirty | 2025-12-20 | 2025-12-22 | Mariam | high |
| C-2520 | C 2520 | in_progress | 2025-12-21 | 2025-12-22 | Giorgi | medium |

---

## Inception Date Logic

The **Inception Date** is the date of the first booking for each apartment. This is crucial for accurate occupancy calculation:

```
Real Occupancy = Occupied Nights / Days Since Inception
```

**NOT** the traditional:
```
Traditional Occupancy = Occupied Nights / Calendar Days (365)
```

### Why This Matters

If an apartment joined the platform on July 1, 2024:
- Traditional method: 100 nights / 365 days = 27% occupancy
- Inception method: 100 nights / 175 days = 57% occupancy

The Inception Date method gives a **fair comparison** between apartments that joined at different times.

---

## AppScript Deployment

### Step 1: Create AppScript Project

1. Go to [script.google.com](https://script.google.com)
2. Create new project: "Orbi City PowerStack"
3. Copy `PowerStack_Main_Engine.js` into `Code.gs`

### Step 2: Configure

Update the `CONFIG` object:
```javascript
const CONFIG = {
  MASTER_DB_SHEET_ID: 'YOUR_ACTUAL_SHEET_ID',
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
  // ...
};
```

### Step 3: Deploy as Web App

1. Deploy → New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. Copy the Web App URL

### Step 4: Set Up Triggers

Run `setupTriggers()` once to enable:
- Hourly OTELMS sync
- Daily unit performance calculation

---

## API Endpoints

### GET Requests

| Action | URL | Response |
|--------|-----|----------|
| Status | `?action=status` | `{ status: 'ok', timestamp, version }` |
| Reservations | `?action=reservations` | Array of reservations |
| Financials | `?action=financials` | Array of financial summaries |
| Units | `?action=units` | Array of unit performance |
| Housekeeping | `?action=housekeeping` | Array of housekeeping status |
| KPIs | `?action=kpis` | Dashboard KPIs object |

### POST Requests

| Action | Payload | Response |
|--------|---------|----------|
| Update Housekeeping | `{ action: 'updateHousekeeping', unitId, status }` | `{ success, unitId, newStatus }` |
| Sync OTELMS | `{ action: 'syncOtelMS' }` | `{ success, reservationsCount, duration }` |
| Generate AI Response | `{ action: 'generateAIResponse', reviewText, rating, platform }` | `{ success, response, duration }` |
