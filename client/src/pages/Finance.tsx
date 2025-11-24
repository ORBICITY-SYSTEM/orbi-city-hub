import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import ManusAIChat from "@/components/ManusAIChat";

export default function Finance() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Finance</h1>
        <p className="text-slate-600">Financial analytics and reporting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">45,230 ₾</div>
            <p className="text-sm text-green-600">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">18,450 ₾</div>
            <p className="text-sm text-red-600">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">26,780 ₾</div>
            <p className="text-sm text-blue-600">59% margin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L Analysis</CardTitle>
          <CardDescription>Profit & Loss breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Financial reports and analytics will appear here</p>
        </CardContent>
      </Card>

      {/* Manus AI Assistant */}
      <ManusAIChat
        module="Finance"
        title="💰 Finance AI Agent"
        description="Upload financial reports (Excel, CSV) or ask about P&L, expenses, revenue optimization"
        placeholder="e.g., 'Analyze October expenses' or 'What are our top cost categories?'"
      />
    </div>
  );
}
