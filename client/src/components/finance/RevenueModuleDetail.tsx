import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Building2, Calendar, Plus } from "lucide-react";
import { AssignExcelDialog } from "./AssignExcelDialog";

interface RevenueModuleDetailProps {
  totalRevenue: number;
  occupancyRate: number;
  adr: number;
  revpar: number;
  totalNights: number;
  totalBookings: number;
  totalRooms: number;
}

export function RevenueModuleDetail({
  totalRevenue,
  occupancyRate,
  adr,
  revpar,
  totalNights,
  totalBookings,
  totalRooms,
}: RevenueModuleDetailProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return `₾${amount.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`;
  };

  const avgStayLength = totalBookings > 0 ? (totalNights / totalBookings).toFixed(1) : "0";

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Add New Analysis Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAssignDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ახალი ანალიზის დამატება
        </Button>
      </div>

      {/* Main Revenue Card */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase">სულ შემოსავალი</h3>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Period Performance</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Revenue Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">📊</div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">დაკავების მაჩვენებელი</p>
              <p className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalNights.toLocaleString()} ღამე / {totalRooms} ოთახი
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">💰</div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">საშუალო ღამის ფასი (ADR)</p>
              <p className="text-2xl font-bold">{formatCurrency(adr)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Average Daily Rate
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-2xl">💵</div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">REVPAR</p>
              <p className="text-2xl font-bold">{formatCurrency(revpar)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue per Available Room
          </p>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-accent/50">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-cyan-600" />
            <div>
              <p className="text-xs text-muted-foreground">სულ ღამეები</p>
              <p className="text-2xl font-bold">{totalNights.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-accent/50">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-xs text-muted-foreground">სულ ბრონირებები</p>
              <p className="text-2xl font-bold">{totalBookings.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-accent/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-pink-600" />
            <div>
              <p className="text-xs text-muted-foreground">საშუალო ყოფნა</p>
              <p className="text-2xl font-bold">{avgStayLength} დღე</p>
            </div>
          </div>
        </Card>
      </div>

      <AssignExcelDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        moduleType="revenue"
        onSuccess={handleSuccess}
      />
    </div>
  );
}
