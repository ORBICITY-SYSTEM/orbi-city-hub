import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, TrendingDown, AlertCircle, PieChart, Plus } from "lucide-react";
import { AssignExcelDialog } from "./AssignExcelDialog";

interface ExpensesModuleDetailProps {
  totalExpenses: number;
  totalRevenue: number;
}

export function ExpensesModuleDetail({
  totalExpenses,
  totalRevenue,
}: ExpensesModuleDetailProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return `₾${amount.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`;
  };

  const expenseRatio = totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : "0";

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

      {/* Main Expenses Card */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase">სულ ხარჯები</h3>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-sm text-muted-foreground mt-1">Operating Costs</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600">
            <TrendingDown className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Expense Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-3">
            <PieChart className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">ხარჯების თანაფარდობა</p>
              <p className="text-2xl font-bold">{expenseRatio}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            ხარჯები შემოსავლის {expenseRatio}%-ს შეადგენს
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">საოპერაციო მიმართულება</p>
              <p className="text-lg font-bold">
                {totalExpenses === 0 ? "მონაცემები არ არის" : "ხარჯების კონტროლი აქტიურია"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-accent/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium mb-2">ხარჯების მონაცემები</p>
            <p className="text-sm text-muted-foreground">
              ხარჯების დეტალური ანალიზი ხელმისაწვდომი იქნება ცალკე ფაილის ატვირთვის შემდეგ. 
              აქ ნახავთ დეტალურ ბრეაკდაუნს - საოპერაციო ხარჯები, კომუნალური, შრომითი, 
              მარკეტინგული და სხვა კატეგორიები.
            </p>
          </div>
        </div>
      </Card>

      <AssignExcelDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        moduleType="expenses"
        onSuccess={handleSuccess}
      />
    </div>
  );
}
