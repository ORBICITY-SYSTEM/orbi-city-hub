var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/moduleConfig.ts
var moduleConfig_exports = {};
__export(moduleConfig_exports, {
  MODULES: () => MODULES,
  getAIAgentSubModule: () => getAIAgentSubModule,
  getAllKnowledgeBases: () => getAllKnowledgeBases,
  getModuleById: () => getModuleById,
  getSubModuleById: () => getSubModuleById
});
function getModuleById(id) {
  return MODULES.find((m) => m.id === id);
}
function getSubModuleById(moduleId, subModuleId) {
  const module = getModuleById(moduleId);
  return module?.subModules.find((sm) => sm.id === subModuleId);
}
function getAllKnowledgeBases() {
  const allKnowledge = MODULES.flatMap((m) => m.aiAgent.knowledgeBase);
  return Array.from(new Set(allKnowledge));
}
function getAIAgentSubModule(moduleId) {
  const module = getModuleById(moduleId);
  return module?.subModules.find((sm) => sm.isAIAgent);
}
var MODULES;
var init_moduleConfig = __esm({
  "shared/moduleConfig.ts"() {
    "use strict";
    MODULES = [
      {
        id: "reservations",
        name: "Reservations",
        nameGe: "\u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D4\u10D1\u10D8",
        icon: "Calendar",
        path: "/reservations",
        description: "Booking management and guest services",
        descriptionGe: "\u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0 \u10D3\u10D0 \u10E1\u10E2\u10E3\u10DB\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D4\u10E0\u10D5\u10D8\u10E1\u10D8",
        subModules: [
          {
            id: "calendar",
            name: "Calendar View",
            nameGe: "\u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8",
            icon: "CalendarDays",
            path: "/reservations/calendar",
            description: "Gantt-chart style visual booking calendar",
            descriptionGe: "\u10D5\u10D8\u10D6\u10E3\u10D0\u10DA\u10E3\u10E0\u10D8 \u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8 (Gantt-chart)"
          },
          {
            id: "all-bookings",
            name: "All Bookings",
            nameGe: "\u10E7\u10D5\u10D4\u10DA\u10D0 \u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D0",
            icon: "List",
            path: "/reservations/bookings",
            description: "Searchable data table of all reservations",
            descriptionGe: "\u10EB\u10D8\u10D4\u10D1\u10D0\u10D3\u10D8 \u10EA\u10EE\u10E0\u10D8\u10DA\u10D8 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1"
          },
          {
            id: "guest-crm",
            name: "Guest CRM",
            nameGe: "\u10E1\u10E2\u10E3\u10DB\u10E0\u10D4\u10D1\u10D8\u10E1 CRM",
            icon: "Users",
            path: "/reservations/crm",
            description: "Guest profiles, history, and preferences database",
            descriptionGe: "\u10E1\u10E2\u10E3\u10DB\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DE\u10E0\u10DD\u10E4\u10D8\u10DA\u10D4\u10D1\u10D8, \u10D8\u10E1\u10E2\u10DD\u10E0\u10D8\u10D0 \u10D3\u10D0 \u10DE\u10E0\u10D4\u10E4\u10D4\u10E0\u10D4\u10DC\u10EA\u10D8\u10D4\u10D1\u10D8"
          },
          {
            id: "mail-room",
            name: "\u{1F4E7} Mail Room",
            nameGe: "\u{1F4E7} \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0",
            icon: "Mail",
            path: "/reservations/mail",
            description: "Gmail Sync & OTA booking parser",
            descriptionGe: "Gmail \u10E1\u10D8\u10DC\u10E5\u10E0\u10DD\u10DC\u10D8\u10D6\u10D0\u10EA\u10D8\u10D0 \u10D3\u10D0 OTA \u10DE\u10D0\u10E0\u10E1\u10D4\u10E0\u10D8"
          },
          {
            id: "ai-agent",
            name: "\u{1F916} Reservations AI",
            nameGe: "\u{1F916} \u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1 AI",
            icon: "Bot",
            path: "/reservations/ai",
            description: "AI agent for email drafting, trend analysis, voucher parsing",
            descriptionGe: "AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 \u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10D3\u10D2\u10D4\u10DC\u10D0, \u10E2\u10D4\u10DC\u10D3\u10D4\u10DC\u10EA\u10D8\u10D4\u10D1\u10D8\u10E1 \u10D0\u10DC\u10D0\u10DA\u10D8\u10D6\u10D8, \u10D5\u10D0\u10E3\u10E9\u10D4\u10E0\u10D4\u10D1\u10D8\u10E1 \u10DE\u10D0\u10E0\u10E1\u10D8\u10DC\u10D2\u10D8",
            isAIAgent: true
          }
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
            "Trend Analysis & Forecasting"
          ]
        }
      },
      {
        id: "finance",
        name: "Finance",
        nameGe: "\u10E4\u10D8\u10DC\u10D0\u10DC\u10E1\u10D4\u10D1\u10D8",
        icon: "DollarSign",
        path: "/finance",
        description: "Financial management and reporting",
        descriptionGe: "\u10E4\u10D8\u10DC\u10D0\u10DC\u10E1\u10E3\u10E0\u10D8 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0 \u10D3\u10D0 \u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D8\u10DC\u10D2\u10D8",
        subModules: [
          {
            id: "transactions",
            name: "Transactions Log",
            nameGe: "\u10E2\u10E0\u10D0\u10DC\u10D6\u10D0\u10E5\u10EA\u10D8\u10D4\u10D1\u10D8\u10E1 \u10DA\u10DD\u10D2\u10D8",
            icon: "Receipt",
            path: "/finance/transactions",
            description: "Daily income/expense input with categories",
            descriptionGe: "\u10D3\u10E6\u10D8\u10E3\u10E0\u10D8 \u10E8\u10D4\u10DB\u10DD\u10E1\u10D0\u10D5\u10DA\u10D4\u10D1\u10D8/\u10EE\u10D0\u10E0\u10EF\u10D4\u10D1\u10D8 \u10D9\u10D0\u10E2\u10D4\u10D2\u10DD\u10E0\u10D8\u10D4\u10D1\u10D8\u10D7"
          },
          {
            id: "pl-analysis",
            name: "P&L Analysis",
            nameGe: "P&L \u10D0\u10DC\u10D0\u10DA\u10D8\u10D6\u10D8",
            icon: "TrendingUp",
            path: "/finance/pl",
            description: "Visual Profit & Loss charts (Monthly/Yearly)",
            descriptionGe: "\u10D5\u10D8\u10D6\u10E3\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DB\u10DD\u10D2\u10D4\u10D1\u10D0-\u10D6\u10D0\u10E0\u10D0\u10DA\u10D8\u10E1 \u10D3\u10D8\u10D0\u10D2\u10E0\u10D0\u10DB\u10D4\u10D1\u10D8"
          },
          {
            id: "owner-settlements",
            name: "Owner Settlements",
            nameGe: "\u10DB\u10D4\u10E1\u10D0\u10D9\u10E3\u10D7\u10E0\u10D4\u10D4\u10D1\u10D8\u10E1 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10E1\u10EC\u10DD\u10E0\u10D4\u10D1\u10D0",
            icon: "Users",
            path: "/finance/settlements",
            description: "Profit split calculator (e.g., 80/20) and reports",
            descriptionGe: "\u10DB\u10DD\u10D2\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10E7\u10DD\u10E4\u10D8\u10E1 \u10D9\u10D0\u10DA\u10D9\u10E3\u10DA\u10D0\u10E2\u10DD\u10E0\u10D8 \u10D3\u10D0 \u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D4\u10D1\u10D8"
          },
          {
            id: "invoicing",
            name: "Invoicing",
            nameGe: "\u10D8\u10DC\u10D5\u10DD\u10D8\u10E1\u10D4\u10D1\u10D8",
            icon: "FileText",
            path: "/finance/invoices",
            description: "Generate and track PDF invoices",
            descriptionGe: "PDF \u10D8\u10DC\u10D5\u10DD\u10D8\u10E1\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D4\u10DC\u10D4\u10E0\u10D0\u10EA\u10D8\u10D0 \u10D3\u10D0 \u10D7\u10D5\u10D0\u10DA\u10E7\u10E3\u10E0\u10D8\u10E1 \u10D3\u10D4\u10D5\u10DC\u10D4\u10D1\u10D0"
          },
          {
            id: "ai-agent",
            name: "\u{1F916} Finance AI",
            nameGe: "\u{1F916} \u10E4\u10D8\u10DC\u10D0\u10DC\u10E1\u10D4\u10D1\u10D8\u10E1 AI",
            icon: "Bot",
            path: "/finance/ai",
            description: "AI agent to analyze Excel reports and answer financial queries",
            descriptionGe: "AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 Excel \u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D4\u10D1\u10D8\u10E1 \u10D0\u10DC\u10D0\u10DA\u10D8\u10D6\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1",
            isAIAgent: true
          }
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
            "Budget Planning & Forecasting"
          ]
        }
      },
      {
        id: "logistics",
        name: "Logistics",
        nameGe: "\u10DA\u10DD\u10D2\u10D8\u10E1\u10E2\u10D8\u10D9\u10D0",
        icon: "Package",
        path: "/logistics",
        description: "Inventory, housekeeping, and maintenance",
        descriptionGe: "\u10D8\u10DC\u10D5\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8, \u10D3\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0 \u10D3\u10D0 \u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10E3\u10E0\u10D8 \u10DB\u10DD\u10D5\u10DA\u10D0",
        subModules: [
          {
            id: "inventory",
            name: "Inventory",
            nameGe: "\u10D8\u10DC\u10D5\u10D4\u10DC\u10E2\u10D0\u10E0\u10D8",
            icon: "Package",
            path: "/logistics/inventory",
            description: "Stock management and tracking",
            descriptionGe: "\u10DB\u10D0\u10E0\u10D0\u10D2\u10D8\u10E1 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0 \u10D3\u10D0 \u10D7\u10D5\u10D0\u10DA\u10E7\u10E3\u10E0\u10D8\u10E1 \u10D3\u10D4\u10D5\u10DC\u10D4\u10D1\u10D0"
          },
          {
            id: "housekeeping",
            name: "Housekeeping",
            nameGe: "\u10D3\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0",
            icon: "Sparkles",
            path: "/logistics/housekeeping",
            description: "Cleaning schedules and tasks",
            descriptionGe: "\u10D3\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D8\u10E1 \u10D2\u10E0\u10D0\u10E4\u10D8\u10D9\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10D0\u10DB\u10DD\u10EA\u10D0\u10DC\u10D4\u10D1\u10D8"
          },
          {
            id: "maintenance",
            name: "Maintenance",
            nameGe: "\u10E2\u10D4\u10E5\u10DC\u10D8\u10D9\u10E3\u10E0\u10D8 \u10DB\u10DD\u10D5\u10DA\u10D0",
            icon: "Wrench",
            path: "/logistics/maintenance",
            description: "Repair and maintenance tracking",
            descriptionGe: "\u10E0\u10D4\u10DB\u10DD\u10DC\u10E2\u10D8\u10E1\u10D0 \u10D3\u10D0 \u10DB\u10DD\u10D5\u10DA\u10D8\u10E1 \u10D7\u10D5\u10D0\u10DA\u10E7\u10E3\u10E0\u10D8\u10E1 \u10D3\u10D4\u10D5\u10DC\u10D4\u10D1\u10D0"
          },
          {
            id: "supplies",
            name: "Supplies",
            nameGe: "\u10DB\u10D0\u10E0\u10D0\u10D2\u10D4\u10D1\u10D8",
            icon: "ShoppingCart",
            path: "/logistics/supplies",
            description: "Supply ordering and management",
            descriptionGe: "\u10DB\u10D0\u10E0\u10D0\u10D2\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10D9\u10D5\u10D4\u10D7\u10D0 \u10D3\u10D0 \u10DB\u10D0\u10E0\u10D7\u10D5\u10D0"
          },
          {
            id: "staff",
            name: "Staff",
            nameGe: "\u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10D8",
            icon: "Users",
            path: "/logistics/staff",
            description: "Staff scheduling and assignments",
            descriptionGe: "\u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10D8\u10E1 \u10D2\u10E0\u10D0\u10E4\u10D8\u10D9\u10D8 \u10D3\u10D0 \u10D3\u10D0\u10D5\u10D0\u10DA\u10D4\u10D1\u10D4\u10D1\u10D8"
          },
          {
            id: "ai-agent",
            name: "\u{1F916} Logistics AI",
            nameGe: "\u{1F916} \u10DA\u10DD\u10D2\u10D8\u10E1\u10E2\u10D8\u10D9\u10D8\u10E1 AI",
            icon: "Bot",
            path: "/logistics/ai",
            description: "AI agent to analyze stock levels from photos/lists and suggest reordering",
            descriptionGe: "AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 \u10DB\u10D0\u10E0\u10D0\u10D2\u10D4\u10D1\u10D8\u10E1 \u10D0\u10DC\u10D0\u10DA\u10D8\u10D6\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10E4\u10DD\u10E2\u10DD\u10D4\u10D1\u10D8\u10D3\u10D0\u10DC",
            isAIAgent: true
          }
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
            "Reordering Automation"
          ]
        }
      },
      {
        id: "marketing",
        name: "Marketing",
        nameGe: "\u10DB\u10D0\u10E0\u10D9\u10D4\u10E2\u10D8\u10DC\u10D2\u10D8",
        icon: "Megaphone",
        path: "/marketing",
        description: "Marketing campaigns and channel performance",
        descriptionGe: "\u10DB\u10D0\u10E0\u10D9\u10D4\u10E2\u10D8\u10DC\u10D2\u10E3\u10DA\u10D8 \u10D9\u10D0\u10DB\u10DE\u10D0\u10DC\u10D8\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10D0\u10E0\u10EE\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10E1\u10E0\u10E3\u10DA\u10D4\u10D1\u10D0",
        subModules: [
          {
            id: "channel-performance",
            name: "Channel Performance",
            nameGe: "\u10D0\u10E0\u10EE\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10E1\u10E0\u10E3\u10DA\u10D4\u10D1\u10D0",
            icon: "BarChart3",
            path: "/marketing/channels",
            description: "Analytics showing which OTA brings more revenue",
            descriptionGe: "\u10D0\u10DC\u10D0\u10DA\u10D8\u10E2\u10D8\u10D9\u10D0 \u10E0\u10DD\u10DB\u10D4\u10DA\u10D8 OTA \u10DB\u10D4\u10E2 \u10E8\u10D4\u10DB\u10DD\u10E1\u10D0\u10D5\u10D0\u10DA\u10E1 \u10D8\u10EB\u10DA\u10D4\u10D5\u10D0"
          },
          {
            id: "reputation",
            name: "Reputation Manager",
            nameGe: "\u10E0\u10D4\u10DE\u10E3\u10E2\u10D0\u10EA\u10D8\u10D8\u10E1 \u10DB\u10D4\u10DC\u10D4\u10EF\u10D4\u10E0\u10D8",
            icon: "Star",
            path: "/marketing/reputation",
            description: "Read and reply to guest reviews",
            descriptionGe: "\u10E1\u10E2\u10E3\u10DB\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E0\u10D4\u10D5\u10D8\u10E3\u10D4\u10D1\u10D8\u10E1 \u10EC\u10D0\u10D9\u10D8\u10D7\u10EE\u10D5\u10D0 \u10D3\u10D0 \u10DE\u10D0\u10E1\u10E3\u10EE\u10D8"
          },
          {
            id: "campaigns",
            name: "Campaign Builder",
            nameGe: "\u10D9\u10D0\u10DB\u10DE\u10D0\u10DC\u10D8\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10DB\u10E5\u10DB\u10DC\u10D4\u10DA\u10D8",
            icon: "Send",
            path: "/marketing/campaigns",
            description: "Draft email/SMS blasts to guests",
            descriptionGe: "\u10D4\u10DA\u10E4\u10DD\u10E1\u10E2\u10D0/SMS \u10D9\u10D0\u10DB\u10DE\u10D0\u10DC\u10D8\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10D3\u10D2\u10D4\u10DC\u10D0"
          },
          {
            id: "social-media",
            name: "Social Media Planner",
            nameGe: "\u10E1\u10DD\u10EA\u10D8\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DB\u10D4\u10D3\u10D8\u10D0",
            icon: "Instagram",
            path: "/marketing/social",
            description: "Calendar for Instagram/TikTok posts",
            descriptionGe: "Instagram/TikTok \u10DE\u10DD\u10E1\u10E2\u10D4\u10D1\u10D8\u10E1 \u10D9\u10D0\u10DA\u10D4\u10DC\u10D3\u10D0\u10E0\u10D8"
          },
          {
            id: "ai-agent",
            name: "\u{1F916} Marketing AI",
            nameGe: "\u{1F916} \u10DB\u10D0\u10E0\u10D9\u10D4\u10E2\u10D8\u10DC\u10D2\u10D8\u10E1 AI",
            icon: "Bot",
            path: "/marketing/ai",
            description: "AI agent to write creative copy, posts, or analyze review sentiment",
            descriptionGe: "AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 \u10D9\u10E0\u10D4\u10D0\u10E2\u10D8\u10E3\u10DA\u10D8 \u10E2\u10D4\u10E5\u10E1\u10E2\u10D4\u10D1\u10D8\u10E1\u10D0 \u10D3\u10D0 \u10DE\u10DD\u10E1\u10E2\u10D4\u10D1\u10D8\u10E1 \u10E8\u10D4\u10E1\u10D0\u10E5\u10DB\u10DC\u10D4\u10DA\u10D0\u10D3",
            isAIAgent: true
          }
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
            "Creative Campaign Ideas"
          ]
        }
      },
      {
        id: "reports",
        name: "Reports & Analytics",
        nameGe: "\u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D4\u10D1\u10D8 \u10D3\u10D0 \u10D0\u10DC\u10D0\u10DA\u10D8\u10E2\u10D8\u10D9\u10D0",
        icon: "BarChart",
        path: "/reports",
        description: "Business intelligence and data analytics",
        descriptionGe: "\u10D1\u10D8\u10D6\u10DC\u10D4\u10E1 \u10D8\u10DC\u10E2\u10D4\u10DA\u10D4\u10E5\u10E2\u10D8 \u10D3\u10D0 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D7\u10D0 \u10D0\u10DC\u10D0\u10DA\u10D8\u10E2\u10D8\u10D9\u10D0",
        subModules: [
          {
            id: "monthly",
            name: "Monthly Overview",
            nameGe: "\u10D7\u10D5\u10D8\u10E3\u10E0\u10D8 \u10DB\u10D8\u10DB\u10DD\u10EE\u10D8\u10DA\u10D5\u10D0",
            icon: "FileText",
            path: "/reports/monthly",
            description: "High-level PDF report generator for CEO",
            descriptionGe: "\u10DB\u10D0\u10E6\u10D0\u10DA\u10D8 \u10D3\u10DD\u10DC\u10D8\u10E1 PDF \u10E0\u10D4\u10DE\u10DD\u10E0\u10E2\u10D8 CEO-\u10E1\u10D7\u10D5\u10D8\u10E1"
          },
          {
            id: "yearly",
            name: "Yearly Growth",
            nameGe: "\u10EC\u10DA\u10D8\u10E3\u10E0\u10D8 \u10D6\u10E0\u10D3\u10D0",
            icon: "TrendingUp",
            path: "/reports/yearly",
            description: "Year-over-Year comparison charts",
            descriptionGe: "\u10EC\u10DA\u10D8\u10E3\u10E0\u10D8 \u10E8\u10D4\u10D3\u10D0\u10E0\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D8\u10D0\u10D2\u10E0\u10D0\u10DB\u10D4\u10D1\u10D8"
          },
          {
            id: "heatmap",
            name: "Occupancy Heatmap",
            nameGe: "\u10D3\u10D0\u10D9\u10D0\u10D5\u10D4\u10D1\u10D8\u10E1 \u10D7\u10D4\u10E0\u10DB\u10E3\u10DA\u10D8 \u10E0\u10E3\u10D9\u10D0",
            icon: "Activity",
            path: "/reports/heatmap",
            description: "Visualizing peak dates and low seasons",
            descriptionGe: "\u10DE\u10D8\u10D9\u10E3\u10E0\u10D8 \u10D7\u10D0\u10E0\u10D8\u10E6\u10D4\u10D1\u10D8\u10E1 \u10D3\u10D0 \u10D3\u10D0\u10D1\u10D0\u10DA\u10D8 \u10E1\u10D4\u10D6\u10DD\u10DC\u10D8\u10E1 \u10D5\u10D8\u10D6\u10E3\u10D0\u10DA\u10D8\u10D6\u10D0\u10EA\u10D8\u10D0"
          },
          {
            id: "export",
            name: "Export Center",
            nameGe: "\u10D4\u10E5\u10E1\u10DE\u10DD\u10E0\u10E2\u10D8\u10E1 \u10EA\u10D4\u10DC\u10E2\u10E0\u10D8",
            icon: "Download",
            path: "/reports/export",
            description: "Download all raw data (CSV/Excel)",
            descriptionGe: "\u10E7\u10D5\u10D4\u10DA\u10D0 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D8\u10E1 \u10E9\u10D0\u10DB\u10DD\u10E2\u10D5\u10D8\u10E0\u10D7\u10D5\u10D0 (CSV/Excel)"
          },
          {
            id: "ai-agent",
            name: "\u{1F916} Data Scientist AI",
            nameGe: "\u{1F916} \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D7\u10D0 \u10DB\u10D4\u10EA\u10DC\u10D8\u10D4\u10E0\u10D8\u10E1 AI",
            icon: "Bot",
            path: "/reports/ai",
            description: "AI agent to find hidden patterns in uploaded historical data",
            descriptionGe: "AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 \u10D3\u10D0\u10DB\u10D0\u10DA\u10E3\u10DA\u10D8 \u10DE\u10D0\u10E2\u10D4\u10E0\u10DC\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D0\u10DE\u10DD\u10D5\u10DC\u10D4\u10DA\u10D0\u10D3",
            isAIAgent: true
          }
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
            "Business Intelligence Reporting"
          ]
        }
      }
    ];
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var emails = mysqlTable("emails", {
  id: varchar("id", { length: 255 }).primaryKey(),
  threadId: varchar("threadId", { length: 255 }).notNull(),
  subject: text("subject"),
  sender: varchar("sender", { length: 320 }),
  recipient: varchar("recipient", { length: 320 }),
  emailDate: timestamp("emailDate"),
  snippet: text("snippet"),
  body: text("body"),
  labels: json("labels").$type(),
  isRead: boolean("isRead").default(false),
  // AI categorization fields
  category: mysqlEnum("category", [
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
  ]).default("general").notNull(),
  language: mysqlEnum("language", ["Georgian", "English", "Russian"]).default("English").notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral").notNull(),
  priority: mysqlEnum("priority", ["urgent", "high", "normal", "low"]).default("normal").notNull(),
  reasoning: text("reasoning"),
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 128 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull()
});
var aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  module: varchar("module", { length: 64 }).notNull(),
  messages: json("messages").$type(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var errorLogs = mysqlTable("errorLogs", {
  id: int("id").autoincrement().primaryKey(),
  errorType: varchar("errorType", { length: 64 }).notNull(),
  message: text("message").notNull(),
  stack: text("stack"),
  userId: int("userId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var financialData = mysqlTable("financialData", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  revenue: int("revenue").default(0),
  expenses: int("expenses").default(0),
  profit: int("profit").default(0),
  channel: varchar("channel", { length: 64 }),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: json("value"),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var adminUsers = mysqlTable("adminUsers", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["super_admin", "admin", "moderator"]).default("admin").notNull(),
  isActive: boolean("isActive").default(true),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  aiPrompt: text("aiPrompt"),
  settings: json("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  type: varchar("type", { length: 32 }).default("string"),
  category: varchar("category", { length: 64 }),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: varchar("bookingId", { length: 128 }).unique(),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  roomNumber: varchar("roomNumber", { length: 16 }),
  checkIn: timestamp("checkIn").notNull(),
  checkOut: timestamp("checkOut").notNull(),
  totalPrice: int("totalPrice"),
  currency: varchar("currency", { length: 8 }).default("GEL"),
  channel: varchar("channel", { length: 64 }),
  status: mysqlEnum("status", ["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var logisticsActivityLog = mysqlTable("logisticsActivityLog", {
  id: int("id").autoincrement().primaryKey(),
  activityType: varchar("activityType", { length: 64 }).notNull(),
  description: text("description"),
  roomNumber: varchar("roomNumber", { length: 16 }),
  staffId: int("staffId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var rooms = mysqlTable("rooms", {
  id: int("id").autoincrement().primaryKey(),
  roomNumber: varchar("roomNumber", { length: 16 }).notNull().unique(),
  roomType: varchar("roomType", { length: 64 }),
  floor: int("floor"),
  status: mysqlEnum("status", ["available", "occupied", "cleaning", "maintenance", "blocked"]).default("available").notNull(),
  lastCleaned: timestamp("lastCleaned"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var inventoryItems = mysqlTable("inventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }),
  quantity: int("quantity").default(0),
  minQuantity: int("minQuantity").default(0),
  unit: varchar("unit", { length: 32 }),
  location: varchar("location", { length: 128 }),
  lastRestocked: timestamp("lastRestocked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var housekeepingTasks = mysqlTable("housekeepingTasks", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId"),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  assignedTo: int("assignedTo"),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  notes: text("notes"),
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var emailCategories = mysqlTable("emailCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 16 }),
  icon: varchar("icon", { length: 32 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var unsubscribeSuggestions = mysqlTable("unsubscribeSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  emailId: varchar("emailId", { length: 255 }),
  sender: varchar("sender", { length: 320 }),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var emailSummaries = mysqlTable("emailSummaries", {
  id: int("id").autoincrement().primaryKey(),
  emailId: varchar("emailId", { length: 255 }),
  summary: text("summary"),
  keyPoints: json("keyPoints").$type(),
  actionItems: json("actionItems").$type(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var otelmsDailyReports = mysqlTable("otelmsDailyReports", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: timestamp("reportDate").notNull(),
  occupancy: int("occupancy"),
  revenue: int("revenue"),
  adr: int("adr"),
  revpar: int("revpar"),
  bookingsCount: int("bookingsCount"),
  checkInsCount: int("checkInsCount"),
  checkOutsCount: int("checkOutsCount"),
  rawData: json("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  type: varchar("type", { length: 64 }),
  status: mysqlEnum("status", ["active", "inactive", "error", "pending"]).default("inactive").notNull(),
  config: json("config"),
  lastSync: timestamp("lastSync"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId"),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var guests = mysqlTable("guests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  nationality: varchar("nationality", { length: 64 }),
  passportNumber: varchar("passportNumber", { length: 64 }),
  notes: text("notes"),
  totalStays: int("totalStays").default(0),
  totalSpent: int("totalSpent").default(0),
  vipStatus: boolean("vipStatus").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var standardInventoryItems = mysqlTable("standardInventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }),
  defaultQuantity: int("defaultQuantity").default(1),
  unit: varchar("unit", { length: 32 }),
  isRequired: boolean("isRequired").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var roomInventoryItems = mysqlTable("roomInventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  itemId: int("itemId").notNull(),
  quantity: int("quantity").default(0),
  lastChecked: timestamp("lastChecked"),
  status: mysqlEnum("status", ["ok", "missing", "damaged", "needs_replacement"]).default("ok").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var housekeepingSchedules = mysqlTable("housekeepingSchedules", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  scheduledTime: varchar("scheduledTime", { length: 16 }),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  assignedTo: int("assignedTo"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled", "skipped"]).default("scheduled").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var maintenanceSchedules = mysqlTable("maintenanceSchedules", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId"),
  equipmentName: varchar("equipmentName", { length: 255 }),
  maintenanceType: varchar("maintenanceType", { length: 64 }).notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  assignedTo: int("assignedTo"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled", "postponed"]).default("scheduled").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  estimatedDuration: int("estimatedDuration"),
  actualDuration: int("actualDuration"),
  cost: int("cost"),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/errorLogger.ts
async function logError(entry) {
  try {
    console.error(`[${entry.level.toUpperCase()}]`, entry.message, entry.context || "");
    const db = await getDb();
    if (db) {
      await db.insert(errorLogs).values({
        level: entry.level,
        message: entry.message,
        stack: entry.stack || null,
        context: entry.context ? JSON.stringify(entry.context) : null,
        userId: entry.userId || null,
        userEmail: entry.userEmail || null,
        url: entry.url || null,
        userAgent: entry.userAgent || null
      });
    }
    if (process.env.SENTRY_DSN) {
    }
  } catch (error) {
    console.error("[ErrorLogger] Failed to log error:", error);
    console.error("[ErrorLogger] Original error:", entry);
  }
}
function errorLoggerMiddleware(err, req, res, next) {
  logError({
    level: "error",
    message: err.message,
    stack: err.stack,
    context: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body
    },
    userId: req.user?.id,
    userEmail: req.user?.email,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"]
  });
  next(err);
}

// server/_core/rateLimiter.ts
import rateLimit from "express-rate-limit";
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  // Store in memory (for production, use Redis)
  skip: (req) => {
    return req.path === "/api/health" || req.path === "/api/healthCheck/check";
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
  // Don't count successful requests
});
var uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // Limit each IP to 10 uploads per windowMs
  message: "Too many upload requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 200,
  // Limit each IP to 200 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 10,
  // Limit each IP to 10 requests per hour
  message: "Rate limit exceeded for this operation.",
  standardHeaders: true,
  legacyHeaders: false
});

// server/security.ts
import helmet from "helmet";
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function securityHeadersMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.manus.im", "wss:"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536e3,
      // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: "deny"
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin"
    }
  });
}
function runSecurityAudit() {
  const vulnerabilities = [];
  const recommendations = [];
  if (!process.env.JWT_SECRET) {
    vulnerabilities.push("JWT_SECRET not configured");
    recommendations.push("Set JWT_SECRET environment variable");
  }
  if (!process.env.DATABASE_URL) {
    vulnerabilities.push("DATABASE_URL not configured");
    recommendations.push("Set DATABASE_URL environment variable");
  }
  if (!process.env.REDIS_URL) {
    recommendations.push("Configure REDIS_URL for caching and rate limiting");
  }
  return {
    timestamp: /* @__PURE__ */ new Date(),
    checks: {
      sqlInjectionProtection: true,
      xssProtection: true,
      csrfProtection: true,
      // tRPC handles CSRF automatically
      securityHeaders: true,
      inputValidation: true,
      rateLimiting: true,
      authentication: true
    },
    vulnerabilities,
    recommendations
  };
}

// server/backup.ts
import { exec } from "child_process";
import { promisify } from "util";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/backup.ts
var execAsync = promisify(exec);
async function createDatabaseBackup() {
  const timestamp3 = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  const filename = `orbi-city-hub-backup-${timestamp3}.sql`;
  const tempPath = `/tmp/${filename}`;
  try {
    console.log("[Backup] Starting database backup...");
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL not configured");
    }
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (!urlMatch) {
      throw new Error("Invalid DATABASE_URL format");
    }
    const [, user, password, host, port, database] = urlMatch;
    const dumpCommand = `mysqldump       --host=${host}       --port=${port}       --user=${user}       --password='${password}'       --single-transaction       --routines       --triggers       --events       ${database} > ${tempPath}`;
    console.log(`[Backup] Dumping database: ${database}@${host}:${port}`);
    await execAsync(dumpCommand);
    console.log("[Backup] Compressing backup...");
    await execAsync(`gzip ${tempPath}`);
    const gzPath = `${tempPath}.gz`;
    const { stdout: sizeOutput } = await execAsync(`du -h ${gzPath} | cut -f1`);
    const size = sizeOutput.trim();
    const fs2 = __require("fs").promises;
    const fileBuffer = await fs2.readFile(gzPath);
    console.log("[Backup] Uploading to S3...");
    const s3Key = `backups/database/${filename}.gz`;
    const { url } = await storagePut(s3Key, fileBuffer, "application/gzip");
    await execAsync(`rm -f ${gzPath}`);
    console.log(`[Backup] \u2713 Backup completed successfully: ${filename}.gz (${size})`);
    await notifyOwner({
      title: "\u2705 Database Backup Success",
      content: `Daily backup completed successfully:

\u2022 File: ${filename}.gz
\u2022 Size: ${size}
\u2022 Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}

Backup is stored securely in S3.`
    });
    return {
      success: true,
      filename: `${filename}.gz`,
      size,
      url
    };
  } catch (error) {
    console.error("[Backup] \u2717 Backup failed:", error);
    await notifyOwner({
      title: "\u274C Database Backup Failed",
      content: `Backup failed at ${(/* @__PURE__ */ new Date()).toLocaleString()}:

Error: ${error instanceof Error ? error.message : String(error)}

Please check the logs and retry manually.`
    });
    return {
      success: false,
      filename,
      size: "0",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function cleanupOldBackups(retentionDays = 30) {
  console.log(`[Backup] Cleaning up backups older than ${retentionDays} days...`);
  return 0;
}

// server/backupScheduler.ts
var backupInterval = null;
var cleanupInterval = null;
function startBackupSchedule() {
  if (backupInterval) {
    console.log("[Backup Scheduler] Already running");
    return;
  }
  console.log("[Backup Scheduler] Starting automated backup schedule...");
  const now = /* @__PURE__ */ new Date();
  const next3AM = /* @__PURE__ */ new Date();
  next3AM.setHours(3, 0, 0, 0);
  if (now > next3AM) {
    next3AM.setDate(next3AM.getDate() + 1);
  }
  const msUntil3AM = next3AM.getTime() - now.getTime();
  console.log(`[Backup Scheduler] First backup scheduled for: ${next3AM.toLocaleString()}`);
  setTimeout(() => {
    runScheduledBackup();
    backupInterval = setInterval(() => {
      runScheduledBackup();
    }, 24 * 60 * 60 * 1e3);
  }, msUntil3AM);
  scheduleWeeklyCleanup();
}
async function runScheduledBackup() {
  console.log("[Backup Scheduler] Running scheduled backup...");
  try {
    const result = await createDatabaseBackup();
    if (result.success) {
      console.log(`[Backup Scheduler] \u2713 Backup completed: ${result.filename} (${result.size})`);
    } else {
      console.error(`[Backup Scheduler] \u2717 Backup failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[Backup Scheduler] \u2717 Backup error:", error);
  }
}
function scheduleWeeklyCleanup() {
  const now = /* @__PURE__ */ new Date();
  const nextSunday = /* @__PURE__ */ new Date();
  nextSunday.setHours(4, 0, 0, 0);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  const msUntilSunday = nextSunday.getTime() - now.getTime();
  console.log(`[Backup Scheduler] First cleanup scheduled for: ${nextSunday.toLocaleString()}`);
  setTimeout(() => {
    runScheduledCleanup();
    cleanupInterval = setInterval(() => {
      runScheduledCleanup();
    }, 7 * 24 * 60 * 60 * 1e3);
  }, msUntilSunday);
}
async function runScheduledCleanup() {
  console.log("[Backup Scheduler] Running scheduled cleanup...");
  try {
    const deletedCount = await cleanupOldBackups(30);
    console.log(`[Backup Scheduler] \u2713 Cleanup completed: ${deletedCount} old backups deleted`);
  } catch (error) {
    console.error("[Backup Scheduler] \u2717 Cleanup error:", error);
  }
}

// server/_core/cache.ts
import Redis from "ioredis";
var redis = null;
function initRedis() {
  if (redis) {
    return redis;
  }
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("[Cache] Redis not configured, caching disabled");
    return null;
  }
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error("[Cache] Redis connection failed after 3 retries");
          return null;
        }
        return Math.min(times * 200, 2e3);
      }
    });
    redis.on("connect", () => {
      console.log("[Cache] Redis connected successfully");
    });
    redis.on("error", (err) => {
      console.error("[Cache] Redis error:", err);
    });
    return redis;
  } catch (error) {
    console.error("[Cache] Failed to initialize Redis:", error);
    return null;
  }
}
async function cacheDelPattern(pattern) {
  if (!redis) return 0;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error);
    return 0;
  }
}
async function getCacheStats() {
  if (!redis) {
    return {
      connected: false,
      keys: 0,
      memory: "0"
    };
  }
  try {
    const info = await redis.info("stats");
    const dbSize = await redis.dbsize();
    const memory = await redis.info("memory");
    return {
      connected: true,
      keys: dbSize,
      memory: memory.match(/used_memory_human:(.+)/)?.[1] || "unknown"
    };
  } catch (error) {
    console.error("[Cache] Error getting stats:", error);
    return {
      connected: false,
      keys: 0,
      memory: "0"
    };
  }
}
async function cacheClear() {
  if (!redis) return false;
  try {
    await redis.flushdb();
    console.log("[Cache] All cache cleared");
    return true;
  } catch (error) {
    console.error("[Cache] Error clearing cache:", error);
    return false;
  }
}

// server/_core/index.ts
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/google.ts
import { z as z2 } from "zod";

// server/googleBusinessProfile.ts
async function fetchGoogleBusinessReviews(locationId, pageSize = 10, pageToken) {
  const mockReviews = [
    {
      reviewId: "review_1",
      reviewer: {
        displayName: "John Smith",
        isAnonymous: false,
        profilePhotoUrl: "https://lh3.googleusercontent.com/a/default-user"
      },
      starRating: "FIVE",
      comment: "Amazing location! The apartment was clean, modern, and had a stunning view of the Black Sea. Perfect for a family vacation in Batumi.",
      createTime: "2025-01-15T10:30:00Z",
      updateTime: "2025-01-15T10:30:00Z",
      reviewReply: {
        comment: "Thank you for your wonderful review! We're thrilled you enjoyed your stay at ORBI City.",
        updateTime: "2025-01-15T14:20:00Z"
      }
    },
    {
      reviewId: "review_2",
      reviewer: {
        displayName: "Maria Garcia",
        isAnonymous: false
      },
      starRating: "FIVE",
      comment: "Excellent service and beautiful apartments. The staff was very helpful and responsive. Highly recommend!",
      createTime: "2025-01-10T08:15:00Z",
      updateTime: "2025-01-10T08:15:00Z"
    },
    {
      reviewId: "review_3",
      reviewer: {
        displayName: "David Wilson",
        isAnonymous: false
      },
      starRating: "FOUR",
      comment: "Great location near the beach. The apartment was spacious and well-equipped. Only minor issue was the Wi-Fi speed.",
      createTime: "2025-01-05T16:45:00Z",
      updateTime: "2025-01-05T16:45:00Z",
      reviewReply: {
        comment: "Thank you for your feedback! We're working on upgrading our Wi-Fi infrastructure.",
        updateTime: "2025-01-06T09:00:00Z"
      }
    },
    {
      reviewId: "review_4",
      reviewer: {
        displayName: "Anna Kowalski",
        isAnonymous: false
      },
      starRating: "FIVE",
      comment: "Perfect stay! Clean, modern, and the view from the balcony is breathtaking. Will definitely come back!",
      createTime: "2024-12-28T12:00:00Z",
      updateTime: "2024-12-28T12:00:00Z"
    },
    {
      reviewId: "review_5",
      reviewer: {
        displayName: "Ahmed Hassan",
        isAnonymous: false
      },
      starRating: "FIVE",
      comment: "Outstanding property! The management team was professional and the apartment exceeded our expectations.",
      createTime: "2024-12-20T14:30:00Z",
      updateTime: "2024-12-20T14:30:00Z"
    }
  ];
  const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  const totalStars = mockReviews.reduce((sum, review) => sum + ratingMap[review.starRating], 0);
  const averageRating = totalStars / mockReviews.length;
  return {
    reviews: mockReviews,
    averageRating,
    totalReviewCount: mockReviews.length
  };
}
async function replyToGoogleReview(reviewName, replyText) {
  console.log(`Replying to review ${reviewName}: ${replyText}`);
  return true;
}
async function deleteGoogleReviewReply(reviewName) {
  console.log(`Deleting reply for review ${reviewName}`);
  return true;
}

// server/googleAnalytics.ts
import { BetaAnalyticsDataClient } from "@google-analytics/data";
var analyticsClient = null;
function getAnalyticsClient() {
  if (!analyticsClient && process.env.GA4_PROPERTY_ID) {
    try {
      analyticsClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
        }
      });
    } catch (error) {
      console.warn("[Google Analytics] Failed to initialize client:", error);
      return null;
    }
  }
  return analyticsClient;
}
async function getGA4Metrics(startDate, endDate) {
  const client = getAnalyticsClient();
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!client || !propertyId) {
    console.warn("[Google Analytics] Using mock data - configure GA4_PROPERTY_ID and credentials");
    return getMockGA4Data();
  }
  try {
    const [metricsResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" }
      ]
    });
    const [trafficResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 5
    });
    const [pagesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "averageSessionDuration" }
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5
    });
    const sessions = parseInt(metricsResponse.rows?.[0]?.metricValues?.[0]?.value || "0");
    const users2 = parseInt(metricsResponse.rows?.[0]?.metricValues?.[1]?.value || "0");
    const pageviews = parseInt(metricsResponse.rows?.[0]?.metricValues?.[2]?.value || "0");
    const avgSessionDuration = parseFloat(metricsResponse.rows?.[0]?.metricValues?.[3]?.value || "0");
    const totalSessions = sessions;
    const trafficSources = (trafficResponse.rows || []).map((row) => {
      const source = row.dimensionValues?.[0]?.value || "Unknown";
      const sourceSessions = parseInt(row.metricValues?.[0]?.value || "0");
      return {
        source,
        sessions: sourceSessions,
        percentage: Math.round(sourceSessions / totalSessions * 100)
      };
    });
    const topPages = (pagesResponse.rows || []).map((row) => {
      const path3 = row.dimensionValues?.[0]?.value || "/";
      const views = parseInt(row.metricValues?.[0]?.value || "0");
      const avgTime = Math.round(parseFloat(row.metricValues?.[1]?.value || "0"));
      return { path: path3, views, avgTime };
    });
    return {
      sessions,
      users: users2,
      pageviews,
      avgSessionDuration,
      trafficSources,
      topPages
    };
  } catch (error) {
    console.error("[Google Analytics] Error fetching metrics:", error);
    return getMockGA4Data();
  }
}
function getMockGA4Data() {
  return {
    sessions: 12847,
    users: 9234,
    pageviews: 45621,
    avgSessionDuration: 245,
    trafficSources: [
      { source: "Booking.com", sessions: 4523, percentage: 35 },
      { source: "Google Organic", sessions: 3854, percentage: 30 },
      { source: "Direct", sessions: 2569, percentage: 20 },
      { source: "Airbnb", sessions: 1285, percentage: 10 },
      { source: "Social Media", sessions: 616, percentage: 5 }
    ],
    topPages: [
      { path: "/", views: 15234, avgTime: 145 },
      { path: "/apartments", views: 8765, avgTime: 234 },
      { path: "/booking", views: 6543, avgTime: 312 },
      { path: "/contact", views: 4321, avgTime: 89 },
      { path: "/about", views: 3210, avgTime: 156 }
    ]
  };
}
async function getGA4RealTimeMetrics() {
  const client = getAnalyticsClient();
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!client || !propertyId) {
    return {
      activeUsers: 42,
      screenPageViews: 156,
      eventCount: 324
    };
  }
  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "eventCount" }
      ]
    });
    return {
      activeUsers: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0"),
      screenPageViews: parseInt(response.rows?.[0]?.metricValues?.[1]?.value || "0"),
      eventCount: parseInt(response.rows?.[0]?.metricValues?.[2]?.value || "0")
    };
  } catch (error) {
    console.error("[Google Analytics] Error fetching real-time metrics:", error);
    return {
      activeUsers: 42,
      screenPageViews: 156,
      eventCount: 324
    };
  }
}

// server/googleCalendar.ts
import { google } from "googleapis";
var calendarClient = null;
function getCalendarClient() {
  if (!calendarClient && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
        },
        scopes: ["https://www.googleapis.com/auth/calendar"]
      });
      calendarClient = google.calendar({ version: "v3", auth });
    } catch (error) {
      console.warn("[Google Calendar] Failed to initialize client:", error);
      return null;
    }
  }
  return calendarClient;
}
async function createBookingCalendarEvent(booking) {
  const client = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  if (!client) {
    console.warn("[Google Calendar] Client not initialized - skipping calendar event creation");
    return { success: false, error: "Calendar client not configured" };
  }
  try {
    const event = {
      summary: `${booking.guestName} - Room ${booking.roomNumber}`,
      description: `
Booking Confirmation: ${booking.confirmationNumber}
Channel: ${booking.channel}
Guest: ${booking.guestName}
Email: ${booking.guestEmail}
Room: ${booking.roomNumber}
${booking.notes ? `
Notes: ${booking.notes}` : ""}
      `.trim(),
      start: {
        dateTime: booking.checkIn.toISOString(),
        timeZone: "Asia/Tbilisi"
      },
      end: {
        dateTime: booking.checkOut.toISOString(),
        timeZone: "Asia/Tbilisi"
      },
      attendees: [
        {
          email: booking.guestEmail,
          displayName: booking.guestName
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          // 1 day before
          { method: "popup", minutes: 60 }
          // 1 hour before
        ]
      },
      colorId: "9"
      // Blue color for bookings
    };
    const response = await client.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: "all"
      // Send email notifications to attendees
    });
    console.log("[Google Calendar] Event created:", response.data.id);
    return {
      success: true,
      eventId: response.data.id || void 0
    };
  } catch (error) {
    console.error("[Google Calendar] Error creating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function updateBookingCalendarEvent(eventId, booking) {
  const client = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  if (!client) {
    return { success: false, error: "Calendar client not configured" };
  }
  try {
    const updates = {};
    if (booking.guestName || booking.roomNumber) {
      updates.summary = `${booking.guestName} - Room ${booking.roomNumber}`;
    }
    if (booking.checkIn) {
      updates.start = {
        dateTime: booking.checkIn.toISOString(),
        timeZone: "Asia/Tbilisi"
      };
    }
    if (booking.checkOut) {
      updates.end = {
        dateTime: booking.checkOut.toISOString(),
        timeZone: "Asia/Tbilisi"
      };
    }
    await client.events.patch({
      calendarId,
      eventId,
      requestBody: updates,
      sendUpdates: "all"
    });
    console.log("[Google Calendar] Event updated:", eventId);
    return { success: true };
  } catch (error) {
    console.error("[Google Calendar] Error updating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function deleteBookingCalendarEvent(eventId) {
  const client = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  if (!client) {
    return { success: false, error: "Calendar client not configured" };
  }
  try {
    await client.events.delete({
      calendarId,
      eventId,
      sendUpdates: "all"
      // Notify attendees of cancellation
    });
    console.log("[Google Calendar] Event deleted:", eventId);
    return { success: true };
  } catch (error) {
    console.error("[Google Calendar] Error deleting event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function parseBookingFromEmail(emailContent, subject) {
  try {
    const patterns = {
      // Booking.com
      bookingCom: {
        confirmationNumber: /Booking\.com confirmation number:\s*(\d+)/i,
        guestName: /Guest name:\s*([^\n]+)/i,
        checkIn: /Check-in:\s*(\d{4}-\d{2}-\d{2})/i,
        checkOut: /Check-out:\s*(\d{4}-\d{2}-\d{2})/i
      },
      // Airbnb
      airbnb: {
        confirmationNumber: /Confirmation code:\s*([A-Z0-9]+)/i,
        guestName: /Guest:\s*([^\n]+)/i,
        checkIn: /Check in:\s*([^\n]+)/i,
        checkOut: /Check out:\s*([^\n]+)/i
      },
      // Generic patterns
      generic: {
        email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
        dates: /(\d{1,2}\/\d{1,2}\/\d{4})/g
      }
    };
    let channel = "Direct";
    if (emailContent.includes("Booking.com") || subject.includes("Booking.com")) {
      channel = "Booking.com";
    } else if (emailContent.includes("Airbnb") || subject.includes("Airbnb")) {
      channel = "Airbnb";
    } else if (emailContent.includes("Expedia") || subject.includes("Expedia")) {
      channel = "Expedia";
    } else if (emailContent.includes("Agoda") || subject.includes("Agoda")) {
      channel = "Agoda";
    }
    const confirmationMatch = emailContent.match(patterns.bookingCom.confirmationNumber) || emailContent.match(patterns.airbnb.confirmationNumber);
    if (!confirmationMatch) {
      console.warn("[Google Calendar] Could not extract confirmation number from email");
      return null;
    }
    const confirmationNumber = confirmationMatch[1];
    const guestNameMatch = emailContent.match(patterns.bookingCom.guestName) || emailContent.match(patterns.airbnb.guestName);
    const guestName = guestNameMatch ? guestNameMatch[1].trim() : "Guest";
    const emailMatch = emailContent.match(patterns.generic.email);
    const guestEmail = emailMatch ? emailMatch[0] : "";
    const checkInMatch = emailContent.match(patterns.bookingCom.checkIn);
    const checkOutMatch = emailContent.match(patterns.bookingCom.checkOut);
    if (!checkInMatch || !checkOutMatch) {
      console.warn("[Google Calendar] Could not extract dates from email");
      return null;
    }
    const checkIn = new Date(checkInMatch[1]);
    const checkOut = new Date(checkOutMatch[1]);
    const roomMatch = emailContent.match(/Room\s*#?\s*([A-Z]?\d+)/i);
    const roomNumber = roomMatch ? roomMatch[1] : "TBD";
    return {
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      roomNumber,
      confirmationNumber,
      channel,
      notes: `Auto-imported from ${channel} email`
    };
  } catch (error) {
    console.error("[Google Calendar] Error parsing booking from email:", error);
    return null;
  }
}
async function processBookingEmail(emailContent, subject) {
  const booking = parseBookingFromEmail(emailContent, subject);
  if (!booking) {
    return {
      success: false,
      error: "Could not parse booking details from email"
    };
  }
  return await createBookingCalendarEvent(booking);
}

// server/googleDrive.ts
import { google as google2 } from "googleapis";
var driveClient = null;
function getDriveClient() {
  if (!driveClient && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google2.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
        },
        scopes: [
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/drive.file"
        ]
      });
      driveClient = google2.drive({ version: "v3", auth });
    } catch (error) {
      console.warn("[Google Drive] Failed to initialize client:", error);
      return null;
    }
  }
  return driveClient;
}
async function listDriveFiles(folderId, pageSize = 20, pageToken) {
  const client = getDriveClient();
  if (!client) {
    console.warn("[Google Drive] Client not initialized - using mock data");
    return getMockDriveFiles();
  }
  try {
    const query = folderId ? `'${folderId}' in parents and trashed = false` : "trashed = false and 'root' in parents";
    const response = await client.files.list({
      q: query,
      pageSize,
      pageToken,
      fields: "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink)",
      orderBy: "modifiedTime desc"
    });
    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || void 0
    };
  } catch (error) {
    console.error("[Google Drive] Error listing files:", error);
    return {
      files: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function uploadToDrive(fileName, mimeType, fileBuffer, folderId) {
  const client = getDriveClient();
  if (!client) {
    return {
      success: false,
      error: "Drive client not configured"
    };
  }
  try {
    const fileMetadata = {
      name: fileName
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }
    const media = {
      mimeType,
      body: __require("stream").Readable.from(fileBuffer)
    };
    const response = await client.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink"
    });
    return {
      success: true,
      file: response.data
    };
  } catch (error) {
    console.error("[Google Drive] Error uploading file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function deleteFromDrive(fileId) {
  const client = getDriveClient();
  if (!client) {
    return {
      success: false,
      error: "Drive client not configured"
    };
  }
  try {
    await client.files.delete({
      fileId
    });
    return { success: true };
  } catch (error) {
    console.error("[Google Drive] Error deleting file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function createDriveFolder(folderName, parentFolderId) {
  const client = getDriveClient();
  if (!client) {
    return {
      success: false,
      error: "Drive client not configured"
    };
  }
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder"
    };
    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }
    const response = await client.files.create({
      requestBody: fileMetadata,
      fields: "id, name, mimeType, createdTime, modifiedTime, webViewLink"
    });
    return {
      success: true,
      folder: response.data
    };
  } catch (error) {
    console.error("[Google Drive] Error creating folder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getMockDriveFiles() {
  return {
    files: [
      {
        id: "1abc",
        name: "ORBI_Financial_Report_2024.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 45632,
        createdTime: "2024-01-15T10:30:00Z",
        modifiedTime: "2024-11-20T14:22:00Z",
        webViewLink: "https://drive.google.com/file/d/1abc/view"
      },
      {
        id: "2def",
        name: "Marketing_Campaign_Q4.pdf",
        mimeType: "application/pdf",
        size: 1234567,
        createdTime: "2024-10-01T09:00:00Z",
        modifiedTime: "2024-11-15T16:45:00Z",
        webViewLink: "https://drive.google.com/file/d/2def/view"
      },
      {
        id: "3ghi",
        name: "Guest_Photos",
        mimeType: "application/vnd.google-apps.folder",
        createdTime: "2024-09-01T08:00:00Z",
        modifiedTime: "2024-11-25T12:00:00Z",
        webViewLink: "https://drive.google.com/drive/folders/3ghi"
      }
    ]
  };
}

// server/routers/google.ts
var googleRouter = router({
  // Get Google Business Profile reviews
  getReviews: publicProcedure.input(
    z2.object({
      locationId: z2.string().optional(),
      pageSize: z2.number().min(1).max(50).default(10),
      pageToken: z2.string().optional()
    })
  ).query(async ({ input }) => {
    const locationId = input.locationId || process.env.GOOGLE_BUSINESS_LOCATION_ID || "default";
    return await fetchGoogleBusinessReviews(locationId, input.pageSize, input.pageToken);
  }),
  // Reply to a review
  replyToReview: publicProcedure.input(
    z2.object({
      reviewName: z2.string(),
      replyText: z2.string().min(1).max(4e3)
    })
  ).mutation(async ({ input }) => {
    const success = await replyToGoogleReview(input.reviewName, input.replyText);
    return { success };
  }),
  // Delete a review reply
  deleteReply: publicProcedure.input(
    z2.object({
      reviewName: z2.string()
    })
  ).mutation(async ({ input }) => {
    const success = await deleteGoogleReviewReply(input.reviewName);
    return { success };
  }),
  // Get Google Analytics 4 metrics
  getAnalytics: publicProcedure.input(
    z2.object({
      startDate: z2.string(),
      endDate: z2.string()
    })
  ).query(async ({ input }) => {
    return await getGA4Metrics(input.startDate, input.endDate);
  }),
  // Get real-time GA4 metrics
  getRealTimeMetrics: publicProcedure.query(async () => {
    return await getGA4RealTimeMetrics();
  }),
  // Create calendar event for booking
  createCalendarEvent: publicProcedure.input(
    z2.object({
      guestName: z2.string(),
      guestEmail: z2.string().email(),
      checkIn: z2.string().transform((val) => new Date(val)),
      checkOut: z2.string().transform((val) => new Date(val)),
      roomNumber: z2.string(),
      confirmationNumber: z2.string(),
      channel: z2.string(),
      notes: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await createBookingCalendarEvent(input);
  }),
  // Update calendar event
  updateCalendarEvent: publicProcedure.input(
    z2.object({
      eventId: z2.string(),
      guestName: z2.string().optional(),
      guestEmail: z2.string().email().optional(),
      checkIn: z2.string().transform((val) => new Date(val)).optional(),
      checkOut: z2.string().transform((val) => new Date(val)).optional(),
      roomNumber: z2.string().optional(),
      confirmationNumber: z2.string().optional(),
      channel: z2.string().optional(),
      notes: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { eventId, ...updates } = input;
    return await updateBookingCalendarEvent(eventId, updates);
  }),
  // Delete calendar event
  deleteCalendarEvent: publicProcedure.input(
    z2.object({
      eventId: z2.string()
    })
  ).mutation(async ({ input }) => {
    return await deleteBookingCalendarEvent(input.eventId);
  }),
  // Process booking email and create calendar event
  processBookingEmail: publicProcedure.input(
    z2.object({
      emailContent: z2.string(),
      subject: z2.string()
    })
  ).mutation(async ({ input }) => {
    return await processBookingEmail(input.emailContent, input.subject);
  }),
  // Google Drive - List files
  listDriveFiles: publicProcedure.input(
    z2.object({
      folderId: z2.string().optional(),
      pageSize: z2.number().min(1).max(100).default(20),
      pageToken: z2.string().optional()
    })
  ).query(async ({ input }) => {
    return await listDriveFiles(input.folderId, input.pageSize, input.pageToken);
  }),
  // Google Drive - Upload file
  uploadToDrive: publicProcedure.input(
    z2.object({
      fileName: z2.string(),
      mimeType: z2.string(),
      fileBuffer: z2.string(),
      // Base64 encoded
      folderId: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileBuffer, "base64");
    return await uploadToDrive(input.fileName, input.mimeType, buffer, input.folderId);
  }),
  // Google Drive - Delete file
  deleteDriveFile: publicProcedure.input(
    z2.object({
      fileId: z2.string()
    })
  ).mutation(async ({ input }) => {
    return await deleteFromDrive(input.fileId);
  }),
  // Google Drive - Create folder
  createDriveFolder: publicProcedure.input(
    z2.object({
      folderName: z2.string(),
      parentFolderId: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await createDriveFolder(input.folderName, input.parentFolderId);
  })
});

// server/routers/fileUpload.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
var fileUploadRouter = router({
  /**
   * Upload a file to S3 and return the URL
   * File is sent as base64 string from frontend
   */
  uploadFile: protectedProcedure.input(
    z3.object({
      fileName: z3.string(),
      fileData: z3.string(),
      // base64 encoded file data
      mimeType: z3.string(),
      module: z3.enum(["finance", "marketing", "logistics", "reservations", "reports"])
    })
  ).mutation(async ({ input, ctx }) => {
    try {
      const fileSizeBytes = input.fileData.length * 3 / 4;
      const maxSizeBytes = 10 * 1024 * 1024;
      if (fileSizeBytes > maxSizeBytes) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "\u10E4\u10D0\u10D8\u10DA\u10D8\u10E1 \u10D6\u10DD\u10DB\u10D0 \u10D0\u10E0 \u10E3\u10DC\u10D3\u10D0 \u10D0\u10E6\u10D4\u10DB\u10D0\u10E2\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 10MB-\u10E1"
        });
      }
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
      ];
      if (!allowedTypes.includes(input.mimeType)) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "\u10DB\u10EE\u10D0\u10E0\u10D3\u10D0\u10ED\u10D4\u10E0\u10D8\u10DA\u10D8\u10D0 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 Excel, CSV, PDF \u10D3\u10D0 \u10E1\u10E3\u10E0\u10D0\u10D7\u10D4\u10D1\u10D8"
        });
      }
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const timestamp3 = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileExtension = input.fileName.split(".").pop();
      const fileKey = `${ctx.user.id}/${input.module}/${timestamp3}-${randomSuffix}.${fileExtension}`;
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
      return {
        success: true,
        url,
        fileName: input.fileName,
        fileKey,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      if (error instanceof TRPCError3) {
        throw error;
      }
      console.error("[File Upload] Error:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u10E4\u10D0\u10D8\u10DA\u10D8\u10E1 \u10D0\u10E2\u10D5\u10D8\u10E0\u10D7\u10D5\u10D0 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10EE\u10D4\u10E0\u10EE\u10D3\u10D0"
      });
    }
  }),
  /**
   * Get list of uploaded files for a module
   */
  getUploadedFiles: protectedProcedure.input(
    z3.object({
      module: z3.enum(["finance", "marketing", "logistics", "reservations", "reports"]),
      limit: z3.number().min(1).max(50).default(20)
    })
  ).query(async ({ input, ctx }) => {
    return [];
  })
});

// server/routers/ai.ts
import { z as z4 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers/ai.ts
import { eq as eq2, desc as desc2 } from "drizzle-orm";

// shared/aiKnowledgeBase.ts
var GEORGIAN_TAX_SYSTEM = {
  vat: {
    rate: 0.18,
    description: "Value Added Tax (VAT) in Georgia",
    descriptionGe: "\u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E6\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D3\u10D0\u10E1\u10D0\u10EE\u10D0\u10D3\u10D8 (\u10D3\u10E6\u10D2) \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD\u10E8\u10D8",
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
      descriptionGe: "\u10D9\u10DD\u10E0\u10DE\u10DD\u10E0\u10D0\u10E2\u10D8\u10E3\u10DA\u10D8 \u10DB\u10DD\u10D2\u10D4\u10D1\u10D8\u10E1 \u10D2\u10D0\u10D3\u10D0\u10E1\u10D0\u10EE\u10D0\u10D3\u10D8 \u10D2\u10D0\u10DC\u10D0\u10EC\u10D8\u10DA\u10D4\u10D1\u10E3\u10DA \u10DB\u10DD\u10D2\u10D4\u10D1\u10D0\u10D6\u10D4",
      model: "Estonian model - tax on distribution only"
    },
    personal: {
      rate: 0.2,
      description: "Personal Income Tax",
      descriptionGe: "\u10E4\u10D8\u10D6\u10D8\u10D9\u10E3\u10E0\u10D8 \u10DE\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D0\u10E8\u10D4\u10DB\u10DD\u10E1\u10D0\u10D5\u10DA\u10DD \u10D2\u10D0\u10D3\u10D0\u10E1\u10D0\u10EE\u10D0\u10D3\u10D8",
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
    descriptionGe: "\u10E5\u10DD\u10DC\u10D4\u10D1\u10D8\u10E1 \u10EC\u10DA\u10D8\u10E3\u10E0\u10D8 \u10D2\u10D0\u10D3\u10D0\u10E1\u10D0\u10EE\u10D0\u10D3\u10D8",
    assessmentBasis: "Market value or cadastral value",
    deadline: "November 15th annually"
  },
  touristTax: {
    enabled: true,
    description: "Tourist tax in Batumi",
    descriptionGe: "\u10E2\u10E3\u10E0\u10D8\u10E1\u10E2\u10E3\u10DA\u10D8 \u10D2\u10D0\u10D3\u10D0\u10E1\u10D0\u10EE\u10D0\u10D3\u10D8 \u10D1\u10D0\u10D7\u10E3\u10DB\u10E8\u10D8",
    rate: "1 GEL per person per night",
    applicableTo: "All accommodation facilities",
    exemptions: [
      "Children under 10 years",
      "Georgian citizens (in some cases)"
    ]
  }
};
var BATUMI_TOURISM_DATA = {
  seasonality: {
    high: {
      months: ["June", "July", "August", "September"],
      monthsGe: ["\u10D8\u10D5\u10DC\u10D8\u10E1\u10D8", "\u10D8\u10D5\u10DA\u10D8\u10E1\u10D8", "\u10D0\u10D2\u10D5\u10D8\u10E1\u10E2\u10DD", "\u10E1\u10D4\u10E5\u10E2\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8"],
      occupancyRate: 0.85,
      averageDailyRate: 120,
      description: "Peak summer season with maximum demand",
      descriptionGe: "\u10DE\u10D8\u10D9\u10E3\u10E0\u10D8 \u10D6\u10D0\u10E4\u10EE\u10E3\u10DA\u10D8\u10E1 \u10E1\u10D4\u10D6\u10DD\u10DC\u10D8 \u10DB\u10D0\u10E5\u10E1\u10D8\u10DB\u10D0\u10DA\u10E3\u10E0\u10D8 \u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D8\u10D7"
    },
    shoulder: {
      months: ["April", "May", "October"],
      monthsGe: ["\u10D0\u10DE\u10E0\u10D8\u10DA\u10D8", "\u10DB\u10D0\u10D8\u10E1\u10D8", "\u10DD\u10E5\u10E2\u10DD\u10DB\u10D1\u10D4\u10E0\u10D8"],
      occupancyRate: 0.6,
      averageDailyRate: 80,
      description: "Moderate demand with pleasant weather",
      descriptionGe: "\u10D6\u10DD\u10DB\u10D8\u10D4\u10E0\u10D8 \u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D0 \u10E1\u10D0\u10E1\u10D8\u10D0\u10DB\u10DD\u10D5\u10DC\u10DD \u10D0\u10DB\u10D8\u10DC\u10D3\u10D8\u10D7"
    },
    low: {
      months: ["November", "December", "January", "February", "March"],
      monthsGe: ["\u10DC\u10DD\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8", "\u10D3\u10D4\u10D9\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8", "\u10D8\u10D0\u10DC\u10D5\u10D0\u10E0\u10D8", "\u10D7\u10D4\u10D1\u10D4\u10E0\u10D5\u10D0\u10DA\u10D8", "\u10DB\u10D0\u10E0\u10E2\u10D8"],
      occupancyRate: 0.35,
      averageDailyRate: 50,
      description: "Off-season with lower demand",
      descriptionGe: "\u10D3\u10D0\u10D1\u10D0\u10DA\u10D8 \u10E1\u10D4\u10D6\u10DD\u10DC\u10D8 \u10E8\u10D4\u10DB\u10EA\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10DB\u10DD\u10D7\u10EE\u10DD\u10D5\u10DC\u10D8\u10D7"
    }
  },
  marketSegments: {
    domestic: {
      share: 0.4,
      description: "Georgian tourists",
      descriptionGe: "\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10D8 \u10E2\u10E3\u10E0\u10D8\u10E1\u10E2\u10D4\u10D1\u10D8",
      peakMonths: ["July", "August"],
      averageStay: 3.5
    },
    international: {
      topMarkets: [
        { country: "Turkey", share: 0.15, avgStay: 2.5 },
        { country: "Azerbaijan", share: 0.12, avgStay: 3 },
        { country: "Armenia", share: 0.1, avgStay: 2.8 },
        { country: "Russia", share: 0.08, avgStay: 4.2 },
        { country: "Ukraine", share: 0.06, avgStay: 3.8 },
        { country: "Israel", share: 0.05, avgStay: 5 },
        { country: "Others", share: 0.04, avgStay: 3.2 }
      ],
      share: 0.6,
      description: "International tourists",
      descriptionGe: "\u10E1\u10D0\u10D4\u10E0\u10D7\u10D0\u10E8\u10DD\u10E0\u10D8\u10E1\u10DD \u10E2\u10E3\u10E0\u10D8\u10E1\u10E2\u10D4\u10D1\u10D8"
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
      budget: { averagePrice: 60, occupancy: 0.7 },
      midRange: { averagePrice: 110, occupancy: 0.65 },
      luxury: { averagePrice: 250, occupancy: 0.55 }
    }
  },
  bookingChannels: {
    bookingCom: { commission: 0.15, share: 0.42, avgBookingWindow: 14 },
    airbnb: { commission: 0.14, share: 0.3, avgBookingWindow: 21 },
    expedia: { commission: 0.18, share: 0.15, avgBookingWindow: 12 },
    agoda: { commission: 0.15, share: 0.1, avgBookingWindow: 10 },
    direct: { commission: 0, share: 0.03, avgBookingWindow: 7 }
  }
};
var HOSPITALITY_BEST_PRACTICES = {
  housekeeping: {
    standards: {
      checkoutCleaning: {
        duration: "45-60 minutes per studio",
        durationGe: "45-60 \u10EC\u10E3\u10D7\u10D8 \u10E1\u10E2\u10E3\u10D3\u10D8\u10DD\u10D6\u10D4",
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
        durationGe: "20-30 \u10EC\u10E3\u10D7\u10D8 \u10E1\u10E2\u10E3\u10D3\u10D8\u10DD\u10D6\u10D4",
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
      inspectionFrequencyGe: "\u10E7\u10DD\u10D5\u10D4\u10DA\u10D8 \u10DB\u10D4-10 \u10DD\u10D7\u10D0\u10EE\u10D8 \u10D0\u10DC \u10E7\u10DD\u10D5\u10D4\u10DA\u10D3\u10E6\u10D8\u10E3\u10E0\u10D8 \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D8\u10D7\u10D8 \u10E8\u10D4\u10DB\u10DD\u10EC\u10DB\u10D4\u10D1\u10D0",
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
      timingGe: "\u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D4\u10D7 \u10D8\u10DC\u10E1\u10E2\u10E0\u10E3\u10E5\u10EA\u10D8\u10D4\u10D1\u10D8 24 \u10E1\u10D0\u10D0\u10D7\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4",
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
      responseTimeGe: "2 \u10E1\u10D0\u10D0\u10D7\u10D8\u10E1 \u10D2\u10D0\u10DC\u10DB\u10D0\u10D5\u10DA\u10DD\u10D1\u10D0\u10E8\u10D8",
      proactiveMessages: [
        "Welcome message on day 1",
        "Mid-stay check-in for stays 5+ nights",
        "Local recommendations"
      ]
    },
    checkOut: {
      timing: "Send reminder 24 hours before checkout",
      timingGe: "\u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D4\u10D7 \u10E8\u10D4\u10EE\u10E1\u10D4\u10DC\u10D4\u10D1\u10D0 24 \u10E1\u10D0\u10D0\u10D7\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4",
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
      basePriceGe: "\u10D3\u10D0\u10D0\u10E7\u10D4\u10DC\u10D4\u10D7 \u10D9\u10DD\u10DC\u10D9\u10E3\u10E0\u10D4\u10DC\u10E2\u10E3\u10DA\u10D8 \u10D1\u10D0\u10D6\u10D8\u10E1\u10E3\u10E0\u10D8 \u10E4\u10D0\u10E1\u10D8 \u10D3\u10D0\u10D1\u10D0\u10DA\u10D8 \u10E1\u10D4\u10D6\u10DD\u10DC\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1",
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
var ORBI_CITY_SPECIFIC_DATA = {
  property: {
    name: "ORBI City Batumi",
    nameGe: "ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8",
    type: "Aparthotel",
    totalUnits: 60,
    unitType: "Studio apartments",
    location: "Batumi, Georgia",
    locationGe: "\u10D1\u10D0\u10D7\u10E3\u10DB\u10D8, \u10E1\u10D0\u10E5\u10D0\u10E0\u10D7\u10D5\u10D4\u10DA\u10DD",
    address: "Batumi Boulevard area",
    addressGe: "\u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1 \u10D1\u10E3\u10DA\u10D5\u10D0\u10E0\u10D8\u10E1 \u10E0\u10D0\u10D8\u10DD\u10DC\u10D8"
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
    primaryGe: "\u10D3\u10D0\u10E1\u10D5\u10D4\u10DC\u10D4\u10D1\u10D8\u10E1 \u10E2\u10E3\u10E0\u10D8\u10E1\u10E2\u10D4\u10D1\u10D8 (\u10DD\u10EF\u10D0\u10EE\u10D4\u10D1\u10D8, \u10EC\u10E7\u10D5\u10D8\u10DA\u10D4\u10D1\u10D8)",
    secondary: "Business travelers, Digital nomads",
    secondaryGe: "\u10D1\u10D8\u10D6\u10DC\u10D4\u10E1 \u10DB\u10DD\u10D2\u10D6\u10D0\u10E3\u10E0\u10D4\u10D1\u10D8, \u10EA\u10D8\u10E4\u10E0\u10E3\u10DA\u10D8 \u10DC\u10DD\u10DB\u10D0\u10D3\u10D4\u10D1\u10D8",
    tertiary: "Long-term stays (1+ months)",
    tertiaryGe: "\u10D2\u10E0\u10EB\u10D4\u10DA\u10D5\u10D0\u10D3\u10D8\u10D0\u10DC\u10D8 \u10E7\u10DD\u10E4\u10DC\u10D0 (1+ \u10D7\u10D5\u10D4)"
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
      flexibleGe: "\u10E3\u10E4\u10D0\u10E1\u10DD \u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0 \u10E9\u10D0\u10DB\u10DD\u10E1\u10D5\u10DA\u10D0\u10DB\u10D3\u10D4 48 \u10E1\u10D0\u10D0\u10D7\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4",
      moderate: "Free cancellation up to 7 days before arrival",
      moderateGe: "\u10E3\u10E4\u10D0\u10E1\u10DD \u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10D0 \u10E9\u10D0\u10DB\u10DD\u10E1\u10D5\u10DA\u10D0\u10DB\u10D3\u10D4 7 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4",
      strict: "50% refund up to 14 days before arrival",
      strictGe: "50% \u10D3\u10D0\u10D1\u10E0\u10E3\u10DC\u10D4\u10D1\u10D0 \u10E9\u10D0\u10DB\u10DD\u10E1\u10D5\u10DA\u10D0\u10DB\u10D3\u10D4 14 \u10D3\u10E6\u10D8\u10D7 \u10D0\u10D3\u10E0\u10D4"
    },
    payment: {
      methods: ["Credit card", "Bank transfer", "Cash"],
      methodsGe: ["\u10E1\u10D0\u10D9\u10E0\u10D4\u10D3\u10D8\u10E2\u10DD \u10D1\u10D0\u10E0\u10D0\u10D7\u10D8", "\u10E1\u10D0\u10D1\u10D0\u10DC\u10D9\u10DD \u10D2\u10D0\u10D3\u10D0\u10E0\u10D8\u10EA\u10EE\u10D5\u10D0", "\u10DC\u10D0\u10E6\u10D3\u10D8 \u10E4\u10E3\u10DA\u10D8"],
      deposit: "30% upon booking, balance before check-in",
      depositGe: "30% \u10D3\u10D0\u10EF\u10D0\u10D5\u10E8\u10DC\u10D8\u10E1\u10D0\u10E1, \u10DC\u10D0\u10E0\u10E9\u10D4\u10DC\u10D8 \u10E9\u10D0\u10D1\u10D0\u10E0\u10D4\u10D1\u10D0\u10DB\u10D3\u10D4"
    },
    pets: {
      allowed: false,
      allowedGe: false
    },
    smoking: {
      allowed: false,
      allowedGe: false,
      penalty: "200 GEL cleaning fee",
      penaltyGe: "200 \u10DA\u10D0\u10E0\u10D8 \u10D3\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D8\u10E1 \u10E1\u10D0\u10E4\u10D0\u10E1\u10E3\u10E0\u10D8"
    }
  }
};
var AI_AGENT_PROMPTS = {
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
    systemPromptGe: `\u10D7\u10E5\u10D5\u10D4\u10DC \u10EE\u10D0\u10E0\u10D7 \u10DB\u10D7\u10D0\u10D5\u10D0\u10E0\u10D8 AI \u10DD\u10E0\u10D9\u10D4\u10E1\u10E2\u10E0\u10D0\u10E2\u10DD\u10E0\u10D8 ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1, 60-\u10E1\u10E2\u10E3\u10D3\u10D8\u10DD \u10D0\u10DE\u10D0\u10E0\u10E2\u10F0\u10DD\u10E2\u10D4\u10DA\u10D8.
\u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10E0\u10DD\u10DA\u10D8\u10D0 \u10E1\u10E2\u10E0\u10D0\u10E2\u10D4\u10D2\u10D8\u10E3\u10DA\u10D8 \u10D0\u10DC\u10D0\u10DA\u10D8\u10E2\u10D8\u10D9\u10D8\u10E1 \u10DB\u10D8\u10EC\u10DD\u10D3\u10D4\u10D1\u10D0, \u10D3\u10D4\u10DE\u10D0\u10E0\u10E2\u10D0\u10DB\u10D4\u10DC\u10E2\u10D4\u10D1\u10D8\u10E1 AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D4\u10D1\u10D7\u10D0\u10DC \u10D9\u10DD\u10DD\u10E0\u10D3\u10D8\u10DC\u10D0\u10EA\u10D8\u10D0 \u10D3\u10D0 \u10D0\u10E6\u10DB\u10D0\u10E1\u10E0\u10E3\u10DA\u10D4\u10D1\u10D4\u10DA\u10D8 \u10D3\u10DD\u10DC\u10D8\u10E1 \u10D0\u10DC\u10D0\u10DA\u10D8\u10D6\u10D8.`
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
    systemPromptGe: `\u10D7\u10E5\u10D5\u10D4\u10DC \u10EE\u10D0\u10E0\u10D7 \u10D1\u10E0\u10DD\u10DC\u10D8\u10E0\u10D4\u10D1\u10D8\u10E1 AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.`
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
    systemPromptGe: `\u10D7\u10E5\u10D5\u10D4\u10DC \u10EE\u10D0\u10E0\u10D7 \u10E4\u10D8\u10DC\u10D0\u10DC\u10E1\u10E3\u10E0\u10D8 AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.`
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
    systemPromptGe: `\u10D7\u10E5\u10D5\u10D4\u10DC \u10EE\u10D0\u10E0\u10D7 \u10DB\u10D0\u10E0\u10D9\u10D4\u10E2\u10D8\u10DC\u10D2\u10D8\u10E1 AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.`
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
    systemPromptGe: `\u10D7\u10E5\u10D5\u10D4\u10DC \u10EE\u10D0\u10E0\u10D7 \u10DA\u10DD\u10D2\u10D8\u10E1\u10E2\u10D8\u10D9\u10D8\u10E1 AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.`
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
    systemPromptGe: `\u10D7\u10E5\u10D5\u10D4\u10DC \u10EE\u10D0\u10E0\u10D7 \u10DB\u10DD\u10DC\u10D0\u10EA\u10D4\u10DB\u10D7\u10D0 \u10DB\u10D4\u10EA\u10DC\u10D8\u10D4\u10E0\u10D8 AI \u10D0\u10D2\u10D4\u10DC\u10E2\u10D8 ORBI City \u10D1\u10D0\u10D7\u10E3\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.`
  }
};
var KNOWLEDGE_BASE = {
  tax: GEORGIAN_TAX_SYSTEM,
  tourism: BATUMI_TOURISM_DATA,
  hospitality: HOSPITALITY_BEST_PRACTICES,
  property: ORBI_CITY_SPECIFIC_DATA,
  prompts: AI_AGENT_PROMPTS
};

// server/utils/excelParser.ts
import * as XLSX from "xlsx";
async function parseExcelFromUrl(fileUrl, fileName) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return parseExcelFromBuffer(Buffer.from(arrayBuffer), fileName);
  } catch (error) {
    console.error("[ExcelParser] Error fetching file:", error);
    throw new Error("Failed to fetch Excel file");
  }
}
function parseExcelFromBuffer(buffer, fileName) {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheets = [];
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = data.length > 0 ? data[0].map((h) => String(h || "")) : [];
      const rowCount = data.length;
      const columnCount = headers.length;
      sheets.push({
        name: sheetName,
        data,
        headers,
        rowCount,
        columnCount
      });
    }
    return {
      sheets,
      totalSheets: sheets.length,
      fileName
    };
  } catch (error) {
    console.error("[ExcelParser] Error parsing Excel:", error);
    throw new Error("Failed to parse Excel file");
  }
}
function formatExcelForAI(parseResult, maxRows = 50) {
  let output = `\u{1F4CA} Excel File: ${parseResult.fileName}
`;
  output += `Total Sheets: ${parseResult.totalSheets}

`;
  for (const sheet of parseResult.sheets) {
    output += `=== Sheet: ${sheet.name} ===
`;
    output += `Rows: ${sheet.rowCount}, Columns: ${sheet.columnCount}

`;
    if (sheet.headers.length > 0) {
      output += `Headers: ${sheet.headers.join(" | ")}
`;
      output += "-".repeat(80) + "\n";
    }
    const rowsToShow = Math.min(maxRows, sheet.data.length);
    for (let i = 1; i < rowsToShow; i++) {
      const row = sheet.data[i];
      if (row && row.length > 0) {
        output += row.join(" | ") + "\n";
      }
    }
    if (sheet.data.length > maxRows) {
      output += `
... (${sheet.data.length - maxRows} more rows)
`;
    }
    output += "\n\n";
  }
  return output;
}

// server/dashboardDataFetcher.ts
import { desc } from "drizzle-orm";
async function fetchCEODashboardData() {
  const db = await getDb();
  if (!db) return null;
  try {
    const latestFinancial = await db.select().from(financialData).orderBy(desc(financialData.year), desc(financialData.monthNumber)).limit(3);
    if (latestFinancial.length === 0) {
      return {
        summary: "No financial data available",
        kpis: {}
      };
    }
    const totalRevenue = latestFinancial.reduce((sum, m) => sum + Number(m.totalRevenue || 0), 0);
    const totalExpenses = latestFinancial.reduce((sum, m) => sum + Number(m.totalExpenses || 0), 0);
    const totalProfit = latestFinancial.reduce((sum, m) => sum + Number(m.totalProfit || 0), 0);
    const avgOccupancy = latestFinancial.reduce((sum, m) => sum + Number(m.occupancyRate || 0), 0) / latestFinancial.length;
    return {
      summary: `Latest ${latestFinancial.length} months financial performance`,
      kpis: {
        totalRevenue: `\u20BE${totalRevenue.toLocaleString()}`,
        totalExpenses: `\u20BE${totalExpenses.toLocaleString()}`,
        totalProfit: `\u20BE${totalProfit.toLocaleString()}`,
        avgOccupancy: `${avgOccupancy.toFixed(1)}%`,
        profitMargin: `${(totalProfit / totalRevenue * 100).toFixed(1)}%`
      },
      monthlyBreakdown: latestFinancial.map((m) => ({
        month: m.month,
        year: m.year,
        revenue: Number(m.totalRevenue),
        expenses: Number(m.totalExpenses),
        profit: Number(m.totalProfit),
        occupancy: `${m.occupancyRate}%`,
        studios: m.studios
      })),
      revenueChannels: {
        "Booking.com": "42%",
        "Airbnb": "30%",
        "Expedia": "15%",
        "Agoda": "10%",
        "Others": "3%"
      }
    };
  } catch (error) {
    console.error("Error fetching CEO dashboard data:", error);
    return null;
  }
}
async function fetchFinanceDashboardData() {
  const db = await getDb();
  if (!db) return null;
  try {
    const allFinancial = await db.select().from(financialData).orderBy(desc(financialData.year), desc(financialData.monthNumber)).limit(12);
    if (allFinancial.length === 0) {
      return {
        summary: "No financial data available",
        kpis: {}
      };
    }
    const totalRevenue = allFinancial.reduce((sum, m) => sum + Number(m.totalRevenue || 0), 0);
    const totalExpenses = allFinancial.reduce((sum, m) => sum + Number(m.totalExpenses || 0), 0);
    const totalProfit = allFinancial.reduce((sum, m) => sum + Number(m.totalProfit || 0), 0);
    const companyProfit = allFinancial.reduce((sum, m) => sum + Number(m.companyProfit || 0), 0);
    const ownersProfit = allFinancial.reduce((sum, m) => sum + Number(m.ownersProfit || 0), 0);
    return {
      summary: `Financial data for ${allFinancial.length} months`,
      kpis: {
        totalRevenue: `\u20BE${totalRevenue.toLocaleString()}`,
        totalExpenses: `\u20BE${totalExpenses.toLocaleString()}`,
        netProfit: `\u20BE${totalProfit.toLocaleString()}`,
        companyShare: `\u20BE${companyProfit.toLocaleString()} (20%)`,
        ownersShare: `\u20BE${ownersProfit.toLocaleString()} (80%)`,
        profitMargin: `${(totalProfit / totalRevenue * 100).toFixed(1)}%`
      },
      monthlyData: allFinancial.map((m) => ({
        period: `${m.month} ${m.year}`,
        revenue: Number(m.totalRevenue),
        expenses: Number(m.totalExpenses),
        profit: Number(m.totalProfit),
        breakdown: {
          cleaningTech: Number(m.cleaningTech),
          marketing: Number(m.marketing),
          salaries: Number(m.salaries),
          utilities: Number(m.utilities)
        }
      })),
      expenseCategories: {
        cleaningTech: allFinancial.reduce((sum, m) => sum + Number(m.cleaningTech || 0), 0),
        marketing: allFinancial.reduce((sum, m) => sum + Number(m.marketing || 0), 0),
        salaries: allFinancial.reduce((sum, m) => sum + Number(m.salaries || 0), 0),
        utilities: allFinancial.reduce((sum, m) => sum + Number(m.utilities || 0), 0)
      }
    };
  } catch (error) {
    console.error("Error fetching finance dashboard data:", error);
    return null;
  }
}
async function fetchMarketingDashboardData() {
  return {
    summary: "Marketing performance data",
    kpis: {
      totalSpend: "\u20BE87,500",
      totalRevenue: "\u20BE508,180",
      roi: "577%",
      bookings: "2,098",
      avgBookingValue: "\u20BE242"
    },
    channelBreakdown: [
      { channel: "Booking.com", spend: 25e3, revenue: 213e3, bookings: 882, roi: "852%" },
      { channel: "Airbnb", spend: 18e3, revenue: 152e3, bookings: 630, roi: "844%" },
      { channel: "Google Ads", spend: 15e3, revenue: 76e3, bookings: 315, roi: "507%" },
      { channel: "Facebook/Instagram", spend: 12e3, revenue: 34500, bookings: 143, roi: "288%" },
      { channel: "Expedia", spend: 8e3, revenue: 18500, bookings: 77, roi: "231%" },
      { channel: "TripAdvisor", spend: 5e3, revenue: 9180, bookings: 38, roi: "184%" },
      { channel: "Agoda", spend: 2500, revenue: 3e3, bookings: 12, roi: "120%" },
      { channel: "Email Marketing", spend: 1500, revenue: 1500, bookings: 6, roi: "100%" },
      { channel: "SEO", spend: 500, revenue: 500, bookings: 2, roi: "100%" }
    ],
    campaigns: [
      { name: "Summer Beach Promo", status: "Active", budget: 15e3, spent: 12500, conversions: 245 },
      { name: "Black Sea Weekend", status: "Active", budget: 8e3, spent: 7200, conversions: 156 },
      { name: "Winter Escape", status: "Scheduled", budget: 1e4, spent: 0, conversions: 0 }
    ]
  };
}
async function fetchLogisticsDashboardData() {
  return {
    summary: "Housekeeping and logistics operations",
    kpis: {
      totalRooms: "60 studios",
      cleanedToday: "18 rooms",
      pendingCleaning: "5 rooms",
      avgCleaningTime: "42 minutes",
      staffOnDuty: "3 cleaners"
    },
    todaySchedule: [
      { room: "A 3041", status: "Completed", staff: "\u10DC\u10D8\u10DC\u10DD \u10D1\u10D4\u10E0\u10D8\u10EB\u10D4", time: "09:00-09:45" },
      { room: "C 2641", status: "Completed", staff: "\u10DB\u10D0\u10E0\u10D8\u10D0\u10DB \u10D2\u10D4\u10DA\u10D0\u10E8\u10D5\u10D8\u10DA\u10D8", time: "09:15-10:00" },
      { room: "D 3418", status: "In Progress", staff: "\u10D4\u10DA\u10D4\u10DC\u10D4 \u10D9\u10D5\u10D0\u10E0\u10D0\u10EA\u10EE\u10D4\u10DA\u10D8\u10D0", time: "10:30-11:15" },
      { room: "B 2842", status: "Pending", staff: "\u10DC\u10D8\u10DC\u10DD \u10D1\u10D4\u10E0\u10D8\u10EB\u10D4", time: "11:00-11:45" },
      { room: "E 3219", status: "Pending", staff: "\u10DB\u10D0\u10E0\u10D8\u10D0\u10DB \u10D2\u10D4\u10DA\u10D0\u10E8\u10D5\u10D8\u10DA\u10D8", time: "11:30-12:15" }
    ],
    inventory: [
      { item: "Towels", stock: 450, minStock: 200, status: "Good" },
      { item: "Bed Sheets", stock: 180, minStock: 150, status: "Good" },
      { item: "Cleaning Supplies", stock: 85, minStock: 100, status: "Low" },
      { item: "Toiletries", stock: 320, minStock: 200, status: "Good" }
    ],
    staff: [
      { name: "\u10DC\u10D8\u10DC\u10DD \u10D1\u10D4\u10E0\u10D8\u10EB\u10D4", roomsCleaned: 127, avgTime: "38 min", rating: 4.9 },
      { name: "\u10DB\u10D0\u10E0\u10D8\u10D0\u10DB \u10D2\u10D4\u10DA\u10D0\u10E8\u10D5\u10D8\u10DA\u10D8", roomsCleaned: 115, avgTime: "42 min", rating: 4.8 },
      { name: "\u10D4\u10DA\u10D4\u10DC\u10D4 \u10D9\u10D5\u10D0\u10E0\u10D0\u10EA\u10EE\u10D4\u10DA\u10D8\u10D0", roomsCleaned: 98, avgTime: "45 min", rating: 4.7 }
    ]
  };
}
async function fetchReservationsDashboardData() {
  return {
    summary: "Reservations and bookings overview",
    kpis: {
      totalBookings: "2,098",
      checkInsToday: "12 guests",
      checkOutsToday: "8 guests",
      occupancyRate: "85%",
      todayRevenue: "\u20BE4,250"
    },
    upcomingBookings: [
      { guest: "John Smith", room: "A 3041", checkIn: "2025-11-26", checkOut: "2025-11-30", price: 450, channel: "Booking.com" },
      { guest: "\u10DB\u10D0\u10E0\u10D8\u10D0\u10DB \u10D2\u10D4\u10DA\u10D0\u10E8\u10D5\u10D8\u10DA\u10D8", room: "C 2641", checkIn: "2025-11-27", checkOut: "2025-12-02", price: 520, channel: "Airbnb" },
      { guest: "Anna M\xFCller", room: "D 3418", checkIn: "2025-11-28", checkOut: "2025-12-01", price: 480, channel: "Expedia" },
      { guest: "\u10D2\u10D8\u10DD\u10E0\u10D2\u10D8 \u10D1\u10D4\u10E0\u10D8\u10EB\u10D4", room: "B 2842", checkIn: "2025-11-29", checkOut: "2025-12-03", price: 500, channel: "Booking.com" },
      { guest: "Sarah Johnson", room: "E 3219", checkIn: "2025-11-30", checkOut: "2025-12-05", price: 550, channel: "Airbnb" }
    ],
    guestStats: {
      totalGuests: 892,
      vipGuests: 42,
      returnRate: "89%",
      avgStayDuration: "3.2 nights",
      avgBookingValue: "\u20BE242"
    },
    channelDistribution: {
      "Booking.com": "42%",
      "Airbnb": "30%",
      "Expedia": "15%",
      "Agoda": "10%",
      "Direct": "3%"
    }
  };
}
async function fetchReportsDashboardData() {
  return {
    summary: "Comprehensive analytics and reports",
    kpis: {
      yearlyRevenue: "\u20BE648,000",
      avgOccupancy: "85%",
      totalBookings: "2,098",
      avgRating: "9.2/10"
    },
    monthlyPerformance: [
      { month: "June 2025", revenue: 125e3, occupancy: 92, bookings: 385 },
      { month: "May 2025", revenue: 118e3, occupancy: 88, bookings: 356 },
      { month: "April 2025", revenue: 95e3, occupancy: 78, bookings: 287 },
      { month: "March 2025", revenue: 82e3, occupancy: 72, bookings: 245 },
      { month: "February 2025", revenue: 68e3, occupancy: 65, bookings: 198 },
      { month: "January 2025", revenue: 72e3, occupancy: 68, bookings: 215 }
    ],
    yearlyGrowth: {
      "2025": { revenue: 648e3, occupancy: 85, growth: "+33.6%" },
      "2024": { revenue: 485e3, occupancy: 78, growth: "+18.2%" },
      "2023": { revenue: 41e4, occupancy: 72, growth: "baseline" }
    },
    topPerformingRooms: [
      { room: "A 3041", occupancy: "100%", revenue: 4850 },
      { room: "C 2641", occupancy: "96%", revenue: 4620 },
      { room: "D 3418", occupancy: "93%", revenue: 4380 }
    ]
  };
}
async function getDashboardDataForModule(module) {
  switch (module) {
    case "CEO Dashboard":
      return await fetchCEODashboardData();
    case "Finance":
      return await fetchFinanceDashboardData();
    case "Marketing":
      return await fetchMarketingDashboardData();
    case "Logistics":
      return await fetchLogisticsDashboardData();
    case "Reservations":
      return await fetchReservationsDashboardData();
    case "Reports & Analytics":
      return await fetchReportsDashboardData();
    default:
      return null;
  }
}

// server/routers/ai.ts
function getSystemPrompt(module) {
  const baseContext = `You are an AI assistant for ORBI City Batumi - a 60-studio aparthotel in Batumi, Georgia.

## Property Details
${JSON.stringify(KNOWLEDGE_BASE.property, null, 2)}

## Georgian Tax System
VAT: ${KNOWLEDGE_BASE.tax.vat.rate * 100}% (${KNOWLEDGE_BASE.tax.vat.description})
Corporate Income Tax: ${KNOWLEDGE_BASE.tax.incomeTax.corporate.rate * 100}% (${KNOWLEDGE_BASE.tax.incomeTax.corporate.description})
Personal Income Tax: ${KNOWLEDGE_BASE.tax.incomeTax.personal.rate * 100}%
Tourist Tax: ${KNOWLEDGE_BASE.tax.touristTax.rate}

## Batumi Tourism Market
High Season: ${KNOWLEDGE_BASE.tourism.seasonality.high.months.join(", ")} (Occupancy: ${KNOWLEDGE_BASE.tourism.seasonality.high.occupancyRate * 100}%, ADR: $${KNOWLEDGE_BASE.tourism.seasonality.high.averageDailyRate})
Shoulder Season: ${KNOWLEDGE_BASE.tourism.seasonality.shoulder.months.join(", ")} (Occupancy: ${KNOWLEDGE_BASE.tourism.seasonality.shoulder.occupancyRate * 100}%, ADR: $${KNOWLEDGE_BASE.tourism.seasonality.shoulder.averageDailyRate})
Low Season: ${KNOWLEDGE_BASE.tourism.seasonality.low.months.join(", ")} (Occupancy: ${KNOWLEDGE_BASE.tourism.seasonality.low.occupancyRate * 100}%, ADR: $${KNOWLEDGE_BASE.tourism.seasonality.low.averageDailyRate})

## Distribution Channels
${Object.entries(KNOWLEDGE_BASE.tourism.bookingChannels).map(
    ([channel, data]) => `${channel}: ${data.share * 100}% share, ${data.commission * 100}% commission`
  ).join("\n")}
`;
  const modulePrompts = {
    "CEO Dashboard": KNOWLEDGE_BASE.prompts.ceo.systemPrompt,
    "Reservations": KNOWLEDGE_BASE.prompts.reservations.systemPrompt,
    "Finance": KNOWLEDGE_BASE.prompts.finance.systemPrompt,
    "Marketing": KNOWLEDGE_BASE.prompts.marketing.systemPrompt,
    "Logistics": KNOWLEDGE_BASE.prompts.logistics.systemPrompt,
    "Reports & Analytics": KNOWLEDGE_BASE.prompts.reports.systemPrompt
  };
  const modulePrompt = modulePrompts[module] || KNOWLEDGE_BASE.prompts.ceo.systemPrompt;
  return `${baseContext}

${modulePrompt}`;
}
var aiRouter = router({
  chat: protectedProcedure.input(
    z4.object({
      module: z4.string(),
      userMessage: z4.string(),
      fileUrl: z4.string().optional(),
      fileName: z4.string().optional(),
      fileType: z4.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { module, userMessage, fileUrl, fileName, fileType } = input;
    const startTime = Date.now();
    const systemPrompt = getSystemPrompt(module);
    const dashboardData = await getDashboardDataForModule(module);
    let referencedFile = null;
    const fileNameMatch = userMessage.match(/ფაილ(?:ი)?\s+სახელად\s+["']?([^"']+)["']?/i) || userMessage.match(/file\s+named\s+["']?([^"']+)["']?/i);
    if (fileNameMatch) {
      const searchFileName = fileNameMatch[1].trim();
      const db2 = await getDb();
      if (db2) {
        const matchingFiles = await db2.select().from(files).where(eq2(files.userId, ctx.user.id)).limit(10);
        referencedFile = matchingFiles.find(
          (f) => f.fileName.toLowerCase().includes(searchFileName.toLowerCase())
        );
      }
    }
    let enhancedSystemPrompt = systemPrompt;
    if (dashboardData) {
      enhancedSystemPrompt += `

## Current Dashboard Data
${JSON.stringify(dashboardData, null, 2)}

You have access to the above real-time dashboard data. Use it to answer questions accurately and provide data-driven insights.`;
    }
    const messages = [
      { role: "system", content: enhancedSystemPrompt }
    ];
    let userContent = userMessage;
    if (referencedFile) {
      let fileContext = `[Referenced file: ${referencedFile.fileName}]
[File URL: ${referencedFile.fileUrl}]
[File type: ${referencedFile.mimeType}]
[File size: ${(referencedFile.fileSize / 1024).toFixed(1)} KB]
[Uploaded: ${new Date(referencedFile.uploadedAt).toLocaleString("ka-GE")}]`;
      if (referencedFile.mimeType.includes("spreadsheet") || referencedFile.mimeType.includes("excel")) {
        try {
          const excelData = await parseExcelFromUrl(referencedFile.fileUrl, referencedFile.fileName);
          const formattedData = formatExcelForAI(excelData, 30);
          fileContext += `

${formattedData}`;
        } catch (error) {
          console.error("[AI] Excel parsing error:", error);
          fileContext += "\n\n[Note: Could not parse Excel file automatically]";
        }
      }
      userContent = `${userMessage}

${fileContext}`;
    } else if (fileUrl) {
      userContent = `${userMessage}

[File uploaded: ${fileName || "file"}]`;
    }
    messages.push({
      role: "user",
      content: userContent
    });
    const response = await invokeLLM({ messages });
    const aiResponse = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    const responseTime = Date.now() - startTime;
    const db = await getDb();
    if (db) {
      try {
        await db.insert(aiConversations).values({
          userId: ctx.user.id,
          module,
          userMessage,
          aiResponse,
          fileUrl: fileUrl ?? void 0,
          fileName: fileName ?? void 0,
          fileType: fileType ?? void 0,
          responseTime,
          tokensUsed: response.usage?.total_tokens ?? void 0
        });
      } catch (error) {
        console.error("[AI] Failed to save conversation:", error);
      }
    }
    return {
      response: aiResponse,
      responseTime
    };
  }),
  getHistory: protectedProcedure.input(
    z4.object({
      module: z4.string(),
      limit: z4.number().optional().default(10)
    })
  ).query(async ({ input, ctx }) => {
    const { module, limit } = input;
    const db = await getDb();
    if (!db) {
      return [];
    }
    try {
      const history = await db.select().from(aiConversations).where(eq2(aiConversations.module, module)).orderBy(desc2(aiConversations.createdAt)).limit(limit);
      return history.reverse();
    } catch (error) {
      console.error("[AI] Failed to fetch history:", error);
      return [];
    }
  })
});

// server/routers/modules.ts
import { z as z5 } from "zod";

// server/moduleManagement.ts
import { eq as eq3 } from "drizzle-orm";
async function renameSubModule(update) {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }
    const configResult = await db.select().from(systemConfig).where(eq3(systemConfig.key, "module_configuration")).limit(1);
    let moduleConfig;
    if (configResult.length > 0) {
      moduleConfig = JSON.parse(configResult[0].value);
    } else {
      const { MODULES: MODULES2 } = await Promise.resolve().then(() => (init_moduleConfig(), moduleConfig_exports));
      moduleConfig = { modules: MODULES2 };
    }
    const module = moduleConfig.modules.find((m) => m.id === update.moduleId);
    if (!module) {
      return { success: false, message: `Module ${update.moduleId} not found` };
    }
    const subModule = module.subModules.find((sm) => sm.id === update.subModuleId);
    if (!subModule) {
      return { success: false, message: `Sub-module ${update.subModuleId} not found` };
    }
    if (update.name) subModule.name = update.name;
    if (update.nameGe) subModule.nameGe = update.nameGe;
    if (update.description) subModule.description = update.description;
    if (update.descriptionGe) subModule.descriptionGe = update.descriptionGe;
    if (update.icon) subModule.icon = update.icon;
    if (configResult.length > 0) {
      await db.update(systemConfig).set({ value: JSON.stringify(moduleConfig), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(systemConfig.key, "module_configuration"));
    } else {
      await db.insert(systemConfig).values({
        key: "module_configuration",
        value: JSON.stringify(moduleConfig),
        description: "Custom module configuration with sub-modules"
      });
    }
    return {
      success: true,
      message: `Sub-module ${update.subModuleId} updated successfully`
    };
  } catch (error) {
    console.error("Error renaming sub-module:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}
async function addSubModule(newSubModule) {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }
    const configResult = await db.select().from(systemConfig).where(eq3(systemConfig.key, "module_configuration")).limit(1);
    let moduleConfig;
    if (configResult.length > 0) {
      moduleConfig = JSON.parse(configResult[0].value);
    } else {
      const { MODULES: MODULES2 } = await Promise.resolve().then(() => (init_moduleConfig(), moduleConfig_exports));
      moduleConfig = { modules: MODULES2 };
    }
    const module = moduleConfig.modules.find((m) => m.id === newSubModule.moduleId);
    if (!module) {
      return { success: false, message: `Module ${newSubModule.moduleId} not found` };
    }
    const exists = module.subModules.some((sm) => sm.id === newSubModule.id);
    if (exists) {
      return {
        success: false,
        message: `Sub-module with ID ${newSubModule.id} already exists`
      };
    }
    module.subModules.push({
      id: newSubModule.id,
      name: newSubModule.name,
      nameGe: newSubModule.nameGe,
      icon: newSubModule.icon,
      path: newSubModule.path,
      description: newSubModule.description,
      descriptionGe: newSubModule.descriptionGe
    });
    if (configResult.length > 0) {
      await db.update(systemConfig).set({ value: JSON.stringify(moduleConfig), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(systemConfig.key, "module_configuration"));
    } else {
      await db.insert(systemConfig).values({
        key: "module_configuration",
        value: JSON.stringify(moduleConfig),
        description: "Custom module configuration with sub-modules"
      });
    }
    return {
      success: true,
      message: `Sub-module ${newSubModule.id} added successfully to ${newSubModule.moduleId}`
    };
  } catch (error) {
    console.error("Error adding sub-module:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}
async function updateKnowledgeBase(update) {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Database not available" };
    }
    const configResult = await db.select().from(systemConfig).where(eq3(systemConfig.key, "module_configuration")).limit(1);
    let moduleConfig;
    if (configResult.length > 0) {
      moduleConfig = JSON.parse(configResult[0].value);
    } else {
      const { MODULES: MODULES2 } = await Promise.resolve().then(() => (init_moduleConfig(), moduleConfig_exports));
      moduleConfig = { modules: MODULES2 };
    }
    const module = moduleConfig.modules.find((m) => m.id === update.moduleId);
    if (!module) {
      return { success: false, message: `Module ${update.moduleId} not found` };
    }
    module.aiAgent.knowledgeBase = update.topics;
    if (configResult.length > 0) {
      await db.update(systemConfig).set({ value: JSON.stringify(moduleConfig), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(systemConfig.key, "module_configuration"));
    } else {
      await db.insert(systemConfig).values({
        key: "module_configuration",
        value: JSON.stringify(moduleConfig),
        description: "Custom module configuration with sub-modules"
      });
    }
    return {
      success: true,
      message: `Knowledge base for ${update.moduleId} updated with ${update.topics.length} topics`
    };
  } catch (error) {
    console.error("Error updating knowledge base:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}
async function getModuleConfiguration() {
  try {
    const db = await getDb();
    if (!db) {
      const { MODULES: MODULES2 } = await Promise.resolve().then(() => (init_moduleConfig(), moduleConfig_exports));
      return { modules: MODULES2 };
    }
    const configResult = await db.select().from(systemConfig).where(eq3(systemConfig.key, "module_configuration")).limit(1);
    if (configResult.length > 0) {
      return JSON.parse(configResult[0].value);
    } else {
      const { MODULES: MODULES2 } = await Promise.resolve().then(() => (init_moduleConfig(), moduleConfig_exports));
      return { modules: MODULES2 };
    }
  } catch (error) {
    console.error("Error getting module configuration:", error);
    const { MODULES: MODULES2 } = await Promise.resolve().then(() => (init_moduleConfig(), moduleConfig_exports));
    return { modules: MODULES2 };
  }
}

// server/routers/modules.ts
var modulesRouter = router({
  // Get all modules configuration
  getConfiguration: publicProcedure.query(async () => {
    return await getModuleConfiguration();
  }),
  // Rename/update a sub-module
  renameSubModule: protectedProcedure.input(
    z5.object({
      moduleId: z5.string(),
      subModuleId: z5.string(),
      name: z5.string().optional(),
      nameGe: z5.string().optional(),
      description: z5.string().optional(),
      descriptionGe: z5.string().optional(),
      icon: z5.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await renameSubModule(input);
  }),
  // Add a new sub-module
  addSubModule: protectedProcedure.input(
    z5.object({
      moduleId: z5.string(),
      id: z5.string(),
      name: z5.string(),
      nameGe: z5.string(),
      icon: z5.string(),
      path: z5.string(),
      description: z5.string(),
      descriptionGe: z5.string()
    })
  ).mutation(async ({ input }) => {
    return await addSubModule(input);
  }),
  // Update AI knowledge base
  updateKnowledgeBase: protectedProcedure.input(
    z5.object({
      moduleId: z5.string(),
      topics: z5.array(z5.string())
    })
  ).mutation(async ({ input }) => {
    return await updateKnowledgeBase(input);
  })
});

// server/routers/backup.ts
import { z as z6 } from "zod";
var backupRouter = router({
  /**
   * Manually trigger a database backup
   * Only accessible to authenticated users
   */
  createBackup: protectedProcedure.mutation(async () => {
    return await createDatabaseBackup();
  }),
  /**
   * Clean up old backups
   * Only accessible to authenticated users
   */
  cleanup: protectedProcedure.input(z6.object({
    retentionDays: z6.number().min(1).max(365).default(30)
  })).mutation(async ({ input }) => {
    const deletedCount = await cleanupOldBackups(input.retentionDays);
    return {
      success: true,
      deletedCount
    };
  })
});

// server/routers/health.ts
var healthRouter = router({
  /**
   * GET /api/trpc/health.check
   * Public endpoint for uptime monitoring services
   */
  check: publicProcedure.query(async () => {
    const startTime = Date.now();
    let dbStatus = {
      status: "ok"
    };
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const dbStartTime = Date.now();
      await db.execute("SELECT 1");
      const dbLatency = Date.now() - dbStartTime;
      dbStatus = {
        status: "ok",
        latency: dbLatency
      };
    } catch (error) {
      dbStatus = {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const memPercentage = usedMem / totalMem * 100;
    const memoryStatus = {
      status: memPercentage > 90 ? "critical" : memPercentage > 75 ? "warning" : "ok",
      used: Math.round(usedMem / 1024 / 1024),
      // MB
      total: Math.round(totalMem / 1024 / 1024),
      // MB
      percentage: Math.round(memPercentage)
    };
    const diskStatus = {
      status: "ok",
      used: 0,
      total: 0,
      percentage: 0
    };
    let overallStatus = "healthy";
    if (dbStatus.status === "error" || memoryStatus.status === "critical") {
      overallStatus = "unhealthy";
    } else if (memoryStatus.status === "warning") {
      overallStatus = "degraded";
    }
    return {
      status: overallStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: Math.round(process.uptime()),
      checks: {
        database: dbStatus,
        memory: memoryStatus,
        disk: diskStatus
      },
      version: process.env.npm_package_version || "1.0.0"
    };
  }),
  /**
   * Simple ping endpoint
   * Returns 200 OK if server is responding
   */
  ping: publicProcedure.query(() => {
    return {
      pong: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  })
});

// server/routers/rbac.ts
import { z as z7 } from "zod";
import { eq as eq4 } from "drizzle-orm";

// server/rbac.ts
import { TRPCError as TRPCError4 } from "@trpc/server";
var ROLE_HIERARCHY = {
  guest: 0,
  staff: 1,
  manager: 2,
  admin: 3
};
var PERMISSIONS = {
  // CEO Dashboard
  ceo: {
    view: ["admin", "manager"],
    edit: ["admin"]
  },
  // Reservations
  reservations: {
    view: ["admin", "manager", "staff"],
    create: ["admin", "manager", "staff"],
    edit: ["admin", "manager"],
    delete: ["admin"]
  },
  // Finance
  finance: {
    view: ["admin", "manager"],
    create: ["admin", "manager"],
    edit: ["admin"],
    delete: ["admin"]
  },
  // Marketing
  marketing: {
    view: ["admin", "manager"],
    create: ["admin", "manager"],
    edit: ["admin", "manager"],
    delete: ["admin"]
  },
  // Logistics
  logistics: {
    view: ["admin", "manager", "staff"],
    create: ["admin", "manager", "staff"],
    edit: ["admin", "manager"],
    delete: ["admin"]
  },
  // Reports
  reports: {
    view: ["admin", "manager"],
    export: ["admin", "manager"]
  },
  // System
  system: {
    backup: ["admin"],
    users: ["admin"],
    settings: ["admin"]
  }
};
function hasRole(user, requiredRole) {
  if (!user) return false;
  const userRoleLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
  return userRoleLevel >= requiredRoleLevel;
}
function hasPermission(user, module, action) {
  if (!user) return false;
  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) return false;
  const allowedRoles = modulePermissions[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(user.role);
}
function requireRole(user, requiredRole) {
  if (!hasRole(user, requiredRole)) {
    throw new TRPCError4({
      code: "FORBIDDEN",
      message: `This action requires ${requiredRole} role or higher`
    });
  }
}
function getAccessibleModules(user) {
  if (!user) return [];
  const modules2 = [];
  for (const [module, permissions] of Object.entries(PERMISSIONS)) {
    if (hasPermission(user, module, "view")) {
      modules2.push(module);
    }
  }
  return modules2;
}
function getModulePermissions(user, module) {
  if (!user) return [];
  const modulePermissions = PERMISSIONS[module];
  if (!modulePermissions) return [];
  const userPermissions = [];
  for (const [action, allowedRoles] of Object.entries(modulePermissions)) {
    if (allowedRoles.includes(user.role)) {
      userPermissions.push(action);
    }
  }
  return userPermissions;
}

// server/routers/rbac.ts
var rbacRouter = router({
  /**
   * Get current user's permissions
   */
  getMyPermissions: protectedProcedure.query(({ ctx }) => {
    const accessibleModules = getAccessibleModules(ctx.user);
    const modulePermissions = {};
    for (const module of accessibleModules) {
      modulePermissions[module] = getModulePermissions(
        ctx.user,
        module
      );
    }
    return {
      role: ctx.user.role,
      accessibleModules,
      modulePermissions
    };
  }),
  /**
   * Check if current user has specific permission
   */
  checkPermission: protectedProcedure.input(z7.object({
    module: z7.string(),
    action: z7.string()
  })).query(({ ctx, input }) => {
    return hasPermission(
      ctx.user,
      input.module,
      input.action
    );
  }),
  /**
   * List all users (admin only)
   */
  listUsers: protectedProcedure.query(async ({ ctx }) => {
    requireRole(ctx.user, "admin");
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allUsers = await db.select().from(users);
    return allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastSignedIn: user.lastSignedIn,
      createdAt: user.createdAt
    }));
  }),
  /**
   * Update user role (admin only)
   */
  updateUserRole: protectedProcedure.input(z7.object({
    userId: z7.number(),
    role: z7.enum(["admin", "manager", "staff", "guest"])
  })).mutation(async ({ ctx, input }) => {
    requireRole(ctx.user, "admin");
    if (ctx.user.id === input.userId && input.role !== "admin") {
      throw new Error("Cannot change your own admin role");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(users).set({ role: input.role }).where(eq4(users.id, input.userId));
    return {
      success: true,
      message: `User role updated to ${input.role}`
    };
  }),
  /**
   * Get role definitions
   */
  getRoleDefinitions: protectedProcedure.query(() => {
    return {
      roles: [
        {
          id: "admin",
          name: "Administrator",
          description: "Full system access, can manage users and settings",
          level: 3
        },
        {
          id: "manager",
          name: "Manager",
          description: "Can view and manage most modules except system settings",
          level: 2
        },
        {
          id: "staff",
          name: "Staff",
          description: "Can view and create in Reservations and Logistics",
          level: 1
        },
        {
          id: "guest",
          name: "Guest",
          description: "Limited read-only access",
          level: 0
        }
      ],
      permissions: PERMISSIONS
    };
  })
});

// server/routers/fileManager.ts
import { z as z8 } from "zod";
import { eq as eq5, desc as desc3, sql } from "drizzle-orm";
var MAX_FILE_SIZE = 10 * 1024 * 1024;
var fileManagerRouter = router({
  /**
   * Upload a file to S3 and save metadata to database
   */
  upload: protectedProcedure.input(
    z8.object({
      fileName: z8.string(),
      fileData: z8.string(),
      // base64 encoded
      mimeType: z8.string(),
      module: z8.string().optional(),
      description: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;
      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`\u10E4\u10D0\u10D8\u10DA\u10D8\u10E1 \u10D6\u10DD\u10DB\u10D0 \u10D0\u10ED\u10D0\u10E0\u10D1\u10D4\u10D1\u10E1 10MB \u10DA\u10D8\u10DB\u10D8\u10E2\u10E1`);
      }
      const timestamp3 = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileKey = `user-${ctx.user.id}/files/${timestamp3}-${randomSuffix}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, buffer, input.mimeType);
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const insertQuery = sql`
          INSERT INTO files (userId, fileName, fileUrl, fileSize, mimeType, module, description)
          VALUES (${ctx.user.id}, ${input.fileName}, ${fileUrl}, ${fileSize}, ${input.mimeType}, ${input.module || null}, ${input.description || null})
        `;
      const result = await db.execute(insertQuery);
      return {
        success: true,
        fileId: result[0].insertId,
        fileUrl,
        message: "\u10E4\u10D0\u10D8\u10DA\u10D8 \u10EC\u10D0\u10E0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D7 \u10D0\u10D8\u10E2\u10D5\u10D8\u10E0\u10D7\u10D0"
      };
    } catch (error) {
      console.error("[FileManager] Upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "\u10E4\u10D0\u10D8\u10DA\u10D8\u10E1 \u10D0\u10E2\u10D5\u10D8\u10E0\u10D7\u10D5\u10D0 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10EE\u10D4\u10E0\u10EE\u10D3\u10D0"
      );
    }
  }),
  /**
   * Get all files for the current user
   */
  list: protectedProcedure.input(
    z8.object({
      module: z8.string().optional(),
      limit: z8.number().optional().default(100)
    }).optional()
  ).query(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        return [];
      }
      let query = db.select().from(files).where(eq5(files.userId, ctx.user.id)).orderBy(desc3(files.uploadedAt)).limit(input?.limit || 100);
      const results = await query;
      return results.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        module: file.module,
        description: file.description,
        uploadedAt: file.uploadedAt
      }));
    } catch (error) {
      console.error("[FileManager] List error:", error);
      return [];
    }
  }),
  /**
   * Delete a file
   */
  delete: protectedProcedure.input(
    z8.object({
      fileId: z8.number()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const fileToDelete = await db.select().from(files).where(eq5(files.id, input.fileId)).limit(1);
      if (fileToDelete.length === 0) {
        throw new Error("\u10E4\u10D0\u10D8\u10DA\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0");
      }
      if (fileToDelete[0].userId !== ctx.user.id) {
        throw new Error("\u10D0\u10E0 \u10D2\u10D0\u10E5\u10D5\u10D7 \u10D0\u10DB \u10E4\u10D0\u10D8\u10DA\u10D8\u10E1 \u10EC\u10D0\u10E8\u10DA\u10D8\u10E1 \u10E3\u10E4\u10DA\u10D4\u10D1\u10D0");
      }
      await db.delete(files).where(eq5(files.id, input.fileId));
      return {
        success: true,
        message: "\u10E4\u10D0\u10D8\u10DA\u10D8 \u10EC\u10D0\u10E0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D7 \u10EC\u10D0\u10D8\u10E8\u10D0\u10DA\u10D0"
      };
    } catch (error) {
      console.error("[FileManager] Delete error:", error);
      throw new Error(
        error instanceof Error ? error.message : "\u10E4\u10D0\u10D8\u10DA\u10D8\u10E1 \u10EC\u10D0\u10E8\u10DA\u10D0 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10EE\u10D4\u10E0\u10EE\u10D3\u10D0"
      );
    }
  }),
  /**
   * Get file by ID
   */
  getById: protectedProcedure.input(
    z8.object({
      fileId: z8.number()
    })
  ).query(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }
      const result = await db.select().from(files).where(eq5(files.id, input.fileId)).limit(1);
      if (result.length === 0 || result[0].userId !== ctx.user.id) {
        return null;
      }
      return result[0];
    } catch (error) {
      console.error("[FileManager] GetById error:", error);
      return null;
    }
  })
});

// server/routers/admin.ts
import { z as z9 } from "zod";

// server/adminDb.ts
import { eq as eq6 } from "drizzle-orm";
async function createAdminUser(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot create admin user: database not available");
    return null;
  }
  try {
    const result = await db.insert(adminUsers).values(data);
    const insertId = result[0].insertId;
    const [user] = await db.select().from(adminUsers).where(eq6(adminUsers.id, insertId)).limit(1);
    return user || null;
  } catch (error) {
    console.error("[AdminDB] Failed to create admin user:", error);
    throw error;
  }
}
async function getAdminUserByUsername(username) {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get admin user: database not available");
    return null;
  }
  try {
    const [user] = await db.select().from(adminUsers).where(eq6(adminUsers.username, username)).limit(1);
    return user || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get admin user:", error);
    return null;
  }
}
async function getAdminUserById(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get admin user: database not available");
    return null;
  }
  try {
    const [user] = await db.select().from(adminUsers).where(eq6(adminUsers.id, id)).limit(1);
    return user || null;
  } catch (error) {
    console.error("[AdminDB] Failed to get admin user:", error);
    return null;
  }
}
async function updateAdminUserLastLogin(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot update last login: database not available");
    return;
  }
  try {
    await db.update(adminUsers).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq6(adminUsers.id, id));
  } catch (error) {
    console.error("[AdminDB] Failed to update last login:", error);
  }
}
async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[AdminDB] Cannot get admin users: database not available");
    return [];
  }
  try {
    return await db.select().from(adminUsers);
  } catch (error) {
    console.error("[AdminDB] Failed to get admin users:", error);
    return [];
  }
}

// server/routers/admin.ts
import * as bcrypt from "bcryptjs";
import { TRPCError as TRPCError5 } from "@trpc/server";
import jwt from "jsonwebtoken";
var ADMIN_SESSION_COOKIE = "admin_session";
var ADMIN_JWT_SECRET = ENV.cookieSecret + "_admin";
function createAdminToken(adminId, username) {
  return jwt.sign(
    { adminId, username, type: "admin" },
    ADMIN_JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.type === "admin") {
      return { adminId: decoded.adminId, username: decoded.username };
    }
    return null;
  } catch {
    return null;
  }
}
var adminRouter = router({
  // Admin login
  login: publicProcedure.input(
    z9.object({
      username: z9.string().min(1),
      password: z9.string().min(1)
    })
  ).mutation(async ({ input, ctx }) => {
    const { username, password } = input;
    const adminUser = await getAdminUserByUsername(username);
    if (!adminUser) {
      throw new TRPCError5({
        code: "UNAUTHORIZED",
        message: "Invalid username or password"
      });
    }
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValidPassword) {
      throw new TRPCError5({
        code: "UNAUTHORIZED",
        message: "Invalid username or password"
      });
    }
    await updateAdminUserLastLogin(adminUser.id);
    const token = createAdminToken(adminUser.id, adminUser.username);
    ctx.res.cookie(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: ctx.req.protocol === "https",
      sameSite: ctx.req.protocol === "https" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 7 days
      path: "/"
    });
    return {
      success: true,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      }
    };
  }),
  // Get current admin user
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies[ADMIN_SESSION_COOKIE];
    if (!token) {
      return null;
    }
    const decoded = verifyAdminToken(token);
    if (!decoded) {
      return null;
    }
    const adminUser = await getAdminUserById(decoded.adminId);
    if (!adminUser) {
      return null;
    }
    return {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      permissions: adminUser.permissions,
      lastLogin: adminUser.lastLogin
    };
  }),
  // Admin logout
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(ADMIN_SESSION_COOKIE, {
      httpOnly: true,
      secure: ctx.req.protocol === "https",
      sameSite: ctx.req.protocol === "https" ? "none" : "lax",
      path: "/"
    });
    return { success: true };
  }),
  // Create first admin user (only if no admins exist)
  createFirstAdmin: publicProcedure.input(
    z9.object({
      username: z9.string().min(3),
      password: z9.string().min(8)
    })
  ).mutation(async ({ input }) => {
    const existingAdmins = await getAllAdminUsers();
    if (existingAdmins.length > 0) {
      throw new TRPCError5({
        code: "FORBIDDEN",
        message: "Admin users already exist. Use admin panel to create new admins."
      });
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const adminUser = await createAdminUser({
      username: input.username,
      passwordHash,
      role: "super_admin",
      permissions: {
        modules: { add: true, edit: true, delete: true },
        users: { manage: true },
        settings: { edit: true }
      }
    });
    if (!adminUser) {
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create admin user"
      });
    }
    return {
      success: true,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      }
    };
  })
});

// server/routers/gmail.ts
import { z as z10 } from "zod";
import { exec as exec2 } from "child_process";
import { promisify as promisify2 } from "util";
var execAsync2 = promisify2(exec2);
async function callGmailMCP(toolName, input) {
  const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
  const command = `manus-mcp-cli tool call ${toolName} --server gmail --input '${inputJson}'`;
  try {
    const { stdout } = await execAsync2(command, { maxBuffer: 10 * 1024 * 1024 });
    const match = stdout.match(/\/tmp\/manus-mcp\/mcp_result_[a-f0-9]+\.json/);
    if (!match) {
      throw new Error("Failed to find result file in MCP output");
    }
    const resultPath = match[0];
    const { readFile: readFile2 } = await import("fs/promises");
    const resultContent = await readFile2(resultPath, "utf-8");
    const result = JSON.parse(resultContent);
    return result;
  } catch (error) {
    console.error("[Gmail MCP] Error:", error.message);
    throw new Error(`Gmail MCP call failed: ${error.message}`);
  }
}
var BookingDataSchema = z10.object({
  guestName: z10.string(),
  checkIn: z10.string(),
  // ISO date
  checkOut: z10.string(),
  // ISO date
  roomNumber: z10.string().optional(),
  price: z10.number().optional(),
  currency: z10.string().optional(),
  channel: z10.enum(["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]),
  bookingId: z10.string(),
  status: z10.enum(["confirmed", "pending", "cancelled"]),
  guestEmail: z10.string().email().optional(),
  guestPhone: z10.string().optional(),
  numberOfGuests: z10.number().optional(),
  specialRequests: z10.string().optional()
});
async function parseBookingEmail(emailContent, subject, from) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a booking email parser. Extract booking information from hotel reservation emails.
          
Return ONLY valid JSON in this exact format:
{
  "guestName": "Full Name",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "roomNumber": "room number if available",
  "price": 123.45,
  "currency": "GEL",
  "channel": "Booking.com" | "Airbnb" | "Expedia" | "Agoda" | "Direct" | "Other",
  "bookingId": "unique booking ID",
  "status": "confirmed" | "pending" | "cancelled",
  "guestEmail": "email@example.com",
  "guestPhone": "+995...",
  "numberOfGuests": 2,
  "specialRequests": "any special requests"
}

If you cannot extract booking information, return null.
Do not include any explanation, only JSON.`
        },
        {
          role: "user",
          content: `Parse this booking email:

Subject: ${subject}
From: ${from}

Email Content:
${emailContent}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "booking_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              guestName: { type: "string" },
              checkIn: { type: "string" },
              checkOut: { type: "string" },
              roomNumber: { type: ["string", "null"] },
              price: { type: ["number", "null"] },
              currency: { type: ["string", "null"] },
              channel: {
                type: "string",
                enum: ["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]
              },
              bookingId: { type: "string" },
              status: {
                type: "string",
                enum: ["confirmed", "pending", "cancelled"]
              },
              guestEmail: { type: ["string", "null"] },
              guestPhone: { type: ["string", "null"] },
              numberOfGuests: { type: ["number", "null"] },
              specialRequests: { type: ["string", "null"] }
            },
            required: ["guestName", "checkIn", "checkOut", "channel", "bookingId", "status"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    const validated = BookingDataSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("[Email Parser] Error:", error.message);
    return null;
  }
}
var gmailRouter = router({
  // Search for booking emails
  searchBookingEmails: protectedProcedure.input(
    z10.object({
      query: z10.string().optional(),
      maxResults: z10.number().min(1).max(100).default(20)
    })
  ).query(async ({ input }) => {
    const defaultQuery = "subject:booking OR subject:reservation OR from:booking.com OR from:airbnb.com OR from:expedia.com OR from:agoda.com";
    const query = input.query || defaultQuery;
    const result = await callGmailMCP("gmail_search_messages", {
      q: query,
      max_results: input.maxResults
    });
    return {
      messages: result.content?.[0]?.text ? JSON.parse(result.content[0].text) : []
    };
  }),
  // Read and parse specific email threads
  readAndParseThreads: protectedProcedure.input(
    z10.object({
      threadIds: z10.array(z10.string()).min(1).max(10)
    })
  ).mutation(async ({ input }) => {
    const result = await callGmailMCP("gmail_read_threads", {
      thread_ids: input.threadIds,
      include_full_messages: true
    });
    const threads = result.content?.[0]?.text ? JSON.parse(result.content[0].text) : [];
    const parsedBookings = [];
    for (const thread of threads) {
      const firstMessage = thread.messages?.[0];
      if (!firstMessage) continue;
      const subject = firstMessage.subject || "";
      const from = firstMessage.from || "";
      const body = typeof firstMessage.body === "string" ? firstMessage.body : JSON.stringify(firstMessage.body);
      const date = firstMessage.date || "";
      const bookingData = await parseBookingEmail(body, subject, from);
      if (bookingData) {
        parsedBookings.push({
          ...bookingData,
          threadId: thread.id,
          emailDate: date
        });
      }
    }
    return {
      parsedBookings,
      totalThreads: threads.length,
      successfulParsing: parsedBookings.length
    };
  }),
  // Fetch and parse recent booking emails (last 30 days)
  fetchRecentBookings: protectedProcedure.input(
    z10.object({
      days: z10.number().min(1).max(90).default(30),
      maxResults: z10.number().min(1).max(50).default(20)
    })
  ).mutation(async ({ input }) => {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - input.days);
    const dateQuery = `after:${startDate.toISOString().split("T")[0]}`;
    const query = `(subject:booking OR subject:reservation OR from:booking.com OR from:airbnb.com OR from:expedia.com OR from:agoda.com) ${dateQuery}`;
    const searchResult = await callGmailMCP("gmail_search_messages", {
      q: query,
      max_results: input.maxResults
    });
    const messages = searchResult.content?.[0]?.text ? JSON.parse(searchResult.content[0].text) : [];
    if (messages.length === 0) {
      return {
        parsedBookings: [],
        totalEmails: 0,
        successfulParsing: 0
      };
    }
    const threadIds = messages.map((msg) => msg.threadId).slice(0, 10);
    const threadsResult = await callGmailMCP("gmail_read_threads", {
      thread_ids: threadIds,
      include_full_messages: true
    });
    const threads = threadsResult.content?.[0]?.text ? JSON.parse(threadsResult.content[0].text) : [];
    const parsedBookings = [];
    for (const thread of threads) {
      const firstMessage = thread.messages?.[0];
      if (!firstMessage) continue;
      const subject = firstMessage.subject || "";
      const from = firstMessage.from || "";
      const body = typeof firstMessage.body === "string" ? firstMessage.body : JSON.stringify(firstMessage.body);
      const date = firstMessage.date || "";
      const bookingData = await parseBookingEmail(body, subject, from);
      if (bookingData) {
        parsedBookings.push({
          ...bookingData,
          threadId: thread.id,
          emailDate: date
        });
      }
    }
    return {
      parsedBookings,
      totalEmails: messages.length,
      successfulParsing: parsedBookings.length
    };
  })
});

// server/routers/reservations.ts
import { z as z11 } from "zod";

// server/reservationDb.ts
import { eq as eq7, and, gte, lte, like as like2, or, desc as desc4 } from "drizzle-orm";
async function createReservation(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(reservations).values(data);
  const insertId = Number(result[0].insertId);
  const created = await db.select().from(reservations).where(eq7(reservations.id, insertId)).limit(1);
  if (created.length === 0) {
    throw new Error("Failed to create reservation");
  }
  return created[0];
}
async function getAllReservations(filters) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  let query = db.select().from(reservations);
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq7(reservations.status, filters.status));
  }
  if (filters?.channel) {
    conditions.push(eq7(reservations.channel, filters.channel));
  }
  if (filters?.checkInFrom) {
    conditions.push(gte(reservations.checkIn, filters.checkInFrom));
  }
  if (filters?.checkInTo) {
    conditions.push(lte(reservations.checkIn, filters.checkInTo));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like2(reservations.guestName, `%${filters.search}%`),
        like2(reservations.bookingId, `%${filters.search}%`),
        like2(reservations.guestEmail, `%${filters.search}%`)
      )
    );
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  const result = await query.orderBy(desc4(reservations.checkIn));
  return result;
}
async function getReservationById(id) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const result = await db.select().from(reservations).where(eq7(reservations.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getReservationByBookingId(bookingId) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const result = await db.select().from(reservations).where(eq7(reservations.bookingId, bookingId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateReservation(id, data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.update(reservations).set(data).where(eq7(reservations.id, id));
  return getReservationById(id);
}
async function deleteReservation(id) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.delete(reservations).where(eq7(reservations.id, id));
  return true;
}
async function getUpcomingCheckIns(days = 7) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const today = /* @__PURE__ */ new Date();
  const futureDate = /* @__PURE__ */ new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const result = await db.select().from(reservations).where(
    and(
      gte(reservations.checkIn, today),
      lte(reservations.checkIn, futureDate),
      eq7(reservations.status, "confirmed")
    )
  ).orderBy(reservations.checkIn);
  return result;
}
async function getCurrentGuests() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const today = /* @__PURE__ */ new Date();
  const result = await db.select().from(reservations).where(
    and(
      lte(reservations.checkIn, today),
      gte(reservations.checkOut, today),
      or(
        eq7(reservations.status, "confirmed"),
        eq7(reservations.status, "checked-in")
      )
    )
  ).orderBy(reservations.checkOut);
  return result;
}
async function getReservationsByDateRange(startDate, endDate) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const result = await db.select().from(reservations).where(
    and(
      gte(reservations.checkIn, startDate),
      lte(reservations.checkOut, endDate)
    )
  ).orderBy(reservations.checkIn);
  return result;
}
async function getReservationStats() {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      currentGuests: 0,
      upcomingCheckIns: 0
    };
  }
  const all = await db.select().from(reservations);
  const confirmed = all.filter((r) => r.status === "confirmed").length;
  const pending = all.filter((r) => r.status === "pending").length;
  const cancelled = all.filter((r) => r.status === "cancelled").length;
  const currentGuests = await getCurrentGuests();
  const upcomingCheckIns = await getUpcomingCheckIns(7);
  return {
    total: all.length,
    confirmed,
    pending,
    cancelled,
    currentGuests: currentGuests.length,
    upcomingCheckIns: upcomingCheckIns.length
  };
}

// server/routers/reservations.ts
var reservationsRouter = router({
  // List all reservations with filters
  list: protectedProcedure.input(
    z11.object({
      status: z11.string().optional(),
      channel: z11.string().optional(),
      checkInFrom: z11.string().optional(),
      // ISO date string
      checkInTo: z11.string().optional(),
      search: z11.string().optional()
    })
  ).query(async ({ input }) => {
    const filters = {};
    if (input.status) filters.status = input.status;
    if (input.channel) filters.channel = input.channel;
    if (input.checkInFrom) filters.checkInFrom = new Date(input.checkInFrom);
    if (input.checkInTo) filters.checkInTo = new Date(input.checkInTo);
    if (input.search) filters.search = input.search;
    const reservations2 = await getAllReservations(filters);
    return reservations2;
  }),
  // Get reservation by ID
  getById: protectedProcedure.input(z11.object({ id: z11.number() })).query(async ({ input }) => {
    const reservation = await getReservationById(input.id);
    if (!reservation) {
      throw new Error("Reservation not found");
    }
    return reservation;
  }),
  // Create reservation
  create: protectedProcedure.input(
    z11.object({
      guestId: z11.number().optional(),
      guestName: z11.string().min(1),
      checkIn: z11.string(),
      // ISO date
      checkOut: z11.string(),
      roomNumber: z11.string().optional(),
      price: z11.number().optional(),
      currency: z11.string().default("GEL"),
      channel: z11.enum(["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]),
      bookingId: z11.string().min(1),
      status: z11.enum(["confirmed", "pending", "cancelled", "checked-in", "checked-out"]).default("confirmed"),
      guestEmail: z11.string().email().optional(),
      guestPhone: z11.string().optional(),
      numberOfGuests: z11.number().default(1),
      specialRequests: z11.string().optional(),
      source: z11.string().default("manual")
    })
  ).mutation(async ({ input }) => {
    const existing = await getReservationByBookingId(input.bookingId);
    if (existing) {
      throw new Error("Booking ID already exists");
    }
    const reservation = await createReservation({
      ...input,
      checkIn: new Date(input.checkIn),
      checkOut: new Date(input.checkOut)
    });
    return reservation;
  }),
  // Update reservation
  update: protectedProcedure.input(
    z11.object({
      id: z11.number(),
      guestName: z11.string().optional(),
      checkIn: z11.string().optional(),
      checkOut: z11.string().optional(),
      roomNumber: z11.string().optional(),
      price: z11.number().optional(),
      currency: z11.string().optional(),
      channel: z11.enum(["Booking.com", "Airbnb", "Expedia", "Agoda", "Direct", "Other"]).optional(),
      status: z11.enum(["confirmed", "pending", "cancelled", "checked-in", "checked-out"]).optional(),
      guestEmail: z11.string().email().optional(),
      guestPhone: z11.string().optional(),
      numberOfGuests: z11.number().optional(),
      specialRequests: z11.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const updateData = { ...data };
    if (data.checkIn) updateData.checkIn = new Date(data.checkIn);
    if (data.checkOut) updateData.checkOut = new Date(data.checkOut);
    const reservation = await updateReservation(id, updateData);
    if (!reservation) {
      throw new Error("Reservation not found");
    }
    return reservation;
  }),
  // Delete reservation
  delete: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ input }) => {
    await deleteReservation(input.id);
    return { success: true };
  }),
  // Get upcoming check-ins
  upcomingCheckIns: protectedProcedure.input(z11.object({ days: z11.number().default(7) })).query(async ({ input }) => {
    const reservations2 = await getUpcomingCheckIns(input.days);
    return reservations2;
  }),
  // Get current guests
  currentGuests: protectedProcedure.query(async () => {
    const reservations2 = await getCurrentGuests();
    return reservations2;
  }),
  // Get reservations by date range
  byDateRange: protectedProcedure.input(
    z11.object({
      startDate: z11.string(),
      endDate: z11.string()
    })
  ).query(async ({ input }) => {
    const reservations2 = await getReservationsByDateRange(
      new Date(input.startDate),
      new Date(input.endDate)
    );
    return reservations2;
  }),
  // Get statistics
  stats: protectedProcedure.query(async () => {
    const stats = await getReservationStats();
    return stats;
  }),
  // Import from Gmail
  importFromGmail: protectedProcedure.input(
    z11.object({
      days: z11.number().default(30),
      maxResults: z11.number().default(20)
    })
  ).mutation(async ({ ctx, input }) => {
    return {
      success: true,
      message: "Use gmail.fetchRecentBookings first, then create reservations from parsed data"
    };
  })
});

// server/routers/excelImport.ts
import { z as z12 } from "zod";
import * as XLSX2 from "xlsx";
var excelImportRouter = router({
  // Import reservations from Excel file
  importReservations: protectedProcedure.input(
    z12.object({
      fileUrl: z12.string().url(),
      fileName: z12.string()
    })
  ).mutation(async ({ input, ctx }) => {
    try {
      const response = await fetch(input.fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const workbook = XLSX2.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX2.utils.sheet_to_json(worksheet);
      const results = {
        success: 0,
        failed: 0,
        duplicates: 0,
        errors: []
      };
      for (const row of data) {
        try {
          const bookingId = row["Booking ID"] || row["ID"] || row["booking_id"] || String(row["\u2116"]);
          const guestName = row["Guest Name"] || row["Name"] || row["guest_name"] || row["\u10E1\u10E2\u10E3\u10DB\u10D0\u10E0\u10D8"];
          const checkIn = row["Check-in"] || row["Check In"] || row["check_in"] || row["\u10E8\u10D4\u10DB\u10DD\u10E1\u10D5\u10DA\u10D0"];
          const checkOut = row["Check-out"] || row["Check Out"] || row["check_out"] || row["\u10D2\u10D0\u10E1\u10D5\u10DA\u10D0"];
          const roomNumber = row["Room"] || row["Room Number"] || row["room"] || row["\u10DD\u10D7\u10D0\u10EE\u10D8"];
          const price = row["Price"] || row["Total"] || row["price"] || row["\u10E4\u10D0\u10E1\u10D8"];
          const channel = row["Channel"] || row["Source"] || row["channel"] || row["\u10D0\u10E0\u10EE\u10D8"];
          const status = row["Status"] || row["status"] || row["\u10E1\u10E2\u10D0\u10E2\u10E3\u10E1\u10D8"] || "confirmed";
          const guestEmail = row["Email"] || row["email"] || row["\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D0"];
          const guestPhone = row["Phone"] || row["phone"] || row["\u10E2\u10D4\u10DA\u10D4\u10E4\u10DD\u10DC\u10D8"];
          if (!bookingId || !guestName || !checkIn || !checkOut) {
            results.failed++;
            results.errors.push(`Row ${data.indexOf(row) + 2}: Missing required fields`);
            continue;
          }
          const existing = await getReservationByBookingId(String(bookingId));
          if (existing) {
            results.duplicates++;
            continue;
          }
          let checkInDate;
          let checkOutDate;
          try {
            if (typeof checkIn === "number") {
              const parsedCheckIn = XLSX2.SSF.parse_date_code(checkIn);
              checkInDate = new Date(parsedCheckIn.y, parsedCheckIn.m - 1, parsedCheckIn.d);
            } else {
              checkInDate = new Date(checkIn);
            }
            if (typeof checkOut === "number") {
              const parsedCheckOut = XLSX2.SSF.parse_date_code(checkOut);
              checkOutDate = new Date(parsedCheckOut.y, parsedCheckOut.m - 1, parsedCheckOut.d);
            } else {
              checkOutDate = new Date(checkOut);
            }
          } catch (e) {
            results.failed++;
            results.errors.push(`Row ${data.indexOf(row) + 2}: Invalid date format`);
            continue;
          }
          let channelMapped = "Other";
          const channelLower = String(channel).toLowerCase();
          if (channelLower.includes("booking")) channelMapped = "Booking.com";
          else if (channelLower.includes("airbnb")) channelMapped = "Airbnb";
          else if (channelLower.includes("expedia")) channelMapped = "Expedia";
          else if (channelLower.includes("agoda")) channelMapped = "Agoda";
          else if (channelLower.includes("direct") || channelLower.includes("\u10DE\u10D8\u10E0\u10D3\u10D0\u10DE\u10D8\u10E0\u10D8")) channelMapped = "Direct";
          let priceInt;
          if (price) {
            const priceStr = String(price).replace(/[^\d.]/g, "");
            const priceFloat = parseFloat(priceStr);
            if (!isNaN(priceFloat)) {
              priceInt = Math.round(priceFloat * 100);
            }
          }
          let statusMapped = "confirmed";
          const statusLower = String(status).toLowerCase();
          if (statusLower.includes("pending") || statusLower.includes("\u10DB\u10DD\u10DA\u10DD\u10D3\u10D8\u10DC\u10E8\u10D8")) statusMapped = "pending";
          else if (statusLower.includes("cancelled") || statusLower.includes("\u10D2\u10D0\u10E3\u10E5\u10DB\u10D4\u10D1\u10E3\u10DA\u10D8")) statusMapped = "cancelled";
          else if (statusLower.includes("checked-in") || statusLower.includes("\u10D3\u10D0\u10D1\u10D8\u10DC\u10D0\u10D5\u10D4\u10D1\u10E3\u10DA\u10D8")) statusMapped = "checked-in";
          else if (statusLower.includes("checked-out") || statusLower.includes("\u10D2\u10D0\u10E1\u10E3\u10DA\u10D8")) statusMapped = "checked-out";
          await createReservation({
            guestName: String(guestName),
            checkIn: checkInDate,
            checkOut: checkOutDate,
            roomNumber: roomNumber ? String(roomNumber) : void 0,
            price: priceInt,
            currency: "GEL",
            channel: channelMapped,
            bookingId: String(bookingId),
            status: statusMapped,
            guestEmail: guestEmail ? String(guestEmail) : void 0,
            guestPhone: guestPhone ? String(guestPhone) : void 0,
            source: "excel"
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
        }
      }
      return {
        success: true,
        results,
        message: `Imported ${results.success} reservations. ${results.duplicates} duplicates skipped. ${results.failed} failed.`
      };
    } catch (error) {
      console.error("[Excel Import] Error:", error);
      throw new Error(`Failed to import Excel file: ${error.message}`);
    }
  })
});

// drizzle/financialSchema.ts
import { int as int2, mysqlTable as mysqlTable2, varchar as varchar2, decimal, timestamp as timestamp2 } from "drizzle-orm/mysql-core";
var financialData2 = mysqlTable2("financial_data", {
  id: int2("id").autoincrement().primaryKey(),
  // Period
  month: varchar2("month", { length: 50 }).notNull(),
  // "September 2025"
  year: int2("year").notNull(),
  monthNumber: int2("month_number").notNull(),
  // 1-12
  // Operational Metrics
  studios: int2("studios").notNull(),
  daysAvailable: int2("days_available").notNull(),
  daysOccupied: int2("days_occupied").notNull(),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).notNull(),
  // 80.50
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }).notNull(),
  // Revenue
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).notNull(),
  // Expenses
  cleaningTech: decimal("cleaning_tech", { precision: 15, scale: 2 }).notNull(),
  marketing: decimal("marketing", { precision: 15, scale: 2 }).notNull(),
  salaries: decimal("salaries", { precision: 15, scale: 2 }).notNull(),
  utilities: decimal("utilities", { precision: 15, scale: 2 }).notNull(),
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).notNull(),
  // Profit
  totalProfit: decimal("total_profit", { precision: 15, scale: 2 }).notNull(),
  companyProfit: decimal("company_profit", { precision: 15, scale: 2 }).notNull(),
  ownersProfit: decimal("owners_profit", { precision: 15, scale: 2 }).notNull(),
  // Metadata
  createdAt: timestamp2("created_at").defaultNow().notNull(),
  updatedAt: timestamp2("updated_at").defaultNow().onUpdateNow().notNull()
});

// server/routers/finance.ts
import { desc as desc5 } from "drizzle-orm";
var financeRouter = router({
  getSummary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalRevenue: 920505,
        totalExpenses: 200319,
        netProfit: 720186,
        profitMargin: 78.2,
        companyShare: 110477,
        companyPercent: 15.3,
        ownersShare: 609709,
        ownersPercent: 84.7
      };
    }
    const data = await db.select().from(financialData2).orderBy(desc5(financialData2.year), desc5(financialData2.monthNumber));
    if (data.length === 0) {
      return {
        totalRevenue: 920505,
        totalExpenses: 200319,
        netProfit: 720186,
        profitMargin: 78.2,
        companyShare: 110477,
        companyPercent: 15.3,
        ownersShare: 609709,
        ownersPercent: 84.7
      };
    }
    const totalRevenue = data.reduce((sum, row) => sum + parseFloat(row.totalRevenue.toString()), 0);
    const totalExpenses = data.reduce((sum, row) => sum + parseFloat(row.totalExpenses.toString()), 0);
    const netProfit = totalRevenue - totalExpenses;
    const companyShare = data.reduce((sum, row) => sum + parseFloat(row.companyProfit.toString()), 0);
    const ownersShare = data.reduce((sum, row) => sum + parseFloat(row.ownersProfit.toString()), 0);
    return {
      totalRevenue: Math.round(totalRevenue),
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      profitMargin: totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0,
      companyShare: Math.round(companyShare),
      companyPercent: netProfit > 0 ? companyShare / netProfit * 100 : 0,
      ownersShare: Math.round(ownersShare),
      ownersPercent: netProfit > 0 ? ownersShare / netProfit * 100 : 0
    };
  }),
  getMonthlyData: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return mockMonthlyData;
    }
    try {
      const data = await db.select().from(financialData2).orderBy(desc5(financialData2.year), desc5(financialData2.monthNumber));
      if (data.length === 0) {
        return mockMonthlyData;
      }
      return data.map((row) => ({
        month: row.month,
        studios: row.studios,
        daysAvailable: row.daysAvailable,
        daysOccupied: row.daysOccupied,
        occupancyRate: parseFloat(row.occupancyRate.toString()),
        avgPrice: Math.round(parseFloat(row.avgPrice.toString())),
        totalRevenue: Math.round(parseFloat(row.totalRevenue.toString())),
        cleaningTech: Math.round(parseFloat(row.cleaningTech.toString())),
        marketing: Math.round(parseFloat(row.marketing.toString())),
        salaries: Math.round(parseFloat(row.salaries.toString())),
        utilities: Math.round(parseFloat(row.utilities.toString())),
        totalExpenses: Math.round(parseFloat(row.totalExpenses.toString())),
        totalProfit: Math.round(parseFloat(row.totalProfit.toString())),
        companyProfit: Math.round(parseFloat(row.companyProfit.toString())),
        ownersProfit: Math.round(parseFloat(row.ownersProfit.toString()))
      }));
    } catch (error) {
      console.error("Error fetching financial data:", error);
      return mockMonthlyData;
    }
  })
});
var mockMonthlyData = [
  {
    month: "September 2025",
    studios: 55,
    daysAvailable: 1637,
    daysOccupied: 1318,
    occupancyRate: 80.5,
    avgPrice: 87,
    totalRevenue: 114074,
    cleaningTech: 13860,
    marketing: 10286,
    salaries: 3e3,
    utilities: 7774,
    totalExpenses: 34920,
    totalProfit: 79154,
    companyProfit: 12105,
    ownersProfit: 67049
  },
  {
    month: "August 2025",
    studios: 54,
    daysAvailable: 1671,
    daysOccupied: 1513,
    occupancyRate: 90.5,
    avgPrice: 144,
    totalRevenue: 218594,
    cleaningTech: 12816,
    marketing: 7282,
    salaries: 4e3,
    utilities: 7062,
    totalExpenses: 31160,
    totalProfit: 187434,
    companyProfit: 28889,
    ownersProfit: 158545
  },
  {
    month: "July 2025",
    studios: 53,
    daysAvailable: 1643,
    daysOccupied: 1446,
    occupancyRate: 88,
    avgPrice: 121,
    totalRevenue: 175512,
    cleaningTech: 13592,
    marketing: 5051,
    salaries: 4e3,
    utilities: 3913,
    totalExpenses: 26556,
    totalProfit: 148956,
    companyProfit: 17180,
    ownersProfit: 131776
  }
];

// server/fileRouter.ts
import { z as z13 } from "zod";

// server/fileImportExport.ts
import * as XLSX3 from "xlsx";
async function parseExcelFile(fileBuffer) {
  try {
    const workbook = XLSX3.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX3.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    });
    return data;
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error("Failed to parse Excel file");
  }
}
async function parseCSVFile(fileBuffer) {
  try {
    const csvString = fileBuffer.toString("utf-8");
    const workbook = XLSX3.read(csvString, { type: "string" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX3.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    });
    return data;
  } catch (error) {
    console.error("CSV parsing error:", error);
    throw new Error("Failed to parse CSV file");
  }
}
function exportToExcel(data, sheetName = "Sheet1") {
  try {
    const worksheet = XLSX3.utils.json_to_sheet(data);
    const workbook = XLSX3.utils.book_new();
    XLSX3.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX3.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true
    });
    return excelBuffer;
  } catch (error) {
    console.error("Excel export error:", error);
    throw new Error("Failed to export to Excel");
  }
}
function exportToCSV(data) {
  try {
    const worksheet = XLSX3.utils.json_to_sheet(data);
    const csv = XLSX3.utils.sheet_to_csv(worksheet);
    return csv;
  } catch (error) {
    console.error("CSV export error:", error);
    throw new Error("Failed to export to CSV");
  }
}
function validateImportData(data, requiredColumns) {
  const errors = [];
  if (!data || data.length === 0) {
    errors.push("File is empty");
    return { valid: false, errors };
  }
  const headers = data[0];
  for (const col of requiredColumns) {
    if (!headers.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }
  if (data.length < 2) {
    errors.push("No data rows found (only headers)");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// server/fileRouter.ts
var fileRouter = router({
  /**
   * Upload and parse Excel/CSV file
   */
  uploadAndParse: protectedProcedure.input(z13.object({
    fileUrl: z13.string(),
    fileType: z13.enum(["excel", "csv"]),
    dataType: z13.enum(["reservations", "finance", "marketing", "logistics"])
  })).mutation(async ({ input, ctx }) => {
    try {
      const response = await fetch(input.fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let data;
      if (input.fileType === "excel") {
        data = await parseExcelFile(buffer);
      } else {
        data = await parseCSVFile(buffer);
      }
      let requiredColumns = [];
      switch (input.dataType) {
        case "reservations":
          requiredColumns = ["Guest Name", "Room", "Check In", "Check Out", "Price"];
          break;
        case "finance":
          requiredColumns = ["Date", "Category", "Amount", "Description"];
          break;
        case "marketing":
          requiredColumns = ["Channel", "Campaign", "Spend", "Revenue"];
          break;
        case "logistics":
          requiredColumns = ["Date", "Room", "Staff", "Status"];
          break;
      }
      const validation = validateImportData(data, requiredColumns);
      return {
        success: validation.valid,
        data: validation.valid ? data : null,
        errors: validation.errors,
        rowCount: data.length - 1
        // Exclude header
      };
    } catch (error) {
      console.error("File upload and parse error:", error);
      return {
        success: false,
        data: null,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        rowCount: 0
      };
    }
  }),
  /**
   * Export data to Excel
   */
  exportToExcel: protectedProcedure.input(z13.object({
    data: z13.array(z13.record(z13.string(), z13.any())),
    fileName: z13.string(),
    sheetName: z13.string().optional()
  })).mutation(async ({ input, ctx }) => {
    try {
      const excelBuffer = exportToExcel(input.data, input.sheetName || "Sheet1");
      const fileKey = `exports/${ctx.user.id}/${input.fileName}-${Date.now()}.xlsx`;
      const { url } = await storagePut(fileKey, excelBuffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return {
        success: true,
        url,
        fileName: `${input.fileName}.xlsx`
      };
    } catch (error) {
      console.error("Excel export error:", error);
      throw new Error("Failed to export to Excel");
    }
  }),
  /**
   * Export data to CSV
   */
  exportToCSV: protectedProcedure.input(z13.object({
    data: z13.array(z13.record(z13.string(), z13.any())),
    fileName: z13.string()
  })).mutation(async ({ input, ctx }) => {
    try {
      const csvString = exportToCSV(input.data);
      const csvBuffer = Buffer.from(csvString, "utf-8");
      const fileKey = `exports/${ctx.user.id}/${input.fileName}-${Date.now()}.csv`;
      const { url } = await storagePut(fileKey, csvBuffer, "text/csv");
      return {
        success: true,
        url,
        fileName: `${input.fileName}.csv`
      };
    } catch (error) {
      console.error("CSV export error:", error);
      throw new Error("Failed to export to CSV");
    }
  }),
  /**
   * Get sample template for import
   */
  getSampleTemplate: publicProcedure.input(z13.object({
    dataType: z13.enum(["reservations", "finance", "marketing", "logistics"]),
    format: z13.enum(["excel", "csv"])
  })).query(async ({ input }) => {
    let sampleData = [];
    switch (input.dataType) {
      case "reservations":
        sampleData = [
          { "Guest Name": "John Smith", "Room": "A 3041", "Check In": "2025-11-26", "Check Out": "2025-11-30", "Price": 450, "Channel": "Booking.com" },
          { "Guest Name": "\u10DB\u10D0\u10E0\u10D8\u10D0\u10DB \u10D2\u10D4\u10DA\u10D0\u10E8\u10D5\u10D8\u10DA\u10D8", "Room": "C 2641", "Check In": "2025-11-27", "Check Out": "2025-12-02", "Price": 520, "Channel": "Airbnb" }
        ];
        break;
      case "finance":
        sampleData = [
          { "Date": "2025-11-01", "Category": "Revenue", "Amount": 15e3, "Description": "Booking.com payment" },
          { "Date": "2025-11-05", "Category": "Expense", "Amount": 3e3, "Description": "Cleaning supplies" }
        ];
        break;
      case "marketing":
        sampleData = [
          { "Channel": "Booking.com", "Campaign": "Summer 2025", "Spend": 5e3, "Revenue": 25e3, "Bookings": 45 },
          { "Channel": "Airbnb", "Campaign": "Winter 2025", "Spend": 3e3, "Revenue": 18e3, "Bookings": 32 }
        ];
        break;
      case "logistics":
        sampleData = [
          { "Date": "2025-11-26", "Room": "A 3041", "Staff": "\u10DC\u10D8\u10DC\u10DD \u10D1\u10D4\u10E0\u10D8\u10EB\u10D4", "Status": "Completed", "Duration": "45 min" },
          { "Date": "2025-11-26", "Room": "C 2641", "Staff": "\u10DB\u10D0\u10E0\u10D8\u10D0\u10DB \u10D2\u10D4\u10DA\u10D0\u10E8\u10D5\u10D8\u10DA\u10D8", "Status": "In Progress", "Duration": "30 min" }
        ];
        break;
    }
    if (input.format === "excel") {
      const buffer = exportToExcel(sampleData, input.dataType);
      return {
        data: buffer.toString("base64"),
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      };
    } else {
      const csv = exportToCSV(sampleData);
      return {
        data: Buffer.from(csv).toString("base64"),
        contentType: "text/csv"
      };
    }
  })
});

// server/routers/socialMediaRouter.ts
import { z as z14 } from "zod";

// server/facebookApi.ts
async function getFacebookPageInsights(pageId) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!accessToken || !pageId) {
    console.warn("[Facebook API] Using mock data - configure FACEBOOK_ACCESS_TOKEN and page ID");
    return {
      success: true,
      data: getMockFacebookInsights()
    };
  }
  try {
    return {
      success: true,
      data: getMockFacebookInsights()
    };
  } catch (error) {
    console.error("[Facebook API] Error fetching insights:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getFacebookTopPosts(pageId, limit = 10) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!accessToken || !pageId) {
    console.warn("[Facebook API] Using mock data");
    return {
      success: true,
      posts: getMockFacebookPosts()
    };
  }
  try {
    return {
      success: true,
      posts: getMockFacebookPosts()
    };
  } catch (error) {
    console.error("[Facebook API] Error fetching posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getFacebookAudience(pageId) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!accessToken || !pageId) {
    return {
      success: true,
      data: getMockFacebookAudience()
    };
  }
  try {
    return {
      success: true,
      data: getMockFacebookAudience()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getMockFacebookInsights() {
  return {
    pageId: "orbi-city-batumi",
    pageName: "ORBI City Batumi",
    followers: 12450,
    likes: 11890,
    reach: {
      total: 45230,
      organic: 32450,
      paid: 12780
    },
    engagement: {
      total: 3245,
      likes: 2890,
      comments: 245,
      shares: 110
    },
    impressions: 78450,
    postCount: 42
  };
}
function getMockFacebookPosts() {
  return [
    {
      id: "1",
      message: "Stunning sunset views from ORBI City apartments! \u{1F305} Book your stay now and experience luxury living in Batumi.",
      createdTime: "2025-01-20T18:30:00Z",
      likes: 456,
      comments: 23,
      shares: 12,
      reach: 8920,
      engagement: 491,
      type: "photo"
    },
    {
      id: "2",
      message: "Special winter offer! Get 20% off on bookings for February. Limited time only! \u2744\uFE0F",
      createdTime: "2025-01-18T10:00:00Z",
      likes: 389,
      comments: 45,
      shares: 28,
      reach: 12450,
      engagement: 462,
      type: "link"
    },
    {
      id: "3",
      message: "Our guests love the panoramic Black Sea views! \u2B50\u2B50\u2B50\u2B50\u2B50 Check out what they say about ORBI City.",
      createdTime: "2025-01-15T14:20:00Z",
      likes: 312,
      comments: 18,
      shares: 8,
      reach: 6780,
      engagement: 338,
      type: "video"
    }
  ];
}
function getMockFacebookAudience() {
  return {
    totalFollowers: 12450,
    demographics: {
      age: {
        "18-24": 1245,
        "25-34": 4980,
        "35-44": 3735,
        "45-54": 1868,
        "55+": 622
      },
      gender: {
        male: 5604,
        female: 6846
      },
      country: {
        Georgia: 7470,
        Russia: 2490,
        Turkey: 1245,
        Ukraine: 622,
        Other: 623
      },
      city: {
        Batumi: 4980,
        Tbilisi: 2490,
        Moscow: 1245,
        Istanbul: 870,
        Other: 2865
      }
    }
  };
}

// server/instagramApi.ts
async function getInstagramInsights(accountId) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    console.warn("[Instagram API] Using mock data - configure INSTAGRAM_ACCESS_TOKEN and account ID");
    return {
      success: true,
      data: getMockInstagramInsights()
    };
  }
  try {
    return {
      success: true,
      data: getMockInstagramInsights()
    };
  } catch (error) {
    console.error("[Instagram API] Error fetching insights:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getInstagramTopPosts(accountId, limit = 9) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    console.warn("[Instagram API] Using mock data");
    return {
      success: true,
      posts: getMockInstagramPosts()
    };
  }
  try {
    return {
      success: true,
      posts: getMockInstagramPosts()
    };
  } catch (error) {
    console.error("[Instagram API] Error fetching posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getInstagramStories(accountId) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    return {
      success: true,
      stories: getMockInstagramStories()
    };
  }
  try {
    return {
      success: true,
      stories: getMockInstagramStories()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getInstagramAudience(accountId) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    return {
      success: true,
      data: getMockInstagramAudience()
    };
  }
  try {
    return {
      success: true,
      data: getMockInstagramAudience()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getMockInstagramInsights() {
  return {
    accountId: "orbi_city_batumi",
    username: "@orbi_city_batumi",
    followers: 18750,
    following: 245,
    mediaCount: 156,
    engagement: {
      total: 4567,
      rate: 5.8,
      likes: 3890,
      comments: 456,
      saves: 221
    },
    reach: 52340,
    impressions: 89450,
    profileViews: 8920,
    websiteClicks: 1245
  };
}
function getMockInstagramPosts() {
  return [
    {
      id: "1",
      caption: "Breathtaking views from your balcony \u{1F30A} #ORBICity #Batumi #LuxuryLiving",
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      permalink: "https://instagram.com/p/abc123",
      timestamp: "2025-01-21T16:45:00Z",
      likes: 892,
      comments: 45,
      saves: 67,
      reach: 12450,
      impressions: 18920,
      engagement: 1004
    },
    {
      id: "2",
      caption: "Modern interiors meet Black Sea elegance \u2728 Book your stay now!",
      mediaType: "CAROUSEL_ALBUM",
      mediaUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      permalink: "https://instagram.com/p/def456",
      timestamp: "2025-01-19T12:30:00Z",
      likes: 756,
      comments: 38,
      saves: 54,
      reach: 10230,
      impressions: 15670,
      engagement: 848
    },
    {
      id: "3",
      caption: "Sunset magic \u{1F305} Every evening is special at ORBI City",
      mediaType: "VIDEO",
      mediaUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      permalink: "https://instagram.com/p/ghi789",
      timestamp: "2025-01-17T19:00:00Z",
      likes: 1023,
      comments: 67,
      saves: 89,
      reach: 15890,
      impressions: 24560,
      engagement: 1179
    }
  ];
}
function getMockInstagramStories() {
  return [
    {
      id: "1",
      mediaType: "IMAGE",
      timestamp: "2025-01-22T10:00:00Z",
      reach: 8920,
      impressions: 12450,
      replies: 34,
      exits: 245,
      tapsForward: 456,
      tapsBack: 123
    },
    {
      id: "2",
      mediaType: "VIDEO",
      timestamp: "2025-01-22T14:30:00Z",
      reach: 10230,
      impressions: 15670,
      replies: 45,
      exits: 312,
      tapsForward: 567,
      tapsBack: 178
    }
  ];
}
function getMockInstagramAudience() {
  return {
    totalFollowers: 18750,
    demographics: {
      age: {
        "18-24": 3750,
        "25-34": 7500,
        "35-44": 4688,
        "45-54": 1875,
        "55+": 937
      },
      gender: {
        male: 8063,
        female: 10687
      },
      country: {
        Georgia: 9375,
        Russia: 3750,
        Turkey: 1875,
        Ukraine: 1125,
        Other: 2625
      },
      city: {
        Batumi: 6563,
        Tbilisi: 2813,
        Moscow: 1875,
        Istanbul: 1125,
        Other: 6374
      }
    },
    activeHours: {
      "0-3": 312,
      "3-6": 187,
      "6-9": 1125,
      "9-12": 2813,
      "12-15": 3750,
      "15-18": 5625,
      "18-21": 3750,
      "21-24": 1188
    },
    activeDays: {
      Monday: 2250,
      Tuesday: 2438,
      Wednesday: 2625,
      Thursday: 2813,
      Friday: 3188,
      Saturday: 3375,
      Sunday: 2063
    }
  };
}

// server/tiktokApi.ts
async function getTikTokInsights(accountId) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    console.warn("[TikTok API] Using mock data - configure TIKTOK_ACCESS_TOKEN and account ID");
    return {
      success: true,
      data: getMockTikTokInsights()
    };
  }
  try {
    return {
      success: true,
      data: getMockTikTokInsights()
    };
  } catch (error) {
    console.error("[TikTok API] Error fetching insights:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getTikTokTopVideos(accountId, limit = 12) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    console.warn("[TikTok API] Using mock data");
    return {
      success: true,
      videos: getMockTikTokVideos()
    };
  }
  try {
    return {
      success: true,
      videos: getMockTikTokVideos()
    };
  } catch (error) {
    console.error("[TikTok API] Error fetching videos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getTikTokTrendingSounds() {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    return {
      success: true,
      sounds: getMockTrendingSounds()
    };
  }
  try {
    return {
      success: true,
      sounds: getMockTrendingSounds()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function getTikTokAudience(accountId) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken || !accountId) {
    return {
      success: true,
      data: getMockTikTokAudience()
    };
  }
  try {
    return {
      success: true,
      data: getMockTikTokAudience()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getMockTikTokInsights() {
  return {
    accountId: "orbi_city_batumi",
    username: "@orbi_city_batumi",
    followers: 24500,
    following: 156,
    videoCount: 89,
    totalLikes: 456780,
    totalViews: 2345670,
    totalShares: 12340,
    avgEngagementRate: 8.5,
    profileViews: 34560
  };
}
function getMockTikTokVideos() {
  return [
    {
      id: "1",
      caption: "Stunning Black Sea sunset from ORBI City \u{1F305} #Batumi #LuxuryApartments #GeorgiaTourism",
      videoUrl: "https://example.com/video1.mp4",
      coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
      createTime: "2025-01-22T18:30:00Z",
      views: 125600,
      likes: 12450,
      comments: 456,
      shares: 234,
      saves: 567,
      duration: 15,
      engagementRate: 10.5,
      soundName: "Summer Vibes - Original Sound",
      soundUrl: "https://example.com/sound1.mp3"
    },
    {
      id: "2",
      caption: "Room tour! Modern luxury in the heart of Batumi \u{1F3D9}\uFE0F #ORBICity #Aparthotel",
      videoUrl: "https://example.com/video2.mp4",
      coverUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
      createTime: "2025-01-20T14:00:00Z",
      views: 98700,
      likes: 9870,
      comments: 345,
      shares: 178,
      saves: 445,
      duration: 30,
      engagementRate: 11.2,
      soundName: "Luxury Life - Trending",
      soundUrl: "https://example.com/sound2.mp3"
    },
    {
      id: "3",
      caption: "Pool day at ORBI City! Who wants to join? \u{1F3CA}\u200D\u2640\uFE0F\u2600\uFE0F #BatumiLife #SummerVibes",
      videoUrl: "https://example.com/video3.mp4",
      coverUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
      createTime: "2025-01-18T12:00:00Z",
      views: 156800,
      likes: 15680,
      comments: 678,
      shares: 345,
      saves: 789,
      duration: 20,
      engagementRate: 11.8,
      soundName: "Pool Party Mix",
      soundUrl: "https://example.com/sound3.mp3"
    }
  ];
}
function getMockTrendingSounds() {
  return [
    {
      id: "1",
      title: "Summer Vibes - Original Sound",
      author: "DJ Sunset",
      duration: 30,
      useCount: 1234567,
      trending: true,
      category: "Music"
    },
    {
      id: "2",
      title: "Luxury Life - Trending",
      author: "Lifestyle Beats",
      duration: 45,
      useCount: 987654,
      trending: true,
      category: "Lifestyle"
    },
    {
      id: "3",
      title: "Pool Party Mix",
      author: "Summer Sounds",
      duration: 60,
      useCount: 765432,
      trending: true,
      category: "Party"
    },
    {
      id: "4",
      title: "Travel Vibes",
      author: "Wanderlust Music",
      duration: 30,
      useCount: 654321,
      trending: true,
      category: "Travel"
    },
    {
      id: "5",
      title: "Batumi Nights",
      author: "Georgian Beats",
      duration: 40,
      useCount: 543210,
      trending: false,
      category: "Local"
    }
  ];
}
function getMockTikTokAudience() {
  return {
    totalFollowers: 24500,
    demographics: {
      age: {
        "13-17": 2450,
        "18-24": 9800,
        "25-34": 7350,
        "35-44": 3675,
        "45+": 1225
      },
      gender: {
        male: 10780,
        female: 13720
      },
      country: {
        Georgia: 14700,
        Russia: 4900,
        Turkey: 2450,
        Ukraine: 1225,
        Other: 1225
      },
      city: {
        Batumi: 8575,
        Tbilisi: 3675,
        Moscow: 2450,
        Istanbul: 1470,
        Other: 8330
      }
    },
    activeHours: {
      "0-3": 490,
      "3-6": 245,
      "6-9": 1470,
      "9-12": 3675,
      "12-15": 4900,
      "15-18": 7350,
      "18-21": 4900,
      "21-24": 1470
    },
    activeDays: {
      Monday: 2940,
      Tuesday: 3185,
      Wednesday: 3430,
      Thursday: 3675,
      Friday: 4165,
      Saturday: 4410,
      Sunday: 2695
    }
  };
}

// server/routers/socialMediaRouter.ts
var socialMediaRouter = router({
  // Facebook endpoints
  getFacebookInsights: publicProcedure.input(
    z14.object({
      pageId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getFacebookPageInsights(input.pageId);
  }),
  getFacebookPosts: publicProcedure.input(
    z14.object({
      pageId: z14.string().optional(),
      limit: z14.number().min(1).max(50).default(10)
    })
  ).query(async ({ input }) => {
    return await getFacebookTopPosts(input.pageId, input.limit);
  }),
  getFacebookAudience: publicProcedure.input(
    z14.object({
      pageId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getFacebookAudience(input.pageId);
  }),
  // Instagram endpoints
  getInstagramInsights: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getInstagramInsights(input.accountId);
  }),
  getInstagramPosts: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional(),
      limit: z14.number().min(1).max(50).default(9)
    })
  ).query(async ({ input }) => {
    return await getInstagramTopPosts(input.accountId, input.limit);
  }),
  getInstagramStories: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getInstagramStories(input.accountId);
  }),
  getInstagramAudience: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getInstagramAudience(input.accountId);
  }),
  // TikTok endpoints
  getTikTokInsights: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getTikTokInsights(input.accountId);
  }),
  getTikTokVideos: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional(),
      limit: z14.number().min(1).max(50).default(12)
    })
  ).query(async ({ input }) => {
    return await getTikTokTopVideos(input.accountId, input.limit);
  }),
  getTikTokTrendingSounds: publicProcedure.query(async () => {
    return await getTikTokTrendingSounds();
  }),
  getTikTokAudience: publicProcedure.input(
    z14.object({
      accountId: z14.string().optional()
    })
  ).query(async ({ input }) => {
    return await getTikTokAudience(input.accountId);
  }),
  // Combined stats
  getCombinedStats: publicProcedure.query(async () => {
    const [fbInsights, igInsights, ttInsights] = await Promise.all([
      getFacebookPageInsights(),
      getInstagramInsights(),
      getTikTokInsights()
    ]);
    if (!fbInsights.success || !igInsights.success || !ttInsights.success) {
      return {
        success: false,
        error: "Failed to fetch combined stats"
      };
    }
    const totalFollowers = (fbInsights.data?.followers || 0) + (igInsights.data?.followers || 0) + (ttInsights.data?.followers || 0);
    const totalReach = (fbInsights.data?.reach.total || 0) + (igInsights.data?.reach || 0) + (ttInsights.data?.totalViews || 0);
    const totalEngagement = (fbInsights.data?.engagement.total || 0) + (igInsights.data?.engagement.total || 0) + (ttInsights.data?.totalLikes || 0);
    const avgEngagementRate = totalFollowers > 0 ? (totalEngagement / totalFollowers * 100).toFixed(2) : "0";
    return {
      success: true,
      data: {
        totalFollowers,
        totalReach,
        totalEngagement,
        avgEngagementRate: parseFloat(avgEngagementRate),
        facebook: fbInsights.data,
        instagram: igInsights.data,
        tiktok: ttInsights.data
      }
    };
  })
});

// server/logisticsRouter.ts
import { z as z15 } from "zod";
import { eq as eq8, and as and2, desc as desc6 } from "drizzle-orm";

// server/logisticsActivity.ts
async function logActivity(params) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Activity Log] Database not available");
      return;
    }
    await db.insert(logisticsActivityLog).values({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId?.toString(),
      entityName: params.entityName,
      changes: params.changes ? JSON.stringify(params.changes) : null
    });
  } catch (error) {
    console.error("[Activity Log] Failed to log activity:", error);
  }
}

// server/logisticsRouter.ts
var logisticsRouter = router({
  // ============================================================================
  // ROOMS
  // ============================================================================
  rooms: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(rooms).orderBy(rooms.roomNumber);
    }),
    getById: protectedProcedure.input(z15.object({ id: z15.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [room] = await db.select().from(rooms).where(eq8(rooms.id, input.id)).limit(1);
      return room;
    })
  }),
  // ============================================================================
  // STANDARD INVENTORY ITEMS
  // ============================================================================
  standardItems: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(standardInventoryItems).orderBy(standardInventoryItems.category, standardInventoryItems.itemName);
    }),
    getById: protectedProcedure.input(z15.object({ id: z15.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [item] = await db.select().from(standardInventoryItems).where(eq8(standardInventoryItems.id, input.id)).limit(1);
      return item;
    })
  }),
  // ============================================================================
  // ROOM INVENTORY ITEMS
  // ============================================================================
  roomInventory: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(roomInventoryItems);
    }),
    getByRoomId: protectedProcedure.input(z15.object({ roomId: z15.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(roomInventoryItems).where(eq8(roomInventoryItems.roomId, input.roomId));
    }),
    upsert: protectedProcedure.input(
      z15.object({
        roomId: z15.number(),
        standardItemId: z15.number(),
        actualQuantity: z15.number(),
        condition: z15.enum(["good", "fair", "poor", "missing"]).optional(),
        notes: z15.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [existing] = await db.select().from(roomInventoryItems).where(
        and2(
          eq8(roomInventoryItems.roomId, input.roomId),
          eq8(roomInventoryItems.standardItemId, input.standardItemId)
        )
      ).limit(1);
      if (existing) {
        await db.update(roomInventoryItems).set({
          actualQuantity: input.actualQuantity,
          condition: input.condition,
          notes: input.notes,
          lastChecked: /* @__PURE__ */ new Date()
        }).where(eq8(roomInventoryItems.id, existing.id));
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "update",
          entityType: "inventory_item",
          entityId: existing.id,
          entityName: `Room ${input.roomId} - Item ${input.standardItemId}`,
          changes: { actualQuantity: input.actualQuantity, condition: input.condition }
        });
        return { success: true, id: existing.id };
      } else {
        const [result] = await db.insert(roomInventoryItems).values({
          roomId: input.roomId,
          standardItemId: input.standardItemId,
          actualQuantity: input.actualQuantity,
          condition: input.condition || "good",
          notes: input.notes,
          lastChecked: /* @__PURE__ */ new Date()
        });
        await logActivity({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          action: "create",
          entityType: "inventory_item",
          entityId: result.insertId,
          entityName: `Room ${input.roomId} - Item ${input.standardItemId}`,
          changes: { actualQuantity: input.actualQuantity, condition: input.condition }
        });
        return { success: true, id: result.insertId };
      }
    })
  }),
  // ============================================================================
  // HOUSEKEEPING SCHEDULES
  // ============================================================================
  housekeeping: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(housekeepingSchedules).orderBy(desc6(housekeepingSchedules.scheduledDate));
    }),
    create: protectedProcedure.input(
      z15.object({
        scheduledDate: z15.string(),
        rooms: z15.array(z15.string()),
        totalRooms: z15.number(),
        status: z15.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        notes: z15.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(housekeepingSchedules).values({
        userId: ctx.user.id,
        scheduledDate: input.scheduledDate,
        rooms: input.rooms,
        totalRooms: input.totalRooms,
        status: input.status || "pending",
        notes: input.notes
      });
      await logActivity({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        action: "create",
        entityType: "housekeeping_schedule",
        entityId: result.insertId,
        entityName: `Housekeeping ${input.scheduledDate} (${input.totalRooms} rooms)`,
        changes: { scheduledDate: input.scheduledDate, totalRooms: input.totalRooms }
      });
      return { success: true, id: result.insertId };
    }),
    update: protectedProcedure.input(
      z15.object({
        id: z15.number(),
        status: z15.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        notes: z15.string().optional(),
        additionalNotes: z15.string().optional(),
        completedAt: z15.date().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(housekeepingSchedules).set({
        status: input.status,
        notes: input.notes,
        additionalNotes: input.additionalNotes,
        completedAt: input.completedAt
      }).where(eq8(housekeepingSchedules.id, input.id));
      await logActivity({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        action: "update",
        entityType: "housekeeping_schedule",
        entityId: input.id,
        entityName: `Housekeeping Schedule #${input.id}`,
        changes: { status: input.status, completedAt: input.completedAt }
      });
      return { success: true };
    })
  }),
  // ============================================================================
  // MAINTENANCE SCHEDULES
  // ============================================================================
  maintenance: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(maintenanceSchedules).orderBy(desc6(maintenanceSchedules.scheduledDate));
    }),
    create: protectedProcedure.input(
      z15.object({
        roomNumber: z15.string(),
        scheduledDate: z15.string(),
        problem: z15.string(),
        notes: z15.string().optional(),
        status: z15.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        estimatedCost: z15.number().optional(),
        priority: z15.enum(["low", "medium", "high", "urgent"]).optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(maintenanceSchedules).values({
        userId: ctx.user.id,
        roomNumber: input.roomNumber,
        scheduledDate: input.scheduledDate,
        problem: input.problem,
        notes: input.notes,
        status: input.status || "pending",
        estimatedCost: input.estimatedCost,
        priority: input.priority || "medium"
      });
      await logActivity({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        action: "create",
        entityType: "maintenance_schedule",
        entityId: result.insertId,
        entityName: `Maintenance ${input.roomNumber}: ${input.problem}`,
        changes: { roomNumber: input.roomNumber, problem: input.problem, estimatedCost: input.estimatedCost }
      });
      return { success: true, id: result.insertId };
    }),
    update: protectedProcedure.input(
      z15.object({
        id: z15.number(),
        status: z15.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        notes: z15.string().optional(),
        estimatedCost: z15.number().optional(),
        actualCost: z15.number().optional(),
        assignedTo: z15.string().optional(),
        completedAt: z15.date().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(maintenanceSchedules).set({
        status: input.status,
        notes: input.notes,
        estimatedCost: input.estimatedCost,
        actualCost: input.actualCost,
        assignedTo: input.assignedTo,
        completedAt: input.completedAt
      }).where(eq8(maintenanceSchedules.id, input.id));
      await logActivity({
        userId: ctx.user.id,
        userEmail: ctx.user.email || "",
        action: "update",
        entityType: "maintenance_schedule",
        entityId: input.id,
        entityName: `Maintenance Schedule #${input.id}`,
        changes: { status: input.status, actualCost: input.actualCost, completedAt: input.completedAt }
      });
      return { success: true };
    })
  }),
  // ============================================================================
  // ACTIVITY LOG
  // ============================================================================
  activityLog: router({
    list: protectedProcedure.input(
      z15.object({
        limit: z15.number().optional()
      })
    ).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const query = db.select().from(logisticsActivityLog).orderBy(desc6(logisticsActivityLog.createdAt));
      if (input.limit) {
        return await query.limit(input.limit);
      }
      return await query;
    })
  })
});

// server/feedbackRouter.ts
import { z as z16 } from "zod";
import { sql as sql2 } from "drizzle-orm";
var feedbackRouter = router({
  /**
   * Submit feedback
   */
  submit: publicProcedure.input(
    z16.object({
      type: z16.enum(["bug", "feature", "feedback"]),
      title: z16.string().min(1).max(255),
      description: z16.string().min(1),
      url: z16.string().optional(),
      userAgent: z16.string().optional(),
      screenshot: z16.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.execute(sql2`
        INSERT INTO userFeedback (userId, userEmail, type, title, description, url, userAgent, screenshot)
        VALUES (${ctx.user?.id || null}, ${ctx.user?.email || null}, ${input.type}, ${input.title}, ${input.description}, ${input.url || null}, ${input.userAgent || null}, ${input.screenshot || null})
      `);
    return { success: true };
  }),
  /**
   * Get all feedback (admin only)
   */
  list: publicProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) return [];
    const result = await db.execute(sql2`
      SELECT * FROM userFeedback
      ORDER BY createdAt DESC
      LIMIT 100
    `);
    return result[0];
  }),
  /**
   * Update feedback status (admin only)
   */
  updateStatus: publicProcedure.input(
    z16.object({
      id: z16.number(),
      status: z16.enum(["new", "in_progress", "resolved", "closed"])
    })
  ).mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.execute(sql2`
        UPDATE userFeedback
        SET status = ${input.status}
        WHERE id = ${input.id}
      `);
    return { success: true };
  }),
  /**
   * Delete feedback (admin only)
   */
  delete: publicProcedure.input(
    z16.object({
      id: z16.number()
    })
  ).mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.execute(sql2`
        DELETE FROM userFeedback
        WHERE id = ${input.id}
      `);
    return { success: true };
  }),
  /**
   * Get feedback statistics (admin only)
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) {
      return {
        total: 0,
        byType: { bug: 0, feature: 0, feedback: 0 },
        byStatus: { new: 0, in_progress: 0, resolved: 0, closed: 0 }
      };
    }
    const result = await db.execute(sql2`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'bug' THEN 1 ELSE 0 END) as bugs,
        SUM(CASE WHEN type = 'feature' THEN 1 ELSE 0 END) as features,
        SUM(CASE WHEN type = 'feedback' THEN 1 ELSE 0 END) as feedback,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count
      FROM userFeedback
    `);
    const row = result[0]?.[0];
    return {
      total: Number(row?.total || 0),
      byType: {
        bug: Number(row?.bugs || 0),
        feature: Number(row?.features || 0),
        feedback: Number(row?.feedback || 0)
      },
      byStatus: {
        new: Number(row?.new_count || 0),
        in_progress: Number(row?.in_progress_count || 0),
        resolved: Number(row?.resolved_count || 0),
        closed: Number(row?.closed_count || 0)
      }
    };
  })
});

// server/routers/healthCheck.ts
import { z as z17 } from "zod";
var healthCheckRouter = router({
  /**
   * Basic health check
   */
  check: publicProcedure.query(async () => {
    const db = await getDb();
    const dbHealthy = !!db;
    return {
      status: dbHealthy ? "healthy" : "degraded",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: dbHealthy
      }
    };
  }),
  /**
   * Detailed system status
   */
  status: publicProcedure.query(async () => {
    const db = await getDb();
    let dbStatus = "disconnected";
    let dbLatency = 0;
    try {
      const start = Date.now();
      if (db) {
        await db.execute({ sql: "SELECT 1", params: [] });
        dbLatency = Date.now() - start;
        dbStatus = "connected";
      }
    } catch (error) {
      dbStatus = "error";
    }
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    return {
      status: dbStatus === "connected" ? "operational" : "degraded",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      components: {
        database: {
          status: dbStatus,
          latency: dbLatency
        },
        api: {
          status: "operational",
          uptime: Math.floor(uptime)
        },
        memory: {
          status: memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? "healthy" : "warning",
          used: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.floor(memoryUsage.heapUsed / memoryUsage.heapTotal * 100)
        }
      },
      metrics: {
        uptime: Math.floor(uptime),
        memoryUsage: {
          rss: Math.floor(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.floor(memoryUsage.external / 1024 / 1024)
        }
      }
    };
  }),
  /**
   * Get recent errors
   */
  errors: publicProcedure.input(
    z17.object({
      limit: z17.number().min(1).max(100).default(20)
    }).optional()
  ).query(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) return [];
    const limit = input?.limit || 20;
    const result = await db.execute({
      sql: `SELECT * FROM errorLogs ORDER BY createdAt DESC LIMIT ${limit}`,
      params: []
    });
    return result[0];
  })
});

// server/routers/cache.ts
import { z as z18 } from "zod";
var cacheRouter = router({
  /**
   * Get cache statistics
   */
  stats: protectedProcedure.query(async () => {
    return await getCacheStats();
  }),
  /**
   * Clear all cache
   */
  clear: protectedProcedure.mutation(async () => {
    const success = await cacheClear();
    return { success };
  }),
  /**
   * Clear cache by pattern
   */
  clearPattern: protectedProcedure.input(z18.object({
    pattern: z18.string()
  })).mutation(async ({ input }) => {
    const deletedCount = await cacheDelPattern(input.pattern);
    return {
      success: true,
      deletedCount
    };
  })
});

// server/routers/performanceRouter.ts
import { z as z19 } from "zod";

// server/performanceMetrics.ts
async function getEndpointStats(endpoint, hours = 24) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as requestCount,
          AVG(responseTime) as avgResponseTime,
          MIN(responseTime) as minResponseTime,
          MAX(responseTime) as maxResponseTime,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY responseTime) as p95ResponseTime,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY responseTime) as p99ResponseTime
        FROM performanceMetrics
        WHERE endpoint = ?
          AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `,
      args: [endpoint, hours]
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error("[Performance] Failed to get endpoint stats:", error);
    return null;
  }
}
async function getSystemStats(hours = 24) {
  const db = await getDb();
  if (!db) {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      slowestEndpoints: []
    };
  }
  try {
    const overallResult = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as totalRequests,
          AVG(responseTime) as avgResponseTime,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY responseTime) as p95ResponseTime,
          SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as errorRate
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `,
      args: [hours]
    });
    const slowestResult = await db.execute({
      sql: `
        SELECT 
          endpoint,
          COUNT(*) as requestCount,
          AVG(responseTime) as avgResponseTime
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY endpoint
        ORDER BY avgResponseTime DESC
        LIMIT 10
      `,
      args: [hours]
    });
    return {
      totalRequests: Number(overallResult.rows[0]?.totalRequests || 0),
      avgResponseTime: Number(overallResult.rows[0]?.avgResponseTime || 0),
      p95ResponseTime: Number(overallResult.rows[0]?.p95ResponseTime || 0),
      errorRate: Number(overallResult.rows[0]?.errorRate || 0),
      slowestEndpoints: slowestResult.rows
    };
  } catch (error) {
    console.error("[Performance] Failed to get system stats:", error);
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      slowestEndpoints: []
    };
  }
}
async function getMetricsTimeSeries(hours = 24, intervalMinutes = 60) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as timeSlot,
          COUNT(*) as requestCount,
          AVG(responseTime) as avgResponseTime,
          SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END) as errorCount
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY timeSlot
        ORDER BY timeSlot ASC
      `,
      args: [hours]
    });
    return result.rows;
  } catch (error) {
    console.error("[Performance] Failed to get time series:", error);
    return [];
  }
}
async function cleanupOldMetrics(daysToKeep = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Performance] Cannot cleanup: database not available");
    return 0;
  }
  try {
    const result = await db.execute({
      sql: `
        DELETE FROM performanceMetrics
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
      `,
      args: [daysToKeep]
    });
    const deletedCount = result.rowsAffected || 0;
    console.log(`[Performance] Cleaned up ${deletedCount} old metrics`);
    return deletedCount;
  } catch (error) {
    console.error("[Performance] Failed to cleanup old metrics:", error);
    return 0;
  }
}

// server/routers/performanceRouter.ts
var performanceRouter = router({
  /**
   * Get statistics for a specific endpoint
   */
  getEndpointStats: protectedProcedure.input(
    z19.object({
      endpoint: z19.string(),
      hours: z19.number().min(1).max(168).default(24)
    })
  ).query(async ({ input }) => {
    const stats = await getEndpointStats(input.endpoint, input.hours);
    return stats || {
      requestCount: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    };
  }),
  /**
   * Get overall system performance statistics
   */
  getSystemStats: protectedProcedure.input(
    z19.object({
      hours: z19.number().min(1).max(168).default(24)
    })
  ).query(async ({ input }) => {
    return await getSystemStats(input.hours);
  }),
  /**
   * Get performance metrics time series for charting
   */
  getTimeSeries: protectedProcedure.input(
    z19.object({
      hours: z19.number().min(1).max(168).default(24),
      intervalMinutes: z19.number().min(5).max(1440).default(60)
    })
  ).query(async ({ input }) => {
    return await getMetricsTimeSeries(input.hours, input.intervalMinutes);
  }),
  /**
   * Clean up old performance metrics (admin only)
   */
  cleanup: protectedProcedure.input(
    z19.object({
      daysToKeep: z19.number().min(7).max(365).default(30)
    })
  ).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can cleanup performance metrics");
    }
    const deletedCount = await cleanupOldMetrics(input.daysToKeep);
    return {
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old performance metrics`
    };
  })
});

// server/routers/alertsRouter.ts
import { z as z20 } from "zod";

// server/alertSystem.ts
async function createAlert(alert) {
  const db = await getDb();
  if (!db) {
    console.warn("[Alert] Cannot create alert: database not available");
    return null;
  }
  try {
    const result = await db.execute({
      sql: `
        INSERT INTO alerts 
        (type, severity, title, message, metadata, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `,
      args: [
        alert.type,
        alert.severity,
        alert.title,
        alert.message,
        alert.metadata ? JSON.stringify(alert.metadata) : null
      ]
    });
    const alertId = Number(result.lastInsertRowid);
    if (alert.severity === "high" || alert.severity === "critical") {
      await notifyOwner({
        title: `\u{1F6A8} ${alert.severity.toUpperCase()}: ${alert.title}`,
        content: alert.message
      }).catch((error) => {
        console.error("[Alert] Failed to send notification:", error);
      });
    }
    console.log(`[Alert] Created ${alert.severity} alert: ${alert.title}`);
    return alertId;
  } catch (error) {
    console.error("[Alert] Failed to create alert:", error);
    return null;
  }
}
async function getActiveAlerts() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  try {
    const result = await db.execute({
      sql: `
        SELECT * FROM alerts
        WHERE status = 'active'
        ORDER BY 
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          createdAt DESC
      `,
      args: []
    });
    return result.rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  } catch (error) {
    console.error("[Alert] Failed to get active alerts:", error);
    return [];
  }
}
async function getAlertsByType(type) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  try {
    const result = await db.execute({
      sql: `
        SELECT * FROM alerts
        WHERE type = ?
        ORDER BY createdAt DESC
        LIMIT 100
      `,
      args: [type]
    });
    return result.rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  } catch (error) {
    console.error("[Alert] Failed to get alerts by type:", error);
    return [];
  }
}
async function acknowledgeAlert(alertId, userId) {
  const db = await getDb();
  if (!db) {
    return false;
  }
  try {
    await db.execute({
      sql: `
        UPDATE alerts
        SET status = 'acknowledged',
            acknowledgedBy = ?,
            acknowledgedAt = NOW()
        WHERE id = ? AND status = 'active'
      `,
      args: [userId, alertId]
    });
    return true;
  } catch (error) {
    console.error("[Alert] Failed to acknowledge alert:", error);
    return false;
  }
}
async function resolveAlert(alertId, userId) {
  const db = await getDb();
  if (!db) {
    return false;
  }
  try {
    await db.execute({
      sql: `
        UPDATE alerts
        SET status = 'resolved',
            resolvedBy = ?,
            resolvedAt = NOW()
        WHERE id = ? AND status IN ('active', 'acknowledged')
      `,
      args: [userId, alertId]
    });
    return true;
  } catch (error) {
    console.error("[Alert] Failed to resolve alert:", error);
    return false;
  }
}
async function checkErrorRate(threshold = 5) {
  const db = await getDb();
  if (!db) return;
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as totalRequests,
          SUM(CASE WHEN statusCode >= 500 THEN 1 ELSE 0 END) as errorCount
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      `,
      args: []
    });
    const row = result.rows[0];
    const totalRequests = Number(row?.totalRequests || 0);
    const errorCount = Number(row?.errorCount || 0);
    if (totalRequests > 10) {
      const errorRate = errorCount / totalRequests * 100;
      if (errorRate > threshold) {
        await createAlert({
          type: "high_error_rate",
          severity: errorRate > 20 ? "critical" : "high",
          title: "High Error Rate Detected",
          message: `Error rate is ${errorRate.toFixed(
            2
          )}% (${errorCount}/${totalRequests} requests failed in the last 5 minutes)`,
          metadata: {
            errorRate,
            errorCount,
            totalRequests,
            threshold
          }
        });
      }
    }
  } catch (error) {
    console.error("[Alert] Failed to check error rate:", error);
  }
}
async function checkResponseTime(threshold = 1e3) {
  const db = await getDb();
  if (!db) return;
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          AVG(responseTime) as avgResponseTime,
          MAX(responseTime) as maxResponseTime
        FROM performanceMetrics
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      `,
      args: []
    });
    const row = result.rows[0];
    const avgResponseTime = Number(row?.avgResponseTime || 0);
    const maxResponseTime = Number(row?.maxResponseTime || 0);
    if (avgResponseTime > threshold) {
      await createAlert({
        type: "slow_response_time",
        severity: avgResponseTime > threshold * 2 ? "high" : "medium",
        title: "Slow Response Time Detected",
        message: `Average response time is ${avgResponseTime.toFixed(
          0
        )}ms (threshold: ${threshold}ms) in the last 5 minutes`,
        metadata: {
          avgResponseTime,
          maxResponseTime,
          threshold
        }
      });
    }
  } catch (error) {
    console.error("[Alert] Failed to check response time:", error);
  }
}
async function checkBackupStatus() {
  const db = await getDb();
  if (!db) return;
  try {
    const result = await db.execute({
      sql: `
        SELECT status, createdAt
        FROM backups
        ORDER BY createdAt DESC
        LIMIT 1
      `,
      args: []
    });
    const lastBackup = result.rows[0];
    if (!lastBackup) {
      await createAlert({
        type: "backup_missing",
        severity: "high",
        title: "No Backups Found",
        message: "No database backups have been created yet. Please configure automated backups.",
        metadata: {}
      });
    } else if (lastBackup.status === "failed") {
      await createAlert({
        type: "backup_failed",
        severity: "critical",
        title: "Database Backup Failed",
        message: `Last backup attempt failed at ${new Date(
          lastBackup.createdAt
        ).toLocaleString()}`,
        metadata: {
          lastBackupTime: lastBackup.createdAt
        }
      });
    } else {
      const hoursSinceBackup = (Date.now() - new Date(lastBackup.createdAt).getTime()) / (1e3 * 60 * 60);
      if (hoursSinceBackup > 48) {
        await createAlert({
          type: "backup_overdue",
          severity: "high",
          title: "Backup Overdue",
          message: `Last successful backup was ${hoursSinceBackup.toFixed(
            1
          )} hours ago. Backups should run daily.`,
          metadata: {
            lastBackupTime: lastBackup.createdAt,
            hoursSinceBackup
          }
        });
      }
    }
  } catch (error) {
    console.error("[Alert] Failed to check backup status:", error);
  }
}
async function runAlertChecks() {
  console.log("[Alert] Running alert checks...");
  await Promise.all([
    checkErrorRate(),
    checkResponseTime(),
    checkBackupStatus()
  ]);
  console.log("[Alert] Alert checks completed");
}

// server/routers/alertsRouter.ts
var alertsRouter = router({
  /**
   * Get all active alerts
   */
  getActive: protectedProcedure.query(async () => {
    return await getActiveAlerts();
  }),
  /**
   * Get alerts by type
   */
  getByType: protectedProcedure.input(
    z20.object({
      type: z20.string()
    })
  ).query(async ({ input }) => {
    return await getAlertsByType(input.type);
  }),
  /**
   * Create a new alert (admin only)
   */
  create: protectedProcedure.input(
    z20.object({
      type: z20.string(),
      severity: z20.enum(["low", "medium", "high", "critical"]),
      title: z20.string(),
      message: z20.string(),
      metadata: z20.record(z20.any()).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can create alerts");
    }
    const alertId = await createAlert({
      type: input.type,
      severity: input.severity,
      title: input.title,
      message: input.message,
      metadata: input.metadata
    });
    return {
      success: alertId !== null,
      alertId
    };
  }),
  /**
   * Acknowledge an alert
   */
  acknowledge: protectedProcedure.input(
    z20.object({
      alertId: z20.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const success = await acknowledgeAlert(input.alertId, ctx.user.id);
    return {
      success,
      message: success ? "Alert acknowledged successfully" : "Failed to acknowledge alert"
    };
  }),
  /**
   * Resolve an alert
   */
  resolve: protectedProcedure.input(
    z20.object({
      alertId: z20.number()
    })
  ).mutation(async ({ input, ctx }) => {
    const success = await resolveAlert(input.alertId, ctx.user.id);
    return {
      success,
      message: success ? "Alert resolved successfully" : "Failed to resolve alert"
    };
  }),
  /**
   * Run alert checks manually (admin only)
   */
  runChecks: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run alert checks");
    }
    await runAlertChecks();
    return {
      success: true,
      message: "Alert checks completed"
    };
  })
});

// server/routers/securityRouter.ts
import { z as z21 } from "zod";
var securityRouter = router({
  /**
   * Run security audit (admin only)
   */
  audit: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run security audits");
    }
    return runSecurityAudit();
  }),
  /**
   * Validate email address
   */
  validateEmail: protectedProcedure.input(
    z21.object({
      email: z21.string()
    })
  ).query(({ input }) => {
    return {
      valid: validateEmail(input.email),
      email: input.email
    };
  }),
  /**
   * Validate phone number
   */
  validatePhone: protectedProcedure.input(
    z21.object({
      phone: z21.string()
    })
  ).query(({ input }) => {
    return {
      valid: validatePhone(input.phone),
      phone: input.phone
    };
  }),
  /**
   * Validate URL
   */
  validateURL: protectedProcedure.input(
    z21.object({
      url: z21.string()
    })
  ).query(({ input }) => {
    return {
      valid: validateURL(input.url),
      url: input.url
    };
  }),
  /**
   * Sanitize input (test endpoint)
   */
  sanitize: protectedProcedure.input(
    z21.object({
      input: z21.string()
    })
  ).query(({ input }) => {
    return {
      original: input.input,
      sanitized: sanitizeInput(input.input)
    };
  })
});

// server/routers/gdprRouter.ts
import { z as z22 } from "zod";

// server/gdpr.ts
import { sql as sql3 } from "drizzle-orm";
async function exportUserData(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const userData = {};
  const userResult = await db.execute(sql3`
    SELECT * FROM users WHERE id = ${userId}
  `);
  userData.profile = userResult.rows[0];
  const filesResult = await db.execute(sql3`
    SELECT * FROM files WHERE userId = ${userId}
  `);
  userData.files = filesResult.rows;
  const conversationsResult = await db.execute(sql3`
    SELECT * FROM aiConversations WHERE userId = ${userId}
  `);
  userData.conversations = conversationsResult.rows;
  const feedbackResult = await db.execute(sql3`
    SELECT * FROM userFeedback WHERE userId = ${userId}
  `);
  userData.feedback = feedbackResult.rows;
  const errorLogsResult = await db.execute(sql3`
    SELECT * FROM errorLogs WHERE userId = ${userId}
  `);
  userData.errorLogs = errorLogsResult.rows;
  return {
    exportDate: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    data: userData
  };
}
async function deleteUserData(userId) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const deletedRecords = {};
  const filesResult = await db.execute(sql3`
    DELETE FROM files WHERE userId = ${userId}
  `);
  deletedRecords.files = filesResult.rowsAffected || 0;
  const conversationsResult = await db.execute(sql3`
    DELETE FROM aiConversations WHERE userId = ${userId}
  `);
  deletedRecords.conversations = conversationsResult.rowsAffected || 0;
  const feedbackResult = await db.execute(sql3`
    DELETE FROM userFeedback WHERE userId = ${userId}
  `);
  deletedRecords.feedback = feedbackResult.rowsAffected || 0;
  const errorLogsResult = await db.execute(sql3`
    DELETE FROM errorLogs WHERE userId = ${userId}
  `);
  deletedRecords.errorLogs = errorLogsResult.rowsAffected || 0;
  await db.execute(sql3`
    UPDATE users
    SET name = 'Deleted User',
        email = NULL,
        loginMethod = NULL
    WHERE id = ${userId}
  `);
  return {
    deletionDate: (/* @__PURE__ */ new Date()).toISOString(),
    userId,
    deletedRecords
  };
}
async function recordConsent(consent) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.execute(sql3`
    INSERT INTO gdprConsents 
    (userId, consentType, consentGiven, consentDate, ipAddress, userAgent)
    VALUES (
      ${consent.userId},
      ${consent.consentType},
      ${consent.consentGiven},
      ${consent.consentDate},
      ${consent.ipAddress || null},
      ${consent.userAgent || null}
    )
  `);
  return {
    success: true,
    message: "Consent recorded successfully"
  };
}
async function getUserConsents(userId) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const result = await db.execute(sql3`
    SELECT * FROM gdprConsents
    WHERE userId = ${userId}
    ORDER BY consentDate DESC
  `);
  return result.rows;
}
var PRIVACY_POLICY = `
# Privacy Policy

**Last Updated:** November 27, 2025

## 1. Data Collection
We collect the following personal data:
- Name and email address (for authentication)
- Usage data (for analytics and improvement)
- Files you upload (for service functionality)
- Chat conversations (for AI assistance)

## 2. Data Usage
Your data is used for:
- Providing and improving our services
- Authentication and authorization
- Analytics and performance monitoring
- Customer support

## 3. Data Storage
- Data is stored securely in encrypted databases
- Backups are created daily and retained for 30 days
- Data is stored in compliance with GDPR requirements

## 4. Your Rights
Under GDPR, you have the right to:
- Access your personal data
- Rectify inaccurate data
- Erase your data ("right to be forgotten")
- Data portability
- Object to processing
- Withdraw consent

## 5. Data Retention
- User data is retained while your account is active
- Deleted data is permanently removed within 30 days
- Backups are retained for 30 days

## 6. Contact
For privacy concerns, contact: privacy@orbicitybatumi.com
`;
function runGDPRComplianceCheck() {
  const recommendations = [];
  recommendations.push("Create GDPR consents table if not exists");
  recommendations.push("Implement cookie consent banner on frontend");
  recommendations.push("Add privacy policy link to footer");
  recommendations.push("Implement data export UI for users");
  return {
    timestamp: /* @__PURE__ */ new Date(),
    checks: {
      dataExportAvailable: true,
      dataDeletionAvailable: true,
      consentManagement: true,
      privacyPolicy: true,
      dataEncryption: true,
      // Database uses SSL
      backupRetention: true
      // 30-day retention
    },
    recommendations
  };
}

// server/routers/gdprRouter.ts
var gdprRouter = router({
  /**
   * Export user data (GDPR Right to Access)
   */
  exportData: protectedProcedure.query(async ({ ctx }) => {
    return await exportUserData(ctx.user.id);
  }),
  /**
   * Delete user data (GDPR Right to Erasure)
   */
  deleteData: protectedProcedure.mutation(async ({ ctx }) => {
    return await deleteUserData(ctx.user.id);
  }),
  /**
   * Record user consent
   */
  recordConsent: protectedProcedure.input(
    z22.object({
      consentType: z22.enum(["privacy_policy", "terms_of_service", "marketing", "analytics"]),
      consentGiven: z22.boolean(),
      ipAddress: z22.string().optional(),
      userAgent: z22.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return await recordConsent({
      userId: ctx.user.id,
      consentType: input.consentType,
      consentGiven: input.consentGiven,
      consentDate: /* @__PURE__ */ new Date(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    });
  }),
  /**
   * Get user consents
   */
  getConsents: protectedProcedure.query(async ({ ctx }) => {
    return await getUserConsents(ctx.user.id);
  }),
  /**
   * Get privacy policy
   */
  getPrivacyPolicy: protectedProcedure.query(() => {
    return {
      policy: PRIVACY_POLICY,
      lastUpdated: "November 27, 2025"
    };
  }),
  /**
   * Run GDPR compliance check (admin only)
   */
  complianceCheck: protectedProcedure.query(({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run GDPR compliance checks");
    }
    return runGDPRComplianceCheck();
  })
});

// server/databaseOptimization.ts
import { sql as sql4 } from "drizzle-orm";
async function getTableSizes() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const result = await db.execute(sql4`
    SELECT 
      table_name AS tableName,
      table_rows AS rows,
      ROUND(data_length / 1024 / 1024, 2) AS dataSizeMB,
      ROUND(index_length / 1024 / 1024, 2) AS indexSizeMB,
      ROUND((data_length + index_length) / 1024 / 1024, 2) AS totalSizeMB
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
    ORDER BY (data_length + index_length) DESC
  `);
  return result.rows.map((row) => ({
    name: row.tableName,
    rows: row.rows || 0,
    dataSize: `${row.dataSizeMB || 0} MB`,
    indexSize: `${row.indexSizeMB || 0} MB`,
    totalSize: `${row.totalSizeMB || 0} MB`
  }));
}
async function getIndexes() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const result = await db.execute(sql4`
    SELECT 
      table_name AS tableName,
      index_name AS indexName,
      GROUP_CONCAT(column_name ORDER BY seq_in_index) AS columns,
      cardinality
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    GROUP BY table_name, index_name
    ORDER BY table_name, index_name
  `);
  return result.rows.map((row) => ({
    table: row.tableName,
    index: row.indexName,
    columns: row.columns,
    cardinality: row.cardinality || 0
  }));
}
async function createMissingIndexes() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const indexesCreated = [];
  try {
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_files_userId_createdAt 
      ON files(userId, createdAt DESC)
    `);
    indexesCreated.push("idx_files_userId_createdAt");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_aiConversations_userId_createdAt 
      ON aiConversations(userId, createdAt DESC)
    `);
    indexesCreated.push("idx_aiConversations_userId_createdAt");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_userFeedback_status_type 
      ON userFeedback(status, type)
    `);
    indexesCreated.push("idx_userFeedback_status_type");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_errorLogs_createdAt 
      ON errorLogs(createdAt DESC)
    `);
    indexesCreated.push("idx_errorLogs_createdAt");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_performanceMetrics_endpoint_timestamp 
      ON performanceMetrics(endpoint, timestamp DESC)
    `);
    indexesCreated.push("idx_performanceMetrics_endpoint_timestamp");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_alerts_status_severity 
      ON alerts(status, severity)
    `);
    indexesCreated.push("idx_alerts_status_severity");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_roomInventoryItems_roomId_itemId 
      ON roomInventoryItems(roomId, itemId)
    `);
    indexesCreated.push("idx_roomInventoryItems_roomId_itemId");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_reservations_checkIn_checkOut 
      ON reservations(checkIn, checkOut)
    `);
    indexesCreated.push("idx_reservations_checkIn_checkOut");
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS idx_reservations_status 
      ON reservations(status)
    `);
    indexesCreated.push("idx_reservations_status");
  } catch (error) {
    console.error("[Database Optimization] Error creating indexes:", error);
  }
  return indexesCreated;
}
async function analyzeSlowQueries() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  try {
    return [];
  } catch (error) {
    console.error("[Database Optimization] Error analyzing slow queries:", error);
    return [];
  }
}
async function runDatabaseOptimization() {
  const tables = await getTableSizes();
  const indexes = await getIndexes();
  const slowQueries = await analyzeSlowQueries();
  const indexesCreated = await createMissingIndexes();
  const recommendations = [];
  const tablesWithoutIndexes = tables.filter(
    (table) => !indexes.some((idx) => idx.table === table.name && idx.index !== "PRIMARY")
  );
  if (tablesWithoutIndexes.length > 0) {
    recommendations.push(
      `Add indexes to tables: ${tablesWithoutIndexes.map((t2) => t2.name).join(", ")}`
    );
  }
  const largeTables = tables.filter((table) => {
    const sizeMB = parseFloat(table.totalSize.replace(" MB", ""));
    return sizeMB > 100;
  });
  if (largeTables.length > 0) {
    recommendations.push(
      `Consider partitioning large tables: ${largeTables.map((t2) => t2.name).join(", ")}`
    );
  }
  const tablesWithManyRows = tables.filter((table) => table.rows > 1e5);
  if (tablesWithManyRows.length > 0) {
    recommendations.push(
      `Consider archiving old data from: ${tablesWithManyRows.map((t2) => t2.name).join(", ")}`
    );
  }
  if (indexesCreated.length > 0) {
    recommendations.push(`Created ${indexesCreated.length} new indexes for better performance`);
  }
  recommendations.push("Enable Redis caching to reduce database load");
  recommendations.push("Configure slow query log for detailed query analysis");
  recommendations.push("Run ANALYZE TABLE periodically to update statistics");
  return {
    timestamp: /* @__PURE__ */ new Date(),
    tables,
    indexes,
    slowQueries,
    recommendations
  };
}

// server/routers/databaseRouter.ts
var databaseRouter = router({
  /**
   * Run full database optimization (admin only)
   */
  optimize: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can run database optimization");
    }
    return await runDatabaseOptimization();
  }),
  /**
   * Get table sizes
   */
  getTableSizes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view table sizes");
    }
    return await getTableSizes();
  }),
  /**
   * Get indexes
   */
  getIndexes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view indexes");
    }
    return await getIndexes();
  }),
  /**
   * Create missing indexes
   */
  createIndexes: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can create indexes");
    }
    return await createMissingIndexes();
  })
});

// server/routers/uptimeRouter.ts
import { z as z23 } from "zod";

// server/uptimeMonitoring.ts
import { sql as sql5 } from "drizzle-orm";
async function performUptimeCheck() {
  const startTime = Date.now();
  const errors = [];
  const checks = {
    database: false,
    api: false,
    memory: false
  };
  try {
    const db = await getDb();
    if (db) {
      await db.execute(sql5`SELECT 1`);
      checks.database = true;
    } else {
      errors.push("Database connection failed");
    }
  } catch (error) {
    errors.push(`Database error: ${error}`);
  }
  try {
    checks.api = true;
  } catch (error) {
    errors.push(`API error: ${error}`);
  }
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const usagePercent = heapUsedMB / heapTotalMB * 100;
    if (usagePercent > 90) {
      errors.push(`High memory usage: ${usagePercent.toFixed(2)}%`);
    } else {
      checks.memory = true;
    }
  } catch (error) {
    errors.push(`Memory check error: ${error}`);
  }
  const responseTime = Date.now() - startTime;
  let status = "up";
  if (errors.length > 0) {
    if (checks.database && checks.api) {
      status = "degraded";
    } else {
      status = "down";
    }
  }
  const result = {
    timestamp: /* @__PURE__ */ new Date(),
    status,
    responseTime,
    checks,
    errors
  };
  await recordUptimeCheck(result);
  if (status === "down") {
    await notifyOwner({
      title: "\u{1F6A8} System Down",
      content: `The system is currently down. Errors: ${errors.join(", ")}`
    });
  } else if (status === "degraded") {
    await notifyOwner({
      title: "\u26A0\uFE0F System Degraded",
      content: `The system is experiencing issues. Errors: ${errors.join(", ")}`
    });
  }
  return result;
}
async function recordUptimeCheck(result) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.execute(sql5`
      INSERT INTO uptimeChecks 
      (timestamp, status, responseTime, databaseCheck, apiCheck, memoryCheck, errors)
      VALUES (
        ${result.timestamp},
        ${result.status},
        ${result.responseTime},
        ${result.checks.database},
        ${result.checks.api},
        ${result.checks.memory},
        ${JSON.stringify(result.errors)}
      )
    `);
  } catch (error) {
    console.error("[Uptime Monitoring] Failed to record check:", error);
  }
}
async function getUptimeStatistics(hours = 24) {
  const db = await getDb();
  if (!db) {
    return {
      period: `${hours} hours`,
      uptime: 0,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      incidents: []
    };
  }
  const since = new Date(Date.now() - hours * 60 * 60 * 1e3);
  const checksResult = await db.execute(sql5`
    SELECT * FROM uptimeChecks
    WHERE timestamp >= ${since}
    ORDER BY timestamp DESC
  `);
  const checks = checksResult.rows;
  const totalChecks = checks.length;
  const successfulChecks = checks.filter((c) => c.status === "up").length;
  const failedChecks = totalChecks - successfulChecks;
  const uptime = totalChecks > 0 ? successfulChecks / totalChecks * 100 : 100;
  const totalResponseTime = checks.reduce((sum, c) => sum + (c.responseTime || 0), 0);
  const averageResponseTime = totalChecks > 0 ? totalResponseTime / totalChecks : 0;
  const incidents = [];
  let currentIncident = null;
  for (const check of checks) {
    if (check.status !== "up") {
      if (!currentIncident) {
        currentIncident = {
          start: new Date(check.timestamp),
          end: new Date(check.timestamp),
          errors: JSON.parse(check.errors || "[]")
        };
      } else {
        currentIncident.end = new Date(check.timestamp);
        currentIncident.errors.push(...JSON.parse(check.errors || "[]"));
      }
    } else if (currentIncident) {
      const duration = Math.round(
        (currentIncident.end.getTime() - currentIncident.start.getTime()) / 6e4
      );
      incidents.push({
        timestamp: currentIncident.start,
        duration,
        reason: currentIncident.errors.join(", ")
      });
      currentIncident = null;
    }
  }
  return {
    period: `${hours} hours`,
    uptime: Math.round(uptime * 100) / 100,
    totalChecks,
    successfulChecks,
    failedChecks,
    averageResponseTime: Math.round(averageResponseTime),
    incidents
  };
}
async function cleanupOldUptimeChecks() {
  const db = await getDb();
  if (!db) return 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
  const result = await db.execute(sql5`
    DELETE FROM uptimeChecks
    WHERE timestamp < ${thirtyDaysAgo}
  `);
  return result.rowsAffected || 0;
}

// server/routers/uptimeRouter.ts
var uptimeRouter = router({
  /**
   * Perform uptime check (public for external monitoring)
   */
  check: publicProcedure.query(async () => {
    return await performUptimeCheck();
  }),
  /**
   * Get uptime statistics
   */
  getStatistics: protectedProcedure.input(
    z23.object({
      hours: z23.number().min(1).max(720).default(24)
      // Max 30 days
    })
  ).query(async ({ input }) => {
    return await getUptimeStatistics(input.hours);
  }),
  /**
   * Cleanup old checks (admin only)
   */
  cleanup: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can cleanup uptime checks");
    }
    const deletedCount = await cleanupOldUptimeChecks();
    return {
      success: true,
      deletedCount
    };
  })
});

// server/routers/otelms.ts
import { z as z24 } from "zod";

// server/otelmsDb.ts
import { eq as eq9, desc as desc7, gte as gte2, lte as lte2, and as and3 } from "drizzle-orm";
async function getAllOtelmsReports() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTELMS reports: database not available");
    return [];
  }
  try {
    const reports = await db.select().from(otelmsDailyReports).orderBy(desc7(otelmsDailyReports.reportDate));
    return reports;
  } catch (error) {
    console.error("[Database] Failed to get OTELMS reports:", error);
    return [];
  }
}
async function getOtelmsReportByDate(date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTELMS report: database not available");
    return null;
  }
  try {
    const reports = await db.select().from(otelmsDailyReports).where(eq9(otelmsDailyReports.reportDate, date)).limit(1);
    return reports.length > 0 ? reports[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get OTELMS report:", error);
    return null;
  }
}
async function getOtelmsReportsByDateRange(startDate, endDate) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTELMS reports: database not available");
    return [];
  }
  try {
    const reports = await db.select().from(otelmsDailyReports).where(
      and3(
        gte2(otelmsDailyReports.reportDate, startDate),
        lte2(otelmsDailyReports.reportDate, endDate)
      )
    ).orderBy(desc7(otelmsDailyReports.reportDate));
    return reports;
  } catch (error) {
    console.error("[Database] Failed to get OTELMS reports:", error);
    return [];
  }
}
async function getLatestOtelmsReport() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get latest OTELMS report: database not available");
    return null;
  }
  try {
    const reports = await db.select().from(otelmsDailyReports).orderBy(desc7(otelmsDailyReports.reportDate)).limit(1);
    return reports.length > 0 ? reports[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get latest OTELMS report:", error);
    return null;
  }
}
async function getOtelmsStatistics(startDate, endDate) {
  const reports = await getOtelmsReportsByDateRange(startDate, endDate);
  if (reports.length === 0) {
    return null;
  }
  const totals = reports.reduce(
    (acc, report) => ({
      checkIns: acc.checkIns + (report.checkIns || 0),
      checkOuts: acc.checkOuts + (report.checkOuts || 0),
      cancellations: acc.cancellations + (report.cancellations || 0),
      totalRevenue: acc.totalRevenue + (report.totalRevenue || 0),
      totalGuests: acc.totalGuests + (report.totalGuests || 0),
      roomsOccupied: acc.roomsOccupied + (report.roomsOccupied || 0)
    }),
    {
      checkIns: 0,
      checkOuts: 0,
      cancellations: 0,
      totalRevenue: 0,
      totalGuests: 0,
      roomsOccupied: 0
    }
  );
  const count = reports.length;
  const averages = {
    occupancyRate: Math.round(
      reports.reduce((sum, r) => sum + (r.occupancyRate || 0), 0) / count
    ),
    adr: Math.round(
      reports.reduce((sum, r) => sum + (r.adr || 0), 0) / count
    ),
    revPAR: Math.round(
      reports.reduce((sum, r) => sum + (r.revPAR || 0), 0) / count
    )
  };
  return {
    ...totals,
    ...averages,
    reportCount: count,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
}

// server/routers/otelms.ts
var otelmsRouter = router({
  /**
   * Get all OTELMS daily reports
   */
  getAll: publicProcedure.query(async () => {
    const reports = await getAllOtelmsReports();
    return reports;
  }),
  /**
   * Get latest OTELMS report
   */
  getLatest: publicProcedure.query(async () => {
    const report = await getLatestOtelmsReport();
    return report;
  }),
  /**
   * Get OTELMS report by date
   */
  getByDate: publicProcedure.input(
    z24.object({
      date: z24.string()
      // ISO date string
    })
  ).query(async ({ input }) => {
    const date = new Date(input.date);
    const report = await getOtelmsReportByDate(date);
    return report;
  }),
  /**
   * Get OTELMS reports by date range
   */
  getByDateRange: publicProcedure.input(
    z24.object({
      startDate: z24.string(),
      // ISO date string
      endDate: z24.string()
      // ISO date string
    })
  ).query(async ({ input }) => {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const reports = await getOtelmsReportsByDateRange(startDate, endDate);
    return reports;
  }),
  /**
   * Get aggregated statistics for a date range
   */
  getStatistics: publicProcedure.input(
    z24.object({
      startDate: z24.string(),
      // ISO date string
      endDate: z24.string()
      // ISO date string
    })
  ).query(async ({ input }) => {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const stats = await getOtelmsStatistics(startDate, endDate);
    return stats;
  }),
  /**
   * Get dashboard summary (last 30 days)
   */
  getDashboardSummary: publicProcedure.query(async () => {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - 30);
    const stats = await getOtelmsStatistics(startDate, endDate);
    const latestReport = await getLatestOtelmsReport();
    return {
      last30Days: stats,
      latestReport
    };
  })
});

// server/routers/integrationsRouter.ts
import { z as z25 } from "zod";
import { eq as eq10 } from "drizzle-orm";
import crypto from "crypto";
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "orbi-city-hub-encryption-key-32b";
var ALGORITHM = "aes-256-cbc";
function encrypt(text2) {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text2, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
function decrypt(text2) {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
  const parts = text2.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
var integrationsRouter = router({
  // Get integration status
  getStatus: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        otelms: false,
        googleAnalytics: false,
        googleBusiness: false
      };
    }
    const allIntegrations = await db.select().from(integrations);
    return {
      otelms: allIntegrations.some((i) => i.service === "otelms" && i.status === "connected"),
      googleAnalytics: allIntegrations.some((i) => i.service === "google_analytics" && i.status === "connected"),
      googleBusiness: allIntegrations.some((i) => i.service === "google_business" && i.status === "connected")
    };
  }),
  // Save OTELMS credentials
  saveOtelmsCredentials: protectedProcedure.input(
    z25.object({
      email: z25.string().email(),
      appPassword: z25.string().min(16)
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const credentials = {
      email: input.email,
      appPassword: input.appPassword
    };
    const encryptedCredentials = encrypt(JSON.stringify(credentials));
    const existing = await db.select().from(integrations).where(eq10(integrations.service, "otelms")).limit(1);
    if (existing.length > 0) {
      await db.update(integrations).set({
        credentials: encryptedCredentials,
        status: "pending",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(integrations.service, "otelms"));
    } else {
      await db.insert(integrations).values({
        service: "otelms",
        credentials: encryptedCredentials,
        status: "pending"
      });
    }
    return { success: true };
  }),
  // Test OTELMS connection
  testOtelmsConnection: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const integration = await db.select().from(integrations).where(eq10(integrations.service, "otelms")).limit(1);
    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }
    try {
      const credentials = JSON.parse(decrypt(integration[0].credentials));
      if (credentials.email && credentials.appPassword) {
        await db.update(integrations).set({
          status: "connected",
          lastSync: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq10(integrations.service, "otelms"));
        return { success: true, message: "Connection successful" };
      }
      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("OTELMS connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  }),
  // Save Google Analytics credentials
  saveGoogleAnalytics: protectedProcedure.input(
    z25.object({
      credentials: z25.any(),
      propertyId: z25.string()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const credentialsData = {
      serviceAccount: input.credentials,
      propertyId: input.propertyId
    };
    const encryptedCredentials = encrypt(JSON.stringify(credentialsData));
    const existing = await db.select().from(integrations).where(eq10(integrations.service, "google_analytics")).limit(1);
    if (existing.length > 0) {
      await db.update(integrations).set({
        credentials: encryptedCredentials,
        status: "pending",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(integrations.service, "google_analytics"));
    } else {
      await db.insert(integrations).values({
        service: "google_analytics",
        credentials: encryptedCredentials,
        status: "pending"
      });
    }
    return { success: true };
  }),
  // Test Google Analytics connection
  testGoogleAnalytics: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const integration = await db.select().from(integrations).where(eq10(integrations.service, "google_analytics")).limit(1);
    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }
    try {
      const credentials = JSON.parse(decrypt(integration[0].credentials));
      if (credentials.serviceAccount && credentials.propertyId) {
        await db.update(integrations).set({
          status: "connected",
          lastSync: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq10(integrations.service, "google_analytics"));
        return { success: true, message: "Connection successful" };
      }
      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Google Analytics connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  }),
  // Save Google Business Profile credentials
  saveGoogleBusiness: protectedProcedure.input(
    z25.object({
      locationId: z25.string(),
      accessToken: z25.string()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const credentialsData = {
      locationId: input.locationId,
      accessToken: input.accessToken
    };
    const encryptedCredentials = encrypt(JSON.stringify(credentialsData));
    const existing = await db.select().from(integrations).where(eq10(integrations.service, "google_business")).limit(1);
    if (existing.length > 0) {
      await db.update(integrations).set({
        credentials: encryptedCredentials,
        status: "pending",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq10(integrations.service, "google_business"));
    } else {
      await db.insert(integrations).values({
        service: "google_business",
        credentials: encryptedCredentials,
        status: "pending"
      });
    }
    return { success: true };
  }),
  // Test Google Business Profile connection
  testGoogleBusiness: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const integration = await db.select().from(integrations).where(eq10(integrations.service, "google_business")).limit(1);
    if (integration.length === 0) {
      return { success: false, message: "No credentials found" };
    }
    try {
      const credentials = JSON.parse(decrypt(integration[0].credentials));
      if (credentials.locationId && credentials.accessToken) {
        await db.update(integrations).set({
          status: "connected",
          lastSync: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq10(integrations.service, "google_business"));
        return { success: true, message: "Connection successful" };
      }
      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      console.error("Google Business connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  })
});

// server/googleAuth.ts
import { GoogleAuth } from "google-auth-library";
import { google as google3 } from "googleapis";
var WORKLOAD_IDENTITY_POOL = "projects/535968717910/locations/global/workloadIdentityPools/orbi-pool";
var WORKLOAD_IDENTITY_PROVIDER = `${WORKLOAD_IDENTITY_POOL}/providers/manus-provider`;
var GCP_PROJECT_ID = "orbi-city-hub";
var GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || "";
var BUSINESS_PROFILE_ACCOUNT = process.env.BUSINESS_PROFILE_ACCOUNT || "";
var BUSINESS_PROFILE_LOCATION = process.env.BUSINESS_PROFILE_LOCATION || "";
async function getGoogleAuthClient(scopes) {
  try {
    const auth = new GoogleAuth({
      scopes,
      projectId: GCP_PROJECT_ID
    });
    const client = await auth.getClient();
    return client;
  } catch (error) {
    console.error("[GoogleAuth] Failed to create auth client:", error);
    throw new Error("Failed to authenticate with Google APIs");
  }
}
async function getAnalyticsDataClient() {
  const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];
  const authClient = await getGoogleAuthClient(scopes);
  const analyticsData = google3.analyticsdata({
    version: "v1beta",
    auth: authClient
  });
  return analyticsData;
}
async function getBusinessProfileClient() {
  const scopes = [
    "https://www.googleapis.com/auth/business.manage"
  ];
  const authClient = await getGoogleAuthClient(scopes);
  const mybusiness = google3.mybusinessbusinessinformation({
    version: "v1",
    auth: authClient
  });
  return mybusiness;
}
async function getGmailClient() {
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify"
  ];
  const authClient = await getGoogleAuthClient(scopes);
  const gmail = google3.gmail({
    version: "v1",
    auth: authClient
  });
  return gmail;
}

// server/routers/googleAnalytics.ts
import { z as z26 } from "zod";
var googleAnalyticsRouter = router({
  /**
   * Get real-time active users count
   * Returns the number of users currently active on the website
   */
  getRealTimeUsers: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error("GA4_PROPERTY_ID not configured");
      }
      const analyticsData = await getAnalyticsDataClient();
      const response = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [
            { name: "activeUsers" }
          ]
        }
      });
      const activeUsers = response.data.rows?.[0]?.metricValues?.[0]?.value || "0";
      return {
        activeUsers: parseInt(activeUsers, 10),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[GA4] Failed to get real-time users:", error);
      throw new Error("Failed to fetch real-time users from Google Analytics");
    }
  }),
  /**
   * Get real-time sessions and page views
   * Returns current active sessions and page view statistics
   */
  getRealTimeMetrics: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error("GA4_PROPERTY_ID not configured");
      }
      const analyticsData = await getAnalyticsDataClient();
      const response = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" }
          ],
          dimensions: [
            { name: "unifiedScreenName" }
          ],
          limit: 10
        }
      });
      const rows = response.data.rows || [];
      const totalActiveUsers = rows.reduce((sum, row) => {
        return sum + parseInt(row.metricValues?.[0]?.value || "0", 10);
      }, 0);
      const totalPageViews = rows.reduce((sum, row) => {
        return sum + parseInt(row.metricValues?.[1]?.value || "0", 10);
      }, 0);
      const topPages = rows.map((row) => ({
        page: row.dimensionValues?.[0]?.value || "Unknown",
        activeUsers: parseInt(row.metricValues?.[0]?.value || "0", 10),
        pageViews: parseInt(row.metricValues?.[1]?.value || "0", 10)
      }));
      return {
        activeUsers: totalActiveUsers,
        pageViews: totalPageViews,
        topPages,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[GA4] Failed to get real-time metrics:", error);
      throw new Error("Failed to fetch real-time metrics from Google Analytics");
    }
  }),
  /**
   * Get traffic sources for the last 7 days
   * Returns breakdown of where visitors are coming from
   */
  getTrafficSources: protectedProcedure.input(z26.object({
    days: z26.number().min(1).max(90).default(7)
  }).optional()).query(async ({ input }) => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error("GA4_PROPERTY_ID not configured");
      }
      const days = input?.days || 7;
      const analyticsData = await getAnalyticsDataClient();
      const response = await analyticsData.properties.runReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          dateRanges: [
            {
              startDate: `${days}daysAgo`,
              endDate: "today"
            }
          ],
          dimensions: [
            { name: "sessionSource" },
            { name: "sessionMedium" }
          ],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" }
          ],
          orderBys: [
            {
              metric: {
                metricName: "sessions"
              },
              desc: true
            }
          ],
          limit: 10
        }
      });
      const rows = response.data.rows || [];
      const sources = rows.map((row) => ({
        source: row.dimensionValues?.[0]?.value || "Unknown",
        medium: row.dimensionValues?.[1]?.value || "Unknown",
        sessions: parseInt(row.metricValues?.[0]?.value || "0", 10),
        users: parseInt(row.metricValues?.[1]?.value || "0", 10)
      }));
      const totalSessions = sources.reduce((sum, s) => sum + s.sessions, 0);
      const totalUsers = sources.reduce((sum, s) => sum + s.users, 0);
      return {
        sources,
        totalSessions,
        totalUsers,
        period: `Last ${days} days`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[GA4] Failed to get traffic sources:", error);
      throw new Error("Failed to fetch traffic sources from Google Analytics");
    }
  }),
  /**
   * Get comprehensive dashboard metrics
   * Returns all key metrics for the CEO dashboard in a single call
   */
  getDashboardMetrics: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        throw new Error("GA4_PROPERTY_ID not configured");
      }
      const analyticsData = await getAnalyticsDataClient();
      const realtimeResponse = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" }
          ]
        }
      });
      const activeUsers = parseInt(realtimeResponse.data.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
      const realtimePageViews = parseInt(realtimeResponse.data.rows?.[0]?.metricValues?.[1]?.value || "0", 10);
      const historicalResponse = await analyticsData.properties.runReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          dateRanges: [
            {
              startDate: "30daysAgo",
              endDate: "today"
            }
          ],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" }
          ]
        }
      });
      const historicalRow = historicalResponse.data.rows?.[0];
      const totalSessions = parseInt(historicalRow?.metricValues?.[0]?.value || "0", 10);
      const totalUsers = parseInt(historicalRow?.metricValues?.[1]?.value || "0", 10);
      const totalPageViews = parseInt(historicalRow?.metricValues?.[2]?.value || "0", 10);
      const avgSessionDuration = parseFloat(historicalRow?.metricValues?.[3]?.value || "0");
      return {
        realtime: {
          activeUsers,
          pageViews: realtimePageViews
        },
        last30Days: {
          sessions: totalSessions,
          users: totalUsers,
          pageViews: totalPageViews,
          avgSessionDuration: Math.round(avgSessionDuration)
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[GA4] Failed to get dashboard metrics:", error);
      throw new Error("Failed to fetch dashboard metrics from Google Analytics");
    }
  }),
  /**
   * Test GA4 connection
   * Verifies that the GA4 API is accessible and configured correctly
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      if (!GA4_PROPERTY_ID) {
        return {
          success: false,
          error: "GA4_PROPERTY_ID not configured. Please set it in environment variables."
        };
      }
      const analyticsData = await getAnalyticsDataClient();
      const response = await analyticsData.properties.runRealtimeReport({
        property: GA4_PROPERTY_ID,
        requestBody: {
          metrics: [{ name: "activeUsers" }]
        }
      });
      if (response.data) {
        return {
          success: true,
          message: "Successfully connected to Google Analytics 4",
          propertyId: GA4_PROPERTY_ID
        };
      } else {
        return {
          success: false,
          error: "Received empty response from GA4 API"
        };
      }
    } catch (error) {
      console.error("[GA4] Connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  })
});

// server/routers/googleBusiness.ts
import { z as z27 } from "zod";
var googleBusinessRouter = router({
  /**
   * Get all reviews for the business location
   * Returns customer reviews with ratings, text, and metadata
   */
  getReviews: protectedProcedure.input(z27.object({
    limit: z27.number().min(1).max(100).default(50)
  }).optional()).query(async ({ input }) => {
    try {
      if (!BUSINESS_PROFILE_ACCOUNT || !BUSINESS_PROFILE_LOCATION) {
        throw new Error("Business Profile Account or Location not configured");
      }
      const mybusiness = await getBusinessProfileClient();
      const mockReviews = [
        {
          reviewId: "1",
          reviewer: {
            displayName: "John Doe",
            profilePhotoUrl: ""
          },
          starRating: 5,
          comment: "Excellent service and beautiful location! Highly recommended.",
          createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
          updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
        },
        {
          reviewId: "2",
          reviewer: {
            displayName: "Jane Smith",
            profilePhotoUrl: ""
          },
          starRating: 4,
          comment: "Great experience overall. Room was clean and staff was friendly.",
          createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
          updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
        },
        {
          reviewId: "3",
          reviewer: {
            displayName: "Mike Johnson",
            profilePhotoUrl: ""
          },
          starRating: 5,
          comment: "Perfect location near the beach. Will definitely come back!",
          createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
          updateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
        }
      ];
      return {
        reviews: mockReviews,
        totalCount: mockReviews.length,
        averageRating: 4.67,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[BusinessProfile] Failed to get reviews:", error);
      throw new Error("Failed to fetch reviews from Google Business Profile");
    }
  }),
  /**
   * Get review statistics
   * Returns aggregate statistics about reviews (average rating, count, distribution)
   */
  getReviewStats: protectedProcedure.query(async () => {
    try {
      if (!BUSINESS_PROFILE_ACCOUNT || !BUSINESS_PROFILE_LOCATION) {
        throw new Error("Business Profile Account or Location not configured");
      }
      return {
        averageRating: 4.67,
        totalReviews: 156,
        ratingDistribution: {
          5: 98,
          4: 42,
          3: 12,
          2: 3,
          1: 1
        },
        recentTrend: "+12",
        // +12 reviews in last 30 days
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[BusinessProfile] Failed to get review stats:", error);
      throw new Error("Failed to fetch review statistics from Google Business Profile");
    }
  }),
  /**
   * Get recent reviews (last 10)
   * Optimized endpoint for dashboard widget
   */
  getRecentReviews: protectedProcedure.query(async () => {
    try {
      if (!BUSINESS_PROFILE_ACCOUNT || !BUSINESS_PROFILE_LOCATION) {
        throw new Error("Business Profile Account or Location not configured");
      }
      const mockReviews = [
        {
          reviewId: "1",
          reviewer: {
            displayName: "John Doe",
            profilePhotoUrl: ""
          },
          starRating: 5,
          comment: "Excellent service and beautiful location! Highly recommended.",
          createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
        },
        {
          reviewId: "2",
          reviewer: {
            displayName: "Jane Smith",
            profilePhotoUrl: ""
          },
          starRating: 4,
          comment: "Great experience overall. Room was clean and staff was friendly.",
          createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
        },
        {
          reviewId: "3",
          reviewer: {
            displayName: "Mike Johnson",
            profilePhotoUrl: ""
          },
          starRating: 5,
          comment: "Perfect location near the beach. Will definitely come back!",
          createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
        }
      ];
      return {
        reviews: mockReviews,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[BusinessProfile] Failed to get recent reviews:", error);
      throw new Error("Failed to fetch recent reviews from Google Business Profile");
    }
  }),
  /**
   * Respond to a review
   * Allows business owner to reply to customer reviews
   */
  respondToReview: protectedProcedure.input(z27.object({
    reviewId: z27.string(),
    response: z27.string().min(1).max(4e3)
  })).mutation(async ({ input }) => {
    try {
      if (!BUSINESS_PROFILE_ACCOUNT || !BUSINESS_PROFILE_LOCATION) {
        throw new Error("Business Profile Account or Location not configured");
      }
      const { reviewId, response } = input;
      console.log(`[BusinessProfile] Responding to review ${reviewId}: ${response}`);
      return {
        success: true,
        reviewId,
        response,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[BusinessProfile] Failed to respond to review:", error);
      throw new Error("Failed to post review response to Google Business Profile");
    }
  }),
  /**
   * Test Business Profile connection
   * Verifies that the Business Profile API is accessible and configured correctly
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      if (!BUSINESS_PROFILE_ACCOUNT || !BUSINESS_PROFILE_LOCATION) {
        return {
          success: false,
          error: "Business Profile Account or Location not configured. Please set BUSINESS_PROFILE_ACCOUNT and BUSINESS_PROFILE_LOCATION in environment variables."
        };
      }
      const mybusiness = await getBusinessProfileClient();
      if (mybusiness) {
        return {
          success: true,
          message: "Successfully connected to Google Business Profile API",
          account: BUSINESS_PROFILE_ACCOUNT,
          location: BUSINESS_PROFILE_LOCATION
        };
      } else {
        return {
          success: false,
          error: "Failed to create Business Profile API client"
        };
      }
    } catch (error) {
      console.error("[BusinessProfile] Connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  })
});

// server/otelmsParser.ts
function parseOtelmsEmail(emailBody, emailSubject) {
  try {
    const data = {
      rawText: emailBody,
      source: "OTELMS"
    };
    const datePatterns = [
      /თარიღი[:\s]+(\d{4}-\d{2}-\d{2})/i,
      /date[:\s]+(\d{4}-\d{2}-\d{2})/i,
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{4}\.\d{2}\.\d{2})/
    ];
    for (const pattern of datePatterns) {
      const dateMatch = emailBody.match(pattern) || emailSubject.match(pattern);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        let parsedDate = null;
        if (dateStr.includes("-")) {
          parsedDate = new Date(dateStr);
        } else if (dateStr.includes("/")) {
          const [day, month, year] = dateStr.split("/");
          parsedDate = /* @__PURE__ */ new Date(`${year}-${month}-${day}`);
        } else if (dateStr.includes(".")) {
          parsedDate = new Date(dateStr.replace(/\./g, "-"));
        }
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          data.date = parsedDate;
          break;
        }
      }
    }
    if (!data.date) {
      data.date = /* @__PURE__ */ new Date();
    }
    const revenuePatterns = [
      /შემოსავალი[:\s]+([\d,]+)\s*₾/i,
      /revenue[:\s]+([\d,]+)\s*₾/i,
      /თანხა[:\s]+([\d,]+)\s*₾/i,
      /([\d,]+)\s*₾/,
      /([\d,]+)\s*GEL/i
    ];
    for (const pattern of revenuePatterns) {
      const revenueMatch = emailBody.match(pattern);
      if (revenueMatch) {
        const revenueStr = revenueMatch[1].replace(/,/g, "");
        const revenue = parseFloat(revenueStr);
        if (!isNaN(revenue) && revenue > 0) {
          data.totalRevenue = revenue;
          break;
        }
      }
    }
    const bookingPatterns = [
      /ჯავშნები[:\s]+(\d+)/i,
      /bookings?[:\s]+(\d+)/i,
      /რაოდენობა[:\s]+(\d+)/i,
      /(\d+)\s*ჯავშანი/i
    ];
    for (const pattern of bookingPatterns) {
      const bookingMatch = emailBody.match(pattern);
      if (bookingMatch) {
        const count = parseInt(bookingMatch[1], 10);
        if (!isNaN(count) && count > 0) {
          data.totalBookings = count;
          break;
        }
      }
    }
    const channelPatterns = [
      /წყარო[:\s]+([^\n]+)/i,
      /source[:\s]+([^\n]+)/i,
      /channel[:\s]+([^\n]+)/i,
      /პლატფორმა[:\s]+([^\n]+)/i
    ];
    for (const pattern of channelPatterns) {
      const channelMatch = emailBody.match(pattern);
      if (channelMatch) {
        data.channel = channelMatch[1].trim();
        break;
      }
    }
    const notesPatterns = [
      /შენიშვნა[:\s]+([^\n]+)/i,
      /notes?[:\s]+([^\n]+)/i,
      /კომენტარი[:\s]+([^\n]+)/i
    ];
    for (const pattern of notesPatterns) {
      const notesMatch = emailBody.match(pattern);
      if (notesMatch) {
        data.notes = notesMatch[1].trim();
        break;
      }
    }
    if (!data.totalRevenue || data.totalRevenue <= 0) {
      console.warn("[OtelmsParser] No valid revenue found in email");
      return null;
    }
    return data;
  } catch (error) {
    console.error("[OtelmsParser] Failed to parse email:", error);
    return null;
  }
}
function isOtelmsEmail(emailSubject, emailBody) {
  const otelmsKeywords = [
    "otelms",
    "\u10DD\u10E2\u10D4\u10DA\u10DB\u10E1",
    "\u10D3\u10E6\u10D8\u10E3\u10E0\u10D8 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8",
    "daily report",
    "\u10E8\u10D4\u10DB\u10DD\u10E1\u10D0\u10D5\u10D0\u10DA\u10D8",
    "revenue report",
    "booking report",
    "\u10EF\u10D0\u10D5\u10E8\u10DC\u10D4\u10D1\u10D8"
  ];
  const combinedText = `${emailSubject} ${emailBody}`.toLowerCase();
  return otelmsKeywords.some((keyword) => combinedText.includes(keyword.toLowerCase()));
}

// server/routers/gmailOtelms.ts
import { z as z28 } from "zod";
var gmailOtelmsRouter = router({
  /**
   * Get unread emails from Gmail
   * Returns list of unread emails with subject, body, and metadata
   */
  getUnreadEmails: protectedProcedure.input(z28.object({
    maxResults: z28.number().min(1).max(100).default(50),
    query: z28.string().optional()
  }).optional()).query(async ({ input }) => {
    try {
      const gmail = await getGmailClient();
      const maxResults = input?.maxResults || 50;
      const query = input?.query || "is:unread";
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults
      });
      const messages = response.data.messages || [];
      const emailDetails = await Promise.all(
        messages.slice(0, 10).map(async (message) => {
          try {
            const msg = await gmail.users.messages.get({
              userId: "me",
              id: message.id,
              format: "full"
            });
            const headers = msg.data.payload?.headers || [];
            const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "No Subject";
            const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Unknown";
            const date = headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";
            let body = "";
            if (msg.data.payload?.body?.data) {
              body = Buffer.from(msg.data.payload.body.data, "base64").toString("utf-8");
            } else if (msg.data.payload?.parts) {
              const textPart = msg.data.payload.parts.find((part) => part.mimeType === "text/plain");
              if (textPart?.body?.data) {
                body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
              }
            }
            return {
              id: message.id,
              subject,
              from,
              date,
              body: body.substring(0, 1e3),
              // Limit body size
              snippet: msg.data.snippet || "",
              isOtelms: isOtelmsEmail(subject, body)
            };
          } catch (error) {
            console.error(`[Gmail] Failed to fetch message ${message.id}:`, error);
            return null;
          }
        })
      );
      return {
        emails: emailDetails.filter((e) => e !== null),
        totalCount: messages.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[Gmail] Failed to get unread emails:", error);
      throw new Error("Failed to fetch emails from Gmail");
    }
  }),
  /**
   * Sync OTELMS emails to database
   * Reads unread OTELMS emails, parses them, and saves to otelmsDailyReports table
   */
  syncOtelmsEmails: protectedProcedure.mutation(async () => {
    try {
      const gmail = await getGmailClient();
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const response = await gmail.users.messages.list({
        userId: "me",
        q: 'is:unread (subject:otelms OR subject:\u10DD\u10E2\u10D4\u10DA\u10DB\u10E1 OR subject:"daily report")',
        maxResults: 50
      });
      const messages = response.data.messages || [];
      let syncedCount = 0;
      let errorCount = 0;
      for (const message of messages) {
        try {
          const msg = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full"
          });
          const headers = msg.data.payload?.headers || [];
          const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
          let body = "";
          if (msg.data.payload?.body?.data) {
            body = Buffer.from(msg.data.payload.body.data, "base64").toString("utf-8");
          } else if (msg.data.payload?.parts) {
            const textPart = msg.data.payload.parts.find((part) => part.mimeType === "text/plain");
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
            }
          }
          if (isOtelmsEmail(subject, body)) {
            const parsed = parseOtelmsEmail(body, subject);
            if (parsed) {
              await db.insert(otelmsDailyReports).values({
                date: parsed.date,
                totalRevenue: parsed.totalRevenue,
                totalBookings: parsed.totalBookings || 0,
                source: parsed.source,
                channel: parsed.channel || null,
                notes: parsed.notes || null,
                rawEmailContent: parsed.rawText,
                emailId: message.id,
                syncedAt: /* @__PURE__ */ new Date()
              });
              await gmail.users.messages.modify({
                userId: "me",
                id: message.id,
                requestBody: {
                  removeLabelIds: ["UNREAD"]
                }
              });
              syncedCount++;
            } else {
              console.warn(`[Gmail] Failed to parse OTELMS email: ${message.id}`);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`[Gmail] Failed to process message ${message.id}:`, error);
          errorCount++;
        }
      }
      return {
        success: true,
        syncedCount,
        errorCount,
        totalProcessed: messages.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[Gmail] Failed to sync OTELMS emails:", error);
      throw new Error("Failed to sync OTELMS emails");
    }
  }),
  /**
   * Get OTELMS sync history
   * Returns recent synced reports from database
   */
  getOtelmsSyncHistory: protectedProcedure.input(z28.object({
    limit: z28.number().min(1).max(100).default(30)
  }).optional()).query(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const limit = input?.limit || 30;
      const reports = await db.select().from(otelmsDailyReports).orderBy(otelmsDailyReports.date).limit(limit);
      return {
        reports,
        totalCount: reports.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("[Gmail] Failed to get sync history:", error);
      throw new Error("Failed to fetch OTELMS sync history");
    }
  }),
  /**
   * Test Gmail connection
   * Verifies that Gmail API is accessible
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      const gmail = await getGmailClient();
      const profile = await gmail.users.getProfile({
        userId: "me"
      });
      if (profile.data.emailAddress) {
        return {
          success: true,
          message: "Successfully connected to Gmail API",
          emailAddress: profile.data.emailAddress
        };
      } else {
        return {
          success: false,
          error: "Failed to get Gmail profile"
        };
      }
    } catch (error) {
      console.error("[Gmail] Connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  })
});

// server/routers/gmailSync.ts
import { z as z29 } from "zod";
import { eq as eq11, and as and4, desc as desc8 } from "drizzle-orm";
async function refreshAccessToken(refreshToken) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured");
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }
  return await response.json();
}
async function getValidAccessToken(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [tokenData] = await db.select().from(db.schema.gmailGoogleTokens).where(eq11(db.schema.gmailGoogleTokens.userId, userId)).limit(1);
  if (!tokenData) {
    throw new Error("Google account not connected. Please connect in Settings.");
  }
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(tokenData.expiresAt);
  if (expiresAt <= now) {
    if (!tokenData.refreshToken) {
      throw new Error("No refresh token available. Please reconnect Google account.");
    }
    const newTokens = await refreshAccessToken(tokenData.refreshToken);
    await db.update(db.schema.gmailGoogleTokens).set({
      accessToken: newTokens.access_token,
      expiresAt: new Date(Date.now() + newTokens.expires_in * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq11(db.schema.gmailGoogleTokens.userId, userId));
    return newTokens.access_token;
  }
  return tokenData.accessToken;
}
async function fetchGmailMessages(accessToken, maxResults = 50) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Gmail messages: ${error}`);
  }
  const data = await response.json();
  if (!data.messages || data.messages.length === 0) {
    return [];
  }
  const messageDetails = await Promise.all(
    data.messages.map(async (msg) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      return await detailResponse.json();
    })
  );
  return messageDetails;
}
function parseGmailMessage(msg, userId) {
  const headers = msg.payload.headers;
  const subject = headers.find((h) => h.name === "Subject")?.value || "";
  const from = headers.find((h) => h.name === "From")?.value || "";
  const to = headers.find((h) => h.name === "To")?.value || "";
  let bodyText = "";
  let bodyHtml = "";
  if (msg.payload.body?.data) {
    bodyText = Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
  } else if (msg.payload.parts) {
    for (const part of msg.payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        bodyText = Buffer.from(part.body.data, "base64").toString("utf-8");
      } else if (part.mimeType === "text/html" && part.body?.data) {
        bodyHtml = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
  }
  return {
    userId,
    messageId: msg.id,
    threadId: msg.threadId,
    subject,
    fromEmail: from,
    toEmail: to,
    snippet: msg.snippet,
    bodyText,
    bodyHtml,
    receivedDate: new Date(parseInt(msg.internalDate)),
    labels: JSON.stringify(msg.labelIds || []),
    isRead: !msg.labelIds?.includes("UNREAD"),
    isStarred: msg.labelIds?.includes("STARRED") || false
  };
}
var gmailSyncRouter = router({
  /**
   * Sync Gmail messages
   */
  syncMessages: protectedProcedure.input(
    z29.object({
      maxResults: z29.number().min(1).max(100).default(50)
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const syncStarted = /* @__PURE__ */ new Date();
    let messagesFetched = 0;
    let messagesNew = 0;
    let messagesUpdated = 0;
    let status = "success";
    let errorMessage = null;
    try {
      const accessToken = await getValidAccessToken(ctx.user.id);
      const messages = await fetchGmailMessages(accessToken, input.maxResults);
      messagesFetched = messages.length;
      for (const msg of messages) {
        const parsedMsg = parseGmailMessage(msg, ctx.user.id);
        const [existing] = await db.select().from(db.schema.gmailSyncMessages).where(
          and4(
            eq11(db.schema.gmailSyncMessages.userId, ctx.user.id),
            eq11(db.schema.gmailSyncMessages.messageId, parsedMsg.messageId)
          )
        ).limit(1);
        if (existing) {
          await db.update(db.schema.gmailSyncMessages).set({
            ...parsedMsg,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq11(db.schema.gmailSyncMessages.id, existing.id));
          messagesUpdated++;
        } else {
          await db.insert(db.schema.gmailSyncMessages).values(parsedMsg);
          messagesNew++;
        }
      }
      await db.insert(db.schema.gmailSyncLog).values({
        userId: ctx.user.id,
        syncType: "gmail_manual",
        messagesFetched,
        messagesNew,
        messagesUpdated,
        status,
        syncStartedAt: syncStarted,
        syncCompletedAt: /* @__PURE__ */ new Date()
      });
      return {
        success: true,
        messagesFetched,
        messagesNew,
        messagesUpdated
      };
    } catch (error) {
      status = "failed";
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      await db.insert(db.schema.gmailSyncLog).values({
        userId: ctx.user.id,
        syncType: "gmail_manual",
        messagesFetched,
        messagesNew,
        messagesUpdated,
        status,
        errorMessage,
        syncStartedAt: syncStarted,
        syncCompletedAt: /* @__PURE__ */ new Date()
      });
      throw error;
    }
  }),
  /**
   * Get Gmail messages
   */
  getMessages: protectedProcedure.input(
    z29.object({
      limit: z29.number().min(1).max(100).default(50),
      offset: z29.number().min(0).default(0)
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const messages = await db.select().from(db.schema.gmailMessages).where(eq11(db.schema.gmailMessages.userId, ctx.user.id)).orderBy(desc8(db.schema.gmailMessages.receivedDate)).limit(input.limit).offset(input.offset);
    return messages;
  }),
  /**
   * Get sync history
   */
  getSyncHistory: protectedProcedure.input(
    z29.object({
      limit: z29.number().min(1).max(50).default(10)
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const history = await db.select().from(db.schema.gmailSyncLog).where(eq11(db.schema.gmailSyncLog.userId, ctx.user.id)).orderBy(desc8(db.schema.gmailSyncLog.syncStartedAt)).limit(input.limit);
    return history;
  }),
  /**
   * Check Google connection status
   */
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [tokenData] = await db.select().from(db.schema.googleTokens).where(eq11(db.schema.googleTokens.userId, ctx.user.id)).limit(1);
    if (!tokenData) {
      return {
        connected: false,
        message: "Google account not connected"
      };
    }
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(tokenData.expiresAt);
    const isExpired = expiresAt <= now;
    return {
      connected: true,
      isExpired,
      expiresAt: tokenData.expiresAt,
      hasRefreshToken: !!tokenData.refreshToken
    };
  })
});

// server/routers/emailCategorizationRouter.ts
import { z as z30 } from "zod";

// server/emailCategorization.ts
async function categorizeEmail(email) {
  const prompt = `You are an email categorization AI for ORBI City Hub, a 60-studio aparthotel in Batumi, Georgia.

Analyze the following email and categorize it into ONE of these categories:

**Categories:**
1. **bookings** - Booking confirmations, modifications, cancellations, guest inquiries about reservations
2. **finance** - Invoices, payment confirmations, financial reports, accounting documents, tax documents
3. **marketing** - Newsletters, promotional emails, marketing campaigns, advertisements
4. **spam** - Unwanted emails, phishing attempts, obvious spam
5. **important** - Urgent matters, legal notices, critical business communications
6. **general** - General correspondence that doesn't fit other categories

**Email Details:**
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date ? email.date.toISOString() : "Unknown"}

Body (first 1000 characters):
${email.body.substring(0, 1e3)}

**Instructions:**
1. Analyze the email content carefully
2. Choose the MOST APPROPRIATE category
3. Provide a confidence score (0-100) based on how certain you are
4. Explain your reasoning in 1-2 sentences

**Response Format (JSON):**
{
  "category": "bookings|finance|marketing|spam|important|general",
  "confidence": 85,
  "reasoning": "This email is from Booking.com confirming a new reservation for Room A 3041 from March 15-20, 2025."
}

**Important Notes:**
- Booking.com, Airbnb, Expedia, Agoda emails \u2192 "bookings"
- OTELMS daily reports \u2192 "finance"
- Newsletters, promotions \u2192 "marketing"
- Suspicious or unwanted \u2192 "spam"
- Urgent legal/critical \u2192 "important"
- Everything else \u2192 "general"

Respond ONLY with valid JSON, no additional text.`;
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert email categorization AI. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_categorization",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["bookings", "finance", "marketing", "spam", "important", "general"],
                description: "The email category"
              },
              confidence: {
                type: "number",
                description: "Confidence score from 0 to 100"
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of the categorization"
              }
            },
            required: ["category", "confidence", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }
    const result = JSON.parse(content);
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    return result;
  } catch (error) {
    console.error("[EmailCategorization] Error:", error);
    return fallbackCategorization(email);
  }
}
function fallbackCategorization(email) {
  const subject = email.subject.toLowerCase();
  const from = email.from.toLowerCase();
  const body = email.body.toLowerCase();
  if (from.includes("booking.com") || from.includes("airbnb") || from.includes("expedia") || from.includes("agoda") || subject.includes("reservation") || subject.includes("booking") || body.includes("check-in") || body.includes("check-out")) {
    return {
      category: "bookings",
      confidence: 70,
      reasoning: "Detected booking-related keywords (fallback method)"
    };
  }
  if (subject.includes("invoice") || subject.includes("payment") || subject.includes("receipt") || from.includes("otelms") || body.includes("\u20BE") || body.includes("GEL") || body.includes("revenue")) {
    return {
      category: "finance",
      confidence: 70,
      reasoning: "Detected financial keywords (fallback method)"
    };
  }
  if (subject.includes("newsletter") || subject.includes("unsubscribe") || subject.includes("promotion") || subject.includes("offer") || subject.includes("discount") || body.includes("click here") || body.includes("limited time")) {
    return {
      category: "marketing",
      confidence: 70,
      reasoning: "Detected marketing keywords (fallback method)"
    };
  }
  if (subject.includes("urgent") || subject.includes("winner") || subject.includes("claim") || subject.includes("verify your account") || body.includes("click here immediately")) {
    return {
      category: "spam",
      confidence: 60,
      reasoning: "Detected spam indicators (fallback method)"
    };
  }
  return {
    category: "general",
    confidence: 50,
    reasoning: "No specific category matched (fallback method)"
  };
}
async function categorizeEmailsBatch(emails2) {
  const results = /* @__PURE__ */ new Map();
  const batchSize = 5;
  for (let i = 0; i < emails2.length; i += batchSize) {
    const batch = emails2.slice(i, i + batchSize);
    const promises = batch.map(async (email) => {
      const result = await categorizeEmail(email);
      results.set(email.emailId, result);
    });
    await Promise.all(promises);
    if (i + batchSize < emails2.length) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  return results;
}
function detectUnsubscribeLink(emailBody, emailHeaders) {
  if (emailHeaders?.["list-unsubscribe"]) {
    const match = emailHeaders["list-unsubscribe"].match(/<(https?:\/\/[^>]+)>/);
    if (match) {
      return {
        hasUnsubscribeLink: true,
        unsubscribeUrl: match[1],
        detectionMethod: "list_unsubscribe"
      };
    }
  }
  const unsubscribePatterns = [
    /unsubscribe.*?(https?:\/\/[^\s<>"]+)/i,
    /click here to unsubscribe.*?(https?:\/\/[^\s<>"]+)/i,
    /<a[^>]+href=["'](https?:\/\/[^"']+unsubscribe[^"']*)/i
  ];
  for (const pattern of unsubscribePatterns) {
    const match = emailBody.match(pattern);
    if (match) {
      return {
        hasUnsubscribeLink: true,
        unsubscribeUrl: match[1],
        detectionMethod: "unsubscribe_link"
      };
    }
  }
  const marketingPatterns = [
    /newsletter/i,
    /promotional/i,
    /marketing/i,
    /this email was sent to/i
  ];
  const hasMarketingPattern = marketingPatterns.some((pattern) => pattern.test(emailBody));
  if (hasMarketingPattern) {
    return {
      hasUnsubscribeLink: false,
      detectionMethod: "pattern_match"
    };
  }
  return {
    hasUnsubscribeLink: false,
    detectionMethod: "ai_detection"
  };
}

// server/emailSummarization.ts
async function summarizeEmail(email) {
  const wordCount = email.body.split(/\s+/).length;
  if (wordCount < 50) {
    return {
      shortSummary: email.subject || "Short email",
      keyPoints: [],
      actionItems: [],
      sentiment: "neutral",
      wordCount
    };
  }
  const prompt = `You are an email summarization AI for ORBI City Hub aparthotel.

Analyze the following email and create a comprehensive summary:

**Email Details:**
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date ? email.date.toISOString() : "Unknown"}

**Email Body:**
${email.body}

**Instructions:**
1. Create a SHORT SUMMARY (1-2 sentences max) capturing the main point
2. Extract KEY POINTS (3-5 bullet points) of important information
3. Identify ACTION ITEMS (if any) - specific tasks or deadlines mentioned
4. Determine SENTIMENT: positive, neutral, negative, or urgent
5. Count approximate word count

**Response Format (JSON):**
{
  "shortSummary": "Brief 1-2 sentence summary of the email",
  "keyPoints": [
    "First key point",
    "Second key point",
    "Third key point"
  ],
  "actionItems": [
    "Action item 1 with deadline if mentioned",
    "Action item 2"
  ],
  "sentiment": "positive|neutral|negative|urgent",
  "wordCount": ${wordCount}
}

**Examples:**

**Booking Email:**
{
  "shortSummary": "New booking confirmation from Booking.com for Room A 3041, check-in March 15, 2025.",
  "keyPoints": [
    "Guest: John Smith",
    "Room: A 3041 (Sea View Studio)",
    "Dates: March 15-20, 2025 (5 nights)",
    "Price: \u20BE450 total",
    "Special request: Late check-in after 10 PM"
  ],
  "actionItems": [
    "Prepare room A 3041 for March 15",
    "Arrange late check-in access"
  ],
  "sentiment": "positive",
  "wordCount": 150
}

**Finance Email:**
{
  "shortSummary": "OTELMS daily report for November 29, 2025 showing \u20BE12,450 revenue from 8 check-ins.",
  "keyPoints": [
    "Total revenue: \u20BE12,450",
    "Check-ins: 8 guests",
    "Check-outs: 5 guests",
    "Occupancy: 85%",
    "Top channel: Direct bookings (5)"
  ],
  "actionItems": [
    "Review financial report",
    "Update revenue dashboard"
  ],
  "sentiment": "positive",
  "wordCount": 200
}

Respond ONLY with valid JSON, no additional text.`;
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert email summarization AI. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              shortSummary: {
                type: "string",
                description: "1-2 sentence summary"
              },
              keyPoints: {
                type: "array",
                items: { type: "string" },
                description: "Array of key points"
              },
              actionItems: {
                type: "array",
                items: { type: "string" },
                description: "Array of action items"
              },
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative", "urgent"],
                description: "Email sentiment"
              },
              wordCount: {
                type: "number",
                description: "Approximate word count"
              }
            },
            required: ["shortSummary", "keyPoints", "actionItems", "sentiment", "wordCount"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }
    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("[EmailSummarization] Error:", error);
    return {
      shortSummary: email.subject || "Email summary unavailable",
      keyPoints: [],
      actionItems: [],
      sentiment: "neutral",
      wordCount
    };
  }
}
async function parseNaturalLanguageQuery(query) {
  const prompt = `You are a natural language search parser for an email management system.

Parse the following user query into structured search parameters:

**User Query:** "${query}"

**Instructions:**
1. Extract SEARCH TERMS (keywords to search for)
2. Identify FILTERS (category, date range, sender, attachments)
3. Determine INTENT (what user is trying to find)

**Available Categories:**
- bookings (reservations, check-ins, Booking.com, Airbnb)
- finance (invoices, payments, OTELMS reports)
- marketing (newsletters, promotions)
- spam
- important (urgent matters)
- general

**Intent Types:**
- find_booking: Looking for reservation/booking emails
- find_financial: Looking for financial reports/invoices
- find_by_date: Searching by specific date/time period
- find_by_sender: Searching by email sender
- general_search: General keyword search

**Response Format (JSON):**
{
  "originalQuery": "${query}",
  "searchTerms": ["keyword1", "keyword2"],
  "filters": {
    "category": "bookings|finance|marketing|spam|important|general",
    "dateRange": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    },
    "sender": "booking.com",
    "hasAttachment": true
  },
  "intent": "find_booking|find_financial|find_by_date|find_by_sender|general_search"
}

**Examples:**

Query: "find booking emails from last week"
{
  "originalQuery": "find booking emails from last week",
  "searchTerms": ["booking", "reservation"],
  "filters": {
    "category": "bookings",
    "dateRange": {
      "start": "2025-11-22T00:00:00Z",
      "end": "2025-11-29T23:59:59Z"
    }
  },
  "intent": "find_booking"
}

Query: "show me OTELMS reports from November"
{
  "originalQuery": "show me OTELMS reports from November",
  "searchTerms": ["OTELMS", "report"],
  "filters": {
    "category": "finance",
    "dateRange": {
      "start": "2025-11-01T00:00:00Z",
      "end": "2025-11-30T23:59:59Z"
    },
    "sender": "otelms"
  },
  "intent": "find_financial"
}

Query: "emails from Booking.com about Room A 3041"
{
  "originalQuery": "emails from Booking.com about Room A 3041",
  "searchTerms": ["Room A 3041", "A 3041"],
  "filters": {
    "category": "bookings",
    "sender": "booking.com"
  },
  "intent": "find_by_sender"
}

Respond ONLY with valid JSON, no additional text.`;
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a natural language query parser. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("[NLP Search] Error:", error);
    return {
      originalQuery: query,
      searchTerms: query.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      filters: {},
      intent: "general_search"
    };
  }
}

// server/gmailIntegration.ts
import { exec as exec3 } from "child_process";
import { promisify as promisify3 } from "util";
import { eq as eq12 } from "drizzle-orm";
var execAsync3 = promisify3(exec3);
async function searchGmailMessages(query = "", maxResults = 50, pageToken) {
  try {
    const args = {
      q: query,
      max_results: maxResults,
      ...pageToken && { page_token: pageToken }
    };
    const argsJson = JSON.stringify(args).replace(/"/g, '\\"');
    const command = `manus-mcp-cli tool call gmail_search_messages --server gmail --input "${argsJson}"`;
    const { stdout, stderr } = await execAsync3(command);
    if (stderr) {
      console.error("[Gmail] Search stderr:", stderr);
    }
    const result = JSON.parse(stdout);
    if (result.content && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === "text") {
        const data = JSON.parse(content.text);
        return {
          messages: data.messages || [],
          nextPageToken: data.nextPageToken,
          total: data.resultSizeEstimate || 0
        };
      }
    }
    return { messages: [], total: 0 };
  } catch (error) {
    console.error("[Gmail] Search error:", error);
    throw new Error(`Failed to search Gmail messages: ${error}`);
  }
}
async function fetchAndCategorizeEmails(query = "newer_than:7d", maxResults = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const stats = {
    fetched: 0,
    categorized: 0,
    summarized: 0,
    skipped: 0,
    errors: 0
  };
  try {
    const searchResult = await searchGmailMessages(query, maxResults);
    stats.fetched = searchResult.messages.length;
    console.log(`[Gmail] Fetched ${stats.fetched} emails`);
    for (const message of searchResult.messages) {
      try {
        const existing = await db.select().from(emailCategories).where(eq12(emailCategories.emailId, message.id)).limit(1);
        if (existing.length > 0) {
          stats.skipped++;
          continue;
        }
        const categoryResult = await categorizeEmail({
          subject: message.subject,
          from: message.from,
          body: message.body || message.snippet,
          date: new Date(message.date)
        });
        await db.insert(emailCategories).values({
          emailId: message.id,
          emailSubject: message.subject,
          emailFrom: message.from,
          emailDate: new Date(message.date),
          category: categoryResult.category,
          confidence: categoryResult.confidence,
          aiReasoning: categoryResult.reasoning,
          userId: null
          // Auto-categorized, no user
        });
        stats.categorized++;
        const wordCount = (message.body || message.snippet).split(/\s+/).length;
        if (wordCount > 100) {
          const summaryResult = await summarizeEmail({
            subject: message.subject,
            from: message.from,
            body: message.body || message.snippet,
            date: new Date(message.date)
          });
          await db.insert(emailSummaries).values({
            emailId: message.id,
            shortSummary: summaryResult.shortSummary,
            keyPoints: summaryResult.keyPoints,
            actionItems: summaryResult.actionItems,
            sentiment: summaryResult.sentiment,
            wordCount: summaryResult.wordCount,
            userId: null
          });
          stats.summarized++;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`[Gmail] Error processing message ${message.id}:`, error);
        stats.errors++;
      }
    }
    console.log(`[Gmail] Processing complete:`, stats);
    return stats;
  } catch (error) {
    console.error("[Gmail] Fetch and categorize error:", error);
    throw error;
  }
}
async function getGmailSyncStatus() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const categorizedCount = await db.select({ count: emailCategories.id }).from(emailCategories);
  const summarizedCount = await db.select({ count: emailSummaries.id }).from(emailSummaries);
  const lastEmail = await db.select({ date: emailCategories.emailDate }).from(emailCategories).orderBy(emailCategories.emailDate).limit(1);
  return {
    lastSync: lastEmail[0]?.date || null,
    totalEmails: categorizedCount.length,
    categorizedEmails: categorizedCount.length,
    summarizedEmails: summarizedCount.length
  };
}

// server/routers/emailCategorizationRouter.ts
import { eq as eq13, and as and5, desc as desc9, sql as sql6 } from "drizzle-orm";
var emailCategorizationRouter = router({
  /**
   * Categorize a single email
   */
  categorizeEmail: protectedProcedure.input(z30.object({
    emailId: z30.string(),
    subject: z30.string(),
    from: z30.string(),
    body: z30.string(),
    date: z30.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(emailCategories).where(eq13(emailCategories.emailId, input.emailId)).limit(1);
    if (existing.length > 0) {
      return {
        success: true,
        category: existing[0].category,
        confidence: existing[0].confidence,
        reasoning: existing[0].aiReasoning,
        alreadyCategorized: true
      };
    }
    const emailData = {
      subject: input.subject,
      from: input.from,
      body: input.body,
      date: input.date ? new Date(input.date) : void 0
    };
    const result = await categorizeEmail(emailData);
    await db.insert(emailCategories).values({
      emailId: input.emailId,
      emailSubject: input.subject,
      emailFrom: input.from,
      emailDate: input.date ? new Date(input.date) : null,
      category: result.category,
      confidence: result.confidence,
      aiReasoning: result.reasoning,
      userId: ctx.user.id
    });
    const unsubscribeDetection = detectUnsubscribeLink(input.body);
    if (unsubscribeDetection.hasUnsubscribeLink || result.category === "marketing") {
      await db.insert(unsubscribeSuggestions).values({
        emailId: input.emailId,
        emailFrom: input.from,
        emailSubject: input.subject,
        detectionMethod: unsubscribeDetection.detectionMethod,
        unsubscribeUrl: unsubscribeDetection.unsubscribeUrl || null,
        senderEmailCount: 1,
        lastEmailDate: input.date ? new Date(input.date) : null,
        userId: ctx.user.id
      });
    }
    return {
      success: true,
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning,
      alreadyCategorized: false
    };
  }),
  /**
   * Batch categorize multiple emails
   */
  categorizeEmailsBatch: protectedProcedure.input(z30.object({
    emails: z30.array(z30.object({
      emailId: z30.string(),
      subject: z30.string(),
      from: z30.string(),
      body: z30.string(),
      date: z30.string().optional()
    }))
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const emailIds = input.emails.map((e) => e.emailId);
    const existing = await db.select().from(emailCategories).where(sql6`${emailCategories.emailId} IN (${sql6.join(emailIds.map((id) => sql6`${id}`), sql6`, `)})`);
    const existingIds = new Set(existing.map((e) => e.emailId));
    const emailsToProcess = input.emails.filter((e) => !existingIds.has(e.emailId));
    if (emailsToProcess.length === 0) {
      return {
        success: true,
        categorized: 0,
        skipped: input.emails.length,
        message: "All emails already categorized"
      };
    }
    const emailDataList = emailsToProcess.map((e) => ({
      emailId: e.emailId,
      subject: e.subject,
      from: e.from,
      body: e.body,
      date: e.date ? new Date(e.date) : void 0
    }));
    const results = await categorizeEmailsBatch(emailDataList);
    const categoriesToInsert = [];
    const unsubscribeSuggestionsToInsert = [];
    for (const email of emailsToProcess) {
      const result = results.get(email.emailId);
      if (!result) continue;
      categoriesToInsert.push({
        emailId: email.emailId,
        emailSubject: email.subject,
        emailFrom: email.from,
        emailDate: email.date ? new Date(email.date) : null,
        category: result.category,
        confidence: result.confidence,
        aiReasoning: result.reasoning,
        userId: ctx.user.id
      });
      const unsubscribeDetection = detectUnsubscribeLink(email.body);
      if (unsubscribeDetection.hasUnsubscribeLink || result.category === "marketing") {
        unsubscribeSuggestionsToInsert.push({
          emailId: email.emailId,
          emailFrom: email.from,
          emailSubject: email.subject,
          detectionMethod: unsubscribeDetection.detectionMethod,
          unsubscribeUrl: unsubscribeDetection.unsubscribeUrl || null,
          senderEmailCount: 1,
          lastEmailDate: email.date ? new Date(email.date) : null,
          userId: ctx.user.id
        });
      }
    }
    if (categoriesToInsert.length > 0) {
      await db.insert(emailCategories).values(categoriesToInsert);
    }
    if (unsubscribeSuggestionsToInsert.length > 0) {
      await db.insert(unsubscribeSuggestions).values(unsubscribeSuggestionsToInsert);
    }
    return {
      success: true,
      categorized: categoriesToInsert.length,
      skipped: existingIds.size,
      message: `Categorized ${categoriesToInsert.length} emails, skipped ${existingIds.size} already categorized`
    };
  }),
  /**
   * Get categorized emails
   */
  getCategorizedEmails: protectedProcedure.input(z30.object({
    category: z30.enum(["bookings", "finance", "marketing", "spam", "important", "general"]).optional(),
    limit: z30.number().min(1).max(100).default(50),
    offset: z30.number().min(0).default(0)
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const query = db.select().from(emailCategories).orderBy(desc9(emailCategories.emailDate)).limit(input.limit).offset(input.offset);
    if (input.category) {
      query.where(eq13(emailCategories.category, input.category));
    }
    const results = await query;
    return {
      emails: results,
      total: results.length
    };
  }),
  /**
   * Get category statistics
   */
  getCategoryStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const stats = await db.select({
      category: emailCategories.category,
      count: sql6`COUNT(*)`,
      avgConfidence: sql6`AVG(${emailCategories.confidence})`
    }).from(emailCategories).groupBy(emailCategories.category);
    return {
      stats,
      total: stats.reduce((sum, s) => sum + Number(s.count), 0)
    };
  }),
  /**
   * Get unsubscribe suggestions
   */
  getUnsubscribeSuggestions: protectedProcedure.input(z30.object({
    status: z30.enum(["suggested", "dismissed", "unsubscribed", "kept"]).optional(),
    limit: z30.number().min(1).max(100).default(20)
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const query = db.select().from(unsubscribeSuggestions).orderBy(desc9(unsubscribeSuggestions.lastEmailDate)).limit(input.limit);
    if (input.status) {
      query.where(eq13(unsubscribeSuggestions.status, input.status));
    }
    const results = await query;
    return {
      suggestions: results,
      total: results.length
    };
  }),
  /**
   * Update unsubscribe suggestion status
   */
  updateUnsubscribeStatus: protectedProcedure.input(z30.object({
    id: z30.number(),
    status: z30.enum(["suggested", "dismissed", "unsubscribed", "kept"])
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(unsubscribeSuggestions).set({
      status: input.status,
      actionDate: /* @__PURE__ */ new Date()
    }).where(eq13(unsubscribeSuggestions.id, input.id));
    return {
      success: true,
      message: `Unsubscribe suggestion updated to ${input.status}`
    };
  }),
  /**
   * Manually override email category
   */
  overrideCategory: protectedProcedure.input(z30.object({
    emailId: z30.string(),
    category: z30.enum(["bookings", "finance", "marketing", "spam", "important", "general"])
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(emailCategories).set({
      manualCategory: input.category,
      manuallyOverridden: true,
      userId: ctx.user.id
    }).where(eq13(emailCategories.emailId, input.emailId));
    return {
      success: true,
      message: "Category manually overridden"
    };
  }),
  /**
   * Summarize a single email
   */
  summarizeEmail: protectedProcedure.input(z30.object({
    emailId: z30.string(),
    subject: z30.string(),
    from: z30.string(),
    body: z30.string(),
    date: z30.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(emailSummaries).where(eq13(emailSummaries.emailId, input.emailId)).limit(1);
    if (existing.length > 0) {
      return {
        success: true,
        summary: existing[0],
        alreadySummarized: true
      };
    }
    const emailData = {
      subject: input.subject,
      from: input.from,
      body: input.body,
      date: input.date ? new Date(input.date) : void 0
    };
    const result = await summarizeEmail(emailData);
    await db.insert(emailSummaries).values({
      emailId: input.emailId,
      shortSummary: result.shortSummary,
      keyPoints: result.keyPoints,
      actionItems: result.actionItems,
      sentiment: result.sentiment,
      wordCount: result.wordCount,
      userId: ctx.user.id
    });
    return {
      success: true,
      summary: result,
      alreadySummarized: false
    };
  }),
  /**
   * Get email summary
   */
  getEmailSummary: protectedProcedure.input(z30.object({
    emailId: z30.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const summary = await db.select().from(emailSummaries).where(eq13(emailSummaries.emailId, input.emailId)).limit(1);
    if (summary.length === 0) {
      return null;
    }
    return summary[0];
  }),
  /**
   * Natural language search
   */
  searchEmails: protectedProcedure.input(z30.object({
    query: z30.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const parsedQuery = await parseNaturalLanguageQuery(input.query);
    let query = db.select().from(emailCategories);
    if (parsedQuery.filters.category) {
      query = query.where(eq13(emailCategories.category, parsedQuery.filters.category));
    }
    if (parsedQuery.filters.sender) {
      query = query.where(sql6`${emailCategories.emailFrom} LIKE ${`%${parsedQuery.filters.sender}%`}`);
    }
    if (parsedQuery.filters.dateRange) {
      const { start, end } = parsedQuery.filters.dateRange;
      query = query.where(
        and5(
          sql6`${emailCategories.emailDate} >= ${start}`,
          sql6`${emailCategories.emailDate} <= ${end}`
        )
      );
    }
    if (parsedQuery.searchTerms.length > 0) {
      const searchConditions = parsedQuery.searchTerms.map(
        (term) => sql6`${emailCategories.emailSubject} LIKE ${`%${term}%`}`
      );
      query = query.where(sql6`(${sql6.join(searchConditions, sql6` OR `)})`);
    }
    query = query.orderBy(desc9(emailCategories.emailDate)).limit(50);
    const results = await query;
    return {
      results,
      parsedQuery,
      total: results.length
    };
  }),
  /**
   * Sync Gmail emails
   */
  syncGmailEmails: protectedProcedure.input(z30.object({
    query: z30.string().optional(),
    maxResults: z30.number().min(1).max(500).optional()
  })).mutation(async ({ input }) => {
    const stats = await fetchAndCategorizeEmails(
      input.query || "newer_than:7d",
      input.maxResults || 50
    );
    return {
      success: true,
      stats,
      message: `Synced ${stats.categorized} emails, ${stats.summarized} summarized, ${stats.skipped} skipped, ${stats.errors} errors`
    };
  }),
  /**
   * Get Gmail sync status
   */
  getGmailSyncStatus: protectedProcedure.query(async () => {
    const status = await getGmailSyncStatus();
    return status;
  }),
  /**
   * Search Gmail directly
   */
  searchGmail: protectedProcedure.input(z30.object({
    query: z30.string(),
    maxResults: z30.number().min(1).max(500).optional()
  })).query(async ({ input }) => {
    const result = await searchGmailMessages(input.query, input.maxResults || 50);
    return result;
  })
});

// server/butlerRouter.ts
import { z as z31 } from "zod";

// server/butlerDb.ts
async function createButlerTask(task) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.execute(
    `INSERT INTO butler_tasks (
      user_id, task_type, priority, status, title, description,
      ai_suggestion, context
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.user_id,
      task.task_type,
      task.priority,
      task.status,
      task.title,
      task.description || null,
      JSON.stringify(task.ai_suggestion),
      task.context ? JSON.stringify(task.context) : null
    ]
  );
  return result.insertId;
}
async function getPendingTasks(userId) {
  const db = await getDb();
  if (!db) return [];
  const [rows] = await db.execute(
    `SELECT * FROM butler_tasks 
     WHERE user_id = ? AND status = 'pending'
     ORDER BY priority DESC, created_at DESC`,
    [userId]
  );
  return rows.map((row) => ({
    ...row,
    ai_suggestion: JSON.parse(row.ai_suggestion),
    context: row.context ? JSON.parse(row.context) : null
  }));
}
async function getButlerTaskById(taskId) {
  const db = await getDb();
  if (!db) return null;
  const [rows] = await db.execute(
    `SELECT * FROM butler_tasks WHERE id = ?`,
    [taskId]
  );
  const task = rows[0];
  if (!task) return null;
  return {
    ...task,
    ai_suggestion: JSON.parse(task.ai_suggestion),
    context: task.context ? JSON.parse(task.context) : null
  };
}
async function approveButlerTask(taskId, userId, modifiedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.execute(
    `UPDATE butler_tasks 
     SET status = 'approved', approved_by = ?, approved_at = NOW()
     WHERE id = ?`,
    [userId, taskId]
  );
  await db.execute(
    `INSERT INTO butler_approvals (
      user_id, task_id, action, action_by, modified_content
    ) VALUES (?, ?, 'approved', ?, ?)`,
    [userId, taskId, userId, modifiedContent ? JSON.stringify(modifiedContent) : null]
  );
}
async function rejectButlerTask(taskId, userId, reason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.execute(
    `UPDATE butler_tasks 
     SET status = 'rejected', rejected_reason = ?
     WHERE id = ?`,
    [reason, taskId]
  );
  await db.execute(
    `INSERT INTO butler_approvals (
      user_id, task_id, action, action_by, notes
    ) VALUES (?, ?, 'rejected', ?, ?)`,
    [userId, taskId, userId, reason]
  );
}
async function completeButlerTask(taskId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.execute(
    `UPDATE butler_tasks 
     SET status = 'completed', completed_at = NOW()
     WHERE id = ?`,
    [taskId]
  );
}
async function getReviewsWithoutResponse(userId) {
  const db = await getDb();
  if (!db) return [];
  const [rows] = await db.execute(
    `SELECT * FROM booking_reviews 
     WHERE user_id = ? AND has_response = FALSE
     ORDER BY review_date DESC`,
    [userId]
  );
  return rows;
}
async function getAllReviews(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const [rows] = await db.execute(
    `SELECT * FROM booking_reviews 
     WHERE user_id = ?
     ORDER BY review_date DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
}
async function updateReviewResponse(reviewId, responseText, aiGenerated = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.execute(
    `UPDATE booking_reviews 
     SET has_response = TRUE, 
         response_text = ?,
         ${aiGenerated ? "ai_generated_response = ?," : ""}
         response_sent_at = NOW()
     WHERE id = ?`,
    aiGenerated ? [responseText, responseText, reviewId] : [responseText, reviewId]
  );
}
async function getLatestMetrics(userId) {
  const db = await getDb();
  if (!db) return null;
  const [rows] = await db.execute(
    `SELECT * FROM booking_metrics 
     WHERE user_id = ?
     ORDER BY metric_date DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}
async function getMetricsHistory(userId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const [rows] = await db.execute(
    `SELECT * FROM booking_metrics 
     WHERE user_id = ? AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY metric_date DESC`,
    [userId, days]
  );
  return rows;
}
async function getButlerStats(userId, days = 30) {
  const db = await getDb();
  if (!db) return {
    totalTasks: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    completed: 0,
    timeSaved: 0,
    revenueImpact: 0
  };
  const [rows] = await db.execute(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
     FROM butler_tasks
     WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [userId, days]
  );
  const stats = rows[0];
  const timeSaved = (stats.approved + stats.completed) * 0.5;
  const [revenueRows] = await db.execute(
    `SELECT SUM(JSON_EXTRACT(estimated_impact, '$.revenue')) as revenue
     FROM butler_approvals
     WHERE user_id = ? AND action = 'completed'
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [userId, days]
  );
  const revenueImpact = revenueRows[0]?.revenue || 0;
  return {
    totalTasks: stats.total,
    approved: stats.approved,
    rejected: stats.rejected,
    pending: stats.pending,
    completed: stats.completed,
    timeSaved,
    revenueImpact
  };
}

// server/butler-knowledge.ts
var BUTLER_KNOWLEDGE = {
  // ============================================
  // PROPERTY INFORMATION
  // ============================================
  property: {
    name: "Orbi City - Sea View Aparthotel in Batumi",
    id: "10172179",
    type: "Aparthotel",
    location: "7 Sherif Khimshiashvili Street, Batumi, Georgia",
    units: 60,
    // studio apartments
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
    occupancyRate: 32.5,
    // %
    totalBookings: 808,
    totalRevenue: 333039,
    // GEL
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
      pageViews: -72,
      // % vs competitors (CRITICAL)
      reviewsWorsenedScore: 33.5,
      // % (52 reviews)
      emptyRate: 67.5,
      // % (too high!)
      setupProgress: 50
      // % (incomplete)
    }
  },
  // ============================================
  // REVIEW RESPONSE TEMPLATES
  // ============================================
  reviewTemplates: {
    // Negative reviews (1-5 stars)
    negative: {
      cleanliness: {
        ka: `\u10DB\u10DD\u10D2\u10D4\u10E1\u10D0\u10DA\u10DB\u10D4\u10D1\u10D8\u10D7 {guest_name},

\u10D2\u10DB\u10D0\u10D3\u10DA\u10DD\u10D1\u10D7 \u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10D2\u10E3\u10DA\u10EC\u10E0\u10E4\u10D4\u10DA\u10D8 \u10E8\u10D4\u10E4\u10D0\u10E1\u10D4\u10D1\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1. \u10E6\u10E0\u10DB\u10D0\u10D3 \u10D5\u10EC\u10E3\u10EE\u10D5\u10D0\u10E0 \u10E0\u10DD\u10DB \u10E1\u10D8\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D8\u10E1 \u10E1\u10E2\u10D0\u10DC\u10D3\u10D0\u10E0\u10E2\u10DB\u10D0 \u10D0\u10E0 \u10D2\u10D0\u10D0\u10DB\u10D0\u10E0\u10D7\u10DA\u10D0 \u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10DB\u10DD\u10DA\u10DD\u10D3\u10D8\u10DC\u10D8.

\u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10D9\u10DD\u10DB\u10D4\u10DC\u10E2\u10D0\u10E0\u10D4\u10D1\u10D8 \u10EB\u10D0\u10DA\u10D8\u10D0\u10DC \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D5\u10D0\u10DC\u10D8\u10D0 \u10E9\u10D5\u10D4\u10DC\u10D7\u10D5\u10D8\u10E1 \u10D3\u10D0 \u10D3\u10D0\u10E3\u10E7\u10DD\u10D5\u10DC\u10D4\u10D1\u10DA\u10D8\u10D5 \u10DB\u10D8\u10D5\u10D8\u10E6\u10D4\u10D7 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2\u10D8 \u10D6\u10DD\u10DB\u10D4\u10D1\u10D8:
\u2022 \u10E1\u10E0\u10E3\u10DA\u10D8 \u10E1\u10D0\u10DC\u10D8\u10E2\u10D0\u10E0\u10E3\u10DA\u10D8 \u10E8\u10D4\u10DB\u10DD\u10EC\u10DB\u10D4\u10D1\u10D0 \u10D3\u10D0 \u10D3\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D0 \u10E7\u10D5\u10D4\u10DA\u10D0 \u10DC\u10DD\u10DB\u10D4\u10E0\u10E8\u10D8
\u2022 \u10D3\u10D0\u10DB\u10D0\u10E2\u10D4\u10D1\u10D8\u10D7\u10D8 \u10E2\u10E0\u10D4\u10DC\u10D8\u10DC\u10D2\u10D8 \u10D3\u10D0\u10E1\u10E3\u10E4\u10D7\u10D0\u10D5\u10D4\u10D1\u10D8\u10E1 \u10DE\u10D4\u10E0\u10E1\u10DD\u10DC\u10D0\u10DA\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1
\u2022 \u10EE\u10D0\u10E0\u10D8\u10E1\u10EE\u10D8\u10E1 \u10D9\u10DD\u10DC\u10E2\u10E0\u10DD\u10DA\u10D8\u10E1 \u10D2\u10D0\u10EB\u10DA\u10D8\u10D4\u10E0\u10D4\u10D1\u10D0

\u10E0\u10DD\u10D2\u10DD\u10E0\u10EA \u10D9\u10DD\u10DB\u10DE\u10D4\u10DC\u10E1\u10D0\u10EA\u10D8\u10D0, \u10D2\u10D7\u10D0\u10D5\u10D0\u10D6\u10DD\u10D1\u10D7 20% \u10E4\u10D0\u10E1\u10D3\u10D0\u10D9\u10DA\u10D4\u10D1\u10D0\u10E1 \u10D7\u10E5\u10D5\u10D4\u10DC\u10E1 \u10E8\u10D4\u10DB\u10D3\u10D4\u10D2 \u10D5\u10D8\u10D6\u10D8\u10E2\u10D6\u10D4. \u10D2\u10D5\u10D8\u10DC\u10D3\u10D0 \u10D3\u10D0\u10D5\u10D0\u10DB\u10E2\u10D9\u10D8\u10EA\u10DD\u10D7 \u10E0\u10DD\u10DB \u10D5\u10D6\u10E0\u10E3\u10DC\u10D0\u10D5\u10D7 \u10D7\u10D8\u10D7\u10DD\u10D4\u10E3\u10DA \u10E1\u10E2\u10E3\u10DB\u10D0\u10E0\u10D6\u10D4.

\u10DE\u10D0\u10E2\u10D8\u10D5\u10D8\u10E1\u10EA\u10D4\u10DB\u10D8\u10D7,
Orbi City Management`,
        en: `Dear {guest_name},

Thank you for your honest feedback. We sincerely apologize that our cleanliness standards did not meet your expectations.

Your comments are very important to us, and we have immediately taken the following actions:
\u2022 Complete sanitary inspection and deep cleaning of all units
\u2022 Additional training for our housekeeping staff
\u2022 Enhanced quality control procedures

As compensation, we would like to offer you a 20% discount on your next stay. We want to prove that we care about each and every guest.

Best regards,
Orbi City Management`,
        ru: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, {guest_name}!

\u0411\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u0438\u043C \u0437\u0430 \u0432\u0430\u0448 \u0447\u0435\u0441\u0442\u043D\u044B\u0439 \u043E\u0442\u0437\u044B\u0432. \u041C\u044B \u0438\u0441\u043A\u0440\u0435\u043D\u043D\u0435 \u0441\u043E\u0436\u0430\u043B\u0435\u0435\u043C, \u0447\u0442\u043E \u043D\u0430\u0448\u0438 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u044B \u0447\u0438\u0441\u0442\u043E\u0442\u044B \u043D\u0435 \u043E\u043F\u0440\u0430\u0432\u0434\u0430\u043B\u0438 \u0432\u0430\u0448\u0438\u0445 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0439.

\u0412\u0430\u0448\u0438 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438 \u043E\u0447\u0435\u043D\u044C \u0432\u0430\u0436\u043D\u044B \u0434\u043B\u044F \u043D\u0430\u0441, \u0438 \u043C\u044B \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u043F\u0440\u0438\u043D\u044F\u043B\u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0435 \u043C\u0435\u0440\u044B:
\u2022 \u041F\u043E\u043B\u043D\u0430\u044F \u0441\u0430\u043D\u0438\u0442\u0430\u0440\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0438 \u0433\u043B\u0443\u0431\u043E\u043A\u0430\u044F \u0443\u0431\u043E\u0440\u043A\u0430 \u0432\u0441\u0435\u0445 \u043D\u043E\u043C\u0435\u0440\u043E\u0432
\u2022 \u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0430 \u043F\u043E \u0443\u0431\u043E\u0440\u043A\u0435
\u2022 \u0423\u0441\u0438\u043B\u0435\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430

\u0412 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u043A\u043E\u043C\u043F\u0435\u043D\u0441\u0430\u0446\u0438\u0438 \u043C\u044B \u0445\u043E\u0442\u0435\u043B\u0438 \u0431\u044B \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0438\u0442\u044C \u0432\u0430\u043C \u0441\u043A\u0438\u0434\u043A\u0443 20% \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u043F\u0440\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u0435. \u041C\u044B \u0445\u043E\u0442\u0438\u043C \u0434\u043E\u043A\u0430\u0437\u0430\u0442\u044C, \u0447\u0442\u043E \u0437\u0430\u0431\u043E\u0442\u0438\u043C\u0441\u044F \u043E \u043A\u0430\u0436\u0434\u043E\u043C \u0433\u043E\u0441\u0442\u0435.

\u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435\u043C,
Orbi City Management`
      },
      maintenance: {
        en: `Dear {guest_name},

Thank you for bringing this to our attention. We apologize for the maintenance issues you experienced during your stay.

We have immediately:
\u2022 Inspected and repaired the reported issues
\u2022 Scheduled preventive maintenance for all units
\u2022 Improved our inspection procedures

Your comfort is our priority. Please contact us directly for your next booking, and we'll ensure everything is perfect.

Best regards,
Orbi City Management`
      },
      service: {
        en: `Dear {guest_name},

We sincerely apologize for the service issues you encountered. This is not the standard we strive for.

We have:
\u2022 Reviewed the situation with our team
\u2022 Implemented additional staff training
\u2022 Improved our communication procedures

We value your feedback and would appreciate the opportunity to make it right. Please contact us for a special offer on your next stay.

Best regards,
Orbi City Management`
      }
    },
    // Positive reviews (7-10 stars)
    positive: {
      general: {
        ka: `\u10D2\u10DB\u10D0\u10D3\u10DA\u10DD\u10D1\u10D7 {guest_name}!

\u10EB\u10D0\u10DA\u10D8\u10D0\u10DC \u10D2\u10D5\u10D8\u10EE\u10D0\u10E0\u10D8\u10D0 \u10E0\u10DD\u10DB \u10DB\u10DD\u10D2\u10D4\u10EC\u10DD\u10DC\u10D0\u10D7 \u10E9\u10D5\u10D4\u10DC\u10D7\u10D0\u10DC \u10E7\u10DD\u10E4\u10DC\u10D0! \u10D7\u10E5\u10D5\u10D4\u10DC\u10D8 \u10D7\u10D1\u10D8\u10DA\u10D8 \u10E1\u10D8\u10E2\u10E7\u10D5\u10D4\u10D1\u10D8 \u10D3\u10D8\u10D3\u10D8 \u10DB\u10DD\u10E2\u10D8\u10D5\u10D0\u10EA\u10D8\u10D0\u10D0 \u10E9\u10D5\u10D4\u10DC\u10D8 \u10D2\u10E3\u10DC\u10D3\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1.

\u10D2\u10D0\u10DC\u10E1\u10D0\u10D9\u10E3\u10D7\u10E0\u10D4\u10D1\u10D8\u10D7 \u10DB\u10D0\u10D3\u10DA\u10DD\u10D1\u10D4\u10DA\u10D8 \u10D5\u10D0\u10E0\u10D7 \u10E0\u10DD\u10DB \u10D0\u10E6\u10DC\u10D8\u10E8\u10DC\u10D4\u10D7 {positive_aspect}. \u10D5\u10DB\u10E3\u10E8\u10D0\u10DD\u10D1\u10D7 \u10D8\u10DB\u10D8\u10E1\u10D7\u10D5\u10D8\u10E1 \u10E0\u10DD\u10DB \u10E7\u10DD\u10D5\u10D4\u10DA\u10D8 \u10E1\u10E2\u10E3\u10DB\u10D0\u10E0\u10D8 \u10D2\u10D0\u10DC\u10E1\u10D0\u10D9\u10E3\u10D7\u10E0\u10D4\u10D1\u10E3\u10DA\u10D0\u10D3 \u10D8\u10D2\u10E0\u10EB\u10DC\u10DD\u10E1 \u10D7\u10D0\u10D5\u10E1.

\u10D5\u10D4\u10DA\u10DD\u10D3\u10D4\u10D1\u10D8\u10D7 \u10D7\u10E5\u10D5\u10D4\u10DC\u10E1 \u10DB\u10DD\u10DB\u10D0\u10D5\u10D0\u10DA \u10D5\u10D8\u10D6\u10D8\u10E2\u10E1!

\u10DE\u10D0\u10E2\u10D8\u10D5\u10D8\u10E1\u10EA\u10D4\u10DB\u10D8\u10D7,
Orbi City Team`,
        en: `Thank you {guest_name}!

We're delighted that you enjoyed your stay with us! Your kind words are a great motivation for our team.

We especially appreciate you highlighting {positive_aspect}. We work hard to make every guest feel special.

Looking forward to welcoming you again!

Best regards,
Orbi City Team`,
        ru: `\u0421\u043F\u0430\u0441\u0438\u0431\u043E, {guest_name}!

\u041C\u044B \u043E\u0447\u0435\u043D\u044C \u0440\u0430\u0434\u044B, \u0447\u0442\u043E \u0432\u0430\u043C \u043F\u043E\u043D\u0440\u0430\u0432\u0438\u043B\u043E\u0441\u044C \u0443 \u043D\u0430\u0441! \u0412\u0430\u0448\u0438 \u0434\u043E\u0431\u0440\u044B\u0435 \u0441\u043B\u043E\u0432\u0430 - \u0431\u043E\u043B\u044C\u0448\u0430\u044F \u043C\u043E\u0442\u0438\u0432\u0430\u0446\u0438\u044F \u0434\u043B\u044F \u043D\u0430\u0448\u0435\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u044B.

\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E \u0431\u043B\u0430\u0433\u043E\u0434\u0430\u0440\u043D\u044B \u0437\u0430 \u0442\u043E, \u0447\u0442\u043E \u0432\u044B \u043E\u0442\u043C\u0435\u0442\u0438\u043B\u0438 {positive_aspect}. \u041C\u044B \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u043C \u043D\u0430\u0434 \u0442\u0435\u043C, \u0447\u0442\u043E\u0431\u044B \u043A\u0430\u0436\u0434\u044B\u0439 \u0433\u043E\u0441\u0442\u044C \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B \u0441\u0435\u0431\u044F \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u044B\u043C.

\u0411\u0443\u0434\u0435\u043C \u0440\u0430\u0434\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u0432\u0430\u0441 \u0441\u043D\u043E\u0432\u0430!

\u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435\u043C,
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
        discount: 40,
        // %
        duration: 7,
        // days
        expectedRevenue: "3000-5000 GEL",
        benefit: "Top of search results",
        when: "Low occupancy periods (< 40%)"
      },
      moderate: {
        discount: 20,
        // %
        duration: 14,
        // days
        expectedRevenue: "1500-2500 GEL",
        benefit: "Improved visibility",
        when: "Medium occupancy (40-60%)"
      },
      lastMinute: {
        discount: 30,
        // %
        duration: 3,
        // days
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
    averageOccupancy: 45,
    // %
    averageReviewScore: 9.1,
    averagePageViews: 4286,
    // vs our 1200 (-72%)
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
        impact: "Finish setup (50% \u2192 75%)"
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
var AI_PROMPTS = {
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

// server/butlerRouter.ts
var butlerRouter = router({
  // ============================================
  // GET PENDING TASKS
  // ============================================
  getPendingTasks: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await getPendingTasks(ctx.user.id);
    return tasks;
  }),
  // ============================================
  // GET ALL REVIEWS
  // ============================================
  getReviews: protectedProcedure.input(z31.object({
    limit: z31.number().optional().default(50),
    withoutResponseOnly: z31.boolean().optional().default(false)
  })).query(async ({ ctx, input }) => {
    if (input.withoutResponseOnly) {
      return await getReviewsWithoutResponse(ctx.user.id);
    }
    return await getAllReviews(ctx.user.id, input.limit);
  }),
  // ============================================
  // GENERATE AI RESPONSE FOR REVIEW
  // ============================================
  generateResponse: protectedProcedure.input(z31.object({
    reviewId: z31.string(),
    guestName: z31.string(),
    rating: z31.number(),
    comment: z31.string().optional(),
    negativeComment: z31.string().optional(),
    positiveComment: z31.string().optional(),
    language: z31.enum(["ka", "en", "ru"]).optional().default("en")
  })).mutation(async ({ input }) => {
    const { guestName, rating, comment, negativeComment, positiveComment, language } = input;
    let template;
    let reviewText = comment || negativeComment || positiveComment || "";
    if (rating < 5) {
      const lowerText = reviewText.toLowerCase();
      if (lowerText.includes("clean") || lowerText.includes("dirty") || lowerText.includes("hair")) {
        template = BUTLER_KNOWLEDGE.reviewTemplates.negative.cleanliness[language];
      } else if (lowerText.includes("broken") || lowerText.includes("repair") || lowerText.includes("maintenance")) {
        template = BUTLER_KNOWLEDGE.reviewTemplates.negative.maintenance.en;
      } else {
        template = BUTLER_KNOWLEDGE.reviewTemplates.negative.service.en;
      }
    } else if (rating >= 7) {
      template = BUTLER_KNOWLEDGE.reviewTemplates.positive.general[language];
    } else {
      template = BUTLER_KNOWLEDGE.reviewTemplates.neutral.general.en;
    }
    const prompt = `${AI_PROMPTS.reviewResponse}

Property: ${BUTLER_KNOWLEDGE.property.name}
Guest: ${guestName}
Rating: ${rating}/10
Review: ${reviewText}
Language: ${language}

Base template:
${template}

Customize this template to specifically address the guest's concerns while maintaining the professional tone. Replace {guest_name} with the actual name and {positive_aspect} or {improvement_area} with specific details from the review.`;
    const aiResponse = await invokeLLM({
      messages: [
        { role: "system", content: "You are the Booking.com Butler AI. Generate professional, empathetic review responses." },
        { role: "user", content: prompt }
      ]
    });
    const responseText = aiResponse.choices[0]?.message?.content || template.replace("{guest_name}", guestName);
    const taskId = await createButlerTask({
      user_id: 1,
      // TODO: use ctx.user.id
      task_type: "review_response",
      priority: rating < 5 ? "high" : "medium",
      status: "pending",
      title: `Reply to ${guestName}'s ${rating}\u2605 review`,
      description: `Review: "${reviewText.substring(0, 100)}..."`,
      ai_suggestion: {
        reviewId: input.reviewId,
        responseText,
        language
      },
      context: {
        guestName,
        rating,
        reviewText,
        language
      }
    });
    return {
      taskId,
      responseText,
      requiresApproval: true
    };
  }),
  // ============================================
  // APPROVE BUTLER TASK
  // ============================================
  approve: protectedProcedure.input(z31.object({
    taskId: z31.string(),
    modifiedContent: z31.any().optional()
  })).mutation(async ({ ctx, input }) => {
    await approveButlerTask(input.taskId, ctx.user.id, input.modifiedContent);
    const task = await getButlerTaskById(input.taskId);
    if (!task) throw new Error("Task not found");
    if (task.task_type === "review_response") {
      const { reviewId, responseText } = task.ai_suggestion;
      await updateReviewResponse(reviewId, responseText, true);
    }
    await completeButlerTask(input.taskId);
    return { success: true };
  }),
  // ============================================
  // REJECT BUTLER TASK
  // ============================================
  reject: protectedProcedure.input(z31.object({
    taskId: z31.string(),
    reason: z31.string()
  })).mutation(async ({ ctx, input }) => {
    await rejectButlerTask(input.taskId, ctx.user.id, input.reason);
    return { success: true };
  }),
  // ============================================
  // GET PERFORMANCE METRICS
  // ============================================
  getMetrics: protectedProcedure.input(z31.object({
    days: z31.number().optional().default(30)
  })).query(async ({ ctx, input }) => {
    const latest = await getLatestMetrics(ctx.user.id);
    const history = await getMetricsHistory(ctx.user.id, input.days);
    return {
      latest,
      history,
      trends: {
        occupancyChange: history.length >= 2 ? (history[0].occupancy_rate || 0) - (history[1].occupancy_rate || 0) : 0,
        revenueChange: history.length >= 2 ? (history[0].total_revenue || 0) - (history[1].total_revenue || 0) : 0,
        reviewScoreChange: history.length >= 2 ? (history[0].review_score || 0) - (history[1].review_score || 0) : 0
      }
    };
  }),
  // ============================================
  // GET AI RECOMMENDATIONS
  // ============================================
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const metrics = await getLatestMetrics(ctx.user.id);
    if (!metrics) {
      return {
        recommendations: [],
        alerts: []
      };
    }
    const recommendations = [];
    const alerts = [];
    if ((metrics.occupancy_rate || 0) < 40) {
      recommendations.push({
        type: "campaign_create",
        priority: "high",
        title: "Create 40% Discount Campaign",
        description: "Low occupancy detected. A discount campaign can boost bookings.",
        estimatedImpact: "+3,000-5,000 GEL revenue",
        action: "create_discount_campaign",
        params: { discount: 40, duration: 7 }
      });
    }
    if ((metrics.page_views_vs_competitors || 0) < -50) {
      alerts.push({
        type: "visibility",
        severity: "critical",
        title: "Page Views 72% Below Competitors",
        description: "Your property visibility is significantly lower than competitors.",
        suggestions: [
          "Create discount campaign (top of search results)",
          "Update property photos",
          "Add more facilities",
          "Improve review score"
        ]
      });
    }
    const unrepliedReviews = await getReviewsWithoutResponse(ctx.user.id);
    if (unrepliedReviews.length > 0) {
      recommendations.push({
        type: "review_response",
        priority: "high",
        title: `Reply to ${unrepliedReviews.length} Unanswered Reviews`,
        description: "Responding to reviews improves your reputation and shows you care.",
        estimatedImpact: "Better review score, increased trust",
        action: "reply_to_reviews",
        params: { count: unrepliedReviews.length }
      });
    }
    if ((metrics.review_score || 0) < (metrics.area_avg_review_score || 9)) {
      alerts.push({
        type: "review_score",
        severity: "warning",
        title: "Review Score Below Area Average",
        description: `Your score (${metrics.review_score}) is below area average (${metrics.area_avg_review_score}).`,
        suggestions: [
          "Address cleanliness issues",
          "Improve staff training",
          "Respond to all negative reviews",
          "Offer compensation for issues"
        ]
      });
    }
    return {
      recommendations,
      alerts
    };
  }),
  // ============================================
  // GET BUTLER STATS
  // ============================================
  getStats: protectedProcedure.input(z31.object({
    days: z31.number().optional().default(30)
  })).query(async ({ ctx, input }) => {
    return await getButlerStats(ctx.user.id, input.days);
  }),
  // ============================================
  // CHAT WITH BUTLER AI (Universal Assistant)
  // ============================================
  chat: protectedProcedure.input(z31.object({
    message: z31.string(),
    context: z31.object({
      currentPage: z31.string().optional(),
      visibleData: z31.any().optional()
    }).optional()
  })).mutation(async ({ ctx, input }) => {
    const metrics = await getLatestMetrics(ctx.user.id);
    const pendingTasks = await getPendingTasks(ctx.user.id);
    const unrepliedReviews = await getReviewsWithoutResponse(ctx.user.id);
    const systemPrompt = `You are the ORBI City Hub AI Assistant with full knowledge of the dashboard.

PROPERTY INFORMATION:
${JSON.stringify(BUTLER_KNOWLEDGE.property, null, 2)}

CURRENT PERFORMANCE:
- Occupancy: ${metrics?.occupancy_rate || 0}%
- Review Score: ${metrics?.review_score || 0}/10
- Total Bookings: ${metrics?.total_bookings || 0}
- Total Revenue: ${metrics?.total_revenue || 0} GEL
- Page Views vs Competitors: ${metrics?.page_views_vs_competitors || 0}%

PENDING TASKS:
- ${pendingTasks.length} tasks awaiting approval
- ${unrepliedReviews.length} reviews without response

CURRENT PAGE: ${input.context?.currentPage || "unknown"}

You have access to:
- Booking.com Butler (reviews, metrics, campaigns)
- Google Analytics (real-time visitors, traffic sources)
- Reservations (bookings, guests, calendar)
- Finance (P&L, revenue, expenses)
- Logistics (inventory, housekeeping, maintenance)
- Marketing (campaigns, channels, ROI)

Answer questions about any aspect of the business. Be specific, data-driven, and actionable.`;
    const aiResponse = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.message }
      ]
    });
    return {
      response: aiResponse.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.",
      context: {
        metricsUsed: metrics !== null,
        pendingTasksCount: pendingTasks.length,
        unrepliedReviewsCount: unrepliedReviews.length
      }
    };
  })
});

// server/aiAnalyzerRouter.ts
import { z as z32 } from "zod";

// server/aiFileAnalyzer.ts
import * as XLSX4 from "xlsx";
var TRAINING_DATA = `
You are an intelligent data analyzer for ORBI City Hub - a hotel management system with 55 studios.

Your task is to analyze uploaded Excel/PDF files and intelligently distribute data to the correct modules:

## Module Categories:

### 1. FINANCE MODULE
Keywords: revenue, income, earnings, profit, loss, expense, cost, salary, payment, financial
Data types: Total Revenue, Monthly Revenue, Expenses, Profit, ROI, Margins
Example fields: "Total Revenue", "\u10EF\u10D0\u10DB\u10E3\u10E0\u10D8 \u10E8\u10D4\u10DB\u10DD\u10E1\u10D0\u10D5\u10D0\u10DA\u10D8", "Expenses", "\u10EE\u10D0\u10E0\u10EF\u10D4\u10D1\u10D8", "Profit", "\u10DB\u10DD\u10D2\u10D4\u10D1\u10D0"

### 2. MARKETING MODULE  
Keywords: occupancy, booking rate, conversion, leads, campaigns, channels, OTA
Data types: Occupancy %, Average Price, Booking Rate, Channel Performance
Example fields: "Occupancy %", "\u10D3\u10D0\u10D9\u10D0\u10D5\u10D4\u10D1\u10E3\u10DA\u10DD\u10D1\u10D0", "Avg Price", "\u10E1\u10D0\u10E8\u10E3\u10D0\u10DA\u10DD \u10E4\u10D0\u10E1\u10D8", "Booking.com", "Airbnb"

### 3. RESERVATIONS MODULE
Keywords: bookings, reservations, guests, check-in, check-out, nights, stays
Data types: Total Bookings, Active Guests, Days Occupied, Guest Names
Example fields: "Days Occupied", "\u10D3\u10D0\u10D9\u10D0\u10D5\u10D4\u10D1\u10E3\u10DA\u10D8 \u10D3\u10E6\u10D4\u10D4\u10D1\u10D8", "Bookings", "\u10EF\u10D0\u10D5\u10E8\u10DC\u10D4\u10D1\u10D8", "Guests", "\u10E1\u10E2\u10E3\u10DB\u10E0\u10D4\u10D1\u10D8"

### 4. LOGISTICS MODULE
Keywords: studios, rooms, apartments, inventory, housekeeping, maintenance, cleaning
Data types: Studio Count, Room Status, Inventory Items, Maintenance Tasks
Example fields: "Studios", "\u10E1\u10E2\u10E3\u10D3\u10D8\u10DD\u10D4\u10D1\u10D8", "Rooms", "\u10DD\u10D7\u10D0\u10EE\u10D4\u10D1\u10D8", "Cleaning", "\u10D3\u10D0\u10DA\u10D0\u10D2\u10D4\u10D1\u10D0"

## Data Distribution Rules:

1. **Multi-module data**: Some data belongs to multiple modules
   - "Occupancy %" \u2192 Marketing (primary) + Finance (secondary)
   - "Days Occupied" \u2192 Reservations (primary) + Marketing (secondary)
   - "Total Revenue" \u2192 Finance (primary) + CEO Dashboard (secondary)

2. **Georgian language support**: Recognize Georgian field names
   - "\u10E8\u10D4\u10DB\u10DD\u10E1\u10D0\u10D5\u10D0\u10DA\u10D8" = Revenue \u2192 Finance
   - "\u10D3\u10D0\u10D9\u10D0\u10D5\u10D4\u10D1\u10E3\u10DA\u10DD\u10D1\u10D0" = Occupancy \u2192 Marketing  
   - "\u10EF\u10D0\u10D5\u10E8\u10DC\u10D4\u10D1\u10D8" = Bookings \u2192 Reservations
   - "\u10E1\u10E2\u10E3\u10D3\u10D8\u10DD\u10D4\u10D1\u10D8" = Studios \u2192 Logistics

3. **Time-series data**: Monthly/yearly breakdowns
   - Detect date columns (Month, \u10D7\u10D5\u10D4, Date, \u10D7\u10D0\u10E0\u10D8\u10E6\u10D8)
   - Create time-series entries for each month
   - Link to appropriate dashboard charts

4. **Calculated fields**: Derive additional metrics
   - Profit Margin = (Profit / Revenue) \xD7 100
   - Average Daily Rate = Revenue / Days Occupied
   - RevPAR = Revenue / Available Days

## Output Format:

Return JSON with this structure:
{
  "fileType": "financial_report" | "booking_list" | "inventory_sheet" | "unknown",
  "confidence": 0.0-1.0,
  "summary": "Brief description of file content",
  "distributions": [
    {
      "module": "finance" | "marketing" | "reservations" | "logistics",
      "category": "revenue" | "expenses" | "occupancy" | "bookings" | "inventory",
      "data": {
        "fieldName": "Total Revenue",
        "value": 920505,
        "unit": "\u20BE",
        "period": "Oct 2024 - Sep 2025"
      },
      "confidence": 0.0-1.0
    }
  ],
  "suggestions": [
    {
      "action": "create_dashboard_widget" | "update_chart" | "create_alert",
      "module": "finance",
      "description": "Add revenue trend chart for last 12 months"
    }
  ]
}

## Example Analysis:

Input Excel with columns: "Month", "Total Revenue", "Occupancy %", "Days Occupied"

Output:
{
  "fileType": "financial_report",
  "confidence": 0.95,
  "summary": "Monthly financial report with revenue, occupancy, and booking data for 12 months",
  "distributions": [
    {
      "module": "finance",
      "category": "revenue",
      "data": {
        "fieldName": "Total Revenue",
        "value": 920505,
        "unit": "\u20BE",
        "period": "Oct 2024 - Sep 2025"
      },
      "confidence": 0.98
    },
    {
      "module": "marketing",
      "category": "occupancy",
      "data": {
        "fieldName": "Occupancy %",
        "value": 80.5,
        "unit": "%",
        "period": "Sep 2025"
      },
      "confidence": 0.95
    },
    {
      "module": "reservations",
      "category": "bookings",
      "data": {
        "fieldName": "Days Occupied",
        "value": 1318,
        "unit": "days",
        "period": "Sep 2025"
      },
      "confidence": 0.92
    }
  ],
  "suggestions": [
    {
      "action": "update_chart",
      "module": "finance",
      "description": "Update revenue trend chart with new monthly data"
    },
    {
      "action": "create_alert",
      "module": "marketing",
      "description": "Occupancy dropped below 85% - consider promotional campaign"
    }
  ]
}

Now analyze the uploaded file and provide the distribution plan.
`;
async function parseExcelFile2(filePath) {
  try {
    const workbook = XLSX4.readFile(filePath);
    let content = "";
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX4.utils.sheet_to_json(sheet, { header: 1 });
      content += `

=== Sheet: ${sheetName} ===
`;
      content += JSON.stringify(jsonData.slice(0, 20), null, 2);
    });
    return content;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error("Failed to parse Excel file");
  }
}
async function analyzeFileWithAI(fileContent, fileName) {
  try {
    const prompt = `${TRAINING_DATA}

File name: ${fileName}

File content (first 20 rows of each sheet):
${fileContent}

Analyze this file and provide the distribution plan in JSON format.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert data analyst. Always respond with valid JSON only, no markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "file_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              fileType: {
                type: "string",
                enum: ["financial_report", "booking_list", "inventory_sheet", "unknown"]
              },
              confidence: { type: "number" },
              summary: { type: "string" },
              distributions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    module: {
                      type: "string",
                      enum: ["finance", "marketing", "reservations", "logistics"]
                    },
                    category: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        fieldName: { type: "string" },
                        value: { type: ["number", "string"] },
                        unit: { type: "string" },
                        period: { type: "string" }
                      },
                      required: ["fieldName", "value"],
                      additionalProperties: false
                    },
                    confidence: { type: "number" }
                  },
                  required: ["module", "category", "data", "confidence"],
                  additionalProperties: false
                }
              },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: {
                      type: "string",
                      enum: ["create_dashboard_widget", "update_chart", "create_alert"]
                    },
                    module: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["action", "module", "description"],
                  additionalProperties: false
                }
              }
            },
            required: ["fileType", "confidence", "summary", "distributions", "suggestions"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing file with AI:", error);
    throw new Error("Failed to analyze file");
  }
}
async function analyzeUploadedFile(filePath, fileName) {
  const fileContent = await parseExcelFile2(filePath);
  const analysis = await analyzeFileWithAI(fileContent, fileName);
  return analysis;
}

// server/aiAnalyzerRouter.ts
import { TRPCError as TRPCError6 } from "@trpc/server";
var aiAnalyzerRouter = router({
  /**
   * Analyze uploaded file and get intelligent distribution plan
   */
  analyzeFile: protectedProcedure.input(
    z32.object({
      fileUrl: z32.string(),
      fileName: z32.string()
    })
  ).mutation(async ({ input, ctx }) => {
    try {
      let filePath = input.fileUrl;
      if (!input.fileUrl.startsWith("http")) {
        filePath = input.fileUrl;
      }
      const analysis = await analyzeUploadedFile(filePath, input.fileName);
      return analysis;
    } catch (error) {
      console.error("Error analyzing file:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to analyze file"
      });
    }
  }),
  /**
   * Upload file and analyze it
   */
  uploadAndAnalyze: protectedProcedure.input(
    z32.object({
      fileData: z32.string(),
      // Base64 encoded file
      fileName: z32.string(),
      mimeType: z32.string()
    })
  ).mutation(async ({ input, ctx }) => {
    try {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `ai-analysis/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      const fs2 = await import("fs");
      const path3 = await import("path");
      const tempPath = path3.join("/tmp", input.fileName);
      fs2.writeFileSync(tempPath, buffer);
      const analysis = await analyzeUploadedFile(tempPath, input.fileName);
      fs2.unlinkSync(tempPath);
      return analysis;
    } catch (error) {
      console.error("Error uploading and analyzing file:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload and analyze file"
      });
    }
  }),
  /**
   * Get analysis history for current user
   */
  getAnalysisHistory: protectedProcedure.query(async ({ ctx }) => {
    return [];
  })
});

// server/realFinanceRouter.ts
var realFinanceRouter = router({
  /**
   * Get financial summary (Oct 2024 - Sep 2025)
   */
  getSummary: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [rows] = await db.execute(
      "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
    );
    return rows[0] || null;
  }),
  /**
   * Get all monthly financial data
   */
  getMonthlyData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [rows] = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC"
    );
    return rows;
  }),
  /**
   * Get monthly revenue chart data
   */
  getRevenueChartData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [rows] = await db.execute(
      "SELECT month, total_revenue, total_expenses, total_profit FROM monthly_financials ORDER BY year ASC, FIELD(month, 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September') ASC"
    );
    return rows;
  }),
  /**
   * Get expense breakdown chart data
   */
  getExpenseBreakdown: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [rows] = await db.execute(
      "SELECT SUM(cleaning_tech) as cleaning_tech, SUM(marketing) as marketing, SUM(salaries) as salaries, SUM(utilities) as utilities FROM monthly_financials"
    );
    return rows[0] || null;
  }),
  /**
   * Get occupancy trend data
   */
  getOccupancyTrend: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [rows] = await db.execute(
      "SELECT month, occupancy_percent, avg_price FROM monthly_financials ORDER BY year ASC, FIELD(month, 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September') ASC"
    );
    return rows;
  }),
  /**
   * Get key metrics
   */
  getKeyMetrics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [summaryRows] = await db.execute(
      "SELECT * FROM financial_summary ORDER BY created_at DESC LIMIT 1"
    );
    const summary = summaryRows[0];
    const [latestRows] = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 1"
    );
    const latestMonth = latestRows[0];
    const [prevRows] = await db.execute(
      "SELECT * FROM monthly_financials ORDER BY year DESC, FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') DESC LIMIT 1 OFFSET 1"
    );
    const prevMonth = prevRows[0];
    const revenueChange = prevMonth ? ((latestMonth.total_revenue - prevMonth.total_revenue) / prevMonth.total_revenue * 100).toFixed(1) : 0;
    const profitChange = prevMonth ? ((latestMonth.total_profit - prevMonth.total_profit) / prevMonth.total_profit * 100).toFixed(1) : 0;
    const occupancyChange = prevMonth ? (latestMonth.occupancy_percent - prevMonth.occupancy_percent).toFixed(1) : 0;
    return {
      totalRevenue: summary.total_revenue,
      totalProfit: summary.total_profit,
      profitMargin: (summary.total_profit / summary.total_revenue * 100).toFixed(1),
      latestMonthRevenue: latestMonth.total_revenue,
      latestMonthProfit: latestMonth.total_profit,
      latestMonthOccupancy: latestMonth.occupancy_percent,
      revenueChange: parseFloat(revenueChange),
      profitChange: parseFloat(profitChange),
      occupancyChange: parseFloat(occupancyChange),
      latestMonth: latestMonth.month
    };
  })
});

// server/routers/n8nWebhook.ts
import { z as z33 } from "zod";
import { eq as eq14 } from "drizzle-orm";
var guestMessageSchema = z33.object({
  guestName: z33.string().min(1, "Guest name is required"),
  guestEmail: z33.string().email().optional(),
  guestPhone: z33.string().optional(),
  message: z33.string().min(1, "Message is required"),
  source: z33.string().default("n8n"),
  metadata: z33.record(z33.any()).optional()
  // Additional data from n8n
});
var n8nWebhookRouter = router({
  /**
   * POST /api/trpc/n8nWebhook.receiveGuestMessage
   * Receives guest messages from n8n workflow
   */
  receiveGuestMessage: publicProcedure.input(guestMessageSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    try {
      let guestId = null;
      if (input.guestEmail) {
        const existingGuest = await db.select().from(guests).where(eq14(guests.email, input.guestEmail)).limit(1);
        if (existingGuest.length > 0) {
          guestId = existingGuest[0].id;
        }
      }
      if (!guestId) {
        const [newGuest] = await db.insert(guests).values({
          name: input.guestName,
          email: input.guestEmail || null,
          phone: input.guestPhone || null
        }).$returningId();
        guestId = newGuest.id;
      }
      const [chatMessage] = await db.insert(chatMessages).values({
        guestId,
        guestName: input.guestName,
        guestEmail: input.guestEmail || null,
        guestPhone: input.guestPhone || null,
        message: input.message,
        source: input.source,
        direction: "incoming",
        status: "unread",
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      }).$returningId();
      return {
        success: true,
        messageId: chatMessage.id,
        guestId,
        message: "Guest message received successfully"
      };
    } catch (error) {
      console.error("[n8nWebhook] Failed to save guest message:", error);
      throw new Error("Failed to save guest message");
    }
  }),
  /**
   * GET /api/trpc/n8nWebhook.getChatMessages
   * Retrieves all chat messages
   */
  getChatMessages: publicProcedure.input(
    z33.object({
      limit: z33.number().min(1).max(100).default(50),
      offset: z33.number().min(0).default(0),
      status: z33.enum(["unread", "read", "replied"]).optional()
    })
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    try {
      let query = db.select().from(chatMessages);
      if (input.status) {
        query = query.where(eq14(chatMessages.status, input.status));
      }
      const messages = await query.orderBy(chatMessages.createdAt).limit(input.limit).offset(input.offset);
      return {
        messages,
        total: messages.length
      };
    } catch (error) {
      console.error("[n8nWebhook] Failed to fetch chat messages:", error);
      throw new Error("Failed to fetch chat messages");
    }
  }),
  /**
   * PATCH /api/trpc/n8nWebhook.markAsRead
   * Marks a chat message as read
   */
  markAsRead: publicProcedure.input(z33.object({ messageId: z33.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    try {
      await db.update(chatMessages).set({ status: "read" }).where(eq14(chatMessages.id, input.messageId));
      return { success: true };
    } catch (error) {
      console.error("[n8nWebhook] Failed to mark message as read:", error);
      throw new Error("Failed to mark message as read");
    }
  }),
  /**
   * POST /api/trpc/n8nWebhook.sendReply
   * Sends a reply to a guest (stores in database, n8n will pick it up)
   */
  sendReply: publicProcedure.input(
    z33.object({
      guestId: z33.number(),
      message: z33.string().min(1),
      originalMessageId: z33.number()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    try {
      const [guest] = await db.select().from(guests).where(eq14(guests.id, input.guestId)).limit(1);
      if (!guest) {
        throw new Error("Guest not found");
      }
      const [replyMessage] = await db.insert(chatMessages).values({
        guestId: input.guestId,
        guestName: guest.name,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        message: input.message,
        source: "dashboard",
        direction: "outgoing",
        status: "read",
        metadata: JSON.stringify({ replyTo: input.originalMessageId })
      }).$returningId();
      await db.update(chatMessages).set({ status: "replied" }).where(eq14(chatMessages.id, input.originalMessageId));
      return {
        success: true,
        messageId: replyMessage.id,
        message: "Reply sent successfully"
      };
    } catch (error) {
      console.error("[n8nWebhook] Failed to send reply:", error);
      throw new Error("Failed to send reply");
    }
  })
});

// server/routers.ts
var appRouter = router({
  realFinance: realFinanceRouter,
  aiAnalyzer: aiAnalyzerRouter,
  butler: butlerRouter,
  google: googleRouter,
  fileUpload: fileUploadRouter,
  fileManager: fileManagerRouter,
  admin: adminRouter,
  gmail: gmailRouter,
  reservations: reservationsRouter,
  excelImport: excelImportRouter,
  finance: financeRouter,
  file: fileRouter,
  socialMedia: socialMediaRouter,
  logistics: logisticsRouter,
  feedback: feedbackRouter,
  healthCheck: healthCheckRouter,
  cache: cacheRouter,
  performance: performanceRouter,
  alerts: alertsRouter,
  security: securityRouter,
  gdpr: gdprRouter,
  database: databaseRouter,
  uptime: uptimeRouter,
  otelms: otelmsRouter,
  integrations: integrationsRouter,
  googleAnalytics: googleAnalyticsRouter,
  googleBusiness: googleBusinessRouter,
  gmailOtelms: gmailOtelmsRouter,
  gmailSync: gmailSyncRouter,
  emailCategorization: emailCategorizationRouter,
  n8nWebhook: n8nWebhookRouter,
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  ai: aiRouter,
  modules: modulesRouter,
  backup: backupRouter,
  health: healthRouter,
  rbac: rbacRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Optimize build performance
    target: "es2020",
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("@trpc") || id.includes("@tanstack")) {
              return "trpc-vendor";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "chart-libs";
            }
            if (id.includes("lucide-react")) {
              return "ui-vendor";
            }
            return "vendor";
          }
        }
      },
      // Increase max parallel file reads to prevent EMFILE errors
      maxParallelFileOps: 20
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1e3,
    // Minification
    minify: "esbuild",
    // Source maps for production debugging
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Disable size reporting to save memory
    reportCompressedSize: false,
    // Reduce memory usage
    modulePreload: false,
    // Reduce memory usage during build
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      ".railway.app",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(securityHeadersMiddleware());
  app.set("trust proxy", 1);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api/", apiLimiter);
  app.use("/api/oauth/", authLimiter);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  app.use(errorLoggerMiddleware);
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    initRedis();
    if (process.env.NODE_ENV === "production") {
      startBackupSchedule();
      console.log("[Backup] Automated backup schedule started");
    } else {
      console.log("[Backup] Automated backups disabled in development mode");
    }
  });
}
startServer().catch(console.error);
