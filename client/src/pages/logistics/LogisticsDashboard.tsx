import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, BarChart3, ClipboardList, Wrench, History } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryDashboardStats } from "@/components/InventoryDashboardStats";
import { StudioInventoryList } from "@/components/StudioInventoryList";
import { HousekeepingModule } from "@/components/HousekeepingModule";
import { MaintenanceModule } from "@/components/MaintenanceModule";
import { LogisticsActivityLog } from "@/components/LogisticsActivityLog";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useLogisticsRealtimeNotifications } from "@/hooks/useLogisticsRealtimeNotifications";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Logistics = () => {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  // Enable real-time notifications
  useLogisticsRealtimeNotifications();

  // Check if we have real data
  const { data: roomsCount } = useQuery({
    queryKey: ["logistics-rooms-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true });
      if (error) return 0;
      return count || 0;
    },
  });

  const hasRealData = (roomsCount || 0) > 0;
  const dataSource = hasRealData ? "live" : "demo";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header with Ocean Wave */}
      <div className="relative rounded-2xl overflow-hidden mx-6 mt-6 mb-8">
        <div className="relative z-10 px-8 pt-8 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                    {t("ლოჯისტიკის ცენტრი", "Logistics Command Center")}
                  </h1>
                  <DataSourceBadge
                    type={dataSource}
                    source={hasRealData ? "Supabase" : undefined}
                    size="md"
                  />
                </div>
                <p className="text-lg text-white/90 mt-1 font-medium">
                  {t("სტუდიოების ინვენტარის მართვა და ანალიტიკა", "Studio inventory management and analytics")}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Ocean Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
          </svg>
        </div>
        {/* Background */}
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
      </div>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-slate-800/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              {t("მიმოხილვა", "Overview")}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              {t("ინვენტარი", "Inventory")}
            </TabsTrigger>
            <TabsTrigger value="housekeeping" className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <ClipboardList className="h-4 w-4" />
              {t("დასუფთავება", "Housekeeping")}
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Wrench className="h-4 w-4" />
              {t("ტექნიკური", "Maintenance")}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <History className="h-4 w-4" />
              {t("აქტივობა", "Activity")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            }>
              <InventoryDashboardStats />
            </Suspense>
          </TabsContent>

          <TabsContent value="inventory">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            }>
              <StudioInventoryList />
            </Suspense>
          </TabsContent>

          <TabsContent value="housekeeping">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            }>
              <HousekeepingModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="maintenance">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            }>
              <MaintenanceModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="activity">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
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
