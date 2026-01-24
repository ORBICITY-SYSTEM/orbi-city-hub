/**
 * Logistics Module - Main Dashboard with Sub-Module Tabs
 * Connected to Supabase for real-time data
 */

import { Suspense, lazy } from "react";
import { Truck, Package, BarChart3, ClipboardList, Wrench, History, Loader2, PieChart } from "lucide-react";
import { ModulePageLayout, SubModule } from "@/components/ModulePageLayout";

// Lazy load overview component
const LogisticsOverviewContent = lazy(() => import("@/components/logistics/LogisticsOverviewDashboard").then(m => ({ default: m.LogisticsOverviewDashboard })));
import { StudioInventoryList } from "@/components/StudioInventoryList";
import { HousekeepingModule } from "@/components/HousekeepingModule";
import { MaintenanceModule } from "@/components/MaintenanceModule";
import { LogisticsActivityLog } from "@/components/LogisticsActivityLog";
import { useLogisticsRealtimeNotifications } from "@/hooks/useLogisticsRealtimeNotifications";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
  </div>
);

// Overview Tab - Dashboard Stats
const OverviewTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LogisticsOverviewContent />
  </Suspense>
);

// Inventory Tab
const InventoryTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <StudioInventoryList />
    </div>
  </Suspense>
);

// Housekeeping Tab
const HousekeepingTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <HousekeepingModule />
    </div>
  </Suspense>
);

// Maintenance Tab
const MaintenanceTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <MaintenanceModule />
    </div>
  </Suspense>
);

// Activity Log Tab
const ActivityTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <LogisticsActivityLog />
    </div>
  </Suspense>
);

const Logistics = () => {
  // Enable real-time notifications from Supabase
  useLogisticsRealtimeNotifications();

  const subModules: SubModule[] = [
    {
      id: "overview",
      nameKey: "logistics.overview",
      nameFallback: "Overview",
      icon: PieChart,
      component: <OverviewTab />,
    },
    {
      id: "inventory",
      nameKey: "logistics.inventory",
      nameFallback: "Inventory",
      icon: Package,
      component: <InventoryTab />,
    },
    {
      id: "housekeeping",
      nameKey: "logistics.housekeeping",
      nameFallback: "Housekeeping",
      icon: ClipboardList,
      component: <HousekeepingTab />,
    },
    {
      id: "maintenance",
      nameKey: "logistics.maintenance",
      nameFallback: "Maintenance",
      icon: Wrench,
      component: <MaintenanceTab />,
    },
    {
      id: "activity",
      nameKey: "logistics.activity",
      nameFallback: "Activity",
      icon: History,
      component: <ActivityTab />,
    },
  ];

  return (
    <ModulePageLayout
      moduleTitle="Logistics"
      moduleTitleKa="ლოჯისტიკა"
      moduleSubtitle="Inventory, housekeeping, and maintenance management"
      moduleSubtitleKa="ინვენტარი, დასუფთავება და ტექნიკური მომსახურება"
      moduleIcon={Truck}
      moduleColor="purple"
      subModules={subModules}
      defaultTab="overview"
    />
  );
};

export default Logistics;
