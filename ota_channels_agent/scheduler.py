#!/usr/bin/env python3
"""
OTA CHANNELS AGENT - Task Scheduler
Manages automated execution of daily, weekly, and monthly tasks
"""
import schedule
import time
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src import config

def run_task(task_name: str):
    """Execute a task using the main agent"""
    print(f"\n{'='*60}")
    print(f"Running scheduled task: {task_name}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(
            [sys.executable, "-m", "src", "--task", task_name],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True
        )
        
        print(result.stdout)
        if result.stderr:
            print(f"Errors: {result.stderr}")
        
        if result.returncode == 0:
            print(f"✅ Task {task_name} completed successfully")
        else:
            print(f"❌ Task {task_name} failed with code {result.returncode}")
            
    except Exception as e:
        print(f"❌ Error running task {task_name}: {e}")

def daily_morning():
    """Daily morning check at 9:00 AM"""
    run_task("daily_morning")

def daily_evening():
    """Daily evening report at 6:00 PM"""
    run_task("daily_evening")

def weekly():
    """Weekly analysis on Monday at 10:00 AM"""
    run_task("weekly_analysis")

def monthly():
    """Monthly report on 1st of month at 12:00 PM"""
    run_task("monthly_report")

def setup_schedule():
    """Configure all scheduled tasks"""
    
    # Daily tasks
    schedule.every().day.at(config.DAILY_MORNING_TIME).do(daily_morning)
    schedule.every().day.at(config.DAILY_EVENING_TIME).do(daily_evening)
    
    # Weekly task (Monday)
    schedule.every().monday.at(config.WEEKLY_TIME).do(weekly)
    
    # Monthly task (1st of month)
    # Note: schedule library doesn't support monthly directly,
    # so we check daily and run on 1st
    def check_monthly():
        if datetime.now().day == config.MONTHLY_DAY:
            monthly()
    
    schedule.every().day.at(config.MONTHLY_TIME).do(check_monthly)
    
    print("✅ OTA CHANNELS AGENT Scheduler initialized")
    print(f"\nScheduled tasks:")
    print(f"  • Daily Morning Check: Every day at {config.DAILY_MORNING_TIME}")
    print(f"  • Daily Evening Report: Every day at {config.DAILY_EVENING_TIME}")
    print(f"  • Weekly Analysis: Every {config.WEEKLY_DAY} at {config.WEEKLY_TIME}")
    print(f"  • Monthly Report: {config.MONTHLY_DAY}st of month at {config.MONTHLY_TIME}")
    print(f"\n{'='*60}\n")

def main():
    """Main scheduler loop"""
    print("\n" + "="*60)
    print("OTA CHANNELS AGENT - Scheduler Starting")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    setup_schedule()
    
    # Run the scheduler
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\n\n⚠️  Scheduler stopped by user")
    except Exception as e:
        print(f"\n\n❌ Scheduler error: {e}")

if __name__ == "__main__":
    main()
