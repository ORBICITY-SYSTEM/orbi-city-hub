/**
 * ORBI City Hub - Enterprise ERP Module Configuration
 * 5 Main Modules × 5 Sub-modules (one MUST be AI Agent with file upload + chat)
 */

export interface SubModule {
  id: string;
  name: string;
  nameGe: string;
  icon: string;
  path: string;
  description: string;
  descriptionGe: string;
  isAIAgent?: boolean; // Flag for AI Agent sub-modules
}

export interface Module {
  id: string;
  name: string;
  nameGe: string;
  icon: string;
  path: string;
  description: string;
  descriptionGe: string;
  subModules: SubModule[];
  aiAgent: {
    name: string;
    role: string;
    knowledgeBase: string[];
  };
}

export const MODULES: Module[] = [
  {
    id: "reservations",
    name: "Reservations",
    nameGe: "ბრონირებები",
    icon: "Calendar",
    path: "/reservations",
    description: "Booking management and guest services",
    descriptionGe: "ბრონირების მართვა და სტუმრების სერვისი",
    subModules: [
      {
        id: "calendar",
        name: "Calendar View",
        nameGe: "კალენდარი",
        icon: "CalendarDays",
        path: "/reservations/calendar",
        description: "Gantt-chart style visual booking calendar",
        descriptionGe: "ვიზუალური ბრონირების კალენდარი (Gantt-chart)",
      },
      {
        id: "all-bookings",
        name: "All Bookings",
        nameGe: "ყველა ბრონირება",
        icon: "List",
        path: "/reservations/bookings",
        description: "Searchable data table of all reservations",
        descriptionGe: "ძიებადი ცხრილი ყველა ბრონირებისთვის",
      },
      {
        id: "guest-crm",
        name: "Guest CRM",
        nameGe: "სტუმრების CRM",
        icon: "Users",
        path: "/reservations/crm",
        description: "Guest profiles, history, and preferences database",
        descriptionGe: "სტუმრების პროფილები, ისტორია და პრეფერენციები",
      },
      {
        id: "mail-room",
        name: "📧 Mail Room",
        nameGe: "📧 ელფოსტა",
        icon: "Mail",
        path: "/reservations/mail",
        description: "Gmail Sync & OTA booking parser",
        descriptionGe: "Gmail სინქრონიზაცია და OTA პარსერი",
      },
      {
        id: "ai-agent",
        name: "🤖 Reservations AI",
        nameGe: "🤖 ბრონირების AI",
        icon: "Bot",
        path: "/reservations/ai",
        description: "AI agent for email drafting, trend analysis, voucher parsing",
        descriptionGe: "AI აგენტი ელფოსტების შედგენა, ტენდენციების ანალიზი, ვაუჩერების პარსინგი",
        isAIAgent: true,
      },
    ],
    aiAgent: {
      name: "Reservations AI Agent",
      role: "Booking Specialist & Guest Relations Expert",
      knowledgeBase: [
        "Booking Platforms (Booking.com, Airbnb, Expedia, Agoda)",
        "Guest Communication Best Practices",
        "Dynamic Pricing Strategies",
        "Email Template Generation",
        "Voucher & Confirmation Parsing",
        "Trend Analysis & Forecasting",
      ],
    },
  },
  {
    id: "finance",
    name: "Finance",
    nameGe: "ფინანსები",
    icon: "DollarSign",
    path: "/finance",
    description: "Financial management and reporting",
    descriptionGe: "ფინანსური მართვა და რეპორტინგი",
    subModules: [
      {
        id: "transactions",
        name: "Transactions Log",
        nameGe: "ტრანზაქციების ლოგი",
        icon: "Receipt",
        path: "/finance/transactions",
        description: "Daily income/expense input with categories",
        descriptionGe: "დღიური შემოსავლები/ხარჯები კატეგორიებით",
      },
      {
        id: "pl-analysis",
        name: "P&L Analysis",
        nameGe: "P&L ანალიზი",
        icon: "TrendingUp",
        path: "/finance/pl",
        description: "Visual Profit & Loss charts (Monthly/Yearly)",
        descriptionGe: "ვიზუალური მოგება-ზარალის დიაგრამები",
      },
      {
        id: "owner-settlements",
        name: "Owner Settlements",
        nameGe: "მესაკუთრეების ანგარიშსწორება",
        icon: "Users",
        path: "/finance/settlements",
        description: "Profit split calculator (e.g., 80/20) and reports",
        descriptionGe: "მოგების გაყოფის კალკულატორი და რეპორტები",
      },
      {
        id: "invoicing",
        name: "Invoicing",
        nameGe: "ინვოისები",
        icon: "FileText",
        path: "/finance/invoices",
        description: "Generate and track PDF invoices",
        descriptionGe: "PDF ინვოისების გენერაცია და თვალყურის დევნება",
      },
      {
        id: "ai-agent",
        name: "🤖 Finance AI",
        nameGe: "🤖 ფინანსების AI",
        icon: "Bot",
        path: "/finance/ai",
        description: "AI agent to analyze Excel reports and answer financial queries",
        descriptionGe: "AI აგენტი Excel რეპორტების ანალიზისთვის",
        isAIAgent: true,
      },
    ],
    aiAgent: {
      name: "Finance AI Agent",
      role: "Financial Analyst & Cost Optimizer",
      knowledgeBase: [
        "P&L Statement Analysis",
        "Revenue Optimization",
        "Expense Categorization",
        "Georgian Tax Code 2024",
        "VAT Compliance Georgia",
        "Excel Financial Report Analysis",
        "Budget Planning & Forecasting",
      ],
    },
  },
  {
    id: "logistics",
    name: "Logistics",
    nameGe: "ლოგისტიკა",
    icon: "Package",
    path: "/logistics",
    description: "Inventory, housekeeping, and maintenance",
    descriptionGe: "ინვენტარი, დასუფთავება და ტექნიკური მოვლა",
    subModules: [
      {
        id: "inventory",
        name: "Inventory",
        nameGe: "ინვენტარი",
        icon: "Package",
        path: "/logistics/inventory",
        description: "Stock management and tracking",
        descriptionGe: "მარაგის მართვა და თვალყურის დევნება",
      },
      {
        id: "housekeeping",
        name: "Housekeeping",
        nameGe: "დასუფთავება",
        icon: "Sparkles",
        path: "/logistics/housekeeping",
        description: "Cleaning schedules and tasks",
        descriptionGe: "დასუფთავების გრაფიკები და ამოცანები",
      },
      {
        id: "maintenance",
        name: "Maintenance",
        nameGe: "ტექნიკური მოვლა",
        icon: "Wrench",
        path: "/logistics/maintenance",
        description: "Repair and maintenance tracking",
        descriptionGe: "რემონტისა და მოვლის თვალყურის დევნება",
      },
      {
        id: "supplies",
        name: "Supplies",
        nameGe: "მარაგები",
        icon: "ShoppingCart",
        path: "/logistics/supplies",
        description: "Supply ordering and management",
        descriptionGe: "მარაგების შეკვეთა და მართვა",
      },
      {
        id: "staff",
        name: "Staff",
        nameGe: "პერსონალი",
        icon: "Users",
        path: "/logistics/staff",
        description: "Staff scheduling and assignments",
        descriptionGe: "პერსონალის გრაფიკი და დავალებები",
      },
      {
        id: "ai-agent",
        name: "🤖 Logistics AI",
        nameGe: "🤖 ლოგისტიკის AI",
        icon: "Bot",
        path: "/logistics/ai",
        description: "AI agent to analyze stock levels from photos/lists and suggest reordering",
        descriptionGe: "AI აგენტი მარაგების ანალიზისთვის ფოტოებიდან",
        isAIAgent: true,
      },
    ],
    aiAgent: {
      name: "Logistics AI Agent",
      role: "Operations Manager & Resource Optimizer",
      knowledgeBase: [
        "Inventory Management",
        "Image Recognition for Stock Counting",
        "Housekeeping Standards",
        "Maintenance Scheduling",
        "Supply Chain Optimization",
        "Staff Management",
        "Reordering Automation",
      ],
    },
  },
  {
    id: "marketing",
    name: "Marketing",
    nameGe: "მარკეტინგი",
    icon: "Megaphone",
    path: "/marketing",
    description: "Marketing campaigns and channel performance",
    descriptionGe: "მარკეტინგული კამპანიები და არხების შესრულება",
    subModules: [
      {
        id: "channel-performance",
        name: "Channel Performance",
        nameGe: "არხების შესრულება",
        icon: "BarChart3",
        path: "/marketing/channels",
        description: "Analytics showing which OTA brings more revenue",
        descriptionGe: "ანალიტიკა რომელი OTA მეტ შემოსავალს იძლევა",
      },
      {
        id: "reputation",
        name: "Reputation Manager",
        nameGe: "რეპუტაციის მენეჯერი",
        icon: "Star",
        path: "/marketing/reputation",
        description: "Read and reply to guest reviews",
        descriptionGe: "სტუმრების რევიუების წაკითხვა და პასუხი",
      },
      {
        id: "campaigns",
        name: "Campaign Builder",
        nameGe: "კამპანიების შემქმნელი",
        icon: "Send",
        path: "/marketing/campaigns",
        description: "Draft email/SMS blasts to guests",
        descriptionGe: "ელფოსტა/SMS კამპანიების შედგენა",
      },
      {
        id: "social-media",
        name: "Social Media Planner",
        nameGe: "სოციალური მედია",
        icon: "Instagram",
        path: "/marketing/social",
        description: "Calendar for Instagram/TikTok posts",
        descriptionGe: "Instagram/TikTok პოსტების კალენდარი",
      },
      {
        id: "ai-agent",
        name: "🤖 Marketing AI",
        nameGe: "🤖 მარკეტინგის AI",
        icon: "Bot",
        path: "/marketing/ai",
        description: "AI agent to write creative copy, posts, or analyze review sentiment",
        descriptionGe: "AI აგენტი კრეატიული ტექსტებისა და პოსტების შესაქმნელად",
        isAIAgent: true,
      },
    ],
    aiAgent: {
      name: "Marketing AI Agent",
      role: "Marketing Strategist & Content Creator",
      knowledgeBase: [
        "Digital Marketing Strategy",
        "Social Media Content Creation",
        "Review Sentiment Analysis",
        "Email/SMS Copywriting",
        "Instagram/TikTok Trends",
        "OTA Channel Optimization",
        "Creative Campaign Ideas",
      ],
    },
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    nameGe: "რეპორტები და ანალიტიკა",
    icon: "BarChart",
    path: "/reports",
    description: "Business intelligence and data analytics",
    descriptionGe: "ბიზნეს ინტელექტი და მონაცემთა ანალიტიკა",
    subModules: [
      {
        id: "monthly",
        name: "Monthly Overview",
        nameGe: "თვიური მიმოხილვა",
        icon: "FileText",
        path: "/reports/monthly",
        description: "High-level PDF report generator for CEO",
        descriptionGe: "მაღალი დონის PDF რეპორტი CEO-სთვის",
      },
      {
        id: "yearly",
        name: "Yearly Growth",
        nameGe: "წლიური ზრდა",
        icon: "TrendingUp",
        path: "/reports/yearly",
        description: "Year-over-Year comparison charts",
        descriptionGe: "წლიური შედარების დიაგრამები",
      },
      {
        id: "heatmap",
        name: "Occupancy Heatmap",
        nameGe: "დაკავების თერმული რუკა",
        icon: "Activity",
        path: "/reports/heatmap",
        description: "Visualizing peak dates and low seasons",
        descriptionGe: "პიკური თარიღების და დაბალი სეზონის ვიზუალიზაცია",
      },
      {
        id: "export",
        name: "Export Center",
        nameGe: "ექსპორტის ცენტრი",
        icon: "Download",
        path: "/reports/export",
        description: "Download all raw data (CSV/Excel)",
        descriptionGe: "ყველა მონაცემის ჩამოტვირთვა (CSV/Excel)",
      },
      {
        id: "ai-agent",
        name: "🤖 Data Scientist AI",
        nameGe: "🤖 მონაცემთა მეცნიერის AI",
        icon: "Bot",
        path: "/reports/ai",
        description: "AI agent to find hidden patterns in uploaded historical data",
        descriptionGe: "AI აგენტი დამალული პატერნების საპოვნელად",
        isAIAgent: true,
      },
    ],
    aiAgent: {
      name: "Data Scientist AI Agent",
      role: "Business Intelligence & Pattern Recognition Expert",
      knowledgeBase: [
        "Statistical Analysis",
        "Pattern Recognition",
        "Predictive Analytics",
        "Data Visualization",
        "Historical Data Analysis",
        "Trend Forecasting",
        "Business Intelligence Reporting",
      ],
    },
  },
];

// Helper functions
export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getSubModuleById(
  moduleId: string,
  subModuleId: string
): SubModule | undefined {
  const module = getModuleById(moduleId);
  return module?.subModules.find((sm) => sm.id === subModuleId);
}

export function getAllKnowledgeBases(): string[] {
  const allKnowledge = MODULES.flatMap((m) => m.aiAgent.knowledgeBase);
  return Array.from(new Set(allKnowledge));
}

export function getAIAgentSubModule(moduleId: string): SubModule | undefined {
  const module = getModuleById(moduleId);
  return module?.subModules.find((sm) => sm.isAIAgent);
}
