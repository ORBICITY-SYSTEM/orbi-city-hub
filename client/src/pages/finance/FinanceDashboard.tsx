import { TrendingUp, Activity, Brain } from "lucide-react";
import { FinanceModulesLanding } from "@/components/finance/FinanceModulesLanding";
import { FinanceActivityLog } from "@/components/finance/FinanceActivityLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FinanceCopilotWidget } from "@/components/finance-copilot";
import { PageHeader } from "@/components/ui/PageHeader";

const Finance = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title={t('finance.title')}
        subtitle={t('finance.subtitle')}
        icon={TrendingUp}
        iconGradient="from-cyan-500 to-cyan-600"
        dataSource={{ type: "live", source: "tRPC" }}
      />

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="mb-8 bg-slate-800/50 border border-white/10">
            <TabsTrigger value="modules" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t('home.mainModules')}
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              {t('common.overview')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('home.mainModules')}
              </h2>
              <p className="text-cyan-300/70">
                {t('modules.finance.description')}
              </p>
            </div>
            <FinanceModulesLanding />
          </TabsContent>

          <TabsContent value="activity">
            <FinanceActivityLog />
          </TabsContent>
        </Tabs>
      </main>

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
    </div>
  );
};

export default Finance;
