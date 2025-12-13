"""
OTA Channels Portfolio Data
All active distribution channels for ORBI CITY BATUMI
"""

OTA_CHANNELS = {
    "booking": {
        "name": "Booking.com",
        "url": "https://www.booking.com/hotel/ge/orbi-city-luxury-sea-view-apartm...",
        "property_id": "10172179",
        "priority": "HIGH",
        "automation": "FULL",
        "extranet_url": "https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/home.html?hotel_id=10172179&lang=en"
    },
    "airbnb": {
        "name": "Airbnb",
        "url": "https://www.airbnb.com/rooms/1455314718960040955?guests=1&adults=...",
        "property_id": "1455314718960040955",
        "priority": "HIGH",
        "automation": "FULL",
        "extranet_url": "https://www.airbnb.com/hosting"
    },
    "expedia": {
        "name": "Expedia",
        "url": "https://www.expedia.com/Batumi-Hotels-ORBI-CITY-Luxury-Sea-View-A...",
        "property_id": "",
        "priority": "HIGH",
        "automation": "FULL",
        "extranet_url": "https://apps.expediapartnercentral.com/"
    },
    "agoda": {
        "name": "Agoda",
        "url": "https://www.agoda.com/batumi-orbi-sitiy-twin-tower-sea-wiev/hotel...",
        "property_id": "",
        "priority": "MEDIUM",
        "automation": "PARTIAL",
        "extranet_url": "https://ycs.agoda.com/"
    },
    "hostelworld": {
        "name": "Hostelworld",
        "url": "https://www.hostelworld.com/pwa/hosteldetails.php/Orbi-City-Sea-v...",
        "property_id": "",
        "priority": "MEDIUM",
        "automation": "PARTIAL",
        "extranet_url": "https://www.hostelworld.com/extranet/"
    },
    "bronevik": {
        "name": "Bronevik.com",
        "url": "https://bronevik.com/en/hotel/start?hotel_id=757157",
        "property_id": "757157",
        "priority": "MEDIUM",
        "automation": "PARTIAL",
        "extranet_url": "https://bronevik.com/extranet/"
    },
    "tvil": {
        "name": "Tvil.ru",
        "url": "https://tvil.ru/city/batumi/hotels/2062593/?o[arrival]=2025-11-01...",
        "property_id": "2062593",
        "priority": "LOW",
        "automation": "MONITORING",
        "extranet_url": ""
    },
    "ostrovok": {
        "name": "Ostrovok.ru",
        "url": "https://ostrovok.ru/hotel/georgia/batumi/mid13345479/hotel_orbi_c...",
        "property_id": "mid13345479",
        "priority": "LOW",
        "automation": "MONITORING",
        "extranet_url": ""
    },
    "sutochno": {
        "name": "Sutochno.com",
        "url": "https://sutochno.com/front/searchapp/search?occupied=2025-10-24:2...",
        "property_id": "",
        "priority": "LOW",
        "automation": "MONITORING",
        "extranet_url": ""
    }
}

SOCIAL_CHANNELS = {
    "facebook": {
        "name": "Facebook",
        "url": "https://www.facebook.com/share/1D9xvSc6Dh/?mibextid=wwXIfr",
        "type": "SOCIAL_MEDIA",
        "automation": "MONITORING"
    },
    "instagram": {
        "name": "Instagram",
        "url": "https://www.instagram.com/orbi_city_sea_view_apartment?igsh=MTR1c...",
        "type": "SOCIAL_MEDIA",
        "automation": "MONITORING"
    },
    "tiktok": {
        "name": "TikTok",
        "url": "https://www.tiktok.com/@orbi.apartments.batumi?_r=1&_t=ZS-910PNDV...",
        "type": "SOCIAL_MEDIA",
        "automation": "MONITORING"
    },
    "youtube": {
        "name": "YouTube",
        "url": "https://www.youtube.com/@ORBIAPARTMENTS",
        "type": "SOCIAL_MEDIA",
        "automation": "MONITORING"
    }
}

REVIEW_PLATFORMS = {
    "tripadvisor": {
        "name": "TripAdvisor",
        "url": "https://www.tripadvisor.com/Hotel_Review-g297579576-d27797353-Review...",
        "type": "REVIEW_PLATFORM",
        "automation": "MONITORING"
    }
}

COMING_SOON = {
    "yandex_travel": {
        "name": "Yandex Travel",
        "status": "In Progress",
        "priority": "HIGH"
    },
    "hrs": {
        "name": "HRS",
        "status": "In Progress",
        "priority": "MEDIUM"
    },
    "trip_com": {
        "name": "Trip.com",
        "status": "In Progress",
        "priority": "HIGH"
    },
    "cbooking_ru": {
        "name": "Cbooking.ru",
        "status": "In Progress",
        "priority": "MEDIUM"
    }
}

DIRECT_BOOKING = {
    "orbicitybatumi": {
        "name": "orbicitybatumi.com",
        "url": "https://www.orbicitybatumi.com",
        "type": "DIRECT_WEBSITE",
        "automation": "FULL",
        "priority": "HIGHEST"
    }
}

# Total active channels
TOTAL_ACTIVE_CHANNELS = 15
