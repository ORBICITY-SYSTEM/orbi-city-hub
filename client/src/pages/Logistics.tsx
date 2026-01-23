import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, BarChart3, ClipboardList, Wrench, History } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryDashboardStats } from "@/components/InventoryDashboardStats";
import { StudioInventoryList } from "@/components/StudioInventoryList";
import { HousekeepingModule } from "@/components/HousekeepingModule";
import { MaintenanceModule } from "@/components/MaintenanceModule";
import { LogisticsActivityLog } from "@/components/LogisticsActivityLog";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const Logistics = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Rooms & Housekeeping"
        titleKa="ოთახები და დასუფთავება"
        subtitle="Studio inventory management and analytics"
        subtitleKa="სტუდიოების ინვენტარის მართვა და ანალიტიკა"
        icon={Package}
        iconGradient="from-orange-500 to-amber-600"
        dataSource={{ type: "live", source: "Supabase" }}
      />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-slate-800/50 border border-white/10">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("დეშბორდი", "Dashboard")}</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t("ინვენტარი", "Inventory")}</span>
            </TabsTrigger>
            <TabsTrigger value="housekeeping" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">{t("დასუფთავება", "Housekeeping")}</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">{t("ტექნიკური", "Maintenance")}</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{t("აქტივობა", "Activity")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              </div>
            }>
              <InventoryDashboardStats />
            </Suspense>
          </TabsContent>

          <TabsContent value="inventory">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              </div>
            }>
              <StudioInventoryList />
            </Suspense>
          </TabsContent>

          <TabsContent value="housekeeping">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              </div>
            }>
              <HousekeepingModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="maintenance">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              </div>
            }>
              <MaintenanceModule />
            </Suspense>
          </TabsContent>

          <TabsContent value="activity">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
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
