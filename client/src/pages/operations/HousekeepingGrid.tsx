/**
 * PowerStack Operations - Housekeeping Grid Page
 * 
 * Dedicated page for the 60-apartment housekeeping grid.
 * Matches Ocean Theme design system.
 * 
 * Route: /operations/housekeeping
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { PowerStackHousekeepingGrid } from "@/components/PowerStackHousekeepingGrid";
import { AIDirectComposer } from "@/components/AIDirectComposer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot } from "lucide-react";

const HousekeepingGridPage = () => {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-blue-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/")}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("უკან", "Back")}
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <LayoutGrid className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {t("ოპერაციები & ლოჯისტიკა", "Operations & Logistics")}
                  </h1>
                  <p className="text-xs text-white/60">
                    {t("60 აპარტამენტის მართვა", "60 apartments management")}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">
                {t("სისტემა აქტიურია", "System Online")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="housekeeping" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white/5 border border-white/10">
            <TabsTrigger 
              value="housekeeping" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <LayoutGrid className="h-4 w-4" />
              {t("ოთახების გრიდი", "Room Grid")}
            </TabsTrigger>
            <TabsTrigger 
              value="ai-composer" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Bot className="h-4 w-4" />
              {t("AI კომპოზერი", "AI Composer")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="housekeeping">
            <PowerStackHousekeepingGrid />
          </TabsContent>

          <TabsContent value="ai-composer">
            <AIDirectComposer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HousekeepingGridPage;
