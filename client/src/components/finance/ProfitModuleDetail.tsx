import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Building, Users, Plus } from "lucide-react";
import { AssignExcelDialog } from "./AssignExcelDialog";

interface ProfitModuleDetailProps {
  netProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
}

export function ProfitModuleDetail({
  netProfit,
  totalRevenue,
  totalExpenses,
  profitMargin,
}: ProfitModuleDetailProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return `₾${amount.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`;
  };

  const companyShare = netProfit * 0.153;
  const ownersShare = netProfit * 0.847;

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

      {/* Main Profit Card */}
      <Card className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-violet-600" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase">წმინდა მოგება</h3>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(netProfit)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {profitMargin.toFixed(1)}% Margin
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Profit Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-3">
            <Building className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">კომპანიის წილი (15.3%)</p>
              <p className="text-2xl font-bold">{formatCurrency(companyShare)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            15.3% of Profit
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-8 w-8 text-cyan-600" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">მესაკუთრეების წილი (84.7%)</p>
              <p className="text-2xl font-bold">{formatCurrency(ownersShare)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            84.7% of Profit
          </p>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="p-6 bg-accent/30">
        <h4 className="font-bold mb-4 text-lg">ფინანსური მიმოხილვა</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="text-sm text-muted-foreground">სრული შემოსავალი</span>
            <span className="font-bold">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="text-sm text-muted-foreground">სრული ხარჯები</span>
            <span className="font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="h-px bg-border"></div>
          <div className="flex items-center justify-between p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <span className="font-medium">წმინდა მოგება</span>
            <span className="font-bold text-violet-600">{formatCurrency(netProfit)}</span>
          </div>
        </div>
      </Card>

      {/* ROI Info */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-indigo-600 mt-1" />
          <div>
            <h4 className="font-bold text-lg mb-2">ROI & რენტაბელურობა</h4>
            <p className="text-sm text-muted-foreground mb-3">
              თვიური მოგების მარჟა: <span className="font-bold text-foreground">{profitMargin.toFixed(1)}%</span>
            </p>
            <p className="text-xs text-muted-foreground">
              მოგების მარჟა აჩვენებს რამდენი პროცენტი შემოსავლისა რჩება მოგებად ყველა ხარჯის გამოკლების შემდეგ.
              ჯანსაღი ბიზნესისთვის რეკომენდებულია 20-30% მარჟა.
            </p>
          </div>
        </div>
      </Card>

      <AssignExcelDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        moduleType="profit"
        onSuccess={handleSuccess}
      />
    </div>
  );
}
