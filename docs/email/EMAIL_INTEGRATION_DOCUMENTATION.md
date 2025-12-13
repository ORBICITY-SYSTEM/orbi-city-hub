# Email Integration - AI-Powered Email Management System

## Overview

The Email Integration module is an advanced AI-powered email management system designed to handle all incoming emails with intelligent processing, categorization, and automated action suggestions. This system goes beyond simple email viewing to provide comprehensive email intelligence for the Orbi City AI Core platform.

## Features

### 1. **AI-Powered Email Categorization**

The system automatically categorizes all incoming emails into the following categories:

- **Booking** - Reservations, bookings from OTA platforms (Booking.com, Airbnb, Expedia)
- **Guest Communication** - Guest inquiries, reviews, feedback, complaints
- **Operational** - Invoices, payments, maintenance, housekeeping, staff communications
- **Marketing** - Promotional emails, newsletters, marketing campaigns
- **Other** - Miscellaneous emails that don't fit other categories

### 2. **Priority Detection**

Emails are automatically assigned priority levels based on content analysis:

- **High Priority** - Urgent bookings, guest complaints, critical operational issues
- **Normal Priority** - Standard communications, routine inquiries
- **Low Priority** - Marketing emails, newsletters, promotional content

### 3. **Sentiment Analysis**

For guest communications, the system performs basic sentiment analysis:

- **Positive** - Thank you messages, compliments, positive reviews
- **Negative** - Complaints, issues, problems (automatically flagged as high priority)
- **Neutral** - Standard inquiries and communications

### 4. **Smart Action Suggestions**

The AI agent proactively suggests actions based on email content:

- Review booking details
- Update calendar
- Respond to guest
- Consider unsubscribing (for marketing emails)
- Move to archive
- Mark as spam (for detected spam)
- Review and process (for operational emails)

### 5. **Spam Detection**

Basic spam detection identifies potentially unwanted emails based on:

- Common spam phrases ("click here now", "limited time offer", "act now")
- Suspicious patterns (fake reply threads)

### 6. **Advanced Search and Filtering**

- **Search** - Search across subject, sender, and email content
- **Category Filtering** - Filter by email category
- **Real-time Updates** - Refresh and analyze emails on demand

### 7. **Email Statistics Dashboard**

Real-time statistics showing:

- Total emails processed
- Unread email count
- High priority emails
- Booking-related emails
- Spam detected

## Technical Architecture

### Components

#### 1. **EmailAgent.tsx** (`/src/components/EmailAgent.tsx`)

Main component providing:
- Email fetching and display
- AI-powered categorization
- Priority detection
- Sentiment analysis
- Action suggestions
- Search and filtering
- Statistics dashboard

#### 2. **EmailManagement.tsx** (`/src/pages/EmailManagement.tsx`)

Page component with:
- Gmail connection management
- Tabbed interface (AI Agent, Analytics, Settings)
- Integration with dashboard navigation

#### 3. **GoogleGmailConnect.tsx** (`/src/components/GoogleGmailConnect.tsx`)

OAuth connection component for Gmail API integration.

#### 4. **gmail-fetch-messages** (Supabase Edge Function)

Backend function that:
- Authenticates with Gmail API
- Fetches email messages
- Handles token refresh
- Returns formatted email data

### Data Flow

```
User → Email Management Page
  ↓
Gmail Connection Check
  ↓
Fetch Messages (Supabase Function)
  ↓
Gmail API (OAuth 2.0)
  ↓
Raw Email Data
  ↓
AI Categorization Engine
  ↓
Categorized + Prioritized + Analyzed Emails
  ↓
Display with Smart Suggestions
```

## Email Categorization Logic

### Booking Detection

```typescript
if (
  subject.includes("booking") || 
  subject.includes("reservation") || 
  from.includes("booking.com") ||
  from.includes("airbnb") ||
  from.includes("expedia")
) {
  category = "booking";
  priority = "high";
  suggestedActions = ["Review booking details", "Update calendar"];
}
```

### Guest Communication Detection

```typescript
if (
  subject.includes("guest") || 
  subject.includes("review") ||
  subject.includes("feedback") ||
  subject.includes("complaint")
) {
  category = "guest";
  priority = snippet.includes("urgent") || snippet.includes("complaint") ? "high" : "normal";
  suggestedActions = ["Respond to guest"];
  
  // Sentiment analysis
  if (snippet.includes("thank") || snippet.includes("great")) {
    sentiment = "positive";
  } else if (snippet.includes("problem") || snippet.includes("complaint")) {
    sentiment = "negative";
    priority = "high";
  }
}
```

### Marketing Detection

```typescript
if (
  subject.includes("marketing") || 
  subject.includes("promotion") ||
  subject.includes("newsletter") ||
  subject.includes("unsubscribe")
) {
  category = "marketing";
  priority = "low";
  suggestedActions = ["Consider unsubscribing", "Move to archive"];
}
```

## User Interface

### Statistics Cards

Five key metric cards displaying:
1. **Total Emails** - Overall count
2. **Unread** - Unread email count (blue)
3. **High Priority** - Critical emails (red)
4. **Bookings** - Booking-related emails (green)
5. **Spam Detected** - Potential spam (orange)

### Email List

Each email card displays:
- Subject line
- Priority badge (color-coded)
- Category badge
- Unread indicator
- Sentiment indicator (for guest emails)
- Sender information
- Date/time
- Email snippet
- AI-suggested actions (interactive buttons)

### Search and Filter Bar

- Text search input with icon
- Category dropdown filter
- Refresh button with loading animation

## Integration Points

### Dashboard Integration

The Email Management module is integrated into the main dashboard through:

1. **Route** - `/email-management`
2. **Navigation Card** - In OthersModulesSection
3. **Protected Route** - Requires authentication

### Gmail API Integration

- **OAuth 2.0** authentication
- **Scopes**: 
  - `gmail.readonly` - Read emails
  - `gmail.send` - Send emails (future feature)
  - `gmail.modify` - Modify labels (future feature)
- **Token Storage** - Supabase `google_tokens` table
- **Automatic Refresh** - Token refresh handled automatically

## Future Enhancements

### Planned Features

1. **Automatic Response Templates** - AI-generated responses based on email content
2. **Email Scheduling** - Schedule emails for future sending
3. **Follow-up Reminders** - Automatic reminders for emails requiring follow-up
4. **Booking System Integration** - Direct integration with property management system
5. **Multi-language Support** - Automatic translation and language detection
6. **Advanced Analytics** - Email trends, response times, category distribution
7. **Bulk Actions** - Archive, delete, or categorize multiple emails at once
8. **Custom Rules** - User-defined categorization and automation rules
9. **Email Templates** - Pre-built templates for common responses
10. **Integration with Other Modules** - Link emails to bookings, guests, and tasks

### Advanced AI Features

1. **Deep Learning Categorization** - ML model training on historical emails
2. **Predictive Analytics** - Predict email importance and urgency
3. **Natural Language Understanding** - Extract key information (dates, amounts, names)
4. **Automated Workflows** - Trigger actions based on email content
5. **Smart Reply Suggestions** - AI-generated reply suggestions
6. **Email Summarization** - Automatic email thread summaries

## Configuration

### Environment Variables

The following environment variables are required:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=562547913079-73vc20ll40o2cat4d7gf9h7mje51hhob.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[Your Secret]

# Supabase
SUPABASE_URL=[Your Supabase URL]
SUPABASE_ANON_KEY=[Your Supabase Anon Key]
```

### Database Schema

**google_tokens** table:
```sql
CREATE TABLE google_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage

### For End Users

1. **Connect Gmail**
   - Click "Gmail-ის დაკავშირება" button
   - Authorize with Google account (orbi.apartments1@gmail.com)
   - Grant required permissions

2. **View Emails**
   - Navigate to Email Management from dashboard
   - View categorized emails with AI insights
   - Use search and filters to find specific emails

3. **Take Actions**
   - Click suggested action buttons
   - Review high-priority emails first
   - Manage spam and marketing emails

### For Developers

1. **Extend Categorization**
   - Modify `categorizeEmail()` function in `EmailAgent.tsx`
   - Add new categories or rules
   - Update UI to display new categories

2. **Add New Features**
   - Create new components in `/src/components/`
   - Add new Supabase functions in `/supabase/functions/`
   - Update routes in `App.tsx`

3. **Customize UI**
   - Modify component styles using Tailwind CSS
   - Update card layouts and colors
   - Add new statistics or metrics

## Performance Considerations

- **Batch Processing** - Fetches up to 50 emails per request
- **Lazy Loading** - Emails loaded on demand
- **Client-side Filtering** - Fast search and filtering without API calls
- **Token Caching** - OAuth tokens cached and refreshed automatically
- **Optimistic Updates** - UI updates immediately for better UX

## Security

- **OAuth 2.0** - Secure authentication with Google
- **RLS Policies** - Row-level security on tokens table
- **HTTPS Only** - All API calls over secure connections
- **Token Encryption** - Tokens stored securely in database
- **User Isolation** - Each user can only access their own emails

## Troubleshooting

### Common Issues

1. **"Gmail არ არის დაკავშირებული"**
   - Solution: Click connect button and authorize Gmail

2. **Token Expired**
   - Solution: Automatic refresh handled by edge function

3. **No Emails Displayed**
   - Solution: Check Gmail connection, refresh manually

4. **Categorization Errors**
   - Solution: Review categorization logic, add more keywords

## Changelog

### Version 1.0 (Current)

- ✅ Gmail OAuth integration
- ✅ Email fetching and display
- ✅ AI-powered categorization
- ✅ Priority detection
- ✅ Sentiment analysis
- ✅ Smart action suggestions
- ✅ Spam detection
- ✅ Search and filtering
- ✅ Statistics dashboard
- ✅ Dashboard integration

### Upcoming (Version 1.1)

- 🔄 Email analytics page
- 🔄 Custom automation rules
- 🔄 Response templates
- 🔄 Multi-language support

## Support

For issues or questions:
- Check documentation
- Review code comments
- Contact development team

---

**Last Updated**: December 2, 2024  
**Version**: 1.0  
**Status**: Production Ready ✅
