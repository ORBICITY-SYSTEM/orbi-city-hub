import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { FinanceModulesLanding } from "@/components/finance/FinanceModulesLanding";
import { FinanceActivityLog } from "@/components/finance/FinanceActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Finance = () => {
  const navigate = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                მთავარი
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  ფინანსური ინტელექტი
                </h1>
                <p className="text-xs text-muted-foreground">
                  ორბი სითის ფინანსური მოდულები
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="modules">
              <TrendingUp className="h-4 w-4 mr-2" />
              მოდულები
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              აქტივობის ლოგი
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                აირჩიეთ მოდული
              </h2>
              <p className="text-muted-foreground">
                ფინანსური მართვის 4 ძირითადი მოდული
              </p>
            </div>
            <FinanceModulesLanding />
          </TabsContent>

          <TabsContent value="activity">
            <FinanceActivityLog />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Finance;
