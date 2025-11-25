import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import OrbiDashboardLayout from "./components/OrbiDashboardLayout";

// Pages
import CEODashboard from "./pages/CEODashboard";
import Reservations from "./pages/Reservations";
import Finance from "./pages/Finance";
import Marketing from "./pages/Marketing";
import Logistics from "./pages/LogisticsNew";
import Reports from "./pages/Reports";
import Files from "./pages/Files";
import Google from "./pages/Google";
import SocialMedia from "./pages/SocialMedia";
import AdminLogin from "./pages/AdminLogin";
import FinanceDashboard from "./pages/FinanceDashboard";
import Admin from "./pages/Admin";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  if (isAdminRoute) {
    // Admin routes without layout
    return (
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={Admin} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Main app routes with layout
  return (
    <OrbiDashboardLayout>
      <Switch>
        <Route path="/" component={CEODashboard} />
        <Route path="/reservations" component={Reservations} />
        <Route path="/finance" component={Finance} />
        <Route path="/finance-dashboard" component={FinanceDashboard} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/logistics" component={Logistics} />
        <Route path="/reports" component={Reports} />
        <Route path="/files" component={Files} />
      <Route path="/google" component={Google} />
        <Route path="/social-media" component={SocialMedia} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </OrbiDashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
