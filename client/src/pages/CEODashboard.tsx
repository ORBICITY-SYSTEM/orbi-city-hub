import { Link } from 'wouter';
import { HealthScoreWidget } from '@/components/ceo-dashboard/HealthScoreWidget';
import { KPICardsGrid } from '@/components/ceo-dashboard/KPICardsGrid';
import { AIInsightsPanel } from '@/components/ceo-dashboard/AIInsightsPanel';
import { AlertsPanel } from '@/components/ceo-dashboard/AlertsPanel';
import { PredictiveAnalyticsWidget } from '@/components/ceo-dashboard/PredictiveAnalyticsWidget';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

/**
 * CEO Dashboard - Reconstructed
 * 
 * Implements the "Hybrid Transformation" approach from CEO_DASHBOARD_ANALYSIS.md
 * 
 * Features:
 * - Real-time KPIs (Revenue, Occupancy, Satisfaction, Profit)
 * - Health Score (0-100)
 * - AI-powered insights and recommendations
 * - Predictive analytics (30-day forecasts)
 * - Critical alerts
 * - Mobile-responsive design
 * 
 * Design Philosophy:
 * - Dark green gradient background (user preference)
 * - Whitish-yellowish text for contrast (amber-100)
 * - Colorful emojis throughout
 * - Touch-friendly controls for mobile
 * 
 * Based on 6 methodologies:
 * 1. Chain-of-Thought (CoT) - Logical data flow
 * 2. Tree-of-Thought (ToT) - Multiple perspectives
 * 3. Reverse Engineering - Best practices from Salesforce, Tableau
 * 4. Extreme Constraints - Mobile-first, real-time only
 * 5. Comparative Lenses - Buffett (value), Naval (leverage), Bezos (customer)
 * 6. First Principles - Data → Insights → Actions
 */

export default function CEODashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-amber-100 mb-2">
              🎯 CEO Dashboard
            </h1>
            <p className="text-amber-100/70 text-lg">
              Real-time business intelligence for ORBI City Batumi
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="bg-emerald-800/50 hover:bg-emerald-700/60 text-amber-100 border-emerald-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="bg-emerald-800/50 hover:bg-emerald-700/60 text-amber-100 border-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              className="bg-emerald-800/50 hover:bg-emerald-700/60 text-amber-100 border-emerald-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 text-amber-100/60 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {lastRefresh.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Health Score */}
        <div className="lg:col-span-1">
          <HealthScoreWidget />
        </div>

        {/* Middle Column: KPIs */}
        <div className="lg:col-span-2">
          <KPICardsGrid />
        </div>
      </div>

      {/* Second Row: Alerts */}
      <div className="mb-6">
        <AlertsPanel />
      </div>

      {/* Third Row: AI Insights & Predictive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AIInsightsPanel />
        <PredictiveAnalyticsWidget />
      </div>

      {/* Quick Navigation */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700 rounded-xl p-6">
        <h2 className="text-amber-100 text-xl font-bold mb-4">📊 Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickNavCard
            title="Finance"
            emoji="💰"
            path="/finance"
            description="Revenue & Expenses"
          />
          <QuickNavCard
            title="Marketing"
            emoji="📢"
            path="/marketing"
            description="OTA Channels"
          />
          <QuickNavCard
            title="Reservations"
            emoji="📅"
            path="/reservations"
            description="Bookings & Guests"
          />
          <QuickNavCard
            title="Logistics"
            emoji="📦"
            path="/logistics"
            description="Operations"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-amber-100/50 text-sm">
        <p>
          Built with 🧠 AI-powered insights | 
          Data refreshes every 30 seconds | 
          Optimized for mobile & tablet
        </p>
      </div>
    </div>
  );
}

interface QuickNavCardProps {
  title: string;
  emoji: string;
  path: string;
  description: string;
}

function QuickNavCard({ title, emoji, path, description }: QuickNavCardProps) {
  return (
    <Link href={path}>
      <a className="block bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 hover:border-emerald-600 rounded-lg p-4 transition-all group">
        <div className="text-4xl mb-2">{emoji}</div>
        <h3 className="text-amber-100 font-bold mb-1 group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
        <p className="text-amber-100/60 text-xs">{description}</p>
      </a>
    </Link>
  );
}
