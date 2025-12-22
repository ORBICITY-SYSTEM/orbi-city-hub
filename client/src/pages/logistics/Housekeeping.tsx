import { HousekeepingModule } from "@/components/HousekeepingModule";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const Housekeeping = () => {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/logistics")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("უკან", "Back")}
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t("დასუფთავების განრიგი", "Housekeeping Schedule")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("ოთახების დასუფთავების დაგეგმვა და მართვა", "Room cleaning scheduling and management")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <HousekeepingModule />
      </main>
    </div>
  );
};

export default Housekeeping;
