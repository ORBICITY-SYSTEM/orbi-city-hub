/**
 * Finance Module - Professional Financial Management Dashboard
 * Revenue, Expenses, Reports, Investors, Forecasting
 */

import { Suspense, lazy, useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, FileText, Users,
  Brain, PieChart, Loader2, BarChart3, Target, Building2
} from "lucide-react";
import { ModulePageLayout, SubModule } from "@/components/ModulePageLayout";
import { FinanceCopilotWidget } from "@/components/finance-copilot";

// Lazy load sub-module components
const FinanceOverviewContent = lazy(() => import("@/components/finance/FinanceOverviewDashboard").then(m => ({ default: m.FinanceOverviewDashboard })));
const RevenueModule = lazy(() => import("@/components/finance/RevenueModule").then(m => ({ default: m.RevenueModule })));
const ExpensesModule = lazy(() => import("@/components/finance/ExpensesModule").then(m => ({ default: m.ExpensesModule })));
const FinanceReportsContent = lazy(() => import("./FinanceMonthlyReports").then(m => ({ default: m.default })));
const InvestorsContent = lazy(() => import("./InvestorsDashboard").then(m => ({ default: m.default })));
const ForecastModule = lazy(() => import("@/components/finance/FutureForecastModule").then(m => ({ default: m.FutureForecastModule })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
  </div>
);

// Overview Tab
const OverviewTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <FinanceOverviewContent />
  </Suspense>
);

// Revenue Tab
const RevenueTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <RevenueModule />
    </div>
  </Suspense>
);

// Expenses Tab
const ExpensesTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <ExpensesModule />
    </div>
  </Suspense>
);

// Reports Tab
const ReportsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <FinanceReportsContent />
    </div>
  </Suspense>
);

// Investors Tab
const InvestorsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <InvestorsContent />
  </Suspense>
);

// Forecast Tab
const ForecastTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <ForecastModule />
    </div>
  </Suspense>
);

const Finance = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const subModules: SubModule[] = [
    {
      id: "overview",
      nameKey: "finance.overview",
      nameFallback: "Overview",
      icon: PieChart,
      component: <OverviewTab />,
    },
    {
      id: "revenue",
      nameKey: "finance.revenue",
      nameFallback: "Revenue",
      icon: TrendingUp,
      component: <RevenueTab />,
    },
    {
      id: "expenses",
      nameKey: "finance.expenses",
      nameFallback: "Expenses",
      icon: TrendingDown,
      component: <ExpensesTab />,
    },
    {
      id: "reports",
      nameKey: "finance.reports",
      nameFallback: "Reports",
      icon: FileText,
      component: <ReportsTab />,
    },
    {
      id: "investors",
      nameKey: "finance.investors",
      nameFallback: "Investors",
      icon: Users,
      component: <InvestorsTab />,
    },
    {
      id: "forecast",
      nameKey: "finance.forecast",
      nameFallback: "Forecast",
      icon: Target,
      component: <ForecastTab />,
    },
  ];

  return (
    <>
      <ModulePageLayout
        moduleTitle="Finance"
        moduleTitleKa="ფინანსები"
        moduleSubtitle="Revenue, expenses, reports, and investment tracking"
        moduleSubtitleKa="შემოსავლები, ხარჯები, ანგარიშები და ინვესტიციები"
        moduleIcon={DollarSign}
        moduleColor="cyan"
        subModules={subModules}
        defaultTab="overview"
      />

      {/* AI Finance Copilot Floating Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50 hover:scale-110 transition-all duration-300"
        title="AI Finance Copilot"
      >
        <Brain className="h-6 w-6" />
      </button>

      {/* AI Finance Copilot Widget */}
      <FinanceCopilotWidget
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </>
  );
};

export default Finance;
