#!/usr/bin/env python3
"""
Complete Demo Workflow
Demonstrates the full automation workflow with mock data
"""
import json
import sys
from datetime import datetime
from pathlib import Path

# Import modules
import booking_demo_data
import supabase_sync


def run_demo_workflow():
    """Run complete demo workflow"""
    print("\n" + "="*70)
    print("BOOKING.COM AUTOMATION - COMPLETE DEMO WORKFLOW")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Step 1: Generate demo data
    print("\n" + "="*70)
    print("STEP 1: Generate Demo Data")
    print("="*70)
    
    report_file = booking_demo_data.save_demo_report()
    
    # Step 2: Load and display the report
    print("\n" + "="*70)
    print("STEP 2: Load Report Data")
    print("="*70)
    
    with open(report_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"\n✅ Report loaded: {Path(report_file).name}")
    print(f"   Status: {data['status']}")
    print(f"   Data Source: {data['data_source']}")
    
    # Step 3: Prepare summary for agent notebook
    print("\n" + "="*70)
    print("STEP 3: Generate Summary")
    print("="*70)
    
    summary_lines = []
    summary_lines.append(f"Booking.com Daily Check - {datetime.now().strftime('%Y-%m-%d')}")
    summary_lines.append("")
    summary_lines.append("📊 DATA COLLECTED:")
    summary_lines.append(f"   📅 Bookings: {data['bookings']['count']}")
    
    if data['bookings']['count'] > 0:
        confirmed = len([b for b in data['bookings']['items'] if b['status'] == 'confirmed'])
        summary_lines.append(f"      - Confirmed: {confirmed}")
        summary_lines.append(f"      - Total Revenue: ${sum([b['total_price'] for b in data['bookings']['items']])}")
    
    summary_lines.append(f"   ⭐ Reviews: {data['reviews']['count']}")
    if data['reviews']['count'] > 0:
        summary_lines.append(f"      - Average Score: {data['reviews']['average_score']}")
    
    summary_lines.append(f"   💬 Messages: {data['messages']['count']}")
    if data['messages']['unread_count'] > 0:
        summary_lines.append(f"      - Unread: {data['messages']['unread_count']} ⚠️")
    
    summary_lines.append("")
    summary_lines.append("📈 STATISTICS:")
    summary_lines.append(f"   Occupancy Rate: {data['statistics']['occupancy_rate']}%")
    summary_lines.append(f"   Average Daily Rate: ${data['statistics']['average_daily_rate']}")
    summary_lines.append(f"   Review Score: {data['statistics']['review_score']}")
    summary_lines.append(f"   Monthly Revenue: ${data['statistics']['total_revenue_month']}")
    
    summary_lines.append("")
    summary_lines.append("✅ Status: Data collection completed successfully")
    summary_lines.append(f"📝 Note: This is demo data for testing the automation workflow")
    
    summary = "\n".join(summary_lines)
    
    print("\n" + "-"*70)
    print(summary)
    print("-"*70)
    
    # Step 4: Attempt Supabase sync
    print("\n" + "="*70)
    print("STEP 4: Sync to Supabase")
    print("="*70)
    
    sync = supabase_sync.SupabaseSync()
    
    if sync.configured:
        print("\n📤 Syncing to Supabase database...")
        sync.save_daily_report(data)
        sync.save_agent_notebook(data, summary)
    else:
        print("\n⚠️  Supabase not configured")
        print("   To enable database sync:")
        print("   1. Get your Supabase ANON_KEY from project settings")
        print("   2. Add it to .env file: SUPABASE_ANON_KEY=your_key_here")
        print("   3. Run this script again")
        print("\n   For now, data is saved locally in:")
        print(f"   {report_file}")
    
    # Step 5: Final summary
    print("\n" + "="*70)
    print("WORKFLOW COMPLETED SUCCESSFULLY")
    print("="*70)
    
    print("\n📊 Summary:")
    print(f"   ✅ Demo data generated")
    print(f"   ✅ Report saved: {Path(report_file).name}")
    print(f"   {'✅' if sync.configured else '⚠️ '} Supabase sync: {'completed' if sync.configured else 'skipped (not configured)'}")
    
    print("\n📁 Files created:")
    print(f"   - Report: {report_file}")
    
    print("\n🎯 Next Steps:")
    if not sync.configured:
        print("   1. Configure Supabase credentials in .env")
        print("   2. Create database tables using the schema")
        print("   3. Re-run this workflow to test database sync")
    else:
        print("   1. Check Supabase dashboard for new entries")
        print("   2. View data at: https://team.orbicitybatumi.com/agent-notebook")
        print("   3. Set up scheduled automation using cron or scheduler")
    
    print("\n" + "="*70)
    
    return True


if __name__ == "__main__":
    try:
        success = run_demo_workflow()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Workflow failed: {e}")
        sys.exit(1)
