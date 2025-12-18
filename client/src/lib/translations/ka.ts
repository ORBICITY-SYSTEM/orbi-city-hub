import type { Translations } from "./en";

export const ka: Translations = {
  // Header
  logout: "გასვლა",
  
  // Navigation
  nav: {
    home: "მთავარი",
    finance: "ფინანსები",
    marketing: "მარკეტინგი",
    reservations: "რეზერვაციები",
    logistics: "ლოჯისტიკა",
    whatsappBot: "WhatsApp ბოტი",
  },
  
  // Submenu items
  submenu: {
    // Finance
    financeDashboard: "მთავარი",
    analytics: "ანალიტიკა",
    reports: "თვიური ანგარიშები",
    otelms: "OTELMS",
    devExpenses: "დევ ხარჯები",
    
    // Marketing
    marketingDashboard: "მთავარი",
    otaChannels: "OTA არხები",
    webLeads: "ვებ ლიდები",
    
    // Reservations
    otaDashboard: "მთავარი",
    aiResponses: "AI პასუხები",
    butlerAI: "Butler AI",
    email: "ელფოსტა",
    reviews: "მიმოხილვები",
    otaCommand: "OTA სარდლობა",
    
    // Logistics
    logisticsDashboard: "მთავარი",
    housekeeping: "დალაგება",
    maintenance: "მოვლა",
    
    // WhatsApp
    quickStart: "სწრაფი დაწყება",
    implementation: "იმპლემენტაცია",
    codeExamples: "კოდის მაგალითები",
    systemPrompt: "სისტემის პრომპტი",
    testing: "ტესტირება",
    resources: "რესურსები",
    deployment: "განთავსება",
  },
  
  // Home page
  home: {
    title: "ORBI City Hub",
    subtitle: "საზღვაო აპარტჰოტელის მართვის პლატფორმა",
    totalRevenue: "სულ შემოსავალი",
    totalProfit: "სულ მოგება",
    studios: "სტუდიოები",
    avgOccupancy: "საშ. დატვირთვა",
    mainModules: "ძირითადი მოდულები",
    view: "ნახვა",
  },
  
  // Main AI Agent
  aiAgent: {
    title: "მთავარი AI აგენტი",
    subtitle: "ინტელექტუალური მონაცემების განაწილება",
    description: "ატვირთეთ Excel/PDF ფაილები და AI ავტომატურად გააანალიზებს და გაანაწილებს მონაცემებს შესაბამის მოდულებში",
    uploadPrompt: "დააჭირეთ Excel ან PDF ასატვირთად",
    analyze: "ანალიზი",
    analyzing: "ანალიზი...",
    analysisComplete: "ანალიზი დასრულდა",
    dataDistribution: "მონაცემების განაწილება",
    suggestions: "AI რეკომენდაციები",
    uploadHint: "ატვირთეთ ფინანსური ანგარიში, ჯავშნების სია ან ინვენტარის ცხრილი",
    autoDistribute: "AI ავტომატურად გააანალიზებს და გაანაწილებს მონაცემებს",
    type: "ტიპი",
    confidence: "სიზუსტე",
    analysisSuccess: "ფაილი წარმატებით გაანალიზდა!",
    analysisFailed: "ფაილის ანალიზი ვერ მოხერხდა",
  },
  
  // Module cards
  modules: {
    finance: {
      title: "ფინანსები",
      description: "შემოსავლები, ხარჯები და ფინანსური ანალიტიკა",
      metric: "წლიური შემოსავალი",
    },
    marketing: {
      title: "მარკეტინგი",
      description: "OTA არხები, კამპანიები და ვებსაიტის ლიდები",
      metric: "საშ. დატვირთვა",
    },
    reservations: {
      title: "რეზერვაციები",
      description: "ჯავშნები, სტუმრები და ელფოსტის მართვა",
      metric: "აქტიური სტუდიოები",
    },
    logistics: {
      title: "ლოჯისტიკა",
      description: "დალაგება, მოვლა და ოპერაციები",
      metric: "დღევანდელი ამოცანები",
    },
  },
  
  // OTA Dashboard
  ota: {
    title: "Orbi OTA სარდლობის ცენტრი",
    subtitle: "რეალური ჯავშნების ანალიტიკა ყველა არხზე",
    sync: "სინქრონიზაცია",
    syncing: "სინქრონიზაცია...",
    monthFilter: "თვის ფილტრი",
    allMonths: "ყველა თვე",
    clear: "გასუფთავება",
    totalBookings: "სულ ჯავშნები",
    totalRevenue: "სულ შემოსავალი",
    totalNights: "სულ ღამეები",
    activeChannels: "აქტიური არხები",
    avg: "საშ",
  },
  
  // Finance Dashboard
  finance: {
    title: "ფინანსური ინტელექტი",
    subtitle: "შემოსავლები, ხარჯები და ფინანსური ანალიტიკა",
  },
  
  // Marketing Dashboard
  marketing: {
    title: "მარკეტინგის ცენტრი",
    subtitle: "კამპანიების მართვა და ანალიტიკა",
  },
  
  // Reviews Dashboard
  reviews: {
    title: "მიმოხილვების ცენტრი",
    subtitle: "ყველა პლატფორმის მიმოხილვები ერთ ადგილას",
  },
  
  // Logistics Dashboard
  logistics: {
    title: "ლოჯისტიკის ცენტრი",
    subtitle: "სტუდიოების ინვენტარის მართვა და ანალიტიკა",
  },
  
  // Common
  common: {
    loading: "იტვირთება...",
    error: "შეცდომა",
    success: "წარმატება",
    save: "შენახვა",
    cancel: "გაუქმება",
    delete: "წაშლა",
    edit: "რედაქტირება",
    add: "დამატება",
    search: "ძებნა",
    filter: "ფილტრი",
    export: "ექსპორტი",
    import: "იმპორტი",
    refresh: "განახლება",
    back: "უკან",
    next: "შემდეგი",
    previous: "წინა",
    yes: "დიახ",
    no: "არა",
    confirm: "დადასტურება",
    close: "დახურვა",
  },
};
