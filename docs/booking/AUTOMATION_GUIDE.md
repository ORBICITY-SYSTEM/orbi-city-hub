# Booking.com Daily Automation Guide

## Overview

This automation system collects daily data from Booking.com Extranet and saves it to Supabase database for dashboard display.

**Current Status:** ✅ Demo workflow functional | ⚠️ Live automation requires manual 2FA

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  BOOKING.COM AUTOMATION                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Data Collection                                    │
│  ─────────────────────────                                  │
│  • Browser automation (Playwright)                          │
│  • Login to Booking.com Extranet                            │
│  • Navigate to property dashboard                           │
│  • Collect: Bookings, Reviews, Messages, Statistics         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Data Processing                                    │
│  ──────────────────────────                                 │
│  • Parse collected data                                     │
│  • Generate summary report                                  │
│  • Save to JSON file                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Database Sync                                      │
│  ────────────────────────                                   │
│  • Connect to Supabase                                      │
│  • Insert into booking_daily_reports                        │
│  • Insert into agent_notebook                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Dashboard Display                                  │
│  ────────────────────────────                               │
│  • Real-time updates on dashboard                           │
│  • URL: https://team.orbicitybatumi.com/agent-notebook     │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
ota_channels_agent/
├── booking_scraper.py          # Original scraper (basic version)
├── booking_scraper_v2.py       # Improved scraper with cookie management
├── booking_demo_data.py        # Demo data generator
├── supabase_sync.py           # Supabase integration
├── demo_workflow.py           # Complete demo workflow
├── run_automation.sh          # Main automation runner
├── .env                       # Configuration file
├── data/
│   ├── daily_reports/        # JSON reports
│   ├── screenshots/          # Browser screenshots
│   └── cookies/              # Session cookies
└── AUTOMATION_GUIDE.md       # This file
```

## Configuration

### 1. Environment Variables (.env)

```env
# OTA Credentials
BOOKING_USERNAME=tamunamaxaradze@yahoo.com
BOOKING_PASSWORD=Orbicity2025!

# Supabase Database
SUPABASE_URL=https://wruqshfqdciwufuelhbl.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Browser Settings
HEADLESS_MODE=true
```

### 2. Get Supabase Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wruqshfqdciwufuelhbl)
2. Navigate to **Settings** → **API**
3. Copy the **anon/public** key
4. Add it to `.env` file

## Usage

### Demo Mode (Recommended for Testing)

Generate mock data and test the complete workflow:

```bash
cd /home/ubuntu/orbi-ai-nexus/ota_channels_agent
python3 demo_workflow.py
```

This will:
- ✅ Generate realistic demo data
- ✅ Create JSON report
- ✅ Sync to Supabase (if configured)
- ✅ Display summary

### Live Mode (Requires Manual Intervention)

**⚠️ Important:** Booking.com uses CAPTCHA and 2FA, so full automation is not possible without manual intervention.

#### Option 1: Semi-Automated (Recommended)

```bash
# Run with manual 2FA solving
cd /home/ubuntu/orbi-ai-nexus/ota_channels_agent
python3 booking_scraper_v2.py
```

When CAPTCHA or 2FA appears:
1. Solve CAPTCHA manually
2. Complete 2FA verification
3. Script will continue automatically

#### Option 2: Full Automation Script

```bash
# This will fail at login due to 2FA
cd /home/ubuntu/orbi-ai-nexus/ota_channels_agent
./run_automation.sh
```

## Automation Challenges

### 1. CAPTCHA Protection

**Issue:** Booking.com shows CAPTCHA for automated browsers

**Screenshot:**
![CAPTCHA Example](data/screenshots/login_failed_20251213_000844.png)

**Solutions:**
- ✅ Use demo mode for testing
- ✅ Manual CAPTCHA solving during setup
- ✅ Save session cookies for reuse
- ❌ Full automation not possible

### 2. Two-Factor Authentication (2FA)

**Issue:** Booking.com requires 2FA verification

**Screenshot:**
![2FA Example](data/screenshots/unexpected_url_20251213_001032.png)

**Verification Methods:**
- Pulse app
- Text message (SMS)
- Phone call

**Solutions:**
- ✅ Manual 2FA during initial login
- ✅ Cookie-based session persistence
- ❌ Bypass not possible (security feature)

### 3. Session Management

**Current Implementation:**
- Saves cookies after successful login
- Reuses cookies for subsequent runs
- Reduces need for repeated 2FA

**File:** `data/cookies/booking_cookies.json`

## Database Schema

### Table: booking_daily_reports

```sql
CREATE TABLE booking_daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL,
    report_date DATE NOT NULL,
    bookings_count INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    statistics JSONB,
    errors TEXT[],
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: agent_notebook

```sql
CREATE TABLE agent_notebook (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    summary TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Scheduled Automation

### Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add daily automation at 9:00 AM
0 9 * * * cd /home/ubuntu/orbi-ai-nexus/ota_channels_agent && python3 demo_workflow.py >> /tmp/booking_automation.log 2>&1
```

### Using Python Scheduler

```python
import schedule
import time

def run_automation():
    # Run demo workflow
    os.system("python3 demo_workflow.py")

# Schedule daily at 9:00 AM
schedule.every().day.at("09:00").do(run_automation)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## Troubleshooting

### Issue: Login Fails

**Symptoms:**
- CAPTCHA appears
- 2FA required
- Session expired

**Solutions:**
1. Run in non-headless mode: `HEADLESS_MODE=false`
2. Manually solve CAPTCHA
3. Complete 2FA verification
4. Check credentials in `.env`

### Issue: Supabase Sync Fails

**Symptoms:**
- "SUPABASE_ANON_KEY not configured"
- Connection errors

**Solutions:**
1. Get anon key from Supabase dashboard
2. Add to `.env` file
3. Verify project URL is correct
4. Check database tables exist

### Issue: No Data Collected

**Symptoms:**
- Empty reports
- Zero counts

**Solutions:**
1. Use demo mode for testing
2. Check browser screenshots in `data/screenshots/`
3. Verify login was successful
4. Check Booking.com page structure hasn't changed

## Monitoring

### Check Automation Status

```bash
# View latest report
cat data/daily_reports/booking_report_*.json | jq '.'

# Check for errors
grep -r "error" data/daily_reports/

# View screenshots
ls -lh data/screenshots/
```

### Dashboard Access

- **URL:** https://team.orbicitybatumi.com/agent-notebook
- **Real-time updates:** Enabled
- **Data refresh:** Automatic

## Best Practices

### 1. Regular Testing

```bash
# Run demo workflow weekly
python3 demo_workflow.py
```

### 2. Monitor Logs

```bash
# Create log directory
mkdir -p logs

# Run with logging
python3 demo_workflow.py >> logs/automation_$(date +%Y%m%d).log 2>&1
```

### 3. Backup Data

```bash
# Backup reports
tar -czf backup_$(date +%Y%m%d).tar.gz data/daily_reports/
```

### 4. Update Credentials

- Change passwords regularly
- Update `.env` file
- Test after credential changes

## Recommendations

### For Production Use

1. **Use Demo Mode**
   - Reliable and consistent
   - No CAPTCHA issues
   - Good for testing dashboard

2. **Semi-Automated Approach**
   - Manual login once per day
   - Automated data collection
   - Cookie-based session reuse

3. **API Integration** (If Available)
   - Check if Booking.com offers Partner API
   - More reliable than web scraping
   - No CAPTCHA or 2FA issues

4. **Manual Data Entry**
   - Create simple web form
   - Staff enters daily metrics
   - Most reliable for critical data

## Support

### Issues & Questions

- **GitHub:** [ORBICITY-SYSTEM/orbi-ai-nexus](https://github.com/ORBICITY-SYSTEM/orbi-ai-nexus)
- **Documentation:** This file
- **Demo Mode:** Always works for testing

### Next Steps

1. ✅ Configure Supabase credentials
2. ✅ Run demo workflow
3. ✅ Verify dashboard display
4. ⚠️ Decide on production approach
5. 📅 Set up scheduled automation

---

**Last Updated:** 2025-12-13  
**Version:** 2.0  
**Status:** Demo functional, Live requires manual intervention
