#!/usr/bin/env python3
"""
Supabase Integration for Booking.com Automation
Saves collected data to Supabase tables
"""
import os
import sys
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wruqshfqdciwufuelhbl.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


class SupabaseSync:
    """Sync automation data to Supabase"""
    
    def __init__(self):
        self.url = SUPABASE_URL
        self.anon_key = SUPABASE_ANON_KEY
        self.client = None
        
        # Check if credentials are configured
        if not self.anon_key:
            print("⚠️  Warning: SUPABASE_ANON_KEY not configured")
            print("   Data will be saved locally only")
            self.configured = False
        else:
            self.configured = True
            self._init_client()
    
    def _init_client(self):
        """Initialize Supabase client"""
        try:
            from supabase import create_client, Client
            self.client = create_client(self.url, self.anon_key)
            print("✅ Supabase client initialized")
        except Exception as e:
            print(f"❌ Supabase client initialization failed: {e}")
            self.configured = False
    
    def save_daily_report(self, data):
        """Save to booking_daily_reports table"""
        if not self.configured:
            print("⚠️  Skipping Supabase save (not configured)")
            return False
        
        print("\n💾 Saving to booking_daily_reports...")
        
        try:
            # Prepare record
            record = {
                "property_id": data.get("property_id", "10172179"),
                "report_date": datetime.now().date().isoformat(),
                "bookings_count": data.get("bookings", {}).get("count", 0),
                "reviews_count": data.get("reviews", {}).get("count", 0),
                "messages_count": data.get("messages", {}).get("count", 0),
                "statistics": data.get("statistics", {}),
                "errors": data.get("errors", []),
                "raw_data": data,
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into Supabase
            result = self.client.table("booking_daily_reports").insert(record).execute()
            
            print(f"✅ Saved to booking_daily_reports")
            return True
            
        except Exception as e:
            print(f"❌ Failed to save to booking_daily_reports: {e}")
            return False
    
    def save_agent_notebook(self, data, summary_text):
        """Save to agent_notebook table"""
        if not self.configured:
            print("⚠️  Skipping Supabase save (not configured)")
            return False
        
        print("\n💾 Saving to agent_notebook...")
        
        try:
            # Prepare notebook entry
            entry = {
                "agent_name": "Booking.com Automation",
                "task_type": "daily_check",
                "status": "success" if len(data.get("errors", [])) == 0 else "completed_with_errors",
                "summary": summary_text,
                "details": data,
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into Supabase
            result = self.client.table("agent_notebook").insert(entry).execute()
            
            print(f"✅ Saved to agent_notebook")
            return True
            
        except Exception as e:
            print(f"❌ Failed to save to agent_notebook: {e}")
            return False
    
    def sync_latest_report(self):
        """Find and sync the latest report file"""
        print("\n" + "="*60)
        print("SUPABASE SYNC")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        # Find latest report file
        data_dir = Path(__file__).parent / "data" / "daily_reports"
        
        if not data_dir.exists():
            print("❌ No reports directory found")
            return False
        
        report_files = sorted(data_dir.glob("booking_report_*.json"), reverse=True)
        
        if not report_files:
            print("❌ No report files found")
            return False
        
        latest_report = report_files[0]
        print(f"\n📄 Latest report: {latest_report.name}")
        
        # Load report data
        try:
            with open(latest_report, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ Failed to load report: {e}")
            return False
        
        # Generate summary
        summary = self._generate_summary(data)
        print(f"\n📝 Summary:\n{summary}")
        
        # Save to Supabase
        success_daily = self.save_daily_report(data)
        success_notebook = self.save_agent_notebook(data, summary)
        
        if success_daily and success_notebook:
            print("\n✅ Sync completed successfully!")
            return True
        else:
            print("\n⚠️  Sync completed with warnings")
            return False
    
    def _generate_summary(self, data):
        """Generate human-readable summary"""
        lines = []
        lines.append(f"Booking.com Daily Check - {datetime.now().strftime('%Y-%m-%d')}")
        lines.append("")
        lines.append(f"📅 Bookings: {data.get('bookings', {}).get('count', 0)}")
        lines.append(f"⭐ Reviews: {data.get('reviews', {}).get('count', 0)}")
        lines.append(f"💬 Messages: {data.get('messages', {}).get('count', 0)}")
        
        if data.get('errors'):
            lines.append(f"\n⚠️  Errors: {len(data['errors'])}")
            for error in data['errors'][:3]:  # Show first 3 errors
                lines.append(f"   - {error}")
        else:
            lines.append("\n✅ No errors")
        
        return "\n".join(lines)


def main():
    """Main entry point"""
    sync = SupabaseSync()
    success = sync.sync_latest_report()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
