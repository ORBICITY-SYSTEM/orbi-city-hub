#!/usr/bin/env python3
"""
Booking.com Demo Data Generator
Creates realistic mock data for testing the complete automation workflow
"""
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Paths
REPORTS_DIR = Path(__file__).parent / "data" / "daily_reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def generate_demo_data():
    """Generate realistic demo data"""
    
    # Random data for demonstration
    bookings_count = random.randint(2, 8)
    reviews_count = random.randint(0, 3)
    messages_count = random.randint(1, 5)
    
    # Sample bookings
    bookings = []
    for i in range(bookings_count):
        checkin = datetime.now() + timedelta(days=random.randint(1, 30))
        checkout = checkin + timedelta(days=random.randint(1, 7))
        
        bookings.append({
            "id": f"BK{random.randint(100000, 999999)}",
            "guest_name": f"Guest {i+1}",
            "checkin_date": checkin.strftime("%Y-%m-%d"),
            "checkout_date": checkout.strftime("%Y-%m-%d"),
            "room_type": random.choice(["Studio", "1-Bedroom", "2-Bedroom"]),
            "total_price": random.randint(200, 800),
            "status": random.choice(["confirmed", "pending", "cancelled"])
        })
    
    # Sample reviews
    reviews = []
    review_scores = [8.5, 9.0, 9.2, 8.8, 9.5]
    for i in range(reviews_count):
        reviews.append({
            "id": f"RV{random.randint(1000, 9999)}",
            "guest_name": f"Reviewer {i+1}",
            "score": random.choice(review_scores),
            "date": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
            "comment": "Great location and beautiful sea view!",
            "responded": random.choice([True, False])
        })
    
    # Sample messages
    messages = []
    for i in range(messages_count):
        messages.append({
            "id": f"MSG{random.randint(1000, 9999)}",
            "guest_name": f"Guest {i+1}",
            "subject": random.choice(["Check-in question", "Parking info", "Late checkout request"]),
            "date": (datetime.now() - timedelta(hours=random.randint(1, 48))).strftime("%Y-%m-%d %H:%M"),
            "status": random.choice(["unread", "read", "replied"])
        })
    
    # Statistics
    statistics = {
        "occupancy_rate": round(random.uniform(60, 85), 1),
        "average_daily_rate": round(random.uniform(80, 120), 2),
        "review_score": round(random.uniform(8.5, 9.5), 1),
        "total_revenue_month": round(random.uniform(15000, 25000), 2),
        "page_views_today": random.randint(50, 150),
        "conversion_rate": round(random.uniform(2, 5), 1)
    }
    
    # Complete data structure
    data = {
        "timestamp": datetime.now().isoformat(),
        "property_id": "10172179",
        "property_name": "ORBI CITY - Sea View Aparthotel",
        "bookings": {
            "count": bookings_count,
            "items": bookings,
            "collected_at": datetime.now().isoformat()
        },
        "reviews": {
            "count": reviews_count,
            "items": reviews,
            "average_score": round(sum([r["score"] for r in reviews]) / len(reviews), 1) if reviews else 0,
            "collected_at": datetime.now().isoformat()
        },
        "messages": {
            "count": messages_count,
            "items": messages,
            "unread_count": len([m for m in messages if m["status"] == "unread"]),
            "collected_at": datetime.now().isoformat()
        },
        "statistics": statistics,
        "errors": [],
        "status": "completed",
        "data_source": "demo"
    }
    
    return data


def save_demo_report():
    """Save demo report to file"""
    print("\n" + "="*60)
    print("BOOKING.COM DEMO DATA GENERATOR")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Generate data
    print("\n📊 Generating demo data...")
    data = generate_demo_data()
    
    # Save to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = REPORTS_DIR / f"booking_report_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Demo report saved: {filename.name}")
    
    # Print summary
    print("\n" + "="*60)
    print("DEMO DATA SUMMARY")
    print("="*60)
    print(f"\n📊 Data Generated:")
    print(f"   Bookings: {data['bookings']['count']}")
    print(f"   Reviews: {data['reviews']['count']} (avg score: {data['reviews']['average_score']})")
    print(f"   Messages: {data['messages']['count']} ({data['messages']['unread_count']} unread)")
    print(f"\n📈 Statistics:")
    for key, value in data['statistics'].items():
        print(f"   {key.replace('_', ' ').title()}: {value}")
    
    print("\n✅ Demo data generation completed!")
    
    return filename


if __name__ == "__main__":
    save_demo_report()
