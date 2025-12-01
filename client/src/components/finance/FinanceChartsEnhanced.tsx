import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface FinanceRecord {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  occupancy: number;
  nights: number;
  building_block: string;
  channel: string;
}

interface ExpenseRecord {
  date: string;
  category: string;
  amount: number;
}

interface FinanceChartsEnhancedProps {
  records: FinanceRecord[];
  expenses: ExpenseRecord[];
  blockStats: Record<string, { revenue: number; bookings: number; nights: number }>;
  channelStats: Record<string, { revenue: number; bookings: number }>;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--accent))"];

export const FinanceChartsEnhanced = ({ records, expenses, blockStats, channelStats }: FinanceChartsEnhancedProps) => {
  const { t, language } = useLanguage();

  // Monthly aggregation
  const monthlyData = records.reduce((acc: any, record) => {
    const month = new Date(record.date).toLocaleDateString(language === "ka" ? "ka-GE" : "en-US", {
      year: "numeric",
      month: "short",
    });

    if (!acc[month]) {
      acc[month] = {
        month,
        revenue: 0,
        expenses: 0,
        profit: 0,
        bookings: 0,
        nights: 0,
      };
    }

    acc[month].revenue += record.revenue || 0;
    acc[month].expenses += record.expenses || 0;
    acc[month].profit += (record.revenue || 0) - (record.expenses || 0);
    acc[month].bookings += 1;
    acc[month].nights += record.nights || 0;

    return acc;
  }, {});

  const monthlyExpenses = expenses.reduce((acc: any, expense) => {
    const month = new Date(expense.date).toLocaleDateString(language === "ka" ? "ka-GE" : "en-US", {
      year: "numeric",
      month: "short",
    });

    if (!acc[month]) {
      acc[month] = { month, expenses: 0 };
    }

    acc[month].expenses += expense.amount || 0;

    return acc;
  }, {});

  // Merge revenue and expense data
  Object.keys(monthlyExpenses).forEach(month => {
    if (monthlyData[month]) {
      monthlyData[month].expenses = monthlyExpenses[month].expenses;
      monthlyData[month].profit = monthlyData[month].revenue - monthlyExpenses[month].expenses;
    }
  });

  const chartData = Object.values(monthlyData).map((item: any) => ({
    month: item.month,
    [t("შემოსავალი", "Revenue")]: item.revenue,
    [t("ხარჯები", "Expenses")]: item.expenses,
    [t("მოგება", "Profit")]: item.profit,
    [t("დაჯავშნები", "Bookings")]: item.bookings,
    [t("ღამეები", "Nights")]: item.nights,
  }));

  // Building block data
  const blockData = Object.entries(blockStats).map(([block, stats]) => ({
    name: t(`ბლოკი ${block}`, `Block ${block}`),
    [t("შემოსავალი", "Revenue")]: stats.revenue,
    [t("დაჯავშნები", "Bookings")]: stats.bookings,
    [t("ღამეები", "Nights")]: stats.nights,
  }));

  // Channel data
  const channelData = Object.entries(channelStats).map(([channel, stats]) => ({
    name: channel,
    value: stats.revenue,
    bookings: stats.bookings,
  }));

  // Expense by category
  const expenseByCategory = expenses.reduce((acc: any, expense) => {
    const category = expense.category || "Other";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: category,
    [t("თანხა", "Amount")]: amount,
  }));

  return (
    <div className="grid gap-6">
      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t("თვიური შემოსავლების ტენდენცია", "Monthly Revenue Trend")}</CardTitle>
          <CardDescription>
            {t("შემოსავლები, ხარჯები და მოგება თვეების მიხედვით", "Revenue, expenses, and profit by month")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={t("შემოსავალი", "Revenue")} 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey={t("მოგება", "Profit")} 
                stroke="hsl(var(--success))" 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
              <Line 
                type="monotone" 
                dataKey={t("ხარჯები", "Expenses")} 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Building Block Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("შემოსავალი ბლოკების მიხედვით", "Revenue by Building Block")}</CardTitle>
            <CardDescription>
              {t("A, C, D ბლოკების ანალიზი", "Analysis of blocks A, C, D")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={blockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar dataKey={t("შემოსავალი", "Revenue")} fill="hsl(var(--primary))" />
                <Bar dataKey={t("დაჯავშნები", "Bookings")} fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t("შემოსავალი არხების მიხედვით", "Revenue by Channel")}</CardTitle>
            <CardDescription>
              {t("გაყიდვების არხების განაწილება", "Distribution of sales channels")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings and Nights Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t("დაჯავშნები და ღამეები", "Bookings & Nights")}</CardTitle>
            <CardDescription>
              {t("დაჯავშნების რაოდენობა და ღამეების ტენდენცია", "Booking count and nights trend")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={t("დაჯავშნები", "Bookings")} 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                />
                <Line 
                  type="monotone" 
                  dataKey={t("ღამეები", "Nights")} 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("ხარჯები კატეგორიების მიხედვით", "Expenses by Category")}</CardTitle>
              <CardDescription>
                {t("ხარჯების განაწილება", "Expense distribution")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--foreground))" />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey={t("თანხა", "Amount")} fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
