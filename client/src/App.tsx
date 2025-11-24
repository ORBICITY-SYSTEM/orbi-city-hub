import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import OrbiDashboardLayout from "./components/OrbiDashboardLayout";

// Pages
import CEODashboard from "./pages/CEODashboard";
import Reservations from "./pages/Reservations";
import Finance from "./pages/Finance";
import Marketing from "./pages/Marketing";
import Logistics from "./pages/Logistics";
import Reports from "./pages/Reports";

function Router() {
  return (
    <OrbiDashboardLayout>
      <Switch>
        <Route path="/" component={CEODashboard} />
        <Route path="/reservations" component={Reservations} />
        <Route path="/finance" component={Finance} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/logistics" component={Logistics} />
        <Route path="/reports" component={Reports} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </OrbiDashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
