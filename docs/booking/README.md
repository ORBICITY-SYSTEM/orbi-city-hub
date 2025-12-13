> **Project Status:** ✅ **COMPLETE & DELIVERED**
> 
> **Version:** 1.0.0
> 
> **GitHub Repository:** [ORBICITY-SYSTEM/orbi-ai-nexus](https://github.com/ORBICITY-SYSTEM/orbi-ai-nexus)

# OTA CHANNELS AGENT

**A comprehensive, multi-channel automation system designed exclusively for ORBI CITY BATUMI. This powerful agent, built by Manus AI, automates the complete management of over 15 online distribution channels, including Booking.com, Airbnb, Expedia, and Agoda.**

This system leverages a sophisticated architecture of **MINI AGENTS**, where each agent is a specialist for a specific OTA channel. Each MINI AGENT is equipped with its own **Knowledge Base**, derived from your detailed analysis documents, enabling it to make intelligent, data-driven decisions.

## Core Features

### 🧠 Intelligent Automation

- **MINI AGENT Architecture:** Dedicated agents for each OTA channel ensure specialized and efficient management.
- **Knowledge Base Integration:** Agents use your provided analysis documents (`BOOKINGCOMPLETEANALYSYS.docx`, `AGODACOMPLETEANALYSYS.docx`, etc.) to understand context, competitors, and strategy.
- **Competitor Monitoring:** A powerful system, based on your strategic guidelines, tracks and analyzes competitors across all platforms.

### ⏰ Fully Automated Task Scheduling

The agent operates on a precise, automated schedule to ensure your properties are always optimized.

| Task                  | Schedule                                    | Description                                                                                             |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Daily Morning Check**   | Every day at 09:00                          | Checks for new bookings, new reviews, and competitor price changes.                                     |
| **Daily Evening Report**  | Every day at 18:00                          | Generates a summary report of the day's activities, performance metrics, and any critical alerts.     |
| **Weekly Analysis**       | Every Monday at 10:00                       | Performs in-depth competitor analysis, price optimization for the next 14 days, and review sentiment analysis. |
| **Monthly Report**        | 1st of every month at 12:00                 | Creates a comprehensive monthly report covering revenue, channel mix, occupancy, and strategic insights.    |

### 📊 Supported Channels & Priorities

| Priority | Channel              | Automation Level | Property ID           |
| :------- | :------------------- | :--------------- | :-------------------- |
| **HIGHEST**  | `orbicitybatumi.com` | FULL             | -                     |
| **HIGH**     | `Booking.com`        | FULL             | `10172179`            |
| **HIGH**     | `Airbnb`             | FULL             | `1455314718960040955` |
| **HIGH**     | `Expedia`            | FULL             | -                     |
| **MEDIUM**   | `Agoda`              | PARTIAL          | -                     |
| **MEDIUM**   | `Hostelworld`        | PARTIAL          | -                     |
| **MEDIUM**   | `Bronevik.com`       | PARTIAL          | `757157`              |
| **LOW**      | `Tvil.ru`            | MONITORING       | `2062593`             |
| **LOW**      | `Ostrovok.ru`        | MONITORING       | `mid13345479`         |
| **LOW**      | `Sutochno.com`       | MONITORING       | -                     |
| **N/A**      | Social & Reviews     | MONITORING       | -                     |

## Getting Started

### 1. Installation

Clone the repository and install the required Python dependencies.

```bash
# Navigate to the agent's directory
cd orbi-ai-nexus/ota_channels_agent

# Install dependencies
pip3 install -r requirements.txt
```

### 2. Configuration

Create a `.env` file by copying the example file. Then, fill in your credentials.

```bash
# Create the .env file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
```

**`.env` file contents:**

```env
# --- OTA Credentials ---
BOOKING_USERNAME=your_booking_username
BOOKING_PASSWORD=your_booking_password
AIRBNB_USERNAME=your_airbnb_username
AIRBNB_PASSWORD=your_airbnb_password
EXPEDIA_USERNAME=your_expedia_username
EXPEDIA_PASSWORD=your_expedia_password

# --- Supabase Database ---
# The URL is pre-configured. Get the ANON_KEY from your Supabase project settings.
SUPABASE_URL=https://wruqshfqdciwufuelhbl.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# --- Notifications ---
# Email address to receive daily, weekly, and monthly reports.
NOTIFICATION_EMAIL=your_email@example.com

# --- AI Analysis ---
# Optional: Add your OpenAI API key for advanced text analysis (e.g., review sentiment).
OPENAI_API_KEY=your_openai_api_key

# --- Browser Settings ---
# Set to `true` to run browser automation without a visible UI (recommended for servers).
HEADLESS_MODE=false
```

### 3. Database Setup

The agent uses a Supabase PostgreSQL database to store all its data. The schema is defined in `database_schema.sql`.

1.  Go to your Supabase project: [MANUS-ORBICITY](https://supabase.com/dashboard/project/wruqshfqdciwufuelhbl)
2.  Navigate to the **SQL Editor**.
3.  Open `database_schema.sql` from this project, copy its content, and paste it into the Supabase SQL Editor.
4.  Click **"RUN"** to create all the necessary tables.

### 4. Running the Agent

You can run tasks manually or start the scheduler for fully autonomous operation.

**Manual Task Execution:**

```bash
# Run the daily morning check
python3 -m src --task daily_morning

# Run the weekly analysis
python3 -m src --task weekly_analysis
```

**Start the Autonomous Scheduler:**

To have the agent run continuously and execute all tasks automatically, simply run the `scheduler.py` script.

```bash
# Start the scheduler in the background
nohup ./scheduler.py > scheduler.log 2>&1 &

# To view the logs
tail -f scheduler.log
```

## Project Architecture

```
ota_channels_agent/
├── src/                     # Core source code
│   ├── __main__.py          # Main entry point for tasks
│   ├── config.py            # Agent configuration
│   ├── database.py          # Supabase database operations
│   ├── browser.py           # Selenium/Playwright browser automation
│   ├── competitor_monitor.py  # Competitor analysis system
│   ├── mini_agents.py       # MINI AGENT coordinator and classes
│   └── channels/            # Modules for each specific OTA channel
│       ├── booking.py
│       ├── airbnb.py
│       └── ...
├── knowledge/               # Knowledge Bases for MINI AGENTS
│   ├── booking_analysis.txt
│   └── agoda_analysis.txt
├── data/                    # Data storage
│   └── reports/             # Generated PDF/Markdown reports
├── .env                     # Environment variables (credentials)
├── .env.example             # Example environment file
├── scheduler.py             # Automated task scheduler
├── database_schema.sql      # SQL schema for Supabase
├── requirements.txt         # Python dependencies
└── README.md                # This documentation
```

---

*This agent was proudly developed by **Manus AI** for **ORBI CITY BATUMI**.*
