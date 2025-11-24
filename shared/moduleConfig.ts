/**
 * ORBI City Hub - Module Configuration
 * Hierarchical structure: 5 main modules × 5 sub-modules each
 */

export interface SubModule {
  id: string;
  name: string;
  nameGe: string; // Georgian name
  icon: string;
  path: string;
  description: string;
  descriptionGe: string;
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
    knowledgeBase: string[]; // Topics this agent knows about
  };
}

export const MODULES: Module[] = [
  {
    id: "ceo",
    name: "CEO Dashboard",
    nameGe: "CEO დეშბორდი",
    icon: "LayoutDashboard",
    path: "/",
    description: "Executive overview and strategic insights",
    descriptionGe: "აღმასრულებელი მიმოხილვა და სტრატეგიული ანალიტიკა",
    subModules: [
      {
        id: "overview",
        name: "Overview",
        nameGe: "მიმოხილვა",
        icon: "Eye",
        path: "/ceo/overview",
        description: "High-level business metrics and KPIs",
        descriptionGe: "მაღალი დონის ბიზნეს მეტრიკები და KPI-ები",
      },
      {
        id: "analytics",
        name: "Analytics",
        nameGe: "ანალიტიკა",
        icon: "TrendingUp",
        path: "/ceo/analytics",
        description: "Advanced data analysis and trends",
        descriptionGe: "მოწინავე მონაცემთა ანალიზი და ტენდენციები",
      },
      {
        id: "reports",
        name: "Reports",
        nameGe: "რეპორტები",
        icon: "FileText",
        path: "/ceo/reports",
        description: "Automated business reports",
        descriptionGe: "ავტომატიზირებული ბიზნეს რეპორტები",
      },
      {
        id: "team",
        name: "Team",
        nameGe: "გუნდი",
        icon: "Users",
        path: "/ceo/team",
        description: "Team performance and management",
        descriptionGe: "გუნდის შესრულება და მართვა",
      },
      {
        id: "settings",
        name: "Settings",
        nameGe: "პარამეტრები",
        icon: "Settings",
        path: "/ceo/settings",
        description: "System configuration and preferences",
        descriptionGe: "სისტემის კონფიგურაცია და პარამეტრები",
      },
    ],
    aiAgent: {
      name: "Main CEO Agent",
      role: "Strategic Advisor & Multi-Agent Orchestrator",
      knowledgeBase: [
        "Business Strategy",
        "Financial Analysis",
        "Team Management",
        "Market Trends",
        "Competitive Analysis",
        "All Sub-Agent Knowledge", // Has access to all other agents
      ],
    },
  },
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
        id: "active-bookings",
        name: "Active Bookings",
        nameGe: "აქტიური ბრონირებები",
        icon: "BookOpen",
        path: "/reservations/active",
        description: "Current and upcoming reservations",
        descriptionGe: "მიმდინარე და მომავალი ბრონირებები",
      },
      {
        id: "calendar",
        name: "Calendar",
        nameGe: "კალენდარი",
        icon: "CalendarDays",
        path: "/reservations/calendar",
        description: "Visual booking calendar",
        descriptionGe: "ვიზუალური ბრონირების კალენდარი",
      },
      {
        id: "guest-profiles",
        name: "Guest Profiles",
        nameGe: "სტუმრების პროფილები",
        icon: "UserCircle",
        path: "/reservations/guests",
        description: "Guest information and history",
        descriptionGe: "სტუმრების ინფორმაცია და ისტორია",
      },
      {
        id: "channel-manager",
        name: "Channel Manager",
        nameGe: "არხების მენეჯერი",
        icon: "Network",
        path: "/reservations/channels",
        description: "Multi-channel booking management",
        descriptionGe: "მრავალარხიანი ბრონირების მართვა",
      },
      {
        id: "email-sync",
        name: "Email Sync",
        nameGe: "ელფოსტის სინქრონიზაცია",
        icon: "Mail",
        path: "/reservations/email",
        description: "Gmail integration and auto-parsing",
        descriptionGe: "Gmail ინტეგრაცია და ავტო-პარსინგი",
      },
    ],
    aiAgent: {
      name: "Reservations AI Agent",
      role: "Booking Specialist & Guest Relations",
      knowledgeBase: [
        "Booking Platforms (Booking.com, Airbnb, Expedia, etc.)",
        "Guest Communication",
        "Pricing Strategies",
        "Availability Management",
        "Email Parsing",
        "Channel Optimization",
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
        id: "pl-dashboard",
        name: "P&L Dashboard",
        nameGe: "P&L დეშბორდი",
        icon: "BarChart3",
        path: "/finance/pl",
        description: "Profit & Loss overview",
        descriptionGe: "მოგება-ზარალის მიმოხილვა",
      },
      {
        id: "revenue-analysis",
        name: "Revenue Analysis",
        nameGe: "შემოსავლის ანალიზი",
        icon: "TrendingUp",
        path: "/finance/revenue",
        description: "Revenue breakdown and trends",
        descriptionGe: "შემოსავლის დაშლა და ტენდენციები",
      },
      {
        id: "expenses",
        name: "Expenses",
        nameGe: "ხარჯები",
        icon: "Receipt",
        path: "/finance/expenses",
        description: "Expense tracking and categorization",
        descriptionGe: "ხარჯების თვალყურის დევნება და კატეგორიზაცია",
      },
      {
        id: "invoices",
        name: "Invoices",
        nameGe: "ინვოისები",
        icon: "FileText",
        path: "/finance/invoices",
        description: "Invoice management",
        descriptionGe: "ინვოისების მართვა",
      },
      {
        id: "reports",
        name: "Reports",
        nameGe: "რეპორტები",
        icon: "PieChart",
        path: "/finance/reports",
        description: "Financial reports and exports",
        descriptionGe: "ფინანსური რეპორტები და ექსპორტი",
      },
    ],
    aiAgent: {
      name: "Finance AI Agent",
      role: "Financial Analyst & Cost Optimizer",
      knowledgeBase: [
        "P&L Analysis",
        "Revenue Optimization",
        "Cost Management",
        "Tax Compliance (Georgia)",
        "Financial Forecasting",
        "Budget Planning",
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
        id: "campaigns",
        name: "Campaigns",
        nameGe: "კამპანიები",
        icon: "Rocket",
        path: "/marketing/campaigns",
        description: "Marketing campaign management",
        descriptionGe: "მარკეტინგული კამპანიების მართვა",
      },
      {
        id: "channels",
        name: "Channels",
        nameGe: "არხები",
        icon: "Radio",
        path: "/marketing/channels",
        description: "15 distribution channels monitoring",
        descriptionGe: "15 დისტრიბუციის არხის მონიტორინგი",
      },
      {
        id: "analytics",
        name: "Analytics",
        nameGe: "ანალიტიკა",
        icon: "LineChart",
        path: "/marketing/analytics",
        description: "Marketing performance metrics",
        descriptionGe: "მარკეტინგის შესრულების მეტრიკები",
      },
      {
        id: "content",
        name: "Content",
        nameGe: "კონტენტი",
        icon: "Image",
        path: "/marketing/content",
        description: "Content creation and management",
        descriptionGe: "კონტენტის შექმნა და მართვა",
      },
      {
        id: "roi",
        name: "ROI",
        nameGe: "ROI",
        icon: "Target",
        path: "/marketing/roi",
        description: "Return on investment tracking",
        descriptionGe: "ინვესტიციის უკუგების თვალყურის დევნება",
      },
    ],
    aiAgent: {
      name: "Marketing AI Agent",
      role: "Marketing Strategist & Content Creator",
      knowledgeBase: [
        "Digital Marketing",
        "Social Media (TikTok, Instagram)",
        "SEO & SEM",
        "Content Strategy",
        "Channel Optimization",
        "ROI Analysis",
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
    ],
    aiAgent: {
      name: "Logistics AI Agent",
      role: "Operations Manager & Resource Optimizer",
      knowledgeBase: [
        "Inventory Management",
        "Housekeeping Standards",
        "Maintenance Scheduling",
        "Supply Chain",
        "Staff Management",
        "Quality Control",
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
  return Array.from(new Set(allKnowledge)); // Remove duplicates
}
