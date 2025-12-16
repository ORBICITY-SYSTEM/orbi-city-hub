import { Card } from "@/components/ui/card";
import { TrendingUp, Building2, Calendar, Wallet, BarChart3, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export const FinanceModulesLanding = () => {
  const [, navigate] = useLocation();

  const modules = [
    {
      id: "powerbi",
      title: "📊 Power BI ანალიტიკა",
      description: "ინტერაქტიული დეშბორდი - ფილტრები, გრაფიკები, რეალური მონაცემები",
      icon: BarChart3,
      path: "/finance/powerbi",
      gradient: "from-emerald-500 to-teal-500",
      badge: "NEW",
    },
    {
      id: "analytics",
      title: "ფინანსური ანალიზი",
      description: "შემოსავლები, ხარჯები და მოგების ანალიზი",
      icon: TrendingUp,
      path: "/finance/analytics",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "otelms",
      title: "OtelMS",
      description: "სასტუმროს მართვის სისტემა",
      icon: Building2,
      path: "/finance/otelms",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "monthly",
      title: "თვეების ანალიზი",
      description: "თვიური ფინანსური რეპორტები",
      icon: Calendar,
      path: "/finance/reports",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "development",
      title: "განვითარების ხარჯი",
      description: "ინვესტიციები და განვითარების ბიუჯეტი",
      icon: Wallet,
      path: "/finance/expenses",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {modules.map((module) => {
        const Icon = module.icon;
        const isPowerBI = module.id === "powerbi";
        return (
          <Card
            key={module.id}
            className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden ${
              isPowerBI 
                ? "md:col-span-2 border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 hover:border-emerald-400" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => navigate(module.path)}
          >
            <div className={isPowerBI ? "p-8 md:flex md:items-center md:gap-8" : "p-8"}>
              <div className={`inline-flex ${isPowerBI ? "h-20 w-20" : "h-16 w-16"} items-center justify-center rounded-2xl bg-gradient-to-br ${module.gradient} mb-4 md:mb-0 group-hover:scale-110 transition-transform duration-300 relative`}>
                <Icon className={`${isPowerBI ? "h-10 w-10" : "h-8 w-8"} text-white`} />
                {isPowerBI && (
                  <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`${isPowerBI ? "text-3xl" : "text-2xl"} font-bold text-foreground group-hover:text-primary transition-colors`}>
                    {module.title}
                  </h3>
                  {module.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full animate-pulse">
                      {module.badge}
                    </span>
                  )}
                </div>
                <p className={`text-muted-foreground ${isPowerBI ? "text-lg" : ""}`}>
                  {module.description}
                </p>
                {isPowerBI && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs bg-emerald-900/50 text-emerald-300 rounded-full">ფილტრები</span>
                    <span className="px-3 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-full">გრაფიკები</span>
                    <span className="px-3 py-1 text-xs bg-purple-900/50 text-purple-300 rounded-full">სორტირება</span>
                    <span className="px-3 py-1 text-xs bg-amber-900/50 text-amber-300 rounded-full">13 თვის მონაცემები</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${module.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
          </Card>
        );
      })}
    </div>
  );
};
