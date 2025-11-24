import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import OrbiDashboardLayout from "./components/OrbiDashboardLayout";

// Pages
import CEODashboard from "./pages/CEODashboard";
// All modules restored
import Marketing from "./pages/Marketing";
import Logistics from "./pages/Logistics";
import Reservations from "./pages/Reservations";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import HousekeepingMobile from "./pages/HousekeepingMobile";

function Router() {
  return (
    <Switch>
      {/* Public housekeeping route (no dashboard layout) */}
      <Route path="/housekeeping" component={HousekeepingMobile} />
      
      {/* Dashboard routes */}
      <Route path="/">
        <OrbiDashboardLayout>
          <Switch>
            <Route path="/" component={CEODashboard} />
            {/* All modules restored */}
            <Route path="/marketing" component={Marketing} />
            <Route path="/logistics" component={Logistics} />
            <Route path="/reservations" component={Reservations} />
            <Route path="/finance" component={Finance} />
            <Route path="/reports" component={Reports} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </OrbiDashboardLayout>
      </Route>
    </Switch>
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
