import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import { RoleProvider } from "./contexts/RoleContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ModularLayout from "./components/ModularLayout";
import { UniversalChatPopup } from "./components/UniversalChatPopup";
import { PageLoadingSkeleton } from "./components/LoadingSkeleton";

// Only Home is eagerly loaded for fast initial render
import Home from "./pages/Home";

// All other pages are lazy-loaded to reduce initial bundle size
const NotFound = lazy(() => import("./pages/NotFound"));

// Finance Module - Lazy
const RealFinanceDashboard = lazy(() => import("./pages/RealFinanceDashboard"));
const FinanceDashboard = lazy(() => import("./pages/finance/FinanceDashboard"));
const FinanceAnalytics = lazy(() => import("./pages/finance/FinanceAnalytics"));
const FinanceMonthlyReports = lazy(() => import("./pages/finance/FinanceMonthlyReports"));
const FinanceOTELMS = lazy(() => import("./pages/finance/FinanceOTELMS"));
const FinanceDevelopmentExpenses = lazy(() => import("./pages/finance/FinanceDevelopmentExpenses"));
const PowerBIFinanceDashboard = lazy(() => import("./pages/finance/PowerBIFinanceDashboard"));

// Marketing Module - Lazy
const MarketingDashboard = lazy(() => import("./pages/marketing/MarketingDashboard"));
const OTAChannels = lazy(() => import("./pages/marketing/OTAChannels"));
const WebsiteLeads = lazy(() => import("./pages/marketing/WebsiteLeads"));
const LiveChat = lazy(() => import("./pages/marketing/LiveChat"));
const GuestCommunications = lazy(() => import("./pages/marketing/GuestCommunications"));
const LiveChatDashboard = lazy(() => import("./pages/LiveChatDashboard"));

// Reservations Module - Lazy
const EmailInbox = lazy(() => import("./pages/reservations/EmailInbox"));
const EmailDetail = lazy(() => import("./pages/reservations/EmailDetail"));
const GuestCommunication = lazy(() => import("./pages/reservations/GuestCommunication"));
const ReviewsDashboard = lazy(() => import("./pages/reservations/ReviewsDashboard"));
const OTADashboard = lazy(() => import("./pages/reservations/OTADashboard"));
const Automations = lazy(() => import("./pages/reservations/Automations"));
const AIResponseQueue = lazy(() => import("./pages/reservations/AIResponseQueue"));
const TelegramBot = lazy(() => import("./pages/reservations/TelegramBot"));

// Email Management Module - Lazy
const EmailManagement = lazy(() => import("./pages/EmailManagement"));

// Integrations Module - Lazy
const Integrations = lazy(() => import("./pages/Integrations"));

// Settings Module - Lazy
const Settings = lazy(() => import("./pages/Settings"));

// Logistics Module - Lazy
const LogisticsDashboard = lazy(() => import("./pages/logistics/LogisticsDashboard"));
const Housekeeping = lazy(() => import("./pages/logistics/Housekeeping"));

// Operations Module - PowerStack
const HousekeepingGrid = lazy(() => import("./pages/operations/HousekeepingGrid"));

// WhatsApp Bot Module - Lazy
const WhatsAppImplementation = lazy(() => import("./pages/Implementation"));
const WhatsAppCodeExamples = lazy(() => import("./pages/CodeExamples"));
const WhatsAppSystemPrompt = lazy(() => import("./pages/SystemPromptBuilder"));
const WhatsAppTesting = lazy(() => import("./pages/Testing"));
const WhatsAppResources = lazy(() => import("./pages/Resources"));
const WhatsAppDeployment = lazy(() => import("./pages/DeploymentWizard"));
const WhatsAppQuickStart = lazy(() => import("./pages/QuickStart"));

// AI Agent Module - Lazy
const MirrorEffectAgent = lazy(() => import("./pages/ai/MirrorEffectAgent"));

// Admin Pages - Lazy
const SeedLogistics = lazy(() => import("./pages/admin/SeedLogistics"));

// System Pages - Lazy
const ActivityLogPage = lazy(() => import("./pages/system/ActivityLogPage"));
const AnalyticsDashboardPage = lazy(() => import("./pages/system/AnalyticsDashboardPage"));
const WhiteLabelSettingsPage = lazy(() => import("./pages/system/WhiteLabelSettingsPage"));
const UserManagementPage = lazy(() => import("./pages/system/UserManagementPage"));

function Router() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <RouterContent />
    </Suspense>
  );
}

function RouterContent() {
  return (
    <ModularLayout>
      <Switch>
        {/* Home */}
        <Route path={"/"} component={Home} />
        <Route path={"/real-finance"} component={RealFinanceDashboard} />

        {/* Finance Module */}
        <Route path="/finance" component={FinanceDashboard} />
        <Route path="/finance/analytics" component={FinanceAnalytics} />
        <Route path="/finance/reports" component={FinanceMonthlyReports} />
        <Route path="/finance/otelms" component={FinanceOTELMS} />
        <Route path="/finance/expenses" component={FinanceDevelopmentExpenses} />
        <Route path="/finance/powerbi" component={PowerBIFinanceDashboard} />

        {/* Marketing Module (workflow-based) */}
        <Route path="/marketing" component={MarketingDashboard} />
        <Route path="/marketing/reviews" component={ReviewsDashboard} />
        <Route path="/marketing/reputation" component={ReviewsDashboard} />
        <Route path="/marketing/ota" component={OTAChannels} />
        <Route path="/marketing/communications" component={GuestCommunications} />
        <Route path="/marketing/communications/:emailId" component={EmailDetail} />
        <Route path="/marketing/leads" component={WebsiteLeads} />
        <Route path="/live-chat" component={LiveChatDashboard} />

        {/* Reservations Module (restructured - 5 items only) */}
        <Route path="/reservations" component={OTADashboard} />
        <Route path="/reservations/list" component={OTADashboard} />
        <Route path="/reservations/calendar" component={OTADashboard} />
        <Route path="/reservations/exceptions" component={OTADashboard} />
        <Route path="/reservations/ai-assistant" component={AIResponseQueue} />

        {/* Integrations Hub (new module) */}
        <Route path="/integrations" component={Integrations} />
        <Route path="/integrations/whatsapp" component={WhatsAppQuickStart} />
        <Route path="/integrations/telegram" component={TelegramBot} />
        <Route path="/integrations/butler" component={Automations} />

        {/* Email Management Module */}
        <Route path="/email-management" component={EmailManagement} />

        {/* Settings Module */}
        <Route path="/settings" component={Settings} />

        {/* Logistics Module */}
        <Route path="/logistics" component={LogisticsDashboard} />
        <Route path="/logistics/housekeeping" component={Housekeeping} />

        {/* Operations Module - PowerStack */}
        <Route path="/operations/housekeeping" component={HousekeepingGrid} />

        {/* AI Agent Module */}
        <Route path="/ai-agent" component={MirrorEffectAgent} />

        {/* Admin Pages */}
        <Route path="/admin/seed-logistics" component={SeedLogistics} />

        {/* System Pages */}
        <Route path="/system/activity-log" component={ActivityLogPage} />
        <Route path="/system/analytics" component={AnalyticsDashboardPage} />
        <Route path="/system/white-label" component={WhiteLabelSettingsPage} />
        <Route path="/system/users" component={UserManagementPage} />

        {/* WhatsApp Bot Module */}
        <Route path="/whatsapp" component={WhatsAppQuickStart} />
        <Route path="/whatsapp/quick-start" component={WhatsAppQuickStart} />
        <Route path="/whatsapp/implementation" component={WhatsAppImplementation} />
        <Route path="/whatsapp/code-examples" component={WhatsAppCodeExamples} />
        <Route path="/whatsapp/system-prompt" component={WhatsAppSystemPrompt} />
        <Route path="/whatsapp/testing" component={WhatsAppTesting} />
        <Route path="/whatsapp/resources" component={WhatsAppResources} />
        <Route path="/whatsapp/deployment" component={WhatsAppDeployment} />

        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </ModularLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <RoleProvider>
            <DemoModeProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                <UniversalChatPopup />
              </TooltipProvider>
            </DemoModeProvider>
          </RoleProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
