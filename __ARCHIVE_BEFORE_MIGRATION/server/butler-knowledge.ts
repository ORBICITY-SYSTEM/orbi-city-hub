/**
 * Booking.com Butler AI - Knowledge Base
 * 
 * This file contains all the knowledge and context for the Booking.com Butler AI Agent.
 * It includes property details, review response templates, and operational guidelines.
 * 
 * Source: booking_analysis.txt + ChatGPT recommendations
 * Created: 2025-01-12
 */

export const BUTLER_KNOWLEDGE = {
  // ============================================
  // PROPERTY INFORMATION
  // ============================================
  property: {
    name: "Orbi City - Sea View Aparthotel in Batumi",
    id: "10172179",
    type: "Aparthotel",
    location: "7 Sherif Khimshiashvili Street, Batumi, Georgia",
    units: 60, // studio apartments
    floors: 47,
    
    features: {
      views: ["Sea view", "City view", "Mountain view"],
      amenities: [
        "Beach access (50m)",
        "Swimming pool",
        "Bar",
        "Sauna",
        "Free parking",
        "Free WiFi",
        "Kitchen facilities",
        "Satellite TV",
        "Air conditioning"
      ],
      roomFeatures: [
        "Electric kettle",
        "Kitchenette",
        "Microwave",
        "Refrigerator",
        "Hairdryer",
        "Flat-screen TV",
        "Private bathroom"
      ]
    },
    
    targetAudience: [
      "Families",
      "Couples",
      "Business travelers",
      "Long-term stays"
    ]
  },

  // ============================================
  // CURRENT PERFORMANCE METRICS
  // ============================================
  performance: {
    reviewScore: 8.4,
    totalReviews: 155,
    occupancyRate: 32.5, // %
    totalBookings: 808,
    totalRevenue: 333039, // GEL
    period: "365 days",
    
    categoryScores: {
      location: 9.4,
      cleanliness: 8.2,
      valueForMoney: 8.8,
      staff: 8.5,
      facilities: 8.3,
      comfort: 8.4
    },
    
    issues: {
      pageViews: -72, // % vs competitors (CRITICAL)
      reviewsWorsenedScore: 33.5, // % (52 reviews)
      emptyRate: 67.5, // % (too high!)
      setupProgress: 50 // % (incomplete)
    }
  },

  // ============================================
  // REVIEW RESPONSE TEMPLATES
  // ============================================
  reviewTemplates: {
    // Negative reviews (1-5 stars)
    negative: {
      cleanliness: {
        ka: `მოგესალმებით {guest_name},

გმადლობთ თქვენი გულწრფელი შეფასებისთვის. ღრმად ვწუხვარ რომ სისუფთავის სტანდარტმა არ გაამართლა თქვენი მოლოდინი.

თქვენი კომენტარები ძალიან მნიშვნელოვანია ჩვენთვის და დაუყოვნებლივ მივიღეთ შემდეგი ზომები:
• სრული სანიტარული შემოწმება და დასუფთავება ყველა ნომერში
• დამატებითი ტრენინგი დასუფთავების პერსონალისთვის
• ხარისხის კონტროლის გაძლიერება

როგორც კომპენსაცია, გთავაზობთ 20% ფასდაკლებას თქვენს შემდეგ ვიზიტზე. გვინდა დავამტკიცოთ რომ ვზრუნავთ თითოეულ სტუმარზე.

პატივისცემით,
Orbi City Management`,
        
        en: `Dear {guest_name},

Thank you for your honest feedback. We sincerely apologize that our cleanliness standards did not meet your expectations.

Your comments are very important to us, and we have immediately taken the following actions:
• Complete sanitary inspection and deep cleaning of all units
• Additional training for our housekeeping staff
• Enhanced quality control procedures

As compensation, we would like to offer you a 20% discount on your next stay. We want to prove that we care about each and every guest.

Best regards,
Orbi City Management`,
        
        ru: `Здравствуйте, {guest_name}!

Благодарим за ваш честный отзыв. Мы искренне сожалеем, что наши стандарты чистоты не оправдали ваших ожиданий.

Ваши комментарии очень важны для нас, и мы немедленно приняли следующие меры:
• Полная санитарная проверка и глубокая уборка всех номеров
• Дополнительное обучение персонала по уборке
• Усиленный контроль качества

В качестве компенсации мы хотели бы предложить вам скидку 20% на следующее проживание. Мы хотим доказать, что заботимся о каждом госте.

С уважением,
Orbi City Management`
      },
      
      maintenance: {
        en: `Dear {guest_name},

Thank you for bringing this to our attention. We apologize for the maintenance issues you experienced during your stay.

We have immediately:
• Inspected and repaired the reported issues
• Scheduled preventive maintenance for all units
• Improved our inspection procedures

Your comfort is our priority. Please contact us directly for your next booking, and we'll ensure everything is perfect.

Best regards,
Orbi City Management`
      },
      
      service: {
        en: `Dear {guest_name},

We sincerely apologize for the service issues you encountered. This is not the standard we strive for.

We have:
• Reviewed the situation with our team
• Implemented additional staff training
• Improved our communication procedures

We value your feedback and would appreciate the opportunity to make it right. Please contact us for a special offer on your next stay.

Best regards,
Orbi City Management`
      }
    },

    // Positive reviews (7-10 stars)
    positive: {
      general: {
        ka: `გმადლობთ {guest_name}!

ძალიან გვიხარია რომ მოგეწონათ ჩვენთან ყოფნა! თქვენი თბილი სიტყვები დიდი მოტივაციაა ჩვენი გუნდისთვის.

განსაკუთრებით მადლობელი ვართ რომ აღნიშნეთ {positive_aspect}. ვმუშაობთ იმისთვის რომ ყოველი სტუმარი განსაკუთრებულად იგრძნოს თავს.

ველოდებით თქვენს მომავალ ვიზიტს!

პატივისცემით,
Orbi City Team`,
        
        en: `Thank you {guest_name}!

We're delighted that you enjoyed your stay with us! Your kind words are a great motivation for our team.

We especially appreciate you highlighting {positive_aspect}. We work hard to make every guest feel special.

Looking forward to welcoming you again!

Best regards,
Orbi City Team`,
        
        ru: `Спасибо, {guest_name}!

Мы очень рады, что вам понравилось у нас! Ваши добрые слова - большая мотивация для нашей команды.

Особенно благодарны за то, что вы отметили {positive_aspect}. Мы работаем над тем, чтобы каждый гость чувствовал себя особенным.

Будем рады видеть вас снова!

С уважением,
Orbi City Team`
      }
    },

    // Neutral reviews (5-7 stars)
    neutral: {
      general: {
        en: `Dear {guest_name},

Thank you for your feedback and for choosing Orbi City.

We're glad you appreciated {positive_aspect}, and we take note of your suggestions regarding {improvement_area}. We're constantly working to improve our services.

We hope to welcome you again and provide an even better experience.

Best regards,
Orbi City Team`
      }
    }
  },

  // ============================================
  // PRICING & CAMPAIGN STRATEGIES
  // ============================================
  pricingStrategies: {
    discountCampaigns: {
      highImpact: {
        discount: 40, // %
        duration: 7, // days
        expectedRevenue: "3000-5000 GEL",
        benefit: "Top of search results",
        when: "Low occupancy periods (< 40%)"
      },
      
      moderate: {
        discount: 20, // %
        duration: 14, // days
        expectedRevenue: "1500-2500 GEL",
        benefit: "Improved visibility",
        when: "Medium occupancy (40-60%)"
      },
      
      lastMinute: {
        discount: 30, // %
        duration: 3, // days
        expectedRevenue: "1000-2000 GEL",
        benefit: "Fill empty rooms",
        when: "< 48 hours before check-in"
      }
    },
    
    geniusProgram: {
      level1: "10% discount for Genius members",
      level2: "15% discount + free breakfast",
      level3: "20% discount + free breakfast + room upgrade",
      benefits: "Attracts loyal, high-value guests"
    }
  },

  // ============================================
  // OPERATIONAL GUIDELINES
  // ============================================
  guidelines: {
    responseTime: {
      reviews: "Within 24 hours",
      negativeReviews: "Within 12 hours (priority)",
      guestMessages: "Within 2 hours"
    },
    
    toneOfVoice: {
      negative: "Apologetic, empathetic, solution-focused",
      positive: "Grateful, warm, inviting",
      neutral: "Professional, appreciative, improvement-oriented"
    },
    
    compensationPolicy: {
      minorIssues: "10% discount on next stay",
      moderateIssues: "20% discount on next stay",
      majorIssues: "50% refund + 30% discount on next stay"
    },
    
    priorityActions: [
      "Reply to all negative reviews (< 5 stars) within 12 hours",
      "Thank positive reviewers (> 7 stars) within 24 hours",
      "Create discount campaigns when occupancy < 40%",
      "Update pricing during high-demand periods",
      "Monitor competitor pricing weekly"
    ]
  },

  // ============================================
  // COMPETITOR ANALYSIS
  // ============================================
  competitors: {
    averageOccupancy: 45.0, // %
    averageReviewScore: 9.1,
    averagePageViews: 4286, // vs our 1200 (-72%)
    
    insights: [
      "Our page views are 72% lower than competitors (CRITICAL)",
      "Our review score (8.4) is below area average (9.1)",
      "Our occupancy (32.5%) is significantly below market (45%)",
      "Competitors use aggressive discount campaigns",
      "High-performing properties have > 200 reviews"
    ]
  },

  // ============================================
  // ACTION PRIORITIES (from booking_analysis.txt)
  // ============================================
  actionPlan: {
    urgent: [
      {
        action: "Reply to negative reviews",
        priority: "HIGH",
        timeEstimate: "30 min",
        impact: "Improve reputation, show responsiveness"
      },
      {
        action: "Create 40% discount campaign",
        priority: "HIGH",
        timeEstimate: "15 min",
        impact: "+3,000-5,000 GEL revenue, top search results"
      }
    ],
    
    important: [
      {
        action: "Complete 'Set pricing per guest' setup",
        priority: "MEDIUM",
        timeEstimate: "15 min",
        impact: "Finish setup (50% → 75%)"
      },
      {
        action: "Verify facilities (Beach, Pool, Bar, Sauna)",
        priority: "MEDIUM",
        timeEstimate: "10 min",
        impact: "Accurate listing, better search visibility"
      }
    ],
    
    ongoing: [
      {
        action: "Monitor daily metrics",
        priority: "MEDIUM",
        frequency: "Daily",
        impact: "Early problem detection"
      },
      {
        action: "Analyze competitor pricing",
        priority: "LOW",
        frequency: "Weekly",
        impact: "Stay competitive"
      }
    ]
  }
};

// ============================================
// AI PROMPT TEMPLATES
// ============================================
export const AI_PROMPTS = {
  reviewResponse: `You are the Booking.com Butler AI for Orbi City Aparthotel. Generate a professional, empathetic response to this guest review.

Property: {property_name}
Guest: {guest_name}
Rating: {rating}/10
Review: {review_text}

Guidelines:
- Use {language} language
- Be apologetic for negative reviews, grateful for positive ones
- Offer specific solutions, not generic promises
- Mention compensation if rating < 5.0
- Keep response under 150 words
- Use the tone from BUTLER_KNOWLEDGE.guidelines.toneOfVoice

Generate response:`,

  campaignRecommendation: `You are the Booking.com Butler AI. Analyze current metrics and recommend a discount campaign.

Current metrics:
- Occupancy: {occupancy_rate}%
- Review score: {review_score}/10
- Page views vs competitors: {page_views_diff}%
- Total bookings: {total_bookings}

Based on BUTLER_KNOWLEDGE.pricingStrategies, recommend:
1. Discount percentage
2. Campaign duration
3. Expected revenue impact
4. Reasoning

Format as JSON:
{
  "discount": 40,
  "duration": 7,
  "expectedRevenue": "3000-5000 GEL",
  "reasoning": "..."
}`,

  performanceAlert: `You are the Booking.com Butler AI. Analyze daily metrics and identify issues requiring attention.

Today's metrics:
{metrics_json}

Compare with:
- Yesterday's metrics
- Area averages
- Performance targets

Identify:
1. Critical issues (require immediate action)
2. Warnings (monitor closely)
3. Opportunities (capitalize on trends)

Format as JSON array of alerts.`
};

export default BUTLER_KNOWLEDGE;
