import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

// Mock P&L data from August 2025 Excel analysis
const plData = {
  revenue: {
    booking: 5848.93,
    expedia: 1433.02,
    airbnb: 1200,
    whatsapp: 8500,
    facebook: 1611.61,
    total: 218593.56
  },
  expenses: {
    cleaning: 11675,
    technical: 1141.07,
    utilities: 7062,
    siteFees: 7281.95,
    salaries: 4000,
    total: 27160.02
  },
  commission: {
    booking: 5848.93,
    expedia: 1433.02,
    airbnb: 1200,
    whatsapp: 8500,
    total: 41890
  }
};

const profitMargin = ((plData.revenue.total - plData.expenses.total - plData.commission.total) / plData.revenue.total * 100).toFixed(2);
const netProfit = plData.revenue.total - plData.expenses.total - plData.commission.total;

export function FinancePL() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">P&L Statement</h2>
          <p className="text-sm text-gray-600">Profit & Loss - August 2025</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-sm text-green-700 font-medium">Total Revenue</div>
          <div className="text-3xl font-bold text-green-900">₾{plData.revenue.total.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +15% vs last month
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="text-sm text-red-700 font-medium">Total Expenses</div>
          <div className="text-3xl font-bold text-red-900">₾{plData.expenses.total.toLocaleString()}</div>
          <div className="text-xs text-red-600 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +8% vs last month
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="text-sm text-orange-700 font-medium">Commissions</div>
          <div className="text-3xl font-bold text-orange-900">₾{plData.commission.total.toLocaleString()}</div>
          <div className="text-xs text-orange-600 mt-1">19.2% of revenue</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="text-sm text-purple-700 font-medium">Net Profit</div>
          <div className="text-3xl font-bold text-purple-900">₾{netProfit.toLocaleString()}</div>
          <div className="text-xs text-purple-600 mt-1">{profitMargin}% margin</div>
        </Card>
      </div>

      {/* P&L Table */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              Revenue Breakdown
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Booking.com</TableCell>
                  <TableCell className="text-right">₾{plData.revenue.booking.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.revenue.booking / plData.revenue.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">WhatsApp Direct</TableCell>
                  <TableCell className="text-right">₾{plData.revenue.whatsapp.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.revenue.whatsapp / plData.revenue.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Expedia</TableCell>
                  <TableCell className="text-right">₾{plData.revenue.expedia.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.revenue.expedia / plData.revenue.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Facebook</TableCell>
                  <TableCell className="text-right">₾{plData.revenue.facebook.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.revenue.facebook / plData.revenue.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Airbnb</TableCell>
                  <TableCell className="text-right">₾{plData.revenue.airbnb.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.revenue.airbnb / plData.revenue.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow className="bg-green-50 font-bold">
                  <TableCell>Total Revenue</TableCell>
                  <TableCell className="text-right text-green-700">₾{plData.revenue.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-700">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
              Expense Breakdown
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Cleaning & Technical</TableCell>
                  <TableCell className="text-right">₾{plData.expenses.cleaning.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.expenses.cleaning / plData.expenses.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Site Fees (OTA)</TableCell>
                  <TableCell className="text-right">₾{plData.expenses.siteFees.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.expenses.siteFees / plData.expenses.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Utilities</TableCell>
                  <TableCell className="text-right">₾{plData.expenses.utilities.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.expenses.utilities / plData.expenses.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Salaries</TableCell>
                  <TableCell className="text-right">₾{plData.expenses.salaries.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.expenses.salaries / plData.expenses.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Technical</TableCell>
                  <TableCell className="text-right">₾{plData.expenses.technical.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(plData.expenses.technical / plData.expenses.total * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow className="bg-red-50 font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right text-red-700">₾{plData.expenses.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-700">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <div className="h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
            Commission Breakdown
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">% of Revenue</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Booking.com</TableCell>
                <TableCell className="text-right">₾{plData.commission.booking.toLocaleString()}</TableCell>
                <TableCell className="text-right">{(plData.commission.booking / plData.revenue.total * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">15%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">WhatsApp Direct</TableCell>
                <TableCell className="text-right">₾{plData.commission.whatsapp.toLocaleString()}</TableCell>
                <TableCell className="text-right">{(plData.commission.whatsapp / plData.revenue.total * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">20%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expedia</TableCell>
                <TableCell className="text-right">₾{plData.commission.expedia.toLocaleString()}</TableCell>
                <TableCell className="text-right">{(plData.commission.expedia / plData.revenue.total * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">18%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Airbnb</TableCell>
                <TableCell className="text-right">₾{plData.commission.airbnb.toLocaleString()}</TableCell>
                <TableCell className="text-right">{(plData.commission.airbnb / plData.revenue.total * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">16%</TableCell>
              </TableRow>
              <TableRow className="bg-orange-50 font-bold">
                <TableCell>Total Commissions</TableCell>
                <TableCell className="text-right text-orange-700">₾{plData.commission.total.toLocaleString()}</TableCell>
                <TableCell className="text-right text-orange-700">{(plData.commission.total / plData.revenue.total * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Final Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Net Profit Calculation</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Total Revenue</span>
              <span className="font-bold text-green-700">₾{plData.revenue.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Total Expenses</span>
              <span className="font-bold text-red-700">- ₾{plData.expenses.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-700">Total Commissions</span>
              <span className="font-bold text-orange-700">- ₾{plData.commission.total.toLocaleString()}</span>
            </div>
            <div className="border-t-2 border-purple-300 pt-3 mt-3">
              <div className="flex justify-between items-center text-2xl">
                <span className="font-bold text-gray-900">Net Profit</span>
                <span className="font-bold text-purple-700">₾{netProfit.toLocaleString()}</span>
              </div>
              <div className="text-right text-sm text-purple-600 mt-1">
                Profit Margin: {profitMargin}%
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
