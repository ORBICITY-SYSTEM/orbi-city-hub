import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

interface FinanceRecord {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  occupancy: number;
}

interface ExpenseRecord {
  date: string;
  category: string;
  amount: number;
}

export const FinanceCharts = ({ records, expenses }: { records: any[], expenses: any[] }) => {
  const { t, language } = useLanguage();

  // Group by month
  const monthlyData = records.reduce((acc: any, record) => {
    const month = format(new Date(record.date), 'yyyy-MM');
    if (!acc[month]) {
      acc[month] = { month, revenue: 0, expenses: 0, profit: 0, occupancy: 0, count: 0 };
    }
    acc[month].revenue += parseFloat(record.revenue || 0);
    acc[month].expenses += parseFloat(record.expenses || 0);
    acc[month].profit += parseFloat(record.profit || 0);
    acc[month].occupancy += parseFloat(record.occupancy || 0);
    acc[month].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).map((d: any) => ({
    month: d.month,
    [language === 'ka' ? 'შემოსავალი' : 'Revenue']: d.revenue,
    [language === 'ka' ? 'ხარჯები' : 'Expenses']: d.expenses,
    [language === 'ka' ? 'მოგება' : 'Profit']: d.profit,
    [language === 'ka' ? 'ოკუპაცია' : 'Occupancy']: (d.occupancy / d.count).toFixed(1)
  }));

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc: any, exp) => {
    const cat = exp.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += parseFloat(exp.amount || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    [language === 'ka' ? 'კატეგორია' : 'Category']: category,
    [language === 'ka' ? 'თანხა' : 'Amount']: amount
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("შემოსავალი vs ხარჯები (თვეების მიხედვით)", "Revenue vs Expenses (Monthly)")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={language === 'ka' ? 'შემოსავალი' : 'Revenue'} 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey={language === 'ka' ? 'ხარჯები' : 'Expenses'} 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey={language === 'ka' ? 'მოგება' : 'Profit'} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("ხარჯები კატეგორიების მიხედვით", "Expenses by Category")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={language === 'ka' ? 'კატეგორია' : 'Category'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={language === 'ka' ? 'თანხა' : 'Amount'} 
                fill="hsl(var(--destructive))" 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
