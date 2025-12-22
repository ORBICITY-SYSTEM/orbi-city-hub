/**
 * PowerStackDashboard.tsx
 * 
 * CEO Dashboard component that reads data from Google Sheets
 * Part of the PowerStack architecture - demonstrates "Google Sheets as Database"
 */

import { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Percent,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useDashboardKPIs, 
  useFinancialMetrics, 
  useTopPerformers,
  useHousekeepingSummary,
  useTriggerSync 
} from '@/hooks/useGoogleSheets';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// POWERSTACK BADGE COMPONENT
// ============================================================================

function PowerStackBadge() {
  return (
    <Badge 
      variant="outline" 
      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400 text-xs"
    >
      <Cloud className="w-3 h-3 mr-1" />
      PowerStack
    </Badge>
  );
}

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

function KPICard({ title, value, change, positive = true, icon, color, isLoading }: KPICardProps) {
  return (
    <Card className={`bg-gradient-to-br ${color} border-white/10`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-lg bg-white/10">
            {icon}
          </div>
          {change && (
            <span className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
              {change}
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-white">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
        </div>
        <div className="text-sm text-white/60">{title}</div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// UNIT PERFORMANCE TABLE
// ============================================================================

function UnitPerformanceTable() {
  const { data: topUnits, isLoading } = useTopPerformers(10);
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
              {language === 'ka' ? 'რანკი' : 'Rank'}
            </th>
            <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
              {language === 'ka' ? 'აპარტამენტი' : 'Unit'}
            </th>
            <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
              {language === 'ka' ? 'დაწყების თარიღი' : 'Inception Date'}
            </th>
            <th className="text-right py-3 px-4 text-white/60 font-medium text-sm">
              {language === 'ka' ? 'დატვირთულობა' : 'Occupancy'}
            </th>
            <th className="text-right py-3 px-4 text-white/60 font-medium text-sm">
              {language === 'ka' ? 'შემოსავალი' : 'Revenue'}
            </th>
            <th className="text-right py-3 px-4 text-white/60 font-medium text-sm">ROI</th>
          </tr>
        </thead>
        <tbody>
          {topUnits?.map((unit) => (
            <tr key={unit.unitId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3 px-4">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  unit.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60'
                }`}>
                  {unit.rank}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-white">{unit.unitName}</span>
                  <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                    {unit.block}
                  </Badge>
                </div>
              </td>
              <td className="py-3 px-4 text-white/80 text-sm">
                {unit.inceptionDate}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        unit.occupancyRate >= 60 ? 'bg-green-500' : 
                        unit.occupancyRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${unit.occupancyRate}%` }}
                    />
                  </div>
                  <span className="text-white font-medium">{unit.occupancyRate}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right text-white font-medium">
                ₾{unit.totalRevenue.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right">
                <span className={`font-bold ${unit.roi >= 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {unit.roi}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// HOUSEKEEPING GRID
// ============================================================================

function HousekeepingGrid() {
  const { data: summary, housekeeping, isLoading } = useHousekeepingSummary();
  const { language } = useLanguage();

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  const statusColors = {
    clean: 'bg-green-500',
    dirty: 'bg-red-500',
    in_progress: 'bg-yellow-500',
    maintenance: 'bg-purple-500',
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{summary.clean}</div>
          <div className="text-xs text-white/60">{language === 'ka' ? 'სუფთა' : 'Clean'}</div>
        </div>
        <div className="bg-red-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{summary.dirty}</div>
          <div className="text-xs text-white/60">{language === 'ka' ? 'ბინძური' : 'Dirty'}</div>
        </div>
        <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{summary.inProgress}</div>
          <div className="text-xs text-white/60">{language === 'ka' ? 'მიმდინარე' : 'In Progress'}</div>
        </div>
        <div className="bg-purple-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{summary.maintenance}</div>
          <div className="text-xs text-white/60">{language === 'ka' ? 'მოვლა' : 'Maintenance'}</div>
        </div>
      </div>

      {/* Unit Grid */}
      <div className="grid grid-cols-10 gap-1">
        {housekeeping?.slice(0, 60).map((unit) => (
          <div
            key={unit.unitId}
            className={`w-full aspect-square rounded ${statusColors[unit.status]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
            title={`${unit.unitName} - ${unit.status}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>{language === 'ka' ? 'სუფთა' : 'Clean'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>{language === 'ka' ? 'ბინძური' : 'Dirty'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>{language === 'ka' ? 'მიმდინარე' : 'In Progress'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>{language === 'ka' ? 'მოვლა' : 'Maintenance'}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN POWERSTACK DASHBOARD COMPONENT
// ============================================================================

export function PowerStackDashboard() {
  const { language } = useLanguage();
  const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = useDashboardKPIs();
  const { data: financials, isLoading: financialsLoading } = useFinancialMetrics();
  const { mutate: triggerSync, isLoading: syncing } = useTriggerSync();
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSync = async () => {
    const success = await triggerSync();
    if (success) {
      setLastSync(new Date().toLocaleTimeString());
      refetchKPIs();
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₾${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₾${(value / 1000).toFixed(0)}K`;
    return `₾${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with PowerStack Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">
            {language === 'ka' ? 'PowerStack Dashboard' : 'PowerStack Dashboard'}
          </h2>
          <PowerStackBadge />
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-xs text-white/40">
              {language === 'ka' ? 'ბოლო სინქრონიზაცია:' : 'Last sync:'} {lastSync}
            </span>
          )}
          <Button
            onClick={handleSync}
            disabled={syncing}
            size="sm"
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {language === 'ka' ? 'სინქრონიზაცია' : 'Sync OTELMS'}
          </Button>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Database className="w-4 h-4" />
        <span>{language === 'ka' ? 'მონაცემთა წყარო:' : 'Data Source:'}</span>
        <span className="text-green-400 font-medium">Google Sheets</span>
        <CheckCircle2 className="w-3 h-3 text-green-400" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title={language === 'ka' ? 'დღევანდელი შემოსავალი' : "Today's Revenue"}
          value={kpis ? formatCurrency(kpis.todayRevenue) : '₾0'}
          change="+12%"
          positive={true}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          color="from-emerald-500/20 to-emerald-600/10"
          isLoading={kpisLoading}
        />
        <KPICard
          title={language === 'ka' ? 'დღევანდელი ჩეკ-ინი' : "Today's Check-ins"}
          value={kpis?.todayCheckIns || 0}
          change={`+${kpis?.todayCheckIns || 0}`}
          positive={true}
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
          color="from-blue-500/20 to-blue-600/10"
          isLoading={kpisLoading}
        />
        <KPICard
          title={language === 'ka' ? 'საშ. დატვირთულობა' : 'Avg. Occupancy'}
          value={`${kpis?.avgOccupancy || 0}%`}
          change="+8%"
          positive={true}
          icon={<Percent className="w-5 h-5 text-purple-400" />}
          color="from-purple-500/20 to-purple-600/10"
          isLoading={kpisLoading}
        />
        <KPICard
          title={language === 'ka' ? 'მომლოდინე ამოცანები' : 'Pending Tasks'}
          value={kpis?.pendingTasks || 0}
          change={`${kpis?.dirtyUnits || 0} dirty`}
          positive={false}
          icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
          color="from-orange-500/20 to-orange-600/10"
          isLoading={kpisLoading}
        />
      </div>

      {/* Financial Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            {language === 'ka' ? 'ფინანსური მიმოხილვა' : 'Financial Overview'}
          </CardTitle>
          <PowerStackBadge />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {financials ? formatCurrency(financials.totalRevenue) : '₾0'}
              </div>
              <div className="text-xs text-white/60">
                {language === 'ka' ? 'ჯამური შემოსავალი' : 'Total Revenue'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {financials ? formatCurrency(financials.totalExpenses) : '₾0'}
              </div>
              <div className="text-xs text-white/60">
                {language === 'ka' ? 'ჯამური ხარჯი' : 'Total Expenses'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {financials ? formatCurrency(financials.totalProfit) : '₾0'}
              </div>
              <div className="text-xs text-white/60">
                {language === 'ka' ? 'წმინდა მოგება' : 'Net Profit'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {financials?.avgOccupancy || 0}%
              </div>
              <div className="text-xs text-white/60">
                {language === 'ka' ? 'საშ. დატვირთვა' : 'Avg. Occupancy'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ₾{financials?.avgADR || 0}
              </div>
              <div className="text-xs text-white/60">ADR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                ₾{financials?.avgRevPAR || 0}
              </div>
              <div className="text-xs text-white/60">RevPAR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Performance Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              {language === 'ka' ? 'ტოპ 10 აპარტამენტი (ROI)' : 'Top 10 Units (by ROI)'}
            </CardTitle>
            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Inception Date Logic
            </Badge>
          </CardHeader>
          <CardContent>
            <UnitPerformanceTable />
          </CardContent>
        </Card>

        {/* Housekeeping Grid */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              {language === 'ka' ? 'დალაგების სტატუსი (60 აპარტამენტი)' : 'Housekeeping Status (60 Units)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HousekeepingGrid />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PowerStackDashboard;
