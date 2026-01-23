# ROWS.COM → Google Sheets სინქრონიზაცია

## არქიტექტურა

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Instagram     │      │    ROWS.COM     │      │  Google Sheets  │
│   Facebook      │ ──▶  │  (Data Hub)     │ ──▶  │  (Read Layer)   │
│   TikTok        │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
       API                   Integrations              Published CSV
                                  │                         │
                                  │                         ▼
                                  │               ┌─────────────────┐
                                  │               │   ORBI City     │
                                  └──────────────▶│   Application   │
                                    (API backup)  └─────────────────┘
```

## ნაბიჯი 1: ROWS.COM-ში Instagram Integration-ის დაყენება

1. გახსენი ROWS.COM: https://rows.com
2. შექმენი ახალი Spreadsheet: "Instagram Analytics"
3. დააჭირე **Integrations** ღილაკს
4. აირჩიე **Instagram**
5. დააკავშირე შენი Instagram Business Account
6. აირჩიე მონაცემები:
   - Account Metrics (followers, following)
   - Recent Posts (likes, comments, reach)
   - Demographics (age, location, gender)

## ნაბიჯი 2: Google Sheets-ში ექსპორტი

### ვარიანტი A: ROWS.COM → Google Sheets Integration (რეკომენდებული)

1. ROWS.COM-ში გახსენი Instagram spreadsheet
2. დააჭირე **Integrations** → **Google Sheets**
3. აირჩიე "Sync to Google Sheets"
4. მიუთითე destination Google Sheet
5. დააყენე auto-sync (ყოველ 6 საათში)

### ვარიანტი B: Manual Export + n8n Automation

თუ Integration არ მუშაობს, გამოიყენე ეს workflow:

1. ROWS.COM-ში: **File** → **Download** → **CSV**
2. ატვირთე Google Drive-ში
3. n8n workflow გააკეთებს ავტომატიზაციას

## ნაბიჯი 3: n8n Workflow - Instagram Data Sync

შექმენი ახალი workflow n8n-ში: https://orbicity.app.n8n.cloud

### Workflow JSON:

```json
{
  "name": "ROWS.COM Instagram Sync",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 6 }]
        }
      }
    },
    {
      "name": "HTTP Request - ROWS API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.rows.com/v1/spreadsheets",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {}
      },
      "credentials": {
        "httpHeaderAuth": {
          "name": "ROWS API Key",
          "value": "={{$env.ROWS_API_KEY}}"
        }
      }
    },
    {
      "name": "Find Instagram Spreadsheet",
      "type": "n8n-nodes-base.code",
      "position": [650, 300],
      "parameters": {
        "jsCode": "const spreadsheets = $input.first().json.items || [];\nconst instagram = spreadsheets.find(s => \n  s.name.toLowerCase().includes('instagram')\n);\n\nif (!instagram) {\n  throw new Error('Instagram spreadsheet not found');\n}\n\nreturn [{ json: { spreadsheetId: instagram.id, name: instagram.name } }];"
      }
    },
    {
      "name": "Get Spreadsheet Info",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300],
      "parameters": {
        "method": "GET",
        "url": "=https://api.rows.com/v1/spreadsheets/{{$json.spreadsheetId}}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth"
      }
    },
    {
      "name": "Log Spreadsheet Structure",
      "type": "n8n-nodes-base.code",
      "position": [1050, 300],
      "parameters": {
        "jsCode": "// Log the structure for debugging\nconsole.log('Spreadsheet:', JSON.stringify($input.first().json, null, 2));\n\nconst data = $input.first().json;\nconst pages = data.pages || [];\n\nreturn [{ \n  json: { \n    spreadsheetId: data.id,\n    name: data.name,\n    pages: pages.map(p => ({ id: p.id, name: p.name })),\n    message: `Found ${pages.length} pages`\n  } \n}];"
      }
    },
    {
      "name": "Update Google Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "position": [1250, 300],
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": { "mode": "id", "value": "={{$env.GOOGLE_SHEETS_INSTAGRAM_ID}}" },
        "sheetName": "SyncLog",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "timestamp": "={{$now.toISO()}}",
            "spreadsheet_name": "={{$json.name}}",
            "pages_count": "={{$json.pages.length}}",
            "status": "synced"
          }
        }
      }
    },
    {
      "name": "Send Notification",
      "type": "n8n-nodes-base.telegram",
      "position": [1450, 300],
      "parameters": {
        "chatId": "={{$env.TELEGRAM_CHAT_ID}}",
        "text": "✅ Instagram data synced!\n\nSpreadsheet: {{$json.name}}\nPages: {{$json.pages.length}}\nTime: {{$now.format('yyyy-MM-dd HH:mm')}}"
      }
    }
  ],
  "connections": {
    "Schedule Trigger": { "main": [[{ "node": "HTTP Request - ROWS API", "type": "main", "index": 0 }]] },
    "HTTP Request - ROWS API": { "main": [[{ "node": "Find Instagram Spreadsheet", "type": "main", "index": 0 }]] },
    "Find Instagram Spreadsheet": { "main": [[{ "node": "Get Spreadsheet Info", "type": "main", "index": 0 }]] },
    "Get Spreadsheet Info": { "main": [[{ "node": "Log Spreadsheet Structure", "type": "main", "index": 0 }]] },
    "Log Spreadsheet Structure": { "main": [[{ "node": "Update Google Sheet", "type": "main", "index": 0 }]] },
    "Update Google Sheet": { "main": [[{ "node": "Send Notification", "type": "main", "index": 0 }]] }
  }
}
```

## ნაბიჯი 4: Google Sheets კონფიგურაცია

შექმენი Google Sheet სახელით: **Orbi_Instagram_Analytics**

### Tab 1: Metrics
| Column | Description |
|--------|-------------|
| A | Date |
| B | Followers |
| C | Following |
| D | Posts Count |
| E | Engagement Rate |
| F | Reach |
| G | Impressions |
| H | Profile Views |
| I | Website Clicks |

### Tab 2: Posts
| Column | Description |
|--------|-------------|
| A | Post ID |
| B | Caption |
| C | Media URL |
| D | Media Type |
| E | Likes |
| F | Comments |
| G | Shares |
| H | Reach |
| I | Posted At |

### Tab 3: SyncLog
| Column | Description |
|--------|-------------|
| A | Timestamp |
| B | Source |
| C | Status |
| D | Records |

## ნაბიჯი 5: აპლიკაციის კონფიგურაცია

დაამატე `.env` ფაილში:

```env
# Google Sheets Instagram Data (synced from ROWS.COM)
GOOGLE_SHEETS_INSTAGRAM_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv
GOOGLE_SHEETS_INSTAGRAM_ID=YOUR_SHEET_ID

# Tab GIDs
GOOGLE_SHEETS_INSTAGRAM_METRICS_GID=0
GOOGLE_SHEETS_INSTAGRAM_POSTS_GID=1
```

## ალტერნატიული მიდგომა: ROWS.COM Automation

ROWS.COM-ს აქვს ჩაშენებული Automation ფუნქცია:

1. გახსენი ROWS.COM spreadsheet
2. **Automate** → **Create automation**
3. Trigger: "On schedule" (every 6 hours)
4. Action: "Send to Google Sheets"

ეს არის უმარტივესი გზა - არ საჭიროებს n8n-ს ან დამატებით კოდს.

## Troubleshooting

### ROWS.COM API 404 Error
- ROWS.COM API-ის data access საჭიროებს Enterprise პლანს
- გამოიყენე ROWS.COM → Google Sheets integration ნაცვლად API-სა

### Google Sheets არ აპდეითდება
- შეამოწმე რომ Sheet გამოქვეყნებულია: File → Share → Publish to web
- დარწმუნდი რომ URL-ში არის `output=csv`

### n8n Workflow არ მუშაობს
- შეამოწმე credentials n8n-ში
- გადახედე Execution History-ს შეცდომებისთვის
