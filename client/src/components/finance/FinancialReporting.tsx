import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CalendarIcon, Info } from "lucide-react";
import { MonthlyReportCard } from "./reporting/MonthlyReportCard";
import { CustomFieldManager } from "./reporting/CustomFieldManager";
import { ReportExport } from "./reporting/ReportExport";
import { FinancialReportingCharts } from "./reporting/FinancialReportingCharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FinancialReporting = () => {
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const queryClient = useQueryClient();

  // Fetch monthly reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["monthly-reports"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("monthly_reports" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch finance records for channel analysis
  const { data: financeRecords } = useQuery({
    queryKey: ["finance-records-channels-reporting"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("finance_records")
        .select("channel, revenue, date")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch custom field definitions
  const { data: customFields } = useQuery({
    queryKey: ["report-field-definitions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("report_field_definitions" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Create new month
  const createMonthMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newMonth = new Date();
      const monthDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);

      const { data, error } = await supabase
        .from("monthly_reports" as any)
        .insert({
          user_id: user.id,
          month: monthDate.toISOString().split("T")[0],
          studio_count: 56,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-reports"] });
      toast.success("New month added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create month");
    },
  });

  // Filter reports based on date range
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (!startDate || !endDate) return reports;

    return reports.filter((report: any) => {
      const reportDate = new Date(report.month);
      return reportDate >= startDate && reportDate <= endDate;
    });
  }, [reports, startDate, endDate]);

  // Calculate channel analysis from finance records
  const channelAnalysis = useMemo(() => {
    if (!financeRecords || financeRecords.length === 0) return [];

    const channelTotals: Record<string, number> = {};
    let totalRevenue = 0;

    // Filter by date range if specified
    const filteredFinanceRecords = financeRecords.filter((record: any) => {
      if (!startDate || !endDate) return true;
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    filteredFinanceRecords.forEach((record: any) => {
      const channel = record.channel || 'Unknown';
      const revenue = record.revenue || 0;
      channelTotals[channel] = (channelTotals[channel] || 0) + revenue;
      totalRevenue += revenue;
    });

    return Object.entries(channelTotals)
      .map(([channel, revenue]) => ({
        channel,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [financeRecords, startDate, endDate]);

  // Calculate totals for whole period
  const periodTotals = useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) return null;

    return filteredReports.reduce((acc: any, report: any) => {
      return {
        total_revenue: (acc.total_revenue || 0) + (report.total_revenue || 0),
        total_expenses: (acc.total_expenses || 0) + (report.total_expenses || 0),
        total_profit: (acc.total_profit || 0) + (report.total_profit || 0),
        company_profit: (acc.company_profit || 0) + (report.company_profit || 0),
        studio_owners_profit: (acc.studio_owners_profit || 0) + (report.studio_owners_profit || 0),
      };
    }, {});
  }, [filteredReports]);


  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-muted" />
            <CardContent className="h-64 bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div id="finance-dashboard" className="space-y-6">
      {/* Header with Actions */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20" data-pdf-header>
        <CardHeader className="pb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-1 bg-primary rounded-full" />
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Financial Reporting Dashboard
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Comprehensive Monthly Performance Analysis • FY 2024-2025
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCustomFields(true)}>
                Manage Fields
              </Button>
              <ReportExport reports={filteredReports} startDate={startDate} endDate={endDate} />
              <Button onClick={() => createMonthMutation.mutate()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Month
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Overview */}
          {periodTotals && (
            <div className="grid grid-cols-5 gap-4 pt-4 border-t border-border/50">
              <div className="relative overflow-hidden space-y-1 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 text-6xl opacity-10">💰</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Revenue</div>
                <div className="text-2xl font-bold text-primary">
                  ₾{periodTotals.total_revenue?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="animate-pulse">↑</span> Period Performance
                </div>
              </div>
              <div className="relative overflow-hidden space-y-1 p-4 rounded-lg bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 text-6xl opacity-10">💸</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Expenses</div>
                <div className="text-2xl font-bold text-destructive">
                  ₾{periodTotals.total_expenses?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Operating Costs</div>
              </div>
              <div className="relative overflow-hidden space-y-1 p-4 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 text-6xl opacity-10">💎</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Net Profit</div>
                <div className="text-2xl font-bold text-purple-600">
                  ₾{periodTotals.total_profit?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  {periodTotals.total_revenue > 0 
                    ? `${((periodTotals.total_profit / periodTotals.total_revenue) * 100).toFixed(1)}% Margin`
                    : '0% Margin'}
                </div>
              </div>
              <div className="relative overflow-hidden space-y-1 p-4 rounded-lg bg-gradient-to-br from-success/5 to-success/10 border border-success/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 text-6xl opacity-10">🏢</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Company Share</div>
                <div className="text-2xl font-bold text-success">
                  ₾{periodTotals.company_profit?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-success font-medium">
                  {periodTotals.total_profit > 0
                    ? `${((periodTotals.company_profit / periodTotals.total_profit) * 100).toFixed(1)}% of Profit`
                    : '0%'}
                </div>
              </div>
              <div className="relative overflow-hidden space-y-1 p-4 rounded-lg bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 text-6xl opacity-10">👥</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Owners Share</div>
                <div className="text-2xl font-bold text-amber-600">
                  ₾{periodTotals.studio_owners_profit?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-amber-600 font-medium">
                  {periodTotals.total_profit > 0
                    ? `${((periodTotals.studio_owners_profit / periodTotals.total_profit) * 100).toFixed(1)}% of Profit`
                    : '0%'}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Date Range Filter */}
      <Card data-pdf-period>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Period Selection</CardTitle>
              <CardDescription className="mt-1">
                Filter reports by custom date range • October 2024 - September 2025
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(!startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM yyyy") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-sm text-muted-foreground font-medium">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(!endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM yyyy") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {(startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Monthly Report Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Monthly Performance Breakdown</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed metrics and financial analysis for each reporting period
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-pdf-monthly-cards>
          {filteredReports?.map((report: any, index: number) => (
            <div key={report.id} data-pdf-monthly-card={index}>
              <MonthlyReportCard
                report={report}
                customFields={(customFields as any) || []}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Financial Charts */}
      {filteredReports && filteredReports.length > 0 && (
        <div className="space-y-4" data-pdf-charts>
          <div>
            <h3 className="text-xl font-semibold">Visual Analytics & Trends</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive charts and data visualization for strategic insights
            </p>
          </div>
          <FinancialReportingCharts reports={filteredReports} />
        </div>
      )}

      {/* Channel Distribution Analysis */}
      {channelAnalysis && channelAnalysis.length > 0 && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              არხების მიხედვით ანალიზი
            </CardTitle>
            <CardDescription>
              შემოსავლის განაწილება სხვადასხვა არხებში
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Channel Bars with Percentages */}
              <div className="space-y-3">
                {channelAnalysis.map((channel: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{channel.channel}</span>
                      <div className="text-right">
                        <span className="font-bold">₾{channel.revenue.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-2">({channel.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div 
                        className={`h-full flex items-center px-3 text-xs font-medium text-white transition-all ${
                          idx % 5 === 0 ? 'bg-blue-500' :
                          idx % 5 === 1 ? 'bg-emerald-500' :
                          idx % 5 === 2 ? 'bg-purple-500' :
                          idx % 5 === 3 ? 'bg-orange-500' :
                          'bg-pink-500'
                        }`}
                        style={{ width: `${channel.percentage}%` }}
                      >
                        {channel.percentage > 10 && `${channel.percentage.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">წამყვანი არხი</div>
                  <div className="text-lg font-bold">{channelAnalysis[0]?.channel || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">
                    {channelAnalysis[0]?.percentage.toFixed(1)}% შემოსავლიდან
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">არხების რაოდენობა</div>
                  <div className="text-lg font-bold">{channelAnalysis.length}</div>
                  <div className="text-xs text-muted-foreground">აქტიური</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">სულ შემოსავალი</div>
                  <div className="text-lg font-bold">
                    ₾{channelAnalysis.reduce((sum: number, ch: any) => sum + ch.revenue, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">ყველა არხიდან</div>
                </div>
              </div>

              {/* Key Insight */}
              <Alert className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <AlertDescription className="text-sm">
                  <strong>💡 ინსაითი:</strong>{' '}
                  {(() => {
                    const top3 = channelAnalysis.slice(0, 3);
                    const top3Percentage = top3.reduce((sum: number, ch: any) => sum + ch.percentage, 0);
                    return `პირველი 3 არხი (${top3.map((ch: any) => ch.channel).join(', ')}) იძლევა ${top3Percentage.toFixed(1)}% შემოსავლისა. არხების დივერსიფიკაცია აუმჯობესებს რისკების მართვას.`;
                  })()}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Field Manager Dialog */}
      <CustomFieldManager
        open={showCustomFields}
        onOpenChange={setShowCustomFields}
      />
    </div>
  );
};
