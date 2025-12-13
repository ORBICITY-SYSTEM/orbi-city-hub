#!/bin/bash
# Booking.com Daily Automation Runner
# Executes scraper and syncs to Supabase

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "BOOKING.COM DAILY AUTOMATION"
echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Step 1: Run the scraper
echo "Step 1: Running Booking.com scraper..."
python3 booking_scraper.py
SCRAPER_EXIT_CODE=$?

if [ $SCRAPER_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Scraper failed with exit code: $SCRAPER_EXIT_CODE"
    exit $SCRAPER_EXIT_CODE
fi

echo ""
echo "✅ Scraper completed successfully"
echo ""

# Step 2: Sync to Supabase
echo "Step 2: Syncing to Supabase..."
python3 supabase_sync.py
SYNC_EXIT_CODE=$?

if [ $SYNC_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "⚠️  Supabase sync completed with warnings"
fi

echo ""
echo "=========================================="
echo "AUTOMATION COMPLETED"
echo "Finished: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

exit 0
