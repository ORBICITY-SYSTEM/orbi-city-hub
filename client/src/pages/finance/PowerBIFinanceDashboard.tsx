import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Calendar,
  Percent,
  ArrowUpDown,
  Filter,
  Download,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  LayoutGrid,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Color palette for charts
const COLORS = {
  revenue: "#10b981",
  profit: "#3b82f6",
  expenses: "#ef4444",
  company: "#8b5cf6",
  owners: "#f59e0b",
  occupancy: "#06b6d4",
  cleaning: "#ec4899",
  marketing: "#f97316",
  salaries: "#6366f1",
  utilities: "#14b8a6",
};

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

type SortField = "month" | "totalRevenue" | "totalProfit" | "occupancyRate" | "studios" | "avgPrice";
type SortDirection = "asc" | "desc";

export default function PowerBIFinanceDashboard() {
  const { data: monthlyData, isLoading } = trpc.finance.getMonthlyData.useQuery();
  const { data: summary } = trpc.finance.getSummary.useQuery();

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("month");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Get unique years and months
  const years = useMemo(() => {
    if (!monthlyData) return [];
    const uniqueYears = [...new Set(monthlyData.map(d => {
      const parts = d.month.split(" ");
      return parts[parts.length - 1];
    }))];
    return uniqueYears.sort((a, b) => parseInt(b) - parseInt(a));
  }, [monthlyData]);

  const months = useMemo(() => {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!monthlyData) return [];
    
    let data = [...monthlyData];
    
    // Filter by year
    if (selectedYear !== "all") {
      data = data.filter(d => d.month.includes(selectedYear));
    }
    
    // Filter by month
    if (selectedMonth !== "all") {
      data = data.filter(d => d.month.startsWith(selectedMonth));
    }
    
    // Sort
    data.sort((a, b) => {
      let aVal: number, bVal: number;
      
      if (sortField === "month") {
        // Sort by date
        const monthOrder: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
        const [aMonth, aYear] = a.month.split(" ");
        const [bMonth, bYear] = b.month.split(" ");
        aVal = parseInt(aYear) * 100 + monthOrder[aMonth];
        bVal = parseInt(bYear) * 100 + monthOrder[bMonth];
      } else {
        aVal = a[sortField] as number;
        bVal = b[sortField] as number;
      }
      
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
    
    return data;
  }, [monthlyData, selectedYear, selectedMonth, sortField, sortDirection]);

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    if (!filteredData.length) return null;
    
    const totalRevenue = filteredData.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalExpenses = filteredData.reduce((sum, d) => sum + d.totalExpenses, 0);
    const totalProfit = filteredData.reduce((sum, d) => sum + d.totalProfit, 0);
    const avgOccupancy = filteredData.reduce((sum, d) => sum + d.occupancyRate, 0) / filteredData.length;
    const avgPrice = filteredData.reduce((sum, d) => sum + d.avgPrice, 0) / filteredData.length;
    const latestStudios = filteredData[0]?.studios || 0;
    const companyProfit = filteredData.reduce((sum, d) => sum + d.companyProfit, 0);
    const ownersProfit = filteredData.reduce((sum, d) => sum + d.ownersProfit, 0);
    
    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      avgOccupancy,
      avgPrice,
      latestStudios,
      companyProfit,
      ownersProfit,
      profitMargin: (totalProfit / totalRevenue) * 100,
    };
  }, [filteredData]);

  // Expense breakdown for pie chart
  const expenseBreakdown = useMemo(() => {
    if (!filteredData.length) return [];
    
    const cleaning = filteredData.reduce((sum, d) => sum + d.cleaningTech, 0);
    const marketing = filteredData.reduce((sum, d) => sum + d.marketing, 0);
    const salaries = filteredData.reduce((sum, d) => sum + d.salaries, 0);
    const utilities = filteredData.reduce((sum, d) => sum + d.utilities, 0);
    
    return [
      { name: "დასუფთავება/ტექნიკა", value: cleaning, color: COLORS.cleaning },
      { name: "მარკეტინგი", value: marketing, color: COLORS.marketing },
      { name: "ხელფასები", value: salaries, color: COLORS.salaries },
      { name: "კომუნალური", value: utilities, color: COLORS.utilities },
    ];
  }, [filteredData]);

  // Chart data (reversed for chronological order)
  const chartData = useMemo(() => {
    return [...filteredData].reverse();
  }, [filteredData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
    setSortField("month");
    setSortDirection("desc");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1628] flex items-center justify-center">
        <div className="text-white text-xl">იტვირთება...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1628] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/finance">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-1" />
              უკან
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">📊</span>
              ფინანსური ანალიტიკა
            </h1>
            <p className="text-gray-400 mt-1">Power BI სტილის ინტერაქტიული დეშბორდი</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            ექსპორტი
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-medium">ფილტრები:</span>
          </div>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] bg-[#0d1829] border-[#2a3f5f] text-white">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="წელი" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2942] border-[#2a3f5f]">
              <SelectItem value="all" className="text-white">ყველა წელი</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year} className="text-white">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] bg-[#0d1829] border-[#2a3f5f] text-white">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="თვე" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2942] border-[#2a3f5f]">
              <SelectItem value="all" className="text-white">ყველა თვე</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month} className="text-white">{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            გასუფთავება
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="text-gray-300"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="text-gray-300"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-400">
          ნაჩვენებია: <span className="text-white font-semibold">{filteredData.length}</span> თვე
          {selectedYear !== "all" && <span> • წელი: <span className="text-emerald-400">{selectedYear}</span></span>}
          {selectedMonth !== "all" && <span> • თვე: <span className="text-emerald-400">{selectedMonth}</span></span>}
        </div>
      </Card>

      {/* KPI Cards */}
      {filteredTotals && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">შემოსავალი</span>
            </div>
            <div className="text-2xl font-bold text-white">₾{filteredTotals.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-emerald-400 mt-1">სულ პერიოდში</div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">მოგება</span>
            </div>
            <div className="text-2xl font-bold text-white">₾{filteredTotals.totalProfit.toLocaleString()}</div>
            <div className="text-xs text-blue-400 mt-1">{filteredTotals.profitMargin.toFixed(1)}% მარჟა</div>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm font-medium">ხარჯები</span>
            </div>
            <div className="text-2xl font-bold text-white">₾{filteredTotals.totalExpenses.toLocaleString()}</div>
            <div className="text-xs text-red-400 mt-1">სულ პერიოდში</div>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">დატვირთვა</span>
            </div>
            <div className="text-2xl font-bold text-white">{filteredTotals.avgOccupancy.toFixed(1)}%</div>
            <div className="text-xs text-cyan-400 mt-1">საშუალო</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">სტუდიოები</span>
            </div>
            <div className="text-2xl font-bold text-white">{filteredTotals.latestStudios}</div>
            <div className="text-xs text-purple-400 mt-1">აქტიური</div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-amber-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">საშ. ფასი</span>
            </div>
            <div className="text-2xl font-bold text-white">₾{Math.round(filteredTotals.avgPrice)}</div>
            <div className="text-xs text-amber-400 mt-1">ღამეში</div>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="bg-[#1a2942] border-[#2a3f5f]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">
            <LineChartIcon className="w-4 h-4 mr-2" />
            მიმოხილვა
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            შემოსავლები
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-emerald-600">
            <PieChartIcon className="w-4 h-4 mr-2" />
            ხარჯები
          </TabsTrigger>
          <TabsTrigger value="profit" className="data-[state=active]:bg-emerald-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            მოგება
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Profit Trend */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                შემოსავალი vs მოგება
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`₾${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="totalRevenue" name="შემოსავალი" fill={COLORS.revenue} fillOpacity={0.3} stroke={COLORS.revenue} strokeWidth={2} />
                  <Line type="monotone" dataKey="totalProfit" name="მოგება" stroke={COLORS.profit} strokeWidth={3} dot={{ fill: COLORS.profit }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Occupancy Rate */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-cyan-400" />
                დატვირთვის დინამიკა
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'დატვირთვა']}
                  />
                  <Area type="monotone" dataKey="occupancyRate" name="დატვირთვა" fill={COLORS.occupancy} fillOpacity={0.5} stroke={COLORS.occupancy} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Bar Chart */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">თვიური შემოსავალი</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`₾${value.toLocaleString()}`, 'შემოსავალი']}
                  />
                  <Bar dataKey="totalRevenue" name="შემოსავალი" fill={COLORS.revenue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Average Price Trend */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">საშუალო ფასი (ADR)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `₾${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`₾${value}`, 'ADR']}
                  />
                  <Line type="monotone" dataKey="avgPrice" name="საშ. ფასი" stroke={COLORS.owners} strokeWidth={3} dot={{ fill: COLORS.owners, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown Pie */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">ხარჯების სტრუქტურა</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#9ca3af' }}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    formatter={(value: number) => [`₾${value.toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Expense Trend */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">ხარჯების დინამიკა</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="cleaningTech" name="დასუფთავება" stackId="1" fill={COLORS.cleaning} stroke={COLORS.cleaning} />
                  <Area type="monotone" dataKey="marketing" name="მარკეტინგი" stackId="1" fill={COLORS.marketing} stroke={COLORS.marketing} />
                  <Area type="monotone" dataKey="salaries" name="ხელფასები" stackId="1" fill={COLORS.salaries} stroke={COLORS.salaries} />
                  <Area type="monotone" dataKey="utilities" name="კომუნალური" stackId="1" fill={COLORS.utilities} stroke={COLORS.utilities} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Distribution */}
            <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">მოგების განაწილება</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a2942', border: '1px solid #2a3f5f', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="companyProfit" name="კომპანია" stackId="a" fill={COLORS.company} />
                  <Bar dataKey="ownersProfit" name="მფლობელები" stackId="a" fill={COLORS.owners} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Profit Summary */}
            {filteredTotals && (
              <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">მოგების შეჯამება</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-900/30 rounded-lg">
                    <span className="text-purple-300">კომპანიის წილი</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">₾{filteredTotals.companyProfit.toLocaleString()}</div>
                      <div className="text-sm text-purple-400">
                        {((filteredTotals.companyProfit / filteredTotals.totalProfit) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-amber-900/30 rounded-lg">
                    <span className="text-amber-300">მფლობელების წილი</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">₾{filteredTotals.ownersProfit.toLocaleString()}</div>
                      <div className="text-sm text-amber-400">
                        {((filteredTotals.ownersProfit / filteredTotals.totalProfit) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-900/30 rounded-lg border-2 border-blue-500/50">
                    <span className="text-blue-300 font-semibold">სულ მოგება</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">₾{filteredTotals.totalProfit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Data Table */}
      <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          დეტალური მონაცემები
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a3f5f] hover:bg-transparent">
                <TableHead 
                  className="text-gray-300 cursor-pointer hover:text-white"
                  onClick={() => handleSort("month")}
                >
                  <div className="flex items-center gap-1">
                    თვე
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-300 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort("studios")}
                >
                  <div className="flex items-center justify-end gap-1">
                    სტუდიო
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-300 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort("occupancyRate")}
                >
                  <div className="flex items-center justify-end gap-1">
                    დატვირთვა
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-300 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort("avgPrice")}
                >
                  <div className="flex items-center justify-end gap-1">
                    ADR
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-300 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort("totalRevenue")}
                >
                  <div className="flex items-center justify-end gap-1">
                    შემოსავალი
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-gray-300 text-right">ხარჯები</TableHead>
                <TableHead 
                  className="text-gray-300 cursor-pointer hover:text-white text-right"
                  onClick={() => handleSort("totalProfit")}
                >
                  <div className="flex items-center justify-end gap-1">
                    მოგება
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index} className="border-[#2a3f5f] hover:bg-[#2a3f5f]/30">
                  <TableCell className="text-white font-medium">{row.month}</TableCell>
                  <TableCell className="text-white text-right">{row.studios}</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      row.occupancyRate >= 80 ? 'bg-emerald-900/50 text-emerald-300' :
                      row.occupancyRate >= 60 ? 'bg-amber-900/50 text-amber-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>
                      {row.occupancyRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-white text-right">₾{row.avgPrice}</TableCell>
                  <TableCell className="text-emerald-400 text-right font-semibold">₾{row.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell className="text-red-400 text-right">₾{row.totalExpenses.toLocaleString()}</TableCell>
                  <TableCell className="text-blue-400 text-right font-semibold">₾{row.totalProfit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
