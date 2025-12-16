import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wallet, LayoutDashboard, Upload, TrendingUp, Calendar, Target } from "lucide-react";
import { useLocation } from "wouter";

const FinanceDevelopmentExpenses = () => {
  const navigate = useLocation();

  const modules = [
    {
      id: "dashboard",
      title: "Dashboard",
      description: "განვითარების ხარჯების მთავარი დაშბორდი",
      icon: LayoutDashboard,
      path: "/finance/development-expenses/dashboard",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "upload",
      title: "Files Upload",
      description: "ხარჯების დოკუმენტების ატვირთვა",
      icon: Upload,
      path: "/finance/development-expenses/upload",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "ხარჯების ანალიზი და რეპორტები",
      icon: TrendingUp,
      path: "/finance/development-expenses/analytics",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "forecast",
      title: "Forecast",
      description: "მომავალი ხარჯების პროგნოზი",
      icon: Calendar,
      path: "/finance/development-expenses/forecast",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      id: "investments",
      title: "Future Investments",
      description: "დაგეგმილი ინვესტიციები",
      icon: Target,
      path: "/finance/development-expenses/investments",
      gradient: "from-red-500 to-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/finance")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              უკან
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  განვითარების ხარჯი
                </h1>
                <p className="text-xs text-muted-foreground">
                  ინვესტიციები და განვითარების ბიუჯეტი
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 overflow-hidden"
                onClick={() => setLocation(module.path)}
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
      </main>
    </div>
  );
};

export default FinanceDevelopmentExpenses;
