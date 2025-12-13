#!/usr/bin/env python3
"""
Booking.com Extranet Automation Script
Collects daily data: bookings, reviews, messages, statistics
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import json
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Configuration
BOOKING_USERNAME = os.getenv("BOOKING_USERNAME", "")
BOOKING_PASSWORD = os.getenv("BOOKING_PASSWORD", "")
BOOKING_PROPERTY_ID = "10172179"
HEADLESS = os.getenv("HEADLESS_MODE", "false").lower() == "true"

class BookingExtranetScraper:
    """Booking.com Extranet automation"""
    
    def __init__(self):
        self.username = BOOKING_USERNAME
        self.password = BOOKING_PASSWORD
        self.property_id = BOOKING_PROPERTY_ID
        self.headless = HEADLESS
        self.browser = None
        self.context = None
        self.page = None
        
        # Data storage
        self.data = {
            "timestamp": datetime.now().isoformat(),
            "property_id": self.property_id,
            "bookings": [],
            "reviews": [],
            "messages": [],
            "statistics": {},
            "errors": []
        }
    
    def start_browser(self):
        """Initialize browser"""
        print("🌐 Starting browser...")
        playwright = sync_playwright().start()
        self.browser = playwright.chromium.launch(headless=self.headless)
        self.context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        self.page = self.context.new_page()
        print("✅ Browser started")
    
    def login(self):
        """Login to Booking.com Extranet"""
        print("\n🔐 Logging in to Booking.com Extranet...")
        
        try:
            # Navigate to login page
            self.page.goto("https://admin.booking.com/hotel/hoteladmin/", timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            
            # Wait for username field
            print("   Entering username...")
            username_selector = 'input[name="loginname"], input[type="email"], input#loginname'
            self.page.wait_for_selector(username_selector, timeout=10000)
            self.page.fill(username_selector, self.username)
            
            # Click continue/next button
            continue_button = 'button[type="submit"], button:has-text("Continue"), button:has-text("Next")'
            self.page.click(continue_button)
            self.page.wait_for_timeout(2000)
            
            # Enter password
            print("   Entering password...")
            password_selector = 'input[name="password"], input[type="password"], input#password'
            self.page.wait_for_selector(password_selector, timeout=10000)
            self.page.fill(password_selector, self.password)
            
            # Click sign in button
            signin_button = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")'
            self.page.click(signin_button)
            
            # Wait for dashboard to load
            print("   Waiting for dashboard...")
            self.page.wait_for_load_state("networkidle", timeout=60000)
            self.page.wait_for_timeout(3000)
            
            # Check if login was successful
            current_url = self.page.url
            if "extranet" in current_url or "hoteladmin" in current_url:
                print("✅ Login successful!")
                return True
            else:
                print(f"⚠️  Unexpected URL after login: {current_url}")
                return False
                
        except Exception as e:
            error_msg = f"Login failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def navigate_to_dashboard(self):
        """Navigate to main dashboard"""
        print("\n📊 Navigating to dashboard...")
        try:
            dashboard_url = f"https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?hotel_id={self.property_id}&lang=en"
            self.page.goto(dashboard_url, timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            self.page.wait_for_timeout(2000)
            print("✅ Dashboard loaded")
            return True
        except Exception as e:
            error_msg = f"Dashboard navigation failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def collect_bookings(self):
        """Collect recent bookings"""
        print("\n📅 Collecting bookings...")
        try:
            # Navigate to reservations page
            reservations_url = f"https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reservations.html?hotel_id={self.property_id}"
            self.page.goto(reservations_url, timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            self.page.wait_for_timeout(3000)
            
            # Try to extract booking information
            # Note: Booking.com uses dynamic content, so we'll capture what we can
            bookings_count = 0
            
            # Look for booking cards or rows
            booking_selectors = [
                '[data-testid="reservation-card"]',
                '.reservation-row',
                '[class*="reservation"]',
                '[class*="booking"]'
            ]
            
            for selector in booking_selectors:
                try:
                    elements = self.page.query_selector_all(selector)
                    if elements:
                        bookings_count = len(elements)
                        print(f"   Found {bookings_count} booking elements")
                        break
                except:
                    continue
            
            self.data["bookings"] = {
                "count": bookings_count,
                "collected_at": datetime.now().isoformat()
            }
            
            print(f"✅ Bookings collected: {bookings_count}")
            return True
            
        except Exception as e:
            error_msg = f"Bookings collection failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def collect_reviews(self):
        """Collect recent reviews"""
        print("\n⭐ Collecting reviews...")
        try:
            # Navigate to reviews page
            reviews_url = f"https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html?hotel_id={self.property_id}"
            self.page.goto(reviews_url, timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            self.page.wait_for_timeout(3000)
            
            reviews_count = 0
            
            # Look for review elements
            review_selectors = [
                '[data-testid="review-card"]',
                '.review-item',
                '[class*="review"]'
            ]
            
            for selector in review_selectors:
                try:
                    elements = self.page.query_selector_all(selector)
                    if elements:
                        reviews_count = len(elements)
                        print(f"   Found {reviews_count} review elements")
                        break
                except:
                    continue
            
            self.data["reviews"] = {
                "count": reviews_count,
                "collected_at": datetime.now().isoformat()
            }
            
            print(f"✅ Reviews collected: {reviews_count}")
            return True
            
        except Exception as e:
            error_msg = f"Reviews collection failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def collect_messages(self):
        """Collect guest messages"""
        print("\n💬 Collecting messages...")
        try:
            # Navigate to inbox/messages
            messages_url = f"https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/inbox.html?hotel_id={self.property_id}"
            self.page.goto(messages_url, timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            self.page.wait_for_timeout(3000)
            
            messages_count = 0
            
            # Look for message elements
            message_selectors = [
                '[data-testid="message-card"]',
                '.message-item',
                '[class*="message"]',
                '[class*="inbox-item"]'
            ]
            
            for selector in message_selectors:
                try:
                    elements = self.page.query_selector_all(selector)
                    if elements:
                        messages_count = len(elements)
                        print(f"   Found {messages_count} message elements")
                        break
                except:
                    continue
            
            self.data["messages"] = {
                "count": messages_count,
                "collected_at": datetime.now().isoformat()
            }
            
            print(f"✅ Messages collected: {messages_count}")
            return True
            
        except Exception as e:
            error_msg = f"Messages collection failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def collect_statistics(self):
        """Collect property statistics"""
        print("\n📊 Collecting statistics...")
        try:
            # Navigate to statistics/performance page
            stats_url = f"https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?hotel_id={self.property_id}"
            self.page.goto(stats_url, timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            self.page.wait_for_timeout(3000)
            
            # Try to extract key statistics
            stats = {
                "collected_at": datetime.now().isoformat(),
                "property_id": self.property_id
            }
            
            # Look for statistics elements (these are examples, actual selectors may vary)
            stat_selectors = {
                "occupancy": '[data-testid="occupancy"], [class*="occupancy"]',
                "revenue": '[data-testid="revenue"], [class*="revenue"]',
                "score": '[data-testid="score"], [class*="score"]'
            }
            
            for stat_name, selector in stat_selectors.items():
                try:
                    element = self.page.query_selector(selector)
                    if element:
                        stats[stat_name] = element.inner_text()
                except:
                    stats[stat_name] = "N/A"
            
            self.data["statistics"] = stats
            
            print(f"✅ Statistics collected")
            return True
            
        except Exception as e:
            error_msg = f"Statistics collection failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def take_screenshot(self, name="screenshot"):
        """Take screenshot for debugging"""
        try:
            screenshot_dir = Path(__file__).parent / "data" / "screenshots"
            screenshot_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = screenshot_dir / f"{name}_{timestamp}.png"
            
            self.page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"📸 Screenshot saved: {screenshot_path}")
            return str(screenshot_path)
        except Exception as e:
            print(f"⚠️  Screenshot failed: {e}")
            return None
    
    def save_data(self):
        """Save collected data to JSON file"""
        print("\n💾 Saving data...")
        try:
            data_dir = Path(__file__).parent / "data" / "daily_reports"
            data_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = data_dir / f"booking_report_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Data saved: {filename}")
            return str(filename)
            
        except Exception as e:
            print(f"❌ Save failed: {e}")
            return None
    
    def close_browser(self):
        """Close browser"""
        if self.browser:
            self.browser.close()
            print("🔚 Browser closed")
    
    def run(self):
        """Run complete automation"""
        print("\n" + "="*60)
        print("BOOKING.COM EXTRANET AUTOMATION")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        try:
            # Start browser
            self.start_browser()
            
            # Login
            if not self.login():
                print("\n❌ Automation failed: Login unsuccessful")
                self.take_screenshot("login_failed")
                return False
            
            # Navigate to dashboard
            if not self.navigate_to_dashboard():
                print("\n❌ Automation failed: Dashboard navigation unsuccessful")
                self.take_screenshot("dashboard_failed")
                return False
            
            # Collect data
            self.collect_bookings()
            self.collect_reviews()
            self.collect_messages()
            self.collect_statistics()
            
            # Take final screenshot
            self.take_screenshot("final_dashboard")
            
            # Save data
            data_file = self.save_data()
            
            print("\n" + "="*60)
            print("AUTOMATION COMPLETED SUCCESSFULLY")
            print("="*60)
            print(f"\n📊 Summary:")
            print(f"   Bookings: {self.data['bookings'].get('count', 0)}")
            print(f"   Reviews: {self.data['reviews'].get('count', 0)}")
            print(f"   Messages: {self.data['messages'].get('count', 0)}")
            print(f"   Errors: {len(self.data['errors'])}")
            
            if self.data['errors']:
                print(f"\n⚠️  Errors encountered:")
                for error in self.data['errors']:
                    print(f"   - {error}")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")
            self.data["errors"].append(f"Fatal error: {str(e)}")
            self.take_screenshot("fatal_error")
            return False
            
        finally:
            self.close_browser()


def main():
    """Main entry point"""
    scraper = BookingExtranetScraper()
    success = scraper.run()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
