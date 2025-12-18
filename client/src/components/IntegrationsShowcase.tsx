import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Puzzle, Lock, Check, X, Clock,
  Mail, Calendar, Database, Cloud, Bot, 
  BarChart3, Globe, MessageSquare, FileSpreadsheet,
  Shield, Zap, Building2, CreditCard, 
  Bell, Cpu, Send, Smartphone, Key, Wallet
} from "lucide-react";

// Active Integration categories
const INTEGRATIONS = {
  google: {
    title: { en: "Google Ecosystem", ka: "Google ეკოსისტემა" },
    icon: Globe,
    color: "from-red-500 to-yellow-500",
    items: [
      { name: "Google Business Profile", description: { en: "Reviews management and business insights", ka: "მიმოხილვების მართვა და ბიზნეს ანალიტიკა" } },
      { name: "Google Analytics 4", description: { en: "Website traffic and user behavior analytics", ka: "ვებსაიტის ტრაფიკი და მომხმარებლის ქცევის ანალიტიკა" } },
      { name: "Gmail API", description: { en: "Email automation and booking sync", ka: "ელფოსტის ავტომატიზაცია და ჯავშნების სინქრონიზაცია" } },
      { name: "Google Calendar", description: { en: "Booking calendar sync and scheduling", ka: "ჯავშნების კალენდრის სინქრონიზაცია" } },
      { name: "Google Drive", description: { en: "Document storage and file management", ka: "დოკუმენტების შენახვა და ფაილების მართვა" } },
      { name: "Google Maps", description: { en: "Location services and property mapping", ka: "ლოკაციის სერვისები და ობიექტების რუკა" } },
      { name: "Google OAuth 2.0", description: { en: "Secure authentication and SSO", ka: "უსაფრთხო ავთენტიფიკაცია და SSO" } }
    ]
  },
  ota: {
    title: { en: "OTA Channels", ka: "OTA არხები" },
    icon: Building2,
    color: "from-blue-500 to-cyan-500",
    items: [
      { name: "Booking.com", description: { en: "Reservation sync and review management", ka: "ჯავშნების სინქრონიზაცია და მიმოხილვების მართვა" } },
      { name: "Airbnb", description: { en: "Listing management and guest communication", ka: "განცხადებების მართვა და სტუმრებთან კომუნიკაცია" } },
      { name: "Expedia", description: { en: "Channel management and rate sync", ka: "არხების მართვა და ფასების სინქრონიზაცია" } },
      { name: "TripAdvisor", description: { en: "Review aggregation and reputation management", ka: "მიმოხილვების აგრეგაცია და რეპუტაციის მართვა" } },
      { name: "Agoda", description: { en: "Asian market channel integration", ka: "აზიის ბაზრის არხის ინტეგრაცია" } }
    ]
  },
  ai: {
    title: { en: "AI & Machine Learning", ka: "AI და მანქანური სწავლება" },
    icon: Bot,
    color: "from-purple-500 to-pink-500",
    items: [
      { name: "Google Gemini 2.5 Flash", description: { en: "Advanced AI for review responses and analysis", ka: "მოწინავე AI მიმოხილვების პასუხებისა და ანალიზისთვის" } },
      { name: "Butler AI Assistant", description: { en: "Intelligent task automation and guest support", ka: "ინტელექტუალური ამოცანების ავტომატიზაცია" } },
      { name: "AI Email Categorization", description: { en: "Smart email sorting and prioritization", ka: "ჭკვიანი ელფოსტის დახარისხება და პრიორიტეტიზაცია" } },
      { name: "AI File Analyzer", description: { en: "Document analysis and data extraction", ka: "დოკუმენტების ანალიზი და მონაცემების ამოღება" } },
      { name: "AI Review Response Generator", description: { en: "Personalized review responses in multiple languages", ka: "პერსონალიზებული პასუხები მრავალ ენაზე" } },
      { name: "Voice Transcription AI", description: { en: "Speech-to-text for voice messages", ka: "ხმის შეტყობინებების ტექსტად გარდაქმნა" } }
    ]
  },
  automation: {
    title: { en: "Automation & Webhooks", ka: "ავტომატიზაცია და Webhooks" },
    icon: Zap,
    color: "from-orange-500 to-red-500",
    items: [
      { name: "N8N Workflow Automation", description: { en: "Custom workflow automation and triggers", ka: "მორგებული workflow ავტომატიზაცია" } },
      { name: "Outscraper Webhook", description: { en: "Real-time review data collection", ka: "რეალ-ტაიმ მიმოხილვების მონაცემების შეგროვება" } },
      { name: "Gmail Push Notifications", description: { en: "Real-time email notifications via Pub/Sub", ka: "რეალ-ტაიმ ელფოსტის შეტყობინებები" } },
      { name: "WhatsApp Business Bot", description: { en: "Automated guest messaging and support", ka: "ავტომატური სტუმრების შეტყობინებები" } },
      { name: "Scheduled Tasks (Cron)", description: { en: "Automated daily reports and sync jobs", ka: "ავტომატური დღიური ანგარიშები" } }
    ]
  },
  data: {
    title: { en: "Data & Analytics", ka: "მონაცემები და ანალიტიკა" },
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
    items: [
      { name: "Power BI Integration", description: { en: "Advanced financial dashboards and reports", ka: "მოწინავე ფინანსური დეშბორდები და ანგარიშები" } },
      { name: "MySQL Database", description: { en: "Relational database for all business data", ka: "რელაციური ბაზა ყველა ბიზნეს მონაცემისთვის" } },
      { name: "Drizzle ORM", description: { en: "Type-safe database queries and migrations", ka: "ტიპ-უსაფრთხო მონაცემთა ბაზის მოთხოვნები" } },
      { name: "Excel Import/Export", description: { en: "Bulk data import and report export", ka: "მასობრივი მონაცემების იმპორტი და ექსპორტი" } },
      { name: "Real-time Dashboard", description: { en: "Live KPIs and business metrics", ka: "რეალ-ტაიმ KPI და ბიზნეს მეტრიკები" } }
    ]
  },
  storage: {
    title: { en: "Cloud Storage", ka: "ღრუბლოვანი საცავი" },
    icon: Cloud,
    color: "from-sky-500 to-blue-500",
    items: [
      { name: "AWS S3 Storage", description: { en: "Secure file storage and CDN delivery", ka: "უსაფრთხო ფაილების შენახვა და CDN მიწოდება" } },
      { name: "Image Generation & Storage", description: { en: "AI-generated images with cloud storage", ka: "AI-გენერირებული სურათები ღრუბლოვანი შენახვით" } },
      { name: "Database Backup to S3", description: { en: "Automated database backups", ka: "ავტომატური მონაცემთა ბაზის სარეზერვო ასლები" } }
    ]
  },
  security: {
    title: { en: "Security & Compliance", ka: "უსაფრთხოება და შესაბამისობა" },
    icon: Shield,
    color: "from-slate-500 to-zinc-500",
    items: [
      { name: "OAuth 2.0 Authentication", description: { en: "Secure user authentication", ka: "უსაფრთხო მომხმარებლის ავთენტიფიკაცია" } },
      { name: "JWT Token Management", description: { en: "Secure session management", ka: "უსაფრთხო სესიის მართვა" } },
      { name: "GDPR Compliance Tools", description: { en: "Data privacy and export tools", ka: "მონაცემთა კონფიდენციალურობის ინსტრუმენტები" } },
      { name: "Role-Based Access Control", description: { en: "Granular permission management", ka: "დეტალური უფლებების მართვა" } },
      { name: "AES-256 Encryption", description: { en: "Encrypted credential storage", ka: "დაშიფრული credentials-ის შენახვა" } },
      { name: "Rate Limiting & DDoS Protection", description: { en: "API security and abuse prevention", ka: "API უსაფრთხოება და ბოროტად გამოყენების პრევენცია" } }
    ]
  },
  hospitality: {
    title: { en: "Hospitality Systems", ka: "სასტუმრო სისტემები" },
    icon: Building2,
    color: "from-amber-500 to-orange-500",
    items: [
      { name: "OTELMS (Yahoo Mail)", description: { en: "Hotel management system email sync", ka: "სასტუმრო მართვის სისტემის ელფოსტის სინქრონიზაცია" } },
      { name: "Housekeeping Management", description: { en: "Room cleaning schedules and tracking", ka: "ოთახების დალაგების გრაფიკი და თვალყურის დევნება" } },
      { name: "Maintenance Tracking", description: { en: "Property maintenance and repairs", ka: "ობიექტის მოვლა და რემონტი" } },
      { name: "Inventory Management", description: { en: "Supplies and amenities tracking", ka: "მარაგების და კეთილმოწყობის თვალყურის დევნება" } },
      { name: "Guest Communication Hub", description: { en: "Centralized guest messaging", ka: "ცენტრალიზებული სტუმრების შეტყობინებები" } }
    ]
  }
};

// Coming Soon integrations
const COMING_SOON = {
  payments: {
    title: { en: "Payments & Finance", ka: "გადახდები და ფინანსები" },
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
    items: [
      { name: "Stripe", description: { en: "Online payments, deposits and refunds", ka: "ონლაინ გადახდები, დეპოზიტები და დაბრუნებები" } },
      { name: "PayPal", description: { en: "Alternative payment processing", ka: "ალტერნატიული გადახდის დამუშავება" } },
      { name: "QuickBooks", description: { en: "Accounting and invoicing automation", ka: "ბუღალტერია და ინვოისების ავტომატიზაცია" } },
      { name: "Xero", description: { en: "Cloud accounting integration", ka: "ღრუბლოვანი ბუღალტერიის ინტეგრაცია" } },
      { name: "Bank Feed API", description: { en: "Real-time bank transaction sync", ka: "რეალ-ტაიმ ბანკის ტრანზაქციების სინქრონიზაცია" } }
    ]
  },
  communication: {
    title: { en: "Communication", ka: "კომუნიკაცია" },
    icon: MessageSquare,
    color: "from-violet-500 to-purple-500",
    items: [
      { name: "Twilio SMS", description: { en: "SMS notifications and 2FA", ka: "SMS შეტყობინებები და 2FA" } },
      { name: "Telegram Bot", description: { en: "Guest communication via Telegram", ka: "სტუმრებთან კომუნიკაცია Telegram-ით" } },
      { name: "Slack Integration", description: { en: "Team notifications and alerts", ka: "გუნდის შეტყობინებები და გაფრთხილებები" } },
      { name: "Discord Webhooks", description: { en: "Real-time team updates", ka: "რეალ-ტაიმ გუნდის განახლებები" } },
      { name: "Intercom", description: { en: "Live chat and customer support", ka: "ლაივ ჩატი და მომხმარებლის მხარდაჭერა" } }
    ]
  },
  marketing: {
    title: { en: "Marketing & CRM", ka: "მარკეტინგი და CRM" },
    icon: Send,
    color: "from-pink-500 to-rose-500",
    items: [
      { name: "Mailchimp", description: { en: "Email marketing campaigns", ka: "ელფოსტის მარკეტინგის კამპანიები" } },
      { name: "HubSpot CRM", description: { en: "Customer relationship management", ka: "კლიენტებთან ურთიერთობის მართვა" } },
      { name: "Salesforce", description: { en: "Enterprise CRM integration", ka: "საწარმოს CRM ინტეგრაცია" } },
      { name: "Meta Ads API", description: { en: "Facebook & Instagram advertising", ka: "Facebook და Instagram რეკლამა" } },
      { name: "Google Ads", description: { en: "Search and display advertising", ka: "საძიებო და ჩვენების რეკლამა" } }
    ]
  },
  automation2: {
    title: { en: "Advanced Automation", ka: "მოწინავე ავტომატიზაცია" },
    icon: Cpu,
    color: "from-cyan-500 to-blue-500",
    items: [
      { name: "Zapier", description: { en: "Connect 5000+ apps automatically", ka: "5000+ აპლიკაციის ავტომატური დაკავშირება" } },
      { name: "Make (Integromat)", description: { en: "Visual automation workflows", ka: "ვიზუალური ავტომატიზაციის workflows" } },
      { name: "IFTTT", description: { en: "Simple automation triggers", ka: "მარტივი ავტომატიზაციის ტრიგერები" } },
      { name: "Power Automate", description: { en: "Microsoft ecosystem automation", ka: "Microsoft ეკოსისტემის ავტომატიზაცია" } }
    ]
  },
  smartProperty: {
    title: { en: "Smart Property", ka: "ჭკვიანი ობიექტი" },
    icon: Key,
    color: "from-amber-500 to-yellow-500",
    items: [
      { name: "Smart Lock API (Yale/August)", description: { en: "Remote door access control", ka: "დისტანციური კარის წვდომის კონტროლი" } },
      { name: "Apple Wallet Keys", description: { en: "Digital room keys for iPhone", ka: "ციფრული ოთახის გასაღებები iPhone-ისთვის" } },
      { name: "Google Wallet Keys", description: { en: "Digital room keys for Android", ka: "ციფრული ოთახის გასაღებები Android-ისთვის" } },
      { name: "Nest Thermostat", description: { en: "Smart climate control", ka: "ჭკვიანი კლიმატის კონტროლი" } },
      { name: "Ring/Arlo Cameras", description: { en: "Security camera integration", ka: "უსაფრთხოების კამერების ინტეგრაცია" } },
      { name: "IoT Sensors", description: { en: "Occupancy and environment monitoring", ka: "დატვირთვის და გარემოს მონიტორინგი" } }
    ]
  },
  distribution: {
    title: { en: "Channel Distribution", ka: "არხების დისტრიბუცია" },
    icon: Globe,
    color: "from-indigo-500 to-violet-500",
    items: [
      { name: "SiteMinder", description: { en: "Channel manager integration", ka: "არხების მენეჯერის ინტეგრაცია" } },
      { name: "Cloudbeds", description: { en: "Property management system", ka: "ობიექტის მართვის სისტემა" } },
      { name: "Guesty", description: { en: "Short-term rental management", ka: "მოკლევადიანი გაქირავების მართვა" } },
      { name: "Hostaway", description: { en: "Vacation rental software", ka: "შვებულების გაქირავების პროგრამა" } },
      { name: "Vrbo/HomeAway", description: { en: "Vacation rental channel", ka: "შვებულების გაქირავების არხი" } }
    ]
  }
};

// Calculate totals
const TOTAL_ACTIVE = Object.values(INTEGRATIONS).reduce((acc, cat) => acc + cat.items.length, 0);
const TOTAL_COMING = Object.values(COMING_SOON).reduce((acc, cat) => acc + cat.items.length, 0);

interface IntegrationsShowcaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationsShowcase({ open, onOpenChange }: IntegrationsShowcaseProps) {
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "coming">("active");
  
  const SHOWCASE_PASSWORD = "SHAKOniniamasho1!";

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SHOWCASE_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError(language === "ka" ? "არასწორი პაროლი" : "Incorrect password");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsAuthenticated(false);
      setPassword("");
      setError("");
      setActiveTab("active");
    }, 300);
  };

  const renderIntegrationCategory = (key: string, category: any, isComingSoon: boolean) => {
    const Icon = category.icon;
    return (
      <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center ${isComingSoon ? 'opacity-70' : ''}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {category.title[language as keyof typeof category.title]}
            </h3>
            <p className="text-sm text-slate-400">
              {category.items.length} {language === "ka" ? "ინტეგრაცია" : "integrations"}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {category.items.map((item: any, idx: number) => (
            <div 
              key={idx}
              className={`flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border transition-colors ${
                isComingSoon 
                  ? 'border-slate-700/30 opacity-80' 
                  : 'border-slate-700/30 hover:border-cyan-500/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isComingSoon 
                  ? 'bg-amber-500/20' 
                  : 'bg-emerald-500/20'
              }`}>
                {isComingSoon 
                  ? <Clock className="w-3.5 h-3.5 text-amber-400" />
                  : <Check className="w-3.5 h-3.5 text-emerald-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm">{item.name}</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  {item.description[language as keyof typeof item.description]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${isAuthenticated ? 'max-w-5xl max-h-[90vh]' : 'max-w-md'} bg-slate-900 border-slate-700`}>
        {!isAuthenticated ? (
          <div className="py-8">
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl text-white">
                {language === "ka" ? "ინტეგრაციების ცენტრი" : "Integrations Center"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {language === "ka" 
                  ? "შეიყვანეთ პაროლი სისტემის ინტეგრაციების სანახავად"
                  : "Enter password to view system integrations"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === "ka" ? "პაროლი" : "Password"}
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              {error && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> {error}
                </p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {language === "ka" ? "შესვლა" : "Access"}
              </Button>
            </form>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Puzzle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-white">
                      {language === "ka" ? "სისტემის ინტეგრაციები" : "System Integrations"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {language === "ka" 
                        ? `${TOTAL_ACTIVE + TOTAL_COMING} ინტეგრაცია ერთ პლატფორმაში`
                        : `${TOTAL_ACTIVE + TOTAL_COMING} integrations in one platform`}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                    <Check className="w-3 h-3 mr-1" />
                    {TOTAL_ACTIVE} {language === "ka" ? "აქტიური" : "Active"}
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {TOTAL_COMING} {language === "ka" ? "მალე" : "Coming"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* Tab Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={activeTab === "active" ? "default" : "outline"}
                onClick={() => setActiveTab("active")}
                className={activeTab === "active" 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"}
              >
                <Check className="w-4 h-4 mr-2" />
                {language === "ka" ? "აქტიური ინტეგრაციები" : "Active Integrations"} ({TOTAL_ACTIVE})
              </Button>
              <Button
                variant={activeTab === "coming" ? "default" : "outline"}
                onClick={() => setActiveTab("coming")}
                className={activeTab === "coming" 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"}
              >
                <Clock className="w-4 h-4 mr-2" />
                {language === "ka" ? "მალე დაემატება" : "Coming Soon"} ({TOTAL_COMING})
              </Button>
            </div>

            <ScrollArea className="h-[55vh] pr-4 mt-4">
              <div className="space-y-6">
                {activeTab === "active" 
                  ? Object.entries(INTEGRATIONS).map(([key, cat]) => renderIntegrationCategory(key, cat, false))
                  : Object.entries(COMING_SOON).map(([key, cat]) => renderIntegrationCategory(key, cat, true))
                }
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-4 h-4" />
                  {language === "ka" 
                    ? "ყველა ინტეგრაცია დაცულია და დაშიფრულია"
                    : "All integrations are secure and encrypted"}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClose}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {language === "ka" ? "დახურვა" : "Close"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
