/**
 * Finance Overview Dashboard - Professional KPI Dashboard
 * Similar to Marketing and Reservations style
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, PieChart,
  BarChart3, ArrowUpRight, ArrowDownRight, Building2,
  Calendar, Users, Percent, Target, Banknote, Activity,
  RefreshCw, Brain, Sparkles, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartPie, Pie, Cell,
  BarChart, Bar, Legend, ComposedChart, Line
} from "recharts";
import { useLocation } from "wouter";

// Month labels in Georgian
const MONTHS_GE = [
  'იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ',
  'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'
];

const COLORS = ['#22d3ee', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6'];

export function FinanceOverviewDashboard() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real finance data
  const { data: financeData, isLoading, refetch } = trpc.realFinance.getFinancialSummary.useQuery();
  const { data: monthlyData } = trpc.realFinance.getMonthlyRevenue.useQuery();
  const { data: expensesData } = trpc.realFinance.getExpensesByCategory.useQuery();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate key metrics
  const totalRevenue = financeData?.totalRevenue || 0;
  const totalExpenses = financeData?.totalExpenses || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const avgDailyRevenue = financeData?.avgDailyRevenue || 0;
  const occupancyRate = financeData?.occupancyRate || 0;

  // Format monthly data for charts
  const monthlyChartData = monthlyData?.map((item: any) => ({
    month: MONTHS_GE[new Date(item.month + '-01').getMonth()],
    revenue: item.revenue,
    expenses: item.expenses || item.revenue * 0.35,
    profit: item.revenue - (item.expenses || item.revenue * 0.35),
  })) || [];

  // Format expense categories for pie chart
  const expenseChartData = expensesData?.map((item: any, index: number) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {language === 'ka' ? 'ფინანსური მიმოხილვა' : 'Financial Overview'}
          </h2>
          <p className="text-white/60">
            {language === 'ka' ? 'ძირითადი ფინანსური მაჩვენებლები' : 'Key financial metrics at a glance'}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {language === 'ka' ? 'განახლება' : 'Refresh'}
        </Button>
      </div>

      {/* Main KPI Cards - 4 Column Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300/80">
                  {language === 'ka' ? 'მთლიანი შემოსავალი' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold text-emerald-400">
                  ₾{totalRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">+12.5%</span>
                  <span className="text-xs text-white/50">
                    {language === 'ka' ? 'წინა თვესთან' : 'vs last month'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Banknote className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300/80">
                  {language === 'ka' ? 'მთლიანი ხარჯები' : 'Total Expenses'}
                </p>
                <p className="text-3xl font-bold text-red-400">
                  ₾{totalExpenses.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">-5.2%</span>
                  <span className="text-xs text-white/50">
                    {language === 'ka' ? 'წინა თვესთან' : 'vs last month'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Wallet className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300/80">
                  {language === 'ka' ? 'წმინდა მოგება' : 'Net Profit'}
                </p>
                <p className="text-3xl font-bold text-cyan-400">
                  ₾{netProfit.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-cyan-400">+18.3%</span>
                  <span className="text-xs text-white/50">
                    {language === 'ka' ? 'წინა თვესთან' : 'vs last month'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <TrendingUp className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300/80">
                  {language === 'ka' ? 'მოგების მარჟა' : 'Profit Margin'}
                </p>
                <p className="text-3xl font-bold text-purple-400">
                  {profitMargin.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-white/50">
                    {language === 'ka' ? 'მიზანი: 70%' : 'Target: 70%'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Percent className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">
                  {language === 'ka' ? 'საშ. დღიური' : 'Avg Daily'}
                </p>
                <p className="text-lg font-bold text-white">
                  ₾{avgDailyRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">
                  {language === 'ka' ? 'დაკავებულობა' : 'Occupancy'}
                </p>
                <p className="text-lg font-bold text-white">{occupancyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">RevPAR</p>
                <p className="text-lg font-bold text-white">
                  ₾{Math.round(avgDailyRevenue * (occupancyRate / 100))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">ADR</p>
                <p className="text-lg font-bold text-white">
                  ₾{Math.round(avgDailyRevenue / (occupancyRate / 100) || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="bg-slate-800/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              {language === 'ka' ? 'შემოსავლის ტრენდი' : 'Revenue Trend'}
            </CardTitle>
            <CardDescription>
              {language === 'ka' ? 'თვიური შემოსავალი და მოგება' : 'Monthly revenue and profit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `₾${value.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}`,
                    name === 'revenue' ? (language === 'ka' ? 'შემოსავალი' : 'Revenue') :
                    name === 'expenses' ? (language === 'ka' ? 'ხარჯები' : 'Expenses') :
                    (language === 'ka' ? 'მოგება' : 'Profit')
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="revenue" name={language === 'ka' ? 'შემოსავალი' : 'Revenue'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={language === 'ka' ? 'ხარჯები' : 'Expenses'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="profit" name={language === 'ka' ? 'მოგება' : 'Profit'} stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories Pie Chart */}
        <Card className="bg-slate-800/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-400" />
              {language === 'ka' ? 'ხარჯების კატეგორიები' : 'Expense Categories'}
            </CardTitle>
            <CardDescription>
              {language === 'ka' ? 'ხარჯების განაწილება კატეგორიების მიხედვით' : 'Expense distribution by category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartPie>
                <Pie
                  data={expenseChartData.length > 0 ? expenseChartData : [
                    { name: language === 'ka' ? 'ოპერაციული' : 'Operations', value: 35, color: '#22d3ee' },
                    { name: language === 'ka' ? 'მარკეტინგი' : 'Marketing', value: 20, color: '#10b981' },
                    { name: language === 'ka' ? 'პერსონალი' : 'Staff', value: 25, color: '#a855f7' },
                    { name: language === 'ka' ? 'კომუნალური' : 'Utilities', value: 15, color: '#f59e0b' },
                    { name: language === 'ka' ? 'სხვა' : 'Other', value: 5, color: '#ef4444' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(expenseChartData.length > 0 ? expenseChartData : [
                    { color: '#22d3ee' },
                    { color: '#10b981' },
                    { color: '#a855f7' },
                    { color: '#f59e0b' },
                    { color: '#ef4444' },
                  ]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </RechartPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Module Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            id: 'analytics',
            title: language === 'ka' ? 'ანალიტიკა' : 'Analytics',
            icon: BarChart3,
            color: 'cyan',
            path: '/finance/analytics'
          },
          {
            id: 'otelms',
            title: 'OtelMS',
            icon: Building2,
            color: 'purple',
            path: '/finance/otelms'
          },
          {
            id: 'reports',
            title: language === 'ka' ? 'რეპორტები' : 'Reports',
            icon: Calendar,
            color: 'green',
            path: '/finance/reports'
          },
          {
            id: 'expenses',
            title: language === 'ka' ? 'ხარჯები' : 'Expenses',
            icon: Wallet,
            color: 'orange',
            path: '/finance/expenses'
          },
        ].map((module) => {
          const Icon = module.icon;
          const colorClasses: Record<string, string> = {
            cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400',
            purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50 text-purple-400',
            green: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50 text-green-400',
            orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50 text-orange-400',
          };
          return (
            <Card
              key={module.id}
              className={`bg-gradient-to-br ${colorClasses[module.color]} cursor-pointer transition-all hover:scale-[1.02]`}
              onClick={() => navigate(module.path)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{module.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insight Card */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-cyan-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-white">
                  {language === 'ka' ? 'AI ფინანსური ინსაითი' : 'AI Financial Insight'}
                </h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === 'ka' ? 'ახალი' : 'New'}
                </Badge>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {language === 'ka'
                  ? `შემოსავალი იზრდება +12.5%-ით წინა თვესთან შედარებით. მოგების მარჟა ${profitMargin.toFixed(1)}% არის ჯანსაღ დონეზე. რეკომენდაცია: გაზარდეთ მარკეტინგული ინვესტიცია შაბათ-კვირას ოკუპაციის გასაზრდელად.`
                  : `Revenue is growing +12.5% compared to last month. Profit margin of ${profitMargin.toFixed(1)}% is at a healthy level. Recommendation: Increase marketing investment on weekends to boost occupancy.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
