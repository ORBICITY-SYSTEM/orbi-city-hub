import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Building2, TrendingUp, Users, DollarSign, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function OTELMSSummaryWidget() {
  const [, setLocation] = useLocation();
  const { data: latestReport, isLoading } = trpc.otelms.getLatest.useQuery();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1B5E40]" />
            OTELMS Daily Report
          </CardTitle>
          <CardDescription>Loading latest data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestReport) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1B5E40]" />
            OTELMS Daily Report
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Daily reports will appear here once the email integration is active.
          </p>
        </CardContent>
      </Card>
    );
  }

  const reportDate = new Date(latestReport.reportDate);
  const formattedDate = reportDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const metrics = [
    {
      label: "Revenue",
      value: `₾${((latestReport.totalRevenue || 0) / 100).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Occupancy",
      value: `${((latestReport.occupancyRate || 0) / 100).toFixed(1)}%`,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      label: "Check-ins",
      value: latestReport.checkIns || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Guests",
      value: latestReport.totalGuests || 0,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#1B5E40]" />
          OTELMS Daily Report
        </CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-slate-100 ${metric.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">{metric.label}</p>
                  <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => setLocation('/otelms-analytics')}
          variant="outline"
          className="w-full glass-button"
        >
          View Full Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
