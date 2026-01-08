# Vercel Deployment Guide for ORBI City Hub Demo

## Overview

This guide explains how to deploy the ORBI City Hub demo version to Vercel with the PowerStack (Google Sheets) backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  hub.orbicitybatumi.com (Production)                        │
│  ├── VITE_USE_DEMO_DATA = false                             │
│  ├── Backend: Node.js + MySQL                               │
│  └── Full features: Reviews, Butler AI, etc.                │
│                                                              │
│  demo.orbicitybatumi.com (Demo/Investor)                    │
│  ├── VITE_USE_DEMO_DATA = true                              │
│  ├── Backend: Google Apps Script + Sheets                   │
│  └── PowerStack Dashboard with simulation data              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: `ORBICITY-SYSTEM/orbi-city-hub-deploy`
4. Select the repository

## Step 2: Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `pnpm run build` |
| Output Directory | `dist/public` |
| Install Command | `pnpm install` |

## Step 3: Environment Variables (CRITICAL!)

Add these environment variables in Vercel Project Settings:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_USE_DEMO_DATA` | `true` | **CRITICAL!** Enables Google Sheets mode |
| `VITE_APPSCRIPT_WEB_APP_URL` | `https://script.google.com/macros/s/YOUR_ID/exec` | Your deployed AppScript URL |

### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_APP_TITLE` | `ORBI City Hub (Demo)` | Browser tab title |
| `VITE_APP_ID` | `orbi-city-demo` | App identifier |

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Access your deployment at the provided URL

## Step 5: Custom Domain

1. Go to Project Settings → Domains
2. Add: `demo.orbicitybatumi.com`
3. Configure DNS at your domain registrar:
   - Type: `CNAME`
   - Name: `demo`
   - Value: `cname.vercel-dns.com`

## Verification

After deployment, verify:

1. ✅ Dashboard loads without errors
2. ✅ PowerStack badge shows "Demo Data" or "Google Sheets"
3. ✅ Revenue History Chart displays
4. ✅ Unit Performance Table shows 60 apartments
5. ✅ Housekeeping Grid shows status colors

## Troubleshooting

### White Screen / Error

- Check browser console for errors
- Verify `VITE_USE_DEMO_DATA=true` is set
- Ensure all environment variables are added

### Data Not Loading

- Verify AppScript is deployed as Web App
- Check AppScript URL is correct
- Test AppScript directly: `YOUR_URL?action=status`

### Build Fails

- Check Vercel build logs
- Ensure `pnpm` is used (not npm)
- Verify `package.json` dependencies

## AppScript Integration

The demo uses Google Apps Script as the backend. Endpoints:

| Action | URL | Description |
|--------|-----|-------------|
| Status | `?action=status` | Health check |
| Dashboard | `?action=getDashboardStats` | KPIs (~45K GEL, 82%) |
| Housekeeping | `?action=getHousekeeping` | 60 units status |
| Financials | `?action=financials` | Monthly data |
| Units | `?action=units` | Performance with ROI |

## Support

For issues, contact: info@orbicitybatumi.com
