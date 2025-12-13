#!/usr/bin/env python3
"""
Email Parser v2 - AI-Powered Email Categorization System with Supabase Integration
Processes emails from Gmail JSON file, categorizes with Gemini AI, and saves to Supabase database
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'email_sync.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Email categories
CATEGORIES = [
    "bookings",
    "questions", 
    "payments",
    "complaints",
    "general",
    "technical",
    "newsletters",
    "spam",
    "partnerships",
    "reports"
]

# Language detection
LANGUAGES = ["Georgian", "English", "Russian"]

# Sentiment options
SENTIMENTS = ["positive", "neutral", "negative"]

# Priority levels
PRIORITIES = ["urgent", "high", "normal", "low"]


class EmailParser:
    """Email parser with AI categorization using Gemini and Supabase storage"""
    
    def __init__(self):
        """Initialize the email parser"""
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not self.gemini_api_key:
            logger.error("GEMINI_API_KEY environment variable not set")
            raise ValueError("GEMINI_API_KEY is required")
        
        # Configure Gemini
        self.client = genai.Client(api_key=self.gemini_api_key)
        self.model_name = 'gemini-2.0-flash-exp'
        logger.info("Gemini AI initialized successfully")
        
        # Initialize Supabase
        supabase_url = os.getenv('VITE_SUPABASE_URL')
        supabase_key = os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY')
        
        if not supabase_url or not supabase_key:
            logger.error("Supabase credentials not found in environment")
            raise ValueError("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully")
    
    def load_emails_from_json(self, json_file: str) -> List[Dict[str, Any]]:
        """Load emails from the pre-fetched Gmail JSON file"""
        logger.info(f"Loading emails from: {json_file}")
        
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Extract messages from the nested structure
            messages = []
            # The structure is: data -> result -> threads -> messages
            if 'result' in data and isinstance(data['result'], dict):
                result = data['result']
                if 'threads' in result and isinstance(result['threads'], list):
                    # Extract messages from threads
                    for thread in result['threads']:
                        if 'messages' in thread and isinstance(thread['messages'], list):
                            for msg in thread['messages']:
                                # Extract key fields
                                headers = msg.get('pickedHeaders', {})
                                message_data = {
                                    'id': msg.get('id', ''),
                                    'threadId': msg.get('threadId', ''),
                                    'subject': headers.get('subject', ''),
                                    'from': headers.get('from', ''),
                                    'to': headers.get('to', ''),
                                    'date': headers.get('date', ''),
                                    'snippet': msg.get('snippet', ''),
                                    'body': msg.get('pickedMarkdownContent', msg.get('snippet', '')),
                                    'labels': msg.get('labelIds', []),
                                    'isRead': 'UNREAD' not in msg.get('labelIds', [])
                                }
                                messages.append(message_data)
            
            logger.info(f"Successfully loaded {len(messages)} emails from JSON file")
            return messages
                
        except Exception as e:
            logger.error(f"Error loading emails from JSON file: {e}", exc_info=True)
            return []
    
    def categorize_with_gemini(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """Categorize email using Gemini AI"""
        subject = email.get('subject', '')
        sender = email.get('from', '')
        snippet = email.get('snippet', '')
        body = email.get('body', snippet)
        
        # Prepare prompt for Gemini
        prompt = f"""Analyze this email and provide categorization in JSON format.

Email Details:
Subject: {subject}
From: {sender}
Content: {body[:500]}

Please analyze and return ONLY a JSON object with these fields:
{{
  "category": "one of: {', '.join(CATEGORIES)}",
  "language": "one of: {', '.join(LANGUAGES)}",
  "sentiment": "one of: {', '.join(SENTIMENTS)}",
  "priority": "one of: {', '.join(PRIORITIES)}",
  "reasoning": "brief explanation of categorization"
}}

Rules:
- bookings: Reservations from Booking.com, Airbnb, Expedia, Agoda, OtelMS, or booking-related
- questions: Customer inquiries, questions about services
- payments: Invoices, payment confirmations, financial matters
- complaints: Customer complaints, negative feedback, issues
- general: General correspondence, updates
- technical: Technical issues, system notifications, backup failures
- newsletters: Marketing emails, newsletters, promotions
- spam: Unwanted promotional emails, suspicious content
- partnerships: Business partnerships, collaborations
- reports: Analytics, reports, summaries, daily reports

Priority:
- urgent: Requires immediate action (complaints, urgent bookings, technical failures)
- high: Important but not immediate (new bookings, payment issues)
- normal: Standard correspondence
- low: Newsletters, marketing

Language detection:
- Georgian: Contains Georgian characters (ა, ბ, გ, დ, etc.)
- Russian: Contains Cyrillic characters (а, б, в, г, etc.)
- English: Default if no special characters detected

Return ONLY the JSON object, no other text."""

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            response_text = response.text.strip()
            
            # Extract JSON from response
            if '```json' in response_text:
                json_start = response_text.index('```json') + 7
                json_end = response_text.rindex('```')
                response_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.index('```') + 3
                json_end = response_text.rindex('```')
                response_text = response_text[json_start:json_end].strip()
            
            categorization = json.loads(response_text)
            logger.info(f"Gemini categorized email '{subject[:50]}...' as {categorization.get('category')}")
            return categorization
            
        except Exception as e:
            logger.error(f"Gemini categorization failed: {e}")
            # Fallback to keyword-based categorization
            return self.fallback_categorization(email)
    
    def fallback_categorization(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback keyword-based categorization if AI fails"""
        subject = email.get('subject', '').lower()
        sender = email.get('from', '').lower()
        snippet = email.get('snippet', '').lower()
        
        category = "general"
        priority = "normal"
        sentiment = "neutral"
        language = "English"
        
        # Category detection
        if any(word in subject or word in sender for word in ['booking', 'reservation', 'airbnb', 'expedia', 'agoda', 'otelms', 'ჯავშანი']):
            category = "bookings"
            priority = "high"
        elif any(word in subject or word in snippet for word in ['complaint', 'issue', 'problem', 'unhappy']):
            category = "complaints"
            priority = "urgent"
            sentiment = "negative"
        elif any(word in subject for word in ['payment', 'invoice', 'receipt', 'transaction', 'payout']):
            category = "payments"
            priority = "high"
        elif any(word in subject for word in ['question', 'inquiry', 'ask', 'help']):
            category = "questions"
        elif any(word in subject or word in snippet for word in ['newsletter', 'unsubscribe', 'promotion', 'offer', 'marketing']):
            category = "newsletters"
            priority = "low"
        elif any(word in subject for word in ['report', 'analytics', 'summary', 'statistics', 'ანგარიში']):
            category = "reports"
        elif any(word in subject for word in ['partner', 'collaboration', 'business']):
            category = "partnerships"
        elif any(word in subject for word in ['backup failed', 'error', 'failed']):
            category = "technical"
            priority = "urgent"
        elif any(word in snippet for word in ['click here', 'act now', 'limited time', 'winner']):
            category = "spam"
            priority = "low"
        
        # Language detection (basic)
        if any(char in snippet for char in ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ']):
            language = "Georgian"
        elif any(char in snippet for char in ['а', 'б', 'в', 'г', 'д', 'е', 'ж']):
            language = "Russian"
        
        # Sentiment detection
        if any(word in snippet for word in ['thank', 'great', 'excellent', 'wonderful', 'happy']):
            sentiment = "positive"
        elif any(word in snippet for word in ['bad', 'terrible', 'awful', 'disappointed', 'angry', 'failed']):
            sentiment = "negative"
        
        logger.info(f"Fallback categorization: {category}")
        return {
            "category": category,
            "language": language,
            "sentiment": sentiment,
            "priority": priority,
            "reasoning": "Keyword-based fallback categorization"
        }
    
    def save_to_supabase(self, emails: List[Dict[str, Any]]) -> int:
        """Save categorized emails to Supabase database"""
        logger.info(f"Saving {len(emails)} emails to Supabase...")
        
        saved_count = 0
        for email in emails:
            try:
                # Prepare data for Supabase
                email_data = {
                    'id': email['id'],
                    'thread_id': email['threadId'],
                    'subject': email.get('subject', ''),
                    'sender': email.get('from', ''),
                    'recipient': email.get('to', ''),
                    'email_date': email.get('date', None),
                    'snippet': email.get('snippet', ''),
                    'body': email.get('body', ''),
                    'labels': email.get('labels', []),
                    'is_read': email.get('isRead', False),
                    'category': email.get('category', 'general'),
                    'language': email.get('language', 'English'),
                    'sentiment': email.get('sentiment', 'neutral'),
                    'priority': email.get('priority', 'normal'),
                    'reasoning': email.get('reasoning', '')
                }
                
                # Upsert to handle duplicates
                result = self.supabase.table('emails').upsert(email_data).execute()
                saved_count += 1
                
            except Exception as e:
                logger.error(f"Error saving email {email.get('id')}: {e}")
                continue
        
        logger.info(f"Successfully saved {saved_count}/{len(emails)} emails to Supabase")
        return saved_count
    
    def run(self, json_file: str):
        """Main execution flow"""
        logger.info("=" * 80)
        logger.info("Starting Email Sync Process")
        logger.info("=" * 80)
        
        try:
            # Step 1: Load emails from JSON file
            emails = self.load_emails_from_json(json_file)
            
            if not emails:
                logger.warning("No emails loaded from JSON file")
                return
            
            # Step 2: Categorize each email with Gemini
            logger.info(f"Categorizing {len(emails)} emails with Gemini AI...")
            categorized_emails = []
            
            for i, email in enumerate(emails, 1):
                logger.info(f"Processing email {i}/{len(emails)}: {email.get('subject', 'No subject')[:50]}...")
                
                try:
                    categorization = self.categorize_with_gemini(email)
                    
                    # Merge categorization with email data
                    email.update(categorization)
                    categorized_emails.append(email)
                    
                except Exception as e:
                    logger.error(f"Error categorizing email {i}: {e}")
                    # Use fallback
                    categorization = self.fallback_categorization(email)
                    email.update(categorization)
                    categorized_emails.append(email)
            
            # Step 3: Save to Supabase database
            saved_count = self.save_to_supabase(categorized_emails)
            
            # Step 4: Also save results to JSON for inspection
            output_file = os.path.join(log_dir, 'categorized_emails.json')
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(categorized_emails, f, indent=2, ensure_ascii=False)
            logger.info(f"Categorized emails also saved to: {output_file}")
            
            # Summary
            logger.info("=" * 80)
            logger.info("Email Sync Summary")
            logger.info("=" * 80)
            logger.info(f"Total emails processed: {len(emails)}")
            logger.info(f"Successfully categorized: {len(categorized_emails)}")
            logger.info(f"Saved to database: {saved_count}")
            
            # Category breakdown
            category_counts = {}
            for email in categorized_emails:
                cat = email.get('category', 'unknown')
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            logger.info("\nCategory Breakdown:")
            for category, count in sorted(category_counts.items()):
                logger.info(f"  {category}: {count}")
            
            # Language breakdown
            language_counts = {}
            for email in categorized_emails:
                lang = email.get('language', 'unknown')
                language_counts[lang] = language_counts.get(lang, 0) + 1
            
            logger.info("\nLanguage Breakdown:")
            for language, count in sorted(language_counts.items()):
                logger.info(f"  {language}: {count}")
            
            # Priority breakdown
            priority_counts = {}
            for email in categorized_emails:
                pri = email.get('priority', 'unknown')
                priority_counts[pri] = priority_counts.get(pri, 0) + 1
            
            logger.info("\nPriority Breakdown:")
            for priority, count in sorted(priority_counts.items()):
                logger.info(f"  {priority}: {count}")
            
            logger.info("=" * 80)
            logger.info("Email sync completed successfully!")
            logger.info(f"Check logs at: {log_file}")
            logger.info(f"Check categorized emails at: {output_file}")
            logger.info(f"View emails in dashboard: https://akxwboxrwrryroftutpd.supabase.co")
            logger.info("=" * 80)
            
        except Exception as e:
            logger.error(f"Email sync failed: {e}", exc_info=True)
            sys.exit(1)


if __name__ == "__main__":
    # Default JSON file location
    json_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs', 'gmail_emails.json')
    
    # Allow override from command line
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    
    if not os.path.exists(json_file):
        logger.error(f"JSON file not found: {json_file}")
        logger.error("Please run: manus-mcp-cli tool call gmail_search_messages --server gmail --input '{\"query\": \"\", \"maxResults\": 50}'")
        logger.error("Then pass the result JSON file path as an argument")
        sys.exit(1)
    
    parser = EmailParser()
    parser.run(json_file)
