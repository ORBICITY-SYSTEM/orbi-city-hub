#!/usr/bin/env python3
"""
Booking.com Extranet Automation Script v2
With cookie management and CAPTCHA handling
"""
import os
import sys
import json
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Configuration
BOOKING_USERNAME = os.getenv("BOOKING_USERNAME", "")
BOOKING_PASSWORD = os.getenv("BOOKING_PASSWORD", "")
BOOKING_PROPERTY_ID = "10172179"
HEADLESS = os.getenv("HEADLESS_MODE", "false").lower() == "true"

# Paths
COOKIES_FILE = Path(__file__).parent / "data" / "cookies" / "booking_cookies.json"
SCREENSHOTS_DIR = Path(__file__).parent / "data" / "screenshots"
REPORTS_DIR = Path(__file__).parent / "data" / "daily_reports"

# Create directories
COOKIES_FILE.parent.mkdir(parents=True, exist_ok=True)
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


class BookingExtranetScraper:
    """Booking.com Extranet automation with cookie management"""
    
    def __init__(self):
        self.username = BOOKING_USERNAME
        self.password = BOOKING_PASSWORD
        self.property_id = BOOKING_PROPERTY_ID
        self.headless = HEADLESS
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        
        # Data storage
        self.data = {
            "timestamp": datetime.now().isoformat(),
            "property_id": self.property_id,
            "bookings": {},
            "reviews": {},
            "messages": {},
            "statistics": {},
            "errors": [],
            "status": "started"
        }
    
    def start_browser(self, use_cookies=True):
        """Initialize browser with optional cookie loading"""
        print("🌐 Starting browser...")
        
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=self.headless,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        # Create context with cookies if available
        context_options = {
            'viewport': {'width': 1920, 'height': 1080},
            'user_agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        self.context = self.browser.new_context(**context_options)
        
        # Load cookies if they exist
        if use_cookies and COOKIES_FILE.exists():
            try:
                with open(COOKIES_FILE, 'r') as f:
                    cookies = json.load(f)
                self.context.add_cookies(cookies)
                print("✅ Loaded saved cookies")
            except Exception as e:
                print(f"⚠️  Could not load cookies: {e}")
        
        self.page = self.context.new_page()
        print("✅ Browser started")
    
    def save_cookies(self):
        """Save current session cookies"""
        try:
            cookies = self.context.cookies()
            with open(COOKIES_FILE, 'w') as f:
                json.dump(cookies, f, indent=2)
            print("✅ Cookies saved")
            return True
        except Exception as e:
            print(f"⚠️  Could not save cookies: {e}")
            return False
    
    def check_if_logged_in(self):
        """Check if already logged in"""
        try:
            # Navigate to extranet
            print("🔍 Checking login status...")
            self.page.goto("https://admin.booking.com/hotel/hoteladmin/", timeout=30000)
            self.page.wait_for_load_state("networkidle", timeout=15000)
            
            current_url = self.page.url
            
            # If we're redirected to dashboard/extranet, we're logged in
            if "extranet" in current_url or "manage" in current_url:
                print("✅ Already logged in!")
                return True
            
            # Check for login form
            login_indicators = [
                'input[name="loginname"]',
                'input[type="email"]',
                'input#loginname'
            ]
            
            for selector in login_indicators:
                if self.page.query_selector(selector):
                    print("❌ Not logged in (login form detected)")
                    return False
            
            return False
            
        except Exception as e:
            print(f"⚠️  Could not check login status: {e}")
            return False
    
    def login_interactive(self):
        """Interactive login (requires manual CAPTCHA solving)"""
        print("\n🔐 Starting interactive login...")
        print("⚠️  CAPTCHA may appear - please solve it manually if needed")
        
        try:
            # Navigate to login page
            self.page.goto("https://admin.booking.com/hotel/hoteladmin/", timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            
            # Enter username
            print("   Entering username...")
            username_selectors = [
                'input[name="loginname"]',
                'input[type="email"]',
                'input#loginname',
                'input[id*="login"]',
                'input[name*="email"]'
            ]
            
            username_filled = False
            for selector in username_selectors:
                try:
                    if self.page.query_selector(selector):
                        self.page.fill(selector, self.username, timeout=5000)
                        username_filled = True
                        break
                except:
                    continue
            
            if not username_filled:
                print("❌ Could not find username field")
                self.take_screenshot("username_field_not_found")
                return False
            
            # Click continue/next
            self.page.wait_for_timeout(1000)
            continue_buttons = [
                'button[type="submit"]',
                'button:has-text("Continue")',
                'button:has-text("Next")',
                'input[type="submit"]'
            ]
            
            for selector in continue_buttons:
                try:
                    if self.page.query_selector(selector):
                        self.page.click(selector, timeout=5000)
                        break
                except:
                    continue
            
            # Wait for password field or CAPTCHA
            self.page.wait_for_timeout(3000)
            
            # Check for CAPTCHA
            captcha_indicators = [
                'text="Let\'s make sure you\'re human"',
                '[class*="captcha"]',
                '[id*="captcha"]',
                'text="Choose all"'
            ]
            
            has_captcha = False
            for indicator in captcha_indicators:
                if self.page.query_selector(indicator):
                    has_captcha = True
                    break
            
            if has_captcha:
                print("\n⚠️  CAPTCHA DETECTED!")
                print("   Please solve the CAPTCHA manually in the browser window")
                print("   Waiting for 60 seconds...")
                self.take_screenshot("captcha_detected")
                
                # Wait for user to solve CAPTCHA
                self.page.wait_for_timeout(60000)
            
            # Enter password
            print("   Entering password...")
            password_selectors = [
                'input[name="password"]',
                'input[type="password"]',
                'input#password'
            ]
            
            password_filled = False
            for selector in password_selectors:
                try:
                    if self.page.query_selector(selector):
                        self.page.fill(selector, self.password, timeout=5000)
                        password_filled = True
                        break
                except:
                    continue
            
            if not password_filled:
                print("⚠️  Could not find password field, may already be past login")
            else:
                # Click sign in
                signin_buttons = [
                    'button[type="submit"]',
                    'button:has-text("Sign in")',
                    'button:has-text("Log in")',
                    'input[type="submit"]'
                ]
                
                for selector in signin_buttons:
                    try:
                        if self.page.query_selector(selector):
                            self.page.click(selector, timeout=5000)
                            break
                    except:
                        continue
            
            # Wait for dashboard
            print("   Waiting for dashboard...")
            self.page.wait_for_load_state("networkidle", timeout=60000)
            self.page.wait_for_timeout(5000)
            
            # Verify login
            current_url = self.page.url
            if "extranet" in current_url or "manage" in current_url or "hoteladmin" in current_url:
                print("✅ Login successful!")
                self.save_cookies()
                return True
            else:
                print(f"⚠️  Unexpected URL after login: {current_url}")
                self.take_screenshot("unexpected_url")
                return False
            
        except Exception as e:
            error_msg = f"Login failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            self.take_screenshot("login_error")
            return False
    
    def navigate_to_dashboard(self):
        """Navigate to property dashboard"""
        print("\n📊 Navigating to dashboard...")
        try:
            dashboard_url = f"https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?hotel_id={self.property_id}&lang=en"
            self.page.goto(dashboard_url, timeout=60000)
            self.page.wait_for_load_state("networkidle", timeout=30000)
            self.page.wait_for_timeout(3000)
            print("✅ Dashboard loaded")
            self.take_screenshot("dashboard")
            return True
        except Exception as e:
            error_msg = f"Dashboard navigation failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def collect_data_from_page(self):
        """Collect all available data from current page"""
        print("\n📊 Collecting data from page...")
        
        try:
            # Get page content
            content = self.page.content()
            
            # Extract basic metrics (this is a simplified version)
            self.data["statistics"] = {
                "page_title": self.page.title(),
                "current_url": self.page.url,
                "collected_at": datetime.now().isoformat()
            }
            
            # Try to find specific data elements
            # Note: Actual selectors will vary based on Booking.com's current UI
            
            print("✅ Data collected")
            return True
            
        except Exception as e:
            error_msg = f"Data collection failed: {str(e)}"
            print(f"❌ {error_msg}")
            self.data["errors"].append(error_msg)
            return False
    
    def take_screenshot(self, name="screenshot"):
        """Take screenshot"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = SCREENSHOTS_DIR / f"{name}_{timestamp}.png"
            
            self.page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"📸 Screenshot: {screenshot_path.name}")
            return str(screenshot_path)
        except Exception as e:
            print(f"⚠️  Screenshot failed: {e}")
            return None
    
    def save_report(self):
        """Save collected data"""
        print("\n💾 Saving report...")
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = REPORTS_DIR / f"booking_report_{timestamp}.json"
            
            self.data["status"] = "completed"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Report saved: {filename.name}")
            return str(filename)
            
        except Exception as e:
            print(f"❌ Save failed: {e}")
            return None
    
    def close_browser(self):
        """Close browser"""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        print("🔚 Browser closed")
    
    def run(self):
        """Run complete automation"""
        print("\n" + "="*60)
        print("BOOKING.COM EXTRANET AUTOMATION V2")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        try:
            # Start browser with cookies
            self.start_browser(use_cookies=True)
            
            # Check if already logged in
            if not self.check_if_logged_in():
                # Need to login
                if not self.login_interactive():
                    print("\n❌ Automation failed: Login unsuccessful")
                    self.data["status"] = "failed_login"
                    self.save_report()
                    return False
            
            # Navigate to dashboard
            if not self.navigate_to_dashboard():
                print("\n❌ Automation failed: Dashboard navigation unsuccessful")
                self.data["status"] = "failed_navigation"
                self.save_report()
                return False
            
            # Collect data
            self.collect_data_from_page()
            
            # Save report
            self.save_report()
            
            print("\n" + "="*60)
            print("AUTOMATION COMPLETED")
            print("="*60)
            print(f"\n📊 Summary:")
            print(f"   Status: {self.data['status']}")
            print(f"   Errors: {len(self.data['errors'])}")
            
            if self.data['errors']:
                print(f"\n⚠️  Errors:")
                for error in self.data['errors']:
                    print(f"   - {error}")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")
            self.data["errors"].append(f"Fatal error: {str(e)}")
            self.data["status"] = "failed_fatal"
            self.take_screenshot("fatal_error")
            self.save_report()
            return False
            
        finally:
            self.close_browser()


def main():
    """Main entry point"""
    scraper = BookingExtranetScraper()
    success = scraper.run()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
