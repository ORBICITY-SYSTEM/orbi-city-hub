/**
 * ORBI City Hub - Enhanced AI Knowledge Base
 * Comprehensive domain knowledge for all AI agents
 */

export const GEORGIAN_TAX_SYSTEM = {
  vat: {
    rate: 0.18,
    description: "Value Added Tax (VAT) in Georgia",
    descriptionGe: "დამატებული ღირებულების გადასახადი (დღგ) საქართველოში",
    applicableServices: [
      "Accommodation services",
      "Food and beverage services",
      "Additional hotel services"
    ],
    exemptions: [
      "Long-term rentals (over 90 days)",
      "Export of services"
    ],
    filingFrequency: "Monthly",
    deadline: "15th of following month"
  },
  incomeTax: {
    corporate: {
      rate: 0.15,
      description: "Corporate Income Tax on distributed profits",
      descriptionGe: "კორპორატიული მოგების გადასახადი განაწილებულ მოგებაზე",
      model: "Estonian model - tax on distribution only"
    },
    personal: {
      rate: 0.20,
      description: "Personal Income Tax",
      descriptionGe: "ფიზიკური პირების საშემოსავლო გადასახადი",
      applicableIncome: [
        "Salaries and wages",
        "Dividends",
        "Rental income"
      ]
    }
  },
  propertyTax: {
    rate: 0.01,
    description: "Annual property tax",
    descriptionGe: "ქონების წლიური გადასახადი",
    assessmentBasis: "Market value or cadastral value",
    deadline: "November 15th annually"
  },
  touristTax: {
    enabled: true,
    description: "Tourist tax in Batumi",
    descriptionGe: "ტურისტული გადასახადი ბათუმში",
    rate: "1 GEL per person per night",
    applicableTo: "All accommodation facilities",
    exemptions: [
      "Children under 10 years",
      "Georgian citizens (in some cases)"
    ]
  }
};

export const BATUMI_TOURISM_DATA = {
  seasonality: {
    high: {
      months: ["June", "July", "August", "September"],
      monthsGe: ["ივნისი", "ივლისი", "აგვისტო", "სექტემბერი"],
      occupancyRate: 0.85,
      averageDailyRate: 120,
      description: "Peak summer season with maximum demand",
      descriptionGe: "პიკური ზაფხულის სეზონი მაქსიმალური მოთხოვნით"
    },
    shoulder: {
      months: ["April", "May", "October"],
      monthsGe: ["აპრილი", "მაისი", "ოქტომბერი"],
      occupancyRate: 0.60,
      averageDailyRate: 80,
      description: "Moderate demand with pleasant weather",
      descriptionGe: "ზომიერი მოთხოვნა სასიამოვნო ამინდით"
    },
    low: {
      months: ["November", "December", "January", "February", "March"],
      monthsGe: ["ნოემბერი", "დეკემბერი", "იანვარი", "თებერვალი", "მარტი"],
      occupancyRate: 0.35,
      averageDailyRate: 50,
      description: "Off-season with lower demand",
      descriptionGe: "დაბალი სეზონი შემცირებული მოთხოვნით"
    }
  },
  marketSegments: {
    domestic: {
      share: 0.40,
      description: "Georgian tourists",
      descriptionGe: "ქართველი ტურისტები",
      peakMonths: ["July", "August"],
      averageStay: 3.5
    },
    international: {
      topMarkets: [
        { country: "Turkey", share: 0.15, avgStay: 2.5 },
        { country: "Azerbaijan", share: 0.12, avgStay: 3.0 },
        { country: "Armenia", share: 0.10, avgStay: 2.8 },
        { country: "Russia", share: 0.08, avgStay: 4.2 },
        { country: "Ukraine", share: 0.06, avgStay: 3.8 },
        { country: "Israel", share: 0.05, avgStay: 5.0 },
        { country: "Others", share: 0.04, avgStay: 3.2 }
      ],
      share: 0.60,
      description: "International tourists",
      descriptionGe: "საერთაშორისო ტურისტები"
    }
  },
  competitorAnalysis: {
    aparthotels: {
      averageRooms: 45,
      averagePrice: 95,
      mainCompetitors: [
        "Orbi Beach Tower",
        "Orbi Sea Towers",
        "Porta Batumi Tower",
        "Dreamland Oasis",
        "Batumi View"
      ]
    },
    hotels: {
      budget: { averagePrice: 60, occupancy: 0.70 },
      midRange: { averagePrice: 110, occupancy: 0.65 },
      luxury: { averagePrice: 250, occupancy: 0.55 }
    }
  },
  bookingChannels: {
    bookingCom: { commission: 0.15, share: 0.42, avgBookingWindow: 14 },
    airbnb: { commission: 0.14, share: 0.30, avgBookingWindow: 21 },
    expedia: { commission: 0.18, share: 0.15, avgBookingWindow: 12 },
    agoda: { commission: 0.15, share: 0.10, avgBookingWindow: 10 },
    direct: { commission: 0.00, share: 0.03, avgBookingWindow: 7 }
  }
};

export const HOSPITALITY_BEST_PRACTICES = {
  housekeeping: {
    standards: {
      checkoutCleaning: {
        duration: "45-60 minutes per studio",
        durationGe: "45-60 წუთი სტუდიოზე",
        tasks: [
          "Strip and remake bed with fresh linens",
          "Deep clean bathroom (toilet, shower, sink, mirrors)",
          "Vacuum and mop all floors",
          "Dust all surfaces and furniture",
          "Clean kitchen area and appliances",
          "Restock amenities (toiletries, towels, coffee/tea)",
          "Empty all trash bins",
          "Check and report maintenance issues"
        ]
      },
      dailyService: {
        duration: "20-30 minutes per studio",
        durationGe: "20-30 წუთი სტუდიოზე",
        tasks: [
          "Make bed and tidy room",
          "Clean bathroom",
          "Empty trash",
          "Replenish towels if needed",
          "Vacuum high-traffic areas"
        ]
      }
    },
    qualityControl: {
      inspectionFrequency: "Every 10th room or daily random checks",
      inspectionFrequencyGe: "ყოველი მე-10 ოთახი ან ყოველდღიური შემთხვევითი შემოწმება",
      scorecard: [
        "Cleanliness (40%)",
        "Completeness (30%)",
        "Presentation (20%)",
        "Time efficiency (10%)"
      ]
    }
  },
  guestCommunication: {
    checkIn: {
      timing: "Send instructions 24 hours before arrival",
      timingGe: "გაგზავნეთ ინსტრუქციები 24 საათით ადრე",
      includes: [
        "Self check-in code",
        "Apartment number and floor",
        "Parking information",
        "WiFi credentials",
        "House rules",
        "Emergency contacts"
      ]
    },
    duringStay: {
      responseTime: "Within 2 hours for inquiries",
      responseTimeGe: "2 საათის განმავლობაში",
      proactiveMessages: [
        "Welcome message on day 1",
        "Mid-stay check-in for stays 5+ nights",
        "Local recommendations"
      ]
    },
    checkOut: {
      timing: "Send reminder 24 hours before checkout",
      timingGe: "გაგზავნეთ შეხსენება 24 საათით ადრე",
      includes: [
        "Checkout time and procedure",
        "Key return instructions",
        "Feedback request",
        "Thank you message"
      ]
    }
  },
  revenueManagement: {
    pricingStrategy: {
      basePrice: "Set competitive base price for low season",
      basePriceGe: "დააყენეთ კონკურენტული ბაზისური ფასი დაბალი სეზონისთვის",
      dynamicAdjustments: [
        "Occupancy-based: +20% when >70% booked",
        "Seasonality: +50% high season, -30% low season",
        "Day of week: +15% Friday-Saturday",
        "Lead time: +10% for last-minute (< 3 days)",
        "Length of stay: -5% for 7+ nights, -10% for 30+ nights",
        "Events: +30-50% during major events"
      ]
    },
    minimumStay: {
      highSeason: "3-7 nights",
      shoulderSeason: "2-3 nights",
      lowSeason: "1 night"
    }
  },
  maintenanceSchedule: {
    daily: [
      "Check common areas",
      "Monitor HVAC systems",
      "Inspect elevators"
    ],
    weekly: [
      "Deep clean common areas",
      "Test fire safety equipment",
      "Pool maintenance (if applicable)"
    ],
    monthly: [
      "HVAC filter replacement",
      "Plumbing inspection",
      "Electrical safety check"
    ],
    quarterly: [
      "Deep clean and maintenance of vacant units",
      "Exterior building inspection",
      "Furniture and fixture assessment"
    ]
  }
};

export const ORBI_CITY_SPECIFIC_DATA = {
  property: {
    name: "ORBI City Batumi",
    nameGe: "ORBI City ბათუმი",
    type: "Aparthotel",
    totalUnits: 60,
    unitType: "Studio apartments",
    location: "Batumi, Georgia",
    locationGe: "ბათუმი, საქართველო",
    address: "Batumi Boulevard area",
    addressGe: "ბათუმის ბულვარის რაიონი"
  },
  amenities: [
    "Sea view",
    "Fully equipped kitchen",
    "WiFi",
    "Air conditioning",
    "Smart TV",
    "24/7 reception",
    "Parking (subject to availability)",
    "Balcony"
  ],
  targetMarket: {
    primary: "Leisure travelers (families, couples)",
    primaryGe: "დასვენების ტურისტები (ოჯახები, წყვილები)",
    secondary: "Business travelers, Digital nomads",
    secondaryGe: "ბიზნეს მოგზაურები, ციფრული ნომადები",
    tertiary: "Long-term stays (1+ months)",
    tertiaryGe: "გრძელვადიანი ყოფნა (1+ თვე)"
  },
  operatingHours: {
    reception: "24/7",
    checkIn: "14:00",
    checkOut: "12:00",
    housekeeping: "09:00 - 17:00"
  },
  policies: {
    cancellation: {
      flexible: "Free cancellation up to 48 hours before arrival",
      flexibleGe: "უფასო გაუქმება ჩამოსვლამდე 48 საათით ადრე",
      moderate: "Free cancellation up to 7 days before arrival",
      moderateGe: "უფასო გაუქმება ჩამოსვლამდე 7 დღით ადრე",
      strict: "50% refund up to 14 days before arrival",
      strictGe: "50% დაბრუნება ჩამოსვლამდე 14 დღით ადრე"
    },
    payment: {
      methods: ["Credit card", "Bank transfer", "Cash"],
      methodsGe: ["საკრედიტო ბარათი", "საბანკო გადარიცხვა", "ნაღდი ფული"],
      deposit: "30% upon booking, balance before check-in",
      depositGe: "30% დაჯავშნისას, ნარჩენი ჩაბარებამდე"
    },
    pets: {
      allowed: false,
      allowedGe: false
    },
    smoking: {
      allowed: false,
      allowedGe: false,
      penalty: "200 GEL cleaning fee",
      penaltyGe: "200 ლარი დასუფთავების საფასური"
    }
  }
};

export const AI_AGENT_PROMPTS = {
  ceo: {
    systemPrompt: `You are the Main AI Orchestrator for ORBI City Batumi, a 60-studio aparthotel. 
Your role is to provide strategic insights, coordinate with department AI agents, and deliver executive-level analytics.

Knowledge areas:
- Georgian tax system (VAT 18%, Income Tax 15/20%, Tourist Tax 1 GEL/night)
- Batumi tourism market and seasonality
- Revenue management and pricing strategies
- Hospitality operations and best practices
- Multi-channel distribution (Booking.com, Airbnb, etc.)

Always provide data-driven recommendations with specific numbers and actionable insights.`,
    systemPromptGe: `თქვენ ხართ მთავარი AI ორკესტრატორი ORBI City ბათუმისთვის, 60-სტუდიო აპარტჰოტელი.
თქვენი როლია სტრატეგიული ანალიტიკის მიწოდება, დეპარტამენტების AI აგენტებთან კოორდინაცია და აღმასრულებელი დონის ანალიზი.`
  },
  reservations: {
    systemPrompt: `You are the Reservations AI Agent for ORBI City Batumi.
Your role is to assist with booking management, guest communication, email drafting, and trend analysis.

Expertise:
- Booking platforms (Booking.com 42%, Airbnb 30%, Expedia 15%, Agoda 10%)
- Guest communication best practices
- Email template generation (check-in instructions, confirmations, inquiries)
- Voucher and confirmation parsing
- Occupancy forecasting and trend analysis
- Dynamic pricing recommendations

Always be professional, friendly, and solution-oriented in guest communications.`,
    systemPromptGe: `თქვენ ხართ ბრონირების AI აგენტი ORBI City ბათუმისთვის.`
  },
  finance: {
    systemPrompt: `You are the Finance AI Agent for ORBI City Batumi.
Your role is to analyze financial data, provide P&L insights, forecast revenue, and optimize costs.

Expertise:
- Georgian tax system (VAT 18%, Corporate Income Tax 15%, Tourist Tax)
- Revenue analysis by channel and season
- Cost optimization strategies
- P&L statement interpretation
- Cash flow forecasting
- Financial KPIs (RevPAR, ADR, Occupancy Rate)

Always provide specific numbers, percentages, and actionable financial recommendations.`,
    systemPromptGe: `თქვენ ხართ ფინანსური AI აგენტი ORBI City ბათუმისთვის.`
  },
  marketing: {
    systemPrompt: `You are the Marketing AI Agent for ORBI City Batumi.
Your role is to optimize channel performance, create campaigns, and maximize ROI.

Expertise:
- Distribution channel optimization (Booking.com, Airbnb, Expedia, Agoda, Direct)
- Social media strategy (TikTok, Instagram, Facebook)
- Content creation and copywriting
- Campaign performance analysis
- Reputation management (reviews, ratings)
- Competitor analysis

Focus on data-driven marketing strategies that increase direct bookings and reduce OTA dependency.`,
    systemPromptGe: `თქვენ ხართ მარკეტინგის AI აგენტი ORBI City ბათუმისთვის.`
  },
  logistics: {
    systemPrompt: `You are the Logistics AI Agent for ORBI City Batumi.
Your role is to optimize housekeeping, inventory management, and maintenance scheduling.

Expertise:
- Housekeeping standards (45-60 min checkout cleaning, 20-30 min daily service)
- Inventory management and stock optimization
- Maintenance scheduling (daily, weekly, monthly, quarterly)
- Staff scheduling and task assignment
- Quality control and inspection protocols

Always prioritize guest satisfaction while optimizing operational efficiency.`,
    systemPromptGe: `თქვენ ხართ ლოგისტიკის AI აგენტი ORBI City ბათუმისთვის.`
  },
  reports: {
    systemPrompt: `You are the Data Scientist AI Agent for ORBI City Batumi.
Your role is to analyze data, create reports, identify trends, and provide predictive insights.

Expertise:
- Statistical analysis and data visualization
- Trend identification and forecasting
- KPI tracking and reporting
- Heatmap analysis (occupancy, revenue, seasonality)
- Export data in various formats (Excel, PDF, CSV)
- Predictive modeling for occupancy and revenue

Always present data in clear, visual, and actionable formats.`,
    systemPromptGe: `თქვენ ხართ მონაცემთა მეცნიერი AI აგენტი ORBI City ბათუმისთვის.`
  }
};

// Export all knowledge bases
export const KNOWLEDGE_BASE = {
  tax: GEORGIAN_TAX_SYSTEM,
  tourism: BATUMI_TOURISM_DATA,
  hospitality: HOSPITALITY_BEST_PRACTICES,
  property: ORBI_CITY_SPECIFIC_DATA,
  prompts: AI_AGENT_PROMPTS
};
