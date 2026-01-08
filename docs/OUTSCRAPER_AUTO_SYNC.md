# Outscraper Auto-Sync Setup Guide

## Overview

This guide explains how to set up automatic daily synchronization of reviews from Outscraper to ORBI City Hub.

## Prerequisites

1. Outscraper account with API access
2. ORBI City Hub deployed and running
3. Webhook URL from Reviews Command Center

## Step 1: Get Your Webhook URL

1. Go to **Marketing → Reviews & Reputation**
2. Click **"Outscraper Webhook"** button
3. Copy the webhook URL:
   ```
   https://hub.orbicitybatumi.com/api/trpc/reviews.receiveOutscraperWebhook
   ```

## Step 2: Configure Outscraper

### Option A: Outscraper Dashboard (Recommended)

1. Log in to [Outscraper Dashboard](https://app.outscraper.com)
2. Go to **Automations** → **Create New**
3. Select **Google Maps Reviews** task
4. Configure:
   - **Query**: `ORBI City Sea View Batumi` (your business name)
   - **Schedule**: Daily at 6:00 AM
   - **Webhook URL**: Paste your webhook URL
   - **Format**: JSON

### Option B: Outscraper API

```python
import requests
import os

OUTSCRAPER_API_KEY = os.environ.get('OUTSCRAPER_API_KEY')

# Create scheduled task
response = requests.post(
    'https://api.outscraper.com/automations',
    headers={'X-API-KEY': OUTSCRAPER_API_KEY},
    json={
        'task': 'google_maps_reviews',
        'query': 'ORBI City Sea View Batumi',
        'schedule': '0 6 * * *',  # Daily at 6 AM
        'webhook_url': 'https://hub.orbicitybatumi.com/api/trpc/reviews.receiveOutscraperWebhook'
    }
)
```

## Step 3: Verify Integration

1. After first sync, check **Reviews & Reputation** page
2. Verify "Last Sync" timestamp is updated
3. Check platform breakdown shows correct counts

## Supported Platforms

| Platform | Outscraper Support | Status |
|----------|-------------------|--------|
| Google Maps | ✅ Full | Active |
| Booking.com | ✅ Full | Active |
| Airbnb | ✅ Full | Active |
| TripAdvisor | ✅ Full | Active |
| Agoda | ⚠️ Limited | Manual |
| Expedia | ⚠️ Limited | Manual |

## Webhook Payload Format

Outscraper sends reviews in this format:

```json
{
  "data": [
    {
      "name": "ORBI City Sea View",
      "reviews": [
        {
          "review_id": "abc123",
          "author_title": "John Doe",
          "review_rating": 5,
          "review_text": "Amazing view!",
          "review_datetime_utc": "2025-12-20T10:30:00Z",
          "owner_answer": null
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Reviews not syncing?

1. Check webhook URL is correct
2. Verify Outscraper API key is valid
3. Check server logs for errors

### Duplicate reviews?

The system automatically deduplicates by `externalId`. No action needed.

### Missing platforms?

For platforms not supported by Outscraper, use manual import or alternative APIs.

## Alternative: Manual Sync

Click **"Sync"** button in Reviews Command Center to manually trigger demo data import for testing.

## Contact

For issues with Outscraper integration, contact support@outscraper.com
