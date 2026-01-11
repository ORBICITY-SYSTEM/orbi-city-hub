#!/bin/bash
# Google Cloud Shell - Node.js Installation & Project Setup

echo "🚀 Setting up Node.js and project in Cloud Shell..."

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed: $(node --version)"
else
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed: $(node --version)"
fi

# Install pnpm globally
echo "📦 Installing pnpm..."
npm install -g pnpm

# Navigate to project directory (adjust path if needed)
echo "📂 Setting up project directory..."
cd ~
mkdir -p orbi-city-hub
cd orbi-city-hub

# Clone repository if not already cloned
if [ ! -d "orbi-city-hub-main" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/ORBICITY-SYSTEM/orbi-city-hub.git orbi-city-hub-main
fi

cd orbi-city-hub-main/orbi-city-hub-main

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
OTELMS_USERNAME=tamunamaxaradze@yahoo.com
OTELMS_PASSWORD=Orbicity1234!
OTELMS_API_URL=https://otelms-api.run.app
VITE_OTELMS_API_URL=https://otelms-api.run.app

GCS_BUCKET=otelms-data

CALENDAR_RENDER_TIMEOUT=300
CALENDAR_SCAN_SECONDS=90
CALENDAR_MONTH_SHIFTS=-1,0,1
CALENDAR_TODAY=1

ROWS_API_KEY=rows-1Gn09f0kCTRULFMfdghHrCX5fGNea1m432hZ9PIBlhaC
ROWS_SPREADSHEET_ID=6TEX2TmAJXfWwBiRltFBuo
ROWS_SYNC_MODE=overwrite

ROWS_CALENDAR_TABLE_ID=cb0eed95-0f57-4640-975a-8dc7a053f732
ROWS_STATUS_TABLE_ID=9fd54415-7bfd-4e5b-b8bb-17c9e03a5273
ROWS_RLIST_CREATED_TABLE_ID=be9ac7f9-9795-4b0b-b974-d3fac458d834
ROWS_RLIST_CHECKIN_TABLE_ID=0f146429-1ed0-418c-9b8c-b1fd41be44cc
ROWS_RLIST_CHECKOUT_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41
ROWS_HISTORY_TABLE_ID=d5c025b0-55cb-473b-9657-f6f0ac3e227c
ROWS_RLIST_STAY_DAYS_TABLE_ID=ec7c99d8-88b7-430d-98ea-5273e43e9b41

RLIST_ACTIVE_CATEGORIES=Suite with Sea view,Delux suite with sea view,Superior Suite with Sea View,Interconnected Family Room
RLIST_STATUS=all
SKIP_ROWS_IF_UNCHANGED=1
ROWS_APPEND_CHUNK_SIZE=500
SCRAPER_PROFILE=prod

SERVICE_API_KEY=MySuperSecretKeyForOrbi2025
EOF

echo "✅ .env file created!"

# Install dependencies
echo "📦 Installing project dependencies..."
pnpm install

# Start development server
echo "🚀 Starting development server..."
echo "📍 Server will run on Cloud Shell's web preview (port 8080 or similar)"
echo "📝 Use Cloud Shell's 'Web Preview' button to access the app"
pnpm dev
