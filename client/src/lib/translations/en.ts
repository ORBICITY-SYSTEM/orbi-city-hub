export const en = {
  // Header
  logout: "Logout",
  
  // Navigation
  nav: {
    home: "Home",
    finance: "Finance",
    marketing: "Marketing",
    reservations: "Reservations",
    logistics: "Logistics",
    whatsappBot: "WhatsApp Bot",
  },
  
  // Submenu items
  submenu: {
    // Finance
    financeDashboard: "Dashboard",
    analytics: "Analytics",
    reports: "Monthly Reports",
    otelms: "OTELMS",
    devExpenses: "Dev Expenses",
    
    // Marketing
    marketingDashboard: "Dashboard",
    otaChannels: "OTA Channels",
    webLeads: "Web Leads",
    
    // Reservations
    otaDashboard: "Dashboard",
    aiResponses: "AI Responses",
    butlerAI: "Butler AI",
    email: "Email",
    reviews: "Reviews",
    otaCommand: "OTA Command",
    
    // Logistics
    logisticsDashboard: "Dashboard",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    
    // WhatsApp
    quickStart: "Quick Start",
    implementation: "Implementation",
    codeExamples: "Code Examples",
    systemPrompt: "System Prompt",
    testing: "Testing",
    resources: "Resources",
    deployment: "Deployment",
  },
  
  // Home page
  home: {
    title: "ORBI City Hub",
    subtitle: "Sea View Aparthotel Management Platform",
    totalRevenue: "Total Revenue",
    totalProfit: "Total Profit",
    studios: "Studios",
    avgOccupancy: "Avg. Occupancy",
    mainModules: "Main Modules",
    view: "View",
  },
  
  // Main AI Agent
  aiAgent: {
    title: "Main AI Agent",
    subtitle: "Intelligent Data Distribution",
    description: "Upload Excel/PDF files and AI will automatically analyze and distribute data to the right modules",
    uploadPrompt: "Click to upload Excel or PDF",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    analysisComplete: "Analysis Complete",
    dataDistribution: "Data Distribution",
    suggestions: "AI Suggestions",
    uploadHint: "Upload a financial report, booking list, or inventory sheet",
    autoDistribute: "AI will analyze and distribute data automatically",
    type: "Type",
    confidence: "Confidence",
    analysisSuccess: "File analyzed successfully!",
    analysisFailed: "Failed to analyze file",
  },
  
  // Module cards
  modules: {
    finance: {
      title: "Finance",
      description: "Revenue, expenses and financial analytics",
      metric: "Annual Revenue",
    },
    marketing: {
      title: "Marketing",
      description: "OTA channels, campaigns and website leads",
      metric: "Avg. Occupancy",
    },
    reservations: {
      title: "Reservations",
      description: "Bookings, guests and email management",
      metric: "Active Studios",
    },
    logistics: {
      title: "Logistics",
      description: "Cleaning, maintenance and operations",
      metric: "Today's Tasks",
    },
  },
  
  // OTA Dashboard
  ota: {
    title: "Orbi OTA Command Center",
    subtitle: "Real-time booking analytics across all channels",
    sync: "Sync",
    syncing: "Syncing...",
    monthFilter: "Month Filter",
    allMonths: "All Months",
    clear: "Clear",
    totalBookings: "Total Bookings",
    totalRevenue: "Total Revenue",
    totalNights: "Total Nights",
    activeChannels: "Active Channels",
    avg: "Avg",
  },
  
  // Finance Dashboard
  finance: {
    title: "Financial Intelligence",
    subtitle: "Revenue, expenses and financial analytics",
  },
  
  // Marketing Dashboard
  marketing: {
    title: "Marketing Control Center",
    subtitle: "Campaign management and analytics",
  },
  
  // Reviews Dashboard
  reviews: {
    title: "Reviews Command Center",
    subtitle: "All platform reviews in one place",
  },
  
  // Logistics Dashboard
  logistics: {
    title: "Logistics Command Center",
    subtitle: "Studio inventory management and analytics",
  },
  
  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    back: "Back",
    next: "Next",
    previous: "Previous",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    close: "Close",
  },
};

export type Translations = typeof en;
