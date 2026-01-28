import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, BarChart3, ClipboardList, Wrench, History, CalendarCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryDashboardStats } from "@/components/InventoryDashboardStats";
import { StudioInventoryList } from "@/components/StudioInventoryList";
import { HousekeepingModule } from "@/components/HousekeepingModule";
import { MaintenanceModule } from "@/components/MaintenanceModule";
import { LogisticsActivityLog } from "@/components/LogisticsActivityLog";
import { TodayOperations } from "@/components/logistics/TodayOperations";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";


const Logistics = () => {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-white/10 bg-blue-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("უკან", "Back")}
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai">
                  <Package className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {t("ოთახები და დასუფთავება", "Rooms & Housekeeping")}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {t("სტუდიოების ინვენტარის მართვა და ანალიტიკა", "Studio inventory management and analytics")}
                  </p>
                </div>
              </div>
            </div>
            <DataSourceBadge type="live" source="Supabase" size="md" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="operations" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              {t("ოპერაციები", "Operations")}
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("დეშბორდი", "Dashboard")}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("ინვენტარი", "Inventory")}
            </TabsTrigger>
            <TabsTrigger value="housekeeping" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {t("დასუფთავება", "Housekeeping")}
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {t("ტექნიკური", "Maintenance")}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t("აქტივობა", "Activity")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operations">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <TodayOperations />
            </Suspense>
          </TabsContent>

          <TabsContent value="dashboard">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <InventoryDashboardStats />
            </Suspense>
          </TabsContent>

          <TabsContent value="inventory">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <StudioInventoryList />
            </Suspense>
          </TabsContent>

          <TabsContent value="housekeeping">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <HousekeepingModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="maintenance">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <MaintenanceModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="activity">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <LogisticsActivityLog />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Logistics;
