import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ModularLayout from "./components/ModularLayout";

// Pages
import Home from "./pages/Home";

// Finance Module
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import FinanceAnalytics from "./pages/finance/FinanceAnalytics";
import FinanceMonthlyReports from "./pages/finance/FinanceMonthlyReports";
import FinanceOTELMS from "./pages/finance/FinanceOTELMS";
import FinanceDevelopmentExpenses from "./pages/finance/FinanceDevelopmentExpenses";

// Marketing Module
import MarketingDashboard from "./pages/marketing/MarketingDashboard";
import OTAChannels from "./pages/marketing/OTAChannels";
import WebsiteLeads from "./pages/marketing/WebsiteLeads";

// Reservations Module
import EmailInbox from "./pages/reservations/EmailInbox";
import EmailDetail from "./pages/reservations/EmailDetail";
import GuestCommunication from "./pages/reservations/GuestCommunication";
import OTADashboard from "./pages/reservations/OTADashboard";

// Logistics Module
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";
import Housekeeping from "./pages/logistics/Housekeeping";

function Router() {
  return (
    <ModularLayout>
      <Switch>
        {/* Home */}
        <Route path="/" component={Home} />

        {/* Finance Module */}
        <Route path="/finance" component={FinanceDashboard} />
        <Route path="/finance/analytics" component={FinanceAnalytics} />
        <Route path="/finance/reports" component={FinanceMonthlyReports} />
        <Route path="/finance/otelms" component={FinanceOTELMS} />
        <Route path="/finance/expenses" component={FinanceDevelopmentExpenses} />

        {/* Marketing Module */}
        <Route path="/marketing" component={MarketingDashboard} />
        <Route path="/marketing/ota" component={OTAChannels} />
        <Route path="/marketing/leads" component={WebsiteLeads} />

        {/* Reservations Module */}
        <Route path="/reservations" component={OTADashboard} />
        <Route path="/reservations/email" component={EmailInbox} />
        <Route path="/reservations/email/:emailId" component={EmailDetail} />
        <Route path="/reservations/guests" component={GuestCommunication} />
        <Route path="/reservations/ota" component={OTADashboard} />

        {/* Logistics Module */}
        <Route path="/logistics" component={LogisticsDashboard} />
        <Route path="/logistics/housekeeping" component={Housekeeping} />

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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
