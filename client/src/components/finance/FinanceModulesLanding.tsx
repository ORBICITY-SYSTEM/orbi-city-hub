import { Card } from "@/components/ui/card";
import { TrendingUp, Building2, Calendar, Wallet } from "lucide-react";
import { useLocation } from "wouter";

export const FinanceModulesLanding = () => {
  const navigate = useLocation();

  const modules = [
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
      path: "/finance/monthly-analysis",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "development",
      title: "განვითარების ხარჯი",
      description: "ინვესტიციები და განვითარების ბიუჯეტი",
      icon: Wallet,
      path: "/finance/development-expenses",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {modules.map((module) => {
        const Icon = module.icon;
        return (
          <Card
            key={module.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 overflow-hidden"
            onClick={() => navigate(module.path)}
          >
            <div className="p-8">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${module.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              <p className="text-muted-foreground">
                {module.description}
              </p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${module.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
          </Card>
        );
      })}
    </div>
  );
};
