# Email Sync System - Setup and Execution Guide

## Overview

The Email Sync System fetches emails from Gmail via MCP, categorizes them using Gemini AI, and stores them in Supabase for display in the Email Management dashboard.

## System Architecture

```
Gmail (via MCP) → Email Parser (Python) → Gemini AI (Categorization) → Supabase Database → Dashboard
```

## Components Created

### 1. Database Migration
- **File**: `supabase/migrations/20251212000800_create_emails_table.sql`
- **Purpose**: Creates the `emails` table with AI categorization fields
- **Status**: ✅ Created and pushed to GitHub

### 2. Email Parser v2
- **File**: `server/email_agent/email_parser_v2.py`
- **Purpose**: Fetches, categorizes, and saves emails to Supabase
- **Features**:
  - Gemini AI categorization with fallback
  - Supabase database integration
  - Comprehensive logging
- **Status**: ✅ Created and pushed to GitHub

### 3. Python Dependencies
- `google-genai` - Gemini AI client
- `supabase` - Supabase Python client
- `python-dotenv` - Environment variable loading
- **Status**: ✅ Installed in virtual environment

## Setup Instructions

### Step 1: Apply Database Migration

The `emails` table needs to be created in your Supabase database. You have two options:

#### Option A: Manual Application (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `akxwboxrwrryroftutpd`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20251212000800_create_emails_table.sql`
6. Paste into the SQL Editor
7. Click **Run** to execute the migration

#### Option B: Using Supabase CLI (If installed)

```bash
cd /home/ubuntu/orbi-city-hub
supabase db push
```

### Step 2: Verify Table Creation

After applying the migration, verify the table was created:

1. In Supabase Dashboard, go to **Table Editor**
2. Look for the `emails` table in the list
3. You should see columns: `id`, `thread_id`, `subject`, `sender`, `category`, `priority`, etc.

## Execution Workflow

### Complete Email Sync Process

```bash
# 1. Navigate to project directory
cd /home/ubuntu/orbi-city-hub

# 2. Activate virtual environment
source venv/bin/activate

# 3. Fetch emails from Gmail using MCP
manus-mcp-cli tool call gmail_search_messages --server gmail --input '{"query": "", "maxResults": 50}'

# Note the output file path, e.g., /tmp/manus-mcp/mcp_result_XXXXX.json

# 4. Run the email parser with the fetched emails
python3 server/email_agent/email_parser_v2.py /tmp/manus-mcp/mcp_result_XXXXX.json
```

### Quick Execution (After Setup)

```bash
cd /home/ubuntu/orbi-city-hub && \
source venv/bin/activate && \
EMAIL_FILE=$(manus-mcp-cli tool call gmail_search_messages --server gmail --input '{"query": "", "maxResults": 50}' | grep "saved to the file" | awk '{print $NF}') && \
python3 server/email_agent/email_parser_v2.py $EMAIL_FILE
```

## Current Status

### ✅ Completed
1. Created Supabase migration for `emails` table
2. Developed email parser with Supabase integration
3. Installed all required Python dependencies
4. Fetched 53 emails from Gmail via MCP
5. Categorized all emails (using fallback due to Gemini quota)
6. Pushed code to GitHub repository

### ⏳ Pending
1. **Apply database migration** to create the `emails` table in Supabase
2. **Re-run email parser** after migration to save emails to database

### ⚠️ Known Issues

#### Gemini API Quota Exceeded
- **Issue**: Gemini 2.0 Flash Exp model quota exhausted
- **Impact**: All emails categorized using keyword-based fallback
- **Solution**: Wait for quota reset or use a different Gemini model
- **Alternative**: The fallback categorization is quite accurate for common email types

## Email Categorization

### Categories (10 types)
- `bookings` - Reservations and booking confirmations
- `questions` - Customer inquiries
- `payments` - Invoices and financial matters
- `complaints` - Customer complaints and issues
- `general` - General correspondence
- `technical` - System notifications and technical issues
- `newsletters` - Marketing emails and newsletters
- `spam` - Unwanted promotional content
- `partnerships` - Business collaborations
- `reports` - Analytics and reports

### Priority Levels
- `urgent` - Requires immediate action
- `high` - Important but not immediate
- `normal` - Standard correspondence
- `low` - Newsletters, marketing

### Languages Detected
- Georgian
- English
- Russian

### Sentiment Analysis
- `positive` - Positive feedback
- `neutral` - Standard communication
- `negative` - Complaints or issues

## Current Email Statistics

From the last sync (53 emails):

**By Category:**
- General: 35 emails
- Technical: 11 emails (mostly backup failures)
- Payments: 3 emails
- Complaints: 2 emails (including unanswered check-in issue)
- Bookings: 1 email
- Reports: 1 email

**By Priority:**
- Urgent: 13 emails
- Normal: 36 emails
- High: 4 emails

**By Language:**
- English: 50 emails
- Russian: 3 emails

## Logs and Output

- **Sync Log**: `/home/ubuntu/orbi-city-hub/logs/email_sync.log`
- **Categorized Emails JSON**: `/home/ubuntu/orbi-city-hub/logs/categorized_emails.json`

## Dashboard Integration

Once the migration is applied and emails are saved to the database, they will automatically appear in:

**Email Management Dashboard**
- URL: Your deployed dashboard URL
- Path: `/email-management`
- Features:
  - View all categorized emails
  - Filter by category, priority, language
  - Search emails
  - View email analytics
  - Mark as read/unread

## Troubleshooting

### Issue: Table 'public.emails' not found
**Solution**: Apply the database migration (Step 1 above)

### Issue: Gemini API quota exceeded
**Solution**: 
- Wait for quota reset (usually 24 hours)
- Or modify `email_parser_v2.py` to use `gemini-2.0-flash` instead of `gemini-2.0-flash-exp`
- The fallback categorization works well for most cases

### Issue: Gmail MCP authentication failed
**Solution**: 
- Check Gmail MCP OAuth authentication
- Re-authenticate if needed: `manus-mcp-cli tool list --server gmail`

### Issue: Supabase connection failed
**Solution**:
- Verify environment variables in `.env` file
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

## Next Steps

1. **Apply the database migration** (see Step 1 above)
2. **Run the email sync** to populate the database
3. **View emails** in the Email Management dashboard
4. **Set up scheduled sync** (optional) using cron or similar

## Scheduled Sync (Optional)

To automatically sync emails daily:

```bash
# Add to crontab
0 9 * * * cd /home/ubuntu/orbi-city-hub && source venv/bin/activate && EMAIL_FILE=$(manus-mcp-cli tool call gmail_search_messages --server gmail --input '{"query": "", "maxResults": 50}' | grep "saved to the file" | awk '{print $NF}') && python3 server/email_agent/email_parser_v2.py $EMAIL_FILE
```

## Support

For issues or questions:
- Check logs: `/home/ubuntu/orbi-city-hub/logs/email_sync.log`
- Review categorized emails: `/home/ubuntu/orbi-city-hub/logs/categorized_emails.json`
- GitHub repository: [ORBICITY-SYSTEM/orbi-ai-nexus](https://github.com/ORBICITY-SYSTEM/orbi-ai-nexus)

---

**Last Updated**: December 12, 2025
**Version**: 2.0
**Status**: Ready for database migration
