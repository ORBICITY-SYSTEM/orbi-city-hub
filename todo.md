# ORBI City Hub - Feature Implementation TODO

## Activity Log System
- [x] Create activity_logs table schema (id, user_id, action_type, target_entity, target_id, old_value, new_value, ip_address, user_agent, created_at)
- [x] Build Activity Log timeline UI component
- [x] Add filters (by user, date, action type, module)
- [ ] Implement 90-day auto-cleanup cron job
- [x] Add soft rollback for internal DB changes
- [ ] Add compensation actions for external OTA changes
- [ ] Add Preview Mode for AI actions
- [x] Add Undo button (15 minute window)

## Notification Center
- [x] Create notifications table schema (id, user_id, type, title, message, read_at, action_url)
- [x] Build Bell icon + dropdown UI
- [ ] Implement Email notifications for Critical/Approval-required
- [ ] Add WhatsApp integration for Urgent only (optional)
- [ ] Implement Smart Batching (5-minute digest)

## Analytics Dashboard
- [x] Tasks Completed metric (today/week/month)
- [x] Approval Rate metric
- [x] Error Rate metric
- [x] Response Time metric
- [x] Simple cards UI + trend line chart

## White-Label Config (Phase 1)
- [x] Create settings table (logo_url, primary_color, company_name)
- [x] Implement CSS variables for theming
- [x] Build settings UI for customization

## Homepage Updates
- [x] Remove Real Finance Dashboard card from homepage
- [x] Update financial data with Nov 2024 - Nov 2025 report
- [x] Update Finance module with new data

## Power BI-Level Finance Module
- [x] Create interactive month/year filter dropdowns
- [ ] Add date range picker for custom periods
- [x] Implement sortable data tables
- [x] Build KPI cards with sparklines
- [x] Create revenue/profit trend charts
- [x] Add expense breakdown pie chart
- [x] Build occupancy rate gauge
- [ ] Implement studio growth visualization
- [x] Add profit distribution chart (Company vs Owners)
- [ ] Create cost optimization analysis view
- [ ] Add export to Excel/PDF functionality
- [ ] Implement comparison mode (month vs month)

## Export Functionality
- [x] Add Export to Excel button
- [x] Add Export to PDF button
- [x] Generate shareable financial reports

## Mirror Effect AI Agent
- [x] Create AI Agent suggestion system (AI proposes → User approves → AI executes → Shows "DONE")
- [x] Build OTA channel integration UI for 15 channels
- [x] Implement task queue with approval workflow
- [x] Add "Preview Mode" - AI shows what it will do BEFORE execution
- [x] Create compensation actions for external OTA changes
- [x] Build AI Agent dashboard with pending tasks

## Demo Mode
- [x] Add Demo Mode toggle switch
- [x] Create sample demo data for all modules
- [x] Implement data switching between real and demo
- [x] Add visual indicator when Demo Mode is active

## GitHub Sync
- [x] Push all changes to GitHub repository

## Performance Optimization
- [x] Optimize lazy loading and code splitting
- [x] Reduce initial bundle size
- [x] Add loading skeleton components
- [x] Optimize component rendering

## Multi-user Roles System
- [x] Create roles table in database (Admin/Manager/Staff)
- [x] Implement role-based access control (RBAC)
- [x] Add role management UI
- [x] Protect routes based on user roles

## OTA Command Center Data Import
- [x] Analyze OTA Excel files (Booking.com, Airbnb, Expedia, Agoda, etc.)
- [x] Create OTA bookings database schema
- [x] Import real booking data from all channels
- [x] Update OTA Dashboard with real statistics
- [x] Display channel performance metrics

## Individual Bookings Table
- [x] Create ota_bookings database table with guest details
- [x] Import individual booking records from Excel files
- [x] Build detailed bookings table UI with filters
- [x] Add guest name, check-in/out dates, booking status columns
- [x] Implement sorting and pagination
- [x] Add search functionality

## Export Bookings to Excel
- [x] Add Export to Excel button to bookings table
- [x] Implement filter-aware export (respects channel and status filters)
- [x] Include all booking details in export

## OTA Command Center Redesign
- [x] Change currency from EUR to GEL (Georgian Lari)
- [x] Add multi-month filter selection
- [x] Add monthly comparison analytics
- [x] Add average price per night trends
- [x] Add detailed analytics charts after Channel Statistics
- [x] Implement AI analysis for each OTA channel (from first booking to today)
- [x] Add channel-specific performance insights
- [x] Add month-over-month growth metrics

## OTA Command Center Bug Fixes (Critical)
- [x] Remove EUR to GEL conversion - Excel data is already in GEL
- [x] Replace month filter buttons with professional dropdown select
- [x] Fix all currency symbols to ₾ (remove any $ signs)
- [x] Use exact amounts from Excel files without any conversion
- [x] Fix duplicate total rows in Excel (ჯამი გვერდზე, ჯამი excluded)
- [x] Verified totals: ₾465,177 total revenue, 1,413 bookings

## Google Reviews Dashboard (Premium)
- [x] Create reviews database schema (source, rating, text, author, date, response, response_date)
- [x] Seed realistic demo data for Google, Booking.com, Airbnb, TripAdvisor reviews
- [x] Build reviews API endpoints (list, stats, filters)
- [x] Design premium dashboard UI with KPI cards
- [x] Add source filter (Google, Booking, Airbnb, TripAdvisor, Facebook)
- [x] Add rating filter (1-5 stars)
- [x] Add sentiment filter (positive, neutral, negative)
- [ ] Add date range picker
- [x] Add response status filter (responded/pending)
- [ ] Show rating distribution chart
- [ ] Show rating trend over time chart
- [x] Show response rate statistics
- [x] Display individual review cards with response capability
- [x] Add AI-powered response suggestions
- [ ] Export reviews to Excel functionality
- [x] Add Google Business Profile sync button
- [x] Import Google reviews from Orbi City Sea view Aparthotel

## Live Google Business API Integration
- [x] Research Google Business Profile API requirements
- [x] Create server-side Google Business API service
- [x] Implement OAuth2 authentication flow for Google Business
- [x] Add "Connect Google" button with OAuth flow
- [x] Fetch live reviews from Orbi City Sea view Aparthotel (when connected)
- [x] Replace demo data with actual API responses (fallback to demo if not connected)
- [x] Add error handling and rate limiting
- [x] Test live review fetching

## Outscraper Integration (Replacing Google OAuth) ✅ COMPLETED
- [x] Remove non-working Google OAuth code
- [x] Create Outscraper webhook endpoint `/api/webhooks/outscraper-reviews`
- [x] Parse Outscraper review data format
- [x] Save new reviews to database (97 real Google reviews imported!)
- [x] Create notification on new review
- [x] Create urgent notification on negative review (1-2 stars)
- [x] Update frontend to show Outscraper connection status and webhook URL
- [x] Test webhook endpoint - working!
- [x] Import all 97 Google reviews from Orbi City Sea view Aparthotel
- [x] Stats showing correctly: 121 total, 3.2 avg rating, 52% positive
- [x] Outscraper scheduled task configured (daily at 18:07)
- [x] Push all changes to GitHub

## Multi-Platform Review Scraping via Outscraper
- [x] Configure Booking.com reviews scraper (100 reviews imported)
- [x] Configure Airbnb reviews scraper (17 reviews imported)
- [x] Configure TripAdvisor reviews scraper (7 reviews imported)
- [x] Configure Expedia reviews scraper (attempted - no results)
- [ ] Configure Facebook reviews scraper (not available in Outscraper)
- [x] Total: 222 reviews from 4 platforms (Google 98 + Booking 100 + Airbnb 17 + TripAdvisor 7)

## Outscraper Webhook Configuration (All Platforms)
- [ ] Configure Booking.com webhook in Outscraper
- [ ] Configure Airbnb webhook in Outscraper
- [ ] Configure TripAdvisor webhook in Outscraper
- [ ] Update webhook endpoint to detect platform from data
- [ ] Test all platform webhooks

## Reviews Dashboard Premium Upgrade
- [ ] Add Rating Distribution pie/bar chart
- [ ] Add Rating Trend over time line chart
- [ ] Add Platform Comparison analytics
- [ ] Add Response Rate by platform
- [ ] Add Average Rating by platform card
- [ ] Add Review Volume trend chart
- [ ] Add Sentiment Analysis breakdown
- [ ] Add Quick Response templates
- [ ] Add Bulk response actions
- [ ] Add Review export to Excel
- [ ] Add Review filtering by date range
- [ ] Add Review search functionality

## AI Review Response System (Auto-Generate + Approval + N8N)
- [x] Update webhook to detect review source (Google, Booking, Airbnb, TripAdvisor)
- [x] Auto-generate AI response in guest's language using knowledge base
- [x] Create pending approval task in AI Agent system
- [x] Build Review Response UI with Approve/Regenerate/Edit buttons
- [x] Add N8N webhook integration for sending approved responses
- [x] Update Reviews Dashboard with response management (AI Responses tab)
- [x] Create N8N Review Response Webhook workflow
- [x] Test N8N webhook connectivity - working!

## AI Response Metrics Dashboard Widget
- [x] Add API endpoint for AI response generation time metrics
- [x] Add API endpoint for manager approval rate metrics
- [x] Create dashboard widget component with visual metrics
- [x] Add average response time display with trend
- [x] Add approval rate percentage with chart
- [x] Integrate widget into Reviews Dashboard

## N8N Google Business API Integration
- [ ] Open N8N Review Response Webhook workflow
- [ ] Add Google Business Profile node
- [ ] Configure OAuth credentials for Google Business API
- [ ] Map webhook data to Google API fields (reviewId, responseText)
- [ ] Test posting response to Google Reviews
- [ ] Activate and save workflow

## Simplified Review Response Workflow for Manager (Mariam)
- [x] Add "Open in OTA" link button next to Copy
- [x] Add "Mark as Done" button after manager posts response
- [x] Auto-update AI Agent memory when response is marked done
- [x] Update statistics when response is completed
- [x] Clean up duplicate functions and modules
- [x] Push all changes to GitHub

## Dashboard Design Unification - Ocean Theme
- [x] Update global CSS to dark blue ocean colors
- [x] Add wave effect SVG dividers to page headers
- [x] Convert all page titles to Georgian language
- [x] Apply consistent header styling across all modules
- [x] Test and verify all pages have unified design

## Bilingual Headers (English Cyan + Georgian White)
- [x] Home page header: ORBI City Hub (cyan) + ორბი სითი ჰაბი / subtitle (white)
- [x] OTA Dashboard: Orbi OTA Command Center (cyan) + OTA სარდლობის ცენტრი / subtitle (white)
- [x] Finance Dashboard: Financial Intelligence (cyan) + ფინანსური ინტელექტი / subtitle (white)
- [x] Marketing Dashboard: Marketing Control Center (cyan) + მარკეტინგის ცენტრი / subtitle (white)
- [x] Reviews Dashboard: Reviews Command Center (cyan) + მიმოხილვების ცენტრი / subtitle (white)
- [x] Logistics Dashboard: Logistics Command Center (cyan) + ლოჯისტიკის ცენტრი / subtitle (white)
- [x] All headers follow exact format from reference image

## Main AI Agent Bilingual Update
- [x] Title: Main AI Agent + მთავარი AI აგენტი
- [x] Subtitle: Intelligent Data Distribution + ინტელექტუალური მონაცემების განაწილება
- [x] Description text bilingual
- [x] Upload button text bilingual
- [x] All helper text bilingual

## Full Bilingual Website (EN/KA Language Switcher)
- [x] Create LanguageContext for language state management
- [x] Create translations files (en.ts, ka.ts)
- [x] Add language switcher dropdown in header
- [x] Update Home page to use translations
- [ ] Update all dashboard pages to use translations
- [x] Update sidebar navigation to use translations
- [x] Update Main AI Agent to use translations
- [x] English version: no Georgian text
- [x] Georgian version: can use English terms

## Remaining UI Translations (Buttons, Notifications, Popups)
- [x] Expand en.ts with all dashboard text
- [x] Expand ka.ts with Georgian translations
- [x] Update OTA Dashboard with translations
- [x] Update Finance Dashboard with translations
- [x] Update Marketing Dashboard with translations
- [x] Update Reviews Dashboard with translations
- [x] Update Logistics Dashboard with translations
- [x] Update toast notifications with translations
- [x] Update modal dialogs with translations
- [x] Update error messages with translations

## Complete Full Bilingual Translation (Modern Georgian)
- [x] Update translations with modern terms (Command Center → მართვის ცენტრი, not სარდლობა)
- [x] OTA Dashboard - all KPI cards, tabs, chart labels, filters
- [x] Finance Dashboard - all content
- [x] Marketing Dashboard - all content
- [x] Reviews Dashboard - all content
- [x] Logistics Dashboard - all content
- [x] Home page - all module cards and stats
- [x] Fix all mixed language issues
- [x] Push to GitHub

## CEO Dashboard Redesign (Home Page)
- [x] Move WhatsApp Bot from separate module to Reservations submenu
- [x] Main AI Agent - only button with 🤖 emoji (opens modal on click)
- [x] Add 4 module KPIs compactly displayed
- [x] Add CEO-relevant metrics (today's revenue, active bookings, pending reviews, today's tasks)
- [x] Clean up Home page layout
- [x] Add all translations (EN/KA)
- [x] Push to GitHub

## CEO Dashboard Real-Time Data Connection
- [x] Create API endpoint for today's revenue (from OTA bookings)
- [x] Create API endpoint for active bookings (today's check-in/check-out)
- [x] Create API endpoint for pending reviews (unanswered reviews)
- [x] Create API endpoint for today's tasks (Butler AI tasks)
- [x] Update Home.tsx to fetch real-time data
- [x] Add loading states and error handling
- [x] Test and verify all KPIs show live data
- [x] Add vitest tests for CEO Dashboard router
- [x] Push to GitHub

## Critical Translation Fix - Mixed Language Issues
- [ ] Audit all pages for EN/KA language mixing
- [ ] Fix Reviews Dashboard - EN version showing Georgian text
- [ ] Fix AI Responses page - EN version showing Georgian text
- [ ] Fix all KPI cards to use proper translations
- [ ] Fix all filter dropdowns to use proper translations
- [ ] Fix all tab labels to use proper translations
- [ ] Ensure guest data (reviews, names) stays in original language
- [ ] Test EN version - must be 100% English
- [ ] Test KA version - must be 100% Georgian
- [ ] Push all fixes to GitHub

## WhatsApp Bot 404 Fix + Full Language Audit
- [x] Fix WhatsApp Bot page 404 error
- [x] Restore WhatsApp Bot routing in App.tsx
- [x] Audit Reviews Dashboard - fix mixed languages
- [x] Audit AI Responses page - fix mixed languages
- [x] Audit all other pages for language mixing
- [x] Update en.ts with all missing translation keys
- [x] Update ka.ts with all missing translation keys
- [x] Test EN version - must be 100% English
- [x] Test KA version - must be 100% Georgian
- [ ] Push all fixes to GitHub

## Telegram Bot Integration
- [x] Add TELEGRAM_BOT_TOKEN as environment secret (validated: @orbicity_notifications_bot)
- [x] Create Telegram Bot router (server/routers/telegramRouter.ts)
- [x] Create Telegram Bot service for sending messages
- [x] Create Telegram Bot management page
- [x] Add navigation link in sidebar
- [ ] Add Telegram to Integrations Showcase as active
- [x] Test sending messages via Telegram (20 tests passed)
- [ ] Save checkpoint and push to GitHub


## Enterprise-Grade Real-Time Integration Platform

### Outscraper Full Integration
- [ ] Research all Outscraper APIs and services
- [ ] Google Reviews real-time webhook (already configured)
- [ ] Booking.com Reviews scheduled scraping
- [ ] Airbnb Reviews scheduled scraping
- [ ] TripAdvisor Reviews scheduled scraping
- [ ] Google Maps Business Data API
- [ ] Competitor monitoring and analysis

### Tawk.to Full Integration
- [ ] Research Tawk.to REST API capabilities
- [ ] Live chat statistics dashboard widget
- [ ] Ticketing system integration
- [ ] Visitor analytics integration
- [ ] WhatsApp/Messenger message aggregation

### Performance Optimization
- [ ] Redis caching implementation
- [ ] Database indexing optimization
- [ ] WebSocket real-time connections
- [ ] Lazy loading & code splitting optimization
- [ ] CDN optimization for assets

### API Infrastructure
- [ ] Webhook receivers (Outscraper, Tawk.to)
- [ ] Scheduled sync jobs (cron)
- [ ] Real-time notifications system


## Multi-Platform Review Import (Dec 19, 2025)
- [x] Import Google Maps reviews (50 reviews)
- [x] Import Booking.com reviews (97 reviews)
- [x] Import Airbnb reviews (17 reviews)
- [x] Import TripAdvisor reviews (3 reviews)
- [x] Migrate reviews from guest_reviews to guestReviews table
- [x] Total: 169 reviews from 4 platforms in guestReviews table
- [x] Create vitest tests for reviews database (8 tests passing)
- [x] Fix CEO Dashboard queries to use correct table/column names
- [x] Add missing columns to butler_tasks table


## GitHub & Database Sync (Dec 19, 2025)
- [x] Push all code changes to GitHub
- [x] Verify MySQL database is synchronized
- [ ] Save checkpoint

## Tawk.to Live Chat Integration
- [ ] Add Tawk.to widget script to the application
- [ ] Configure Tawk.to settings
- [ ] Test live chat functionality


## Tawk.to Webhook Integration (Real-time Live Chat)
- [x] Create webhook endpoint in server to receive Tawk.to events
- [x] Create tawktoMessages table in database
- [x] Configure Tawk.to webhook in dashboard (Secret: 922e01520e76c1eb...)
- [x] Create Live Chat page in ORBI Hub frontend (/marketing/live-chat)
- [x] Add real-time notifications for new messages (CEO Dashboard card)
- [x] Test end-to-end webhook flow
- [x] Add tRPC routes for Tawk.to data (getAll, getStats, markAsRead, getUnread)
- [x] Add Live Chat to sidebar navigation (Marketing > Live Chat)
- [x] Add translations (EN/KA)


## Manus + Firebase + N8N Integration Architecture
- [ ] Set up Firebase SDK in ORBI City Hub frontend
- [ ] Configure Firebase Firestore for real-time data
- [ ] Create Firestore collections: tawk_messages, notifications, ai_tasks
- [ ] Set up Firebase Authentication with Google Workspace
- [ ] Create N8N workflow for Tawk.to webhook reception
- [ ] Create N8N workflow for AI response generation (Gemini)
- [ ] Create N8N workflow for Telegram notifications
- [ ] Connect N8N to Firebase Firestore (write messages)
- [ ] Add Firebase real-time listeners to Manus Dashboard
- [ ] Create Live Chat Messages component with real-time updates
- [ ] Add notification badges for unread messages
- [ ] Test end-to-end: Tawk.to → N8N → Firebase → Manus Dashboard
- [ ] Deploy and verify real-time functionality

## Tawk.to Integration via N8N
- [ ] Configure Tawk.to webhook in dashboard settings
- [ ] Set N8N webhook URL as Tawk.to endpoint
- [ ] Parse incoming chat messages in N8N
- [ ] Extract visitor info, message content, timestamp
- [ ] Store messages in Firebase Firestore
- [ ] Trigger Telegram notification for new chats
- [ ] Display live chat feed on ORBI Dashboard

## Firebase Firestore Schema
- [ ] tawk_messages collection: visitor_id, visitor_name, message, timestamp, read, responded
- [ ] ai_responses collection: review_id, platform, original_text, ai_response, status, approved_at
- [ ] notifications collection: user_id, type, title, message, read, created_at
- [ ] activity_log collection: action, module, user_id, timestamp, details


## Production-Grade Repository Cleanup (IMMEDIATE)
- [ ] Remove venv/ from repository (if exists)
- [ ] Update .gitignore with Python artifacts (venv/, .venv/, __pycache__/, *.pyc)
- [ ] Archive supabase-butler-schema.sql to /archive/experiments/
- [ ] Create /archive/experiments/README.md explaining archived files
- [ ] Create /docs/ARCHITECTURE.md - Single Source of Truth
- [ ] Update main README.md with clear architecture statement

## GitHub Issues & Releases Process (SHORT-TERM)
- [ ] Create GitHub labels: bug, feature, ops, security, tech-debt
- [ ] Create priority labels: priority:P0, priority:P1, priority:P2
- [ ] Create module labels: module:dashboard, module:reservations, module:cleaning, module:maintenance, module:finance, module:ai
- [ ] Create Bug Report issue template
- [ ] Create Feature Request issue template
- [ ] Create first release tag v0.1.0


## P0 CRITICAL FIXES (IMMEDIATE - Executive Decision 2025-12-21)
- [x] Outscraper webhook: Add strict property/listing whitelist validation
- [x] Outscraper webhook: Reject reviews not matching Orbi City Batumi property IDs
- [x] AI review prompt: Remove all LaTex and templating artifacts
- [x] AI review prompt: Plain text only, deterministic output
- [x] Automatic compensation: Remove 20% discount from fallback templates
- [x] Automatic compensation: AI may suggest, never decide - require manager approval
- [x] Create /docs/ARCHITECTURE.md - Single Source of Truth

## P1 SHORT-TERM ACTIONS
- [ ] Finance module: Implement nightly OtelMS data sync
- [ ] Telegram bot: Add trigger for new booking
- [ ] Telegram bot: Add trigger for checkout completed
- [ ] Telegram bot: Add trigger for issue created


## UI Reorganization (Executive Decision 2025-12-21)
## CONSTRAINTS: NO backend changes, NO data deletion, NO integration changes, Logistics UNTOUCHED

- [x] Create Integrations Hub page (status monitoring only - Outscraper, Tawk.to, Telegram, N8N, Google, OTELMS)
- [x] Create Communications Inbox page (merge Live Chat + placeholders for WhatsApp, Email, Social DMs)
- [x] Create Social Media Performance placeholder page (Instagram, Facebook, TikTok, YouTube)
- [x] Create Paid Ads placeholder page (Meta Ads, Google Ads - hidden if no data)
- [x] Update sidebar navigation to reflect new structure
- [x] Validate: no data deleted, no integrations changed, Logistics untouched

## VALIDATION CONFIRMATION (2025-12-21)
1. ✅ No data was deleted or altered
2. ✅ No integrations were changed or broken
3. ✅ No new ideas, features, or logic were introduced (only UI placeholders)
4. ✅ Logistics module was not touched in any way
5. ✅ All existing functionality remains available, only relocated
