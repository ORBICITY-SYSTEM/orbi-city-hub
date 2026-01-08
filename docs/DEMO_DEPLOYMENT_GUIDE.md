# Demo Deployment Guide - demo.orbicitybatumi.com

## Overview

This guide explains how to deploy the PowerStack Demo version to `demo.orbicitybatumi.com` using Vercel.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  hub.orbicitybatumi.com          demo.orbicitybatumi.com       │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │  VITE_USE_DEMO_DATA │         │  VITE_USE_DEMO_DATA │       │
│  │       = false       │         │       = true        │       │
│  └──────────┬──────────┘         └──────────┬──────────┘       │
│             │                               │                   │
│             ▼                               ▼                   │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │   Node.js + MySQL   │         │   Google Sheets +   │       │
│  │   (Legacy Backend)  │         │   AppScript API     │       │
│  └─────────────────────┘         └─────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Vercel Setup

### 1.1 Create New Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `ORBICITY-SYSTEM/orbi-city-hub`
4. Name the project: `orbi-city-demo`

### 1.2 Configure Build Settings

```
Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

### 1.3 Environment Variables

**CRITICAL: Add these environment variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_USE_DEMO_DATA` | `true` | **REQUIRED** - Enables PowerStack demo mode |
| `VITE_APPSCRIPT_WEB_APP_URL` | `https://script.google.com/macros/s/YOUR_ID/exec` | Optional - AppScript endpoint |
| `VITE_GOOGLE_SHEETS_MASTER_DB` | `https://docs.google.com/spreadsheets/d/YOUR_ID/pub?output=csv` | Optional - Sheets URL |

### 1.4 Domain Configuration

1. Go to Project Settings → Domains
2. Add custom domain: `demo.orbicitybatumi.com`
3. Configure DNS:
   - Type: CNAME
   - Name: demo
   - Value: cname.vercel-dns.com

## Step 2: Google Apps Script Setup

### 2.1 Create AppScript Project

1. Go to [script.google.com](https://script.google.com)
2. Create new project: "Orbi City PowerStack"
3. Copy contents of `docs/appscript/PowerStack_Main_Engine.js` into `Code.gs`

### 2.2 Configure AppScript

Update the `CONFIG` object:

```javascript
const CONFIG = {
  MASTER_DB_SHEET_ID: 'YOUR_ACTUAL_SHEET_ID',
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
  SIMULATION_MODE: true, // Set to false when Sheet is populated
};
```

### 2.3 Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Click "Deploy"
6. Copy the Web App URL

### 2.4 Test the API

```bash
# Test status endpoint
curl "YOUR_WEB_APP_URL?action=status"

# Test dashboard stats
curl "YOUR_WEB_APP_URL?action=getDashboardStats"

# Test housekeeping
curl "YOUR_WEB_APP_URL?action=getHousekeeping"
```

Expected response for `getDashboardStats`:
```json
{
  "revenue_mtd": 45000,
  "occupancy_rate": 82,
  "active_guests": 48,
  "adr": 73,
  "revpar": 56,
  "source": "Simulation Mode"
}
```

## Step 3: Google Sheets Setup (Optional)

If you want to use real data instead of simulation:

### 3.1 Create Master DB Sheet

1. Create new Google Sheet: "Orbi_City_Master_DB"
2. Create tabs as documented in `docs/appscript/SHEETS_TEMPLATE.md`

### 3.2 Populate Data

Import your OTELMS data into the appropriate tabs.

### 3.3 Publish Sheet

1. File → Share → Publish to web
2. Select "Entire Document"
3. Format: CSV
4. Click "Publish"

### 3.4 Update AppScript Config

```javascript
const CONFIG = {
  SIMULATION_MODE: false, // Now using real data
  // ...
};
```

## Demo Features

When `VITE_USE_DEMO_DATA=true`, the dashboard shows:

### Dashboard KPIs
- **Revenue MTD**: ~₾45,000
- **Occupancy Rate**: ~82%
- **Active Guests**: ~48
- **ADR**: ₾73
- **RevPAR**: ₾56

### Unit Performance Table
- 60 real Orbi City apartments
- Inception Date logic for accurate occupancy
- ROI ranking
- Blocks A, C, D

### Housekeeping Grid
- 60 units with visual status
- Clean (green), Dirty (red), In Progress (yellow), Maintenance (purple)
- Real apartment numbers

## Troubleshooting

### White Screen on Load

1. Check browser console for errors
2. Verify `VITE_USE_DEMO_DATA=true` is set
3. Redeploy with `pnpm build`

### Data Not Loading

1. Check if AppScript URL is correct
2. Verify CORS headers in AppScript
3. Test AppScript endpoint directly

### Demo Mode Not Showing

1. Verify environment variable is exactly `VITE_USE_DEMO_DATA=true`
2. Clear browser cache
3. Check that `useDemoMode` hook is imported

## Investor Demo Script

When presenting to investors:

1. **Open demo.orbicitybatumi.com**
2. **Point out the "Demo Mode" badge** - Shows PowerStack architecture
3. **Show Data Source indicator** - "Demo Data (High-Fidelity)"
4. **Scroll to Unit Performance Table** - Explain Inception Date logic
5. **Show Housekeeping Grid** - Real-time status visualization
6. **Click Sync button** - Demonstrates OTELMS integration capability
7. **Compare with hub.orbicitybatumi.com** - Show production vs demo

## Files Reference

| File | Purpose |
|------|---------|
| `client/src/hooks/useDemoMode.ts` | Demo toggle logic |
| `client/src/lib/GoogleSheetsService.ts` | Sheets data adapter |
| `client/src/components/PowerStackDashboard.tsx` | Dashboard UI |
| `docs/appscript/PowerStack_Main_Engine.js` | AppScript backend |
| `docs/appscript/SHEETS_TEMPLATE.md` | Sheet structure docs |

## Support

For issues with the demo deployment, contact the Orbi City Tech Team.
