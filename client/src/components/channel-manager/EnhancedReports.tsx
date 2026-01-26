/**
 * Enhanced Reports Component
 * Comprehensive analytics with charts and visualizations
 */

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Star,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useCalendarBookings } from "@/hooks/useOtelmsData";

// Demo data for charts
const REVENUE_DATA = [
  { month: "იან", booking: 4500, airbnb: 3200, expedia: 1800, direct: 2100 },
  { month: "თებ", booking: 5200, airbnb: 3800, expedia: 2100, direct: 2400 },
  { month: "მარ", booking: 6100, airbnb: 4200, expedia: 2500, direct: 2800 },
  { month: "აპრ", booking: 7500, airbnb: 5100, expedia: 3200, direct: 3500 },
  { month: "მაი", booking: 9200, airbnb: 6500, expedia: 4100, direct: 4200 },
  { month: "ივნ", booking: 11500, airbnb: 8200, expedia: 5500, direct: 5100 },
];

const OCCUPANCY_DATA = [
  { day: "ორშ", occupancy: 65 },
  { day: "სამ", occupancy: 58 },
  { day: "ოთხ", occupancy: 62 },
  { day: "ხუთ", occupancy: 70 },
  { day: "პარ", occupancy: 88 },
  { day: "შაბ", occupancy: 95 },
  { day: "კვი", occupancy: 82 },
];

const SOURCE_DISTRIBUTION = [
  { name: "Booking.com", value: 45, color: "#3B82F6" },
  { name: "Airbnb", value: 28, color: "#EC4899" },
  { name: "Expedia", value: 15, color: "#EAB308" },
  { name: "Direct", value: 12, color: "#10B981" },
];

const ADR_TREND = [
  { week: "კვ 1", adr: 125, revpar: 82 },
  { week: "კვ 2", adr: 132, revpar: 89 },
  { week: "კვ 3", adr: 128, revpar: 85 },
  { week: "კვ 4", adr: 145, revpar: 102 },
  { week: "კვ 5", adr: 158, revpar: 118 },
  { week: "კვ 6", adr: 165, revpar: 135 },
];

const ROOM_TYPE_PERFORMANCE = [
  { type: "Suite Sea", revenue: 12500, bookings: 45, adr: 278 },
  { type: "Deluxe Sea", revenue: 18200, bookings: 62, adr: 294 },
  { type: "Superior", revenue: 8500, bookings: 28, adr: 304 },
  { type: "Family", revenue: 5800, bookings: 18, adr: 322 },
];

export function EnhancedReports() {
  const { language } = useLanguage();
  const { data: bookings, isLoading } = useCalendarBookings();
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");

  // Calculate KPIs from bookings
  const kpis = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        totalRevenue: 32500,
        avgAdr: 165,
        occupancy: 72,
        totalBookings: 156,
        revenueChange: 12.5,
        adrChange: 8.2,
        occupancyChange: 5.3,
        bookingsChange: 15.1,
      };
    }

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const avgAdr = totalRevenue / bookings.length || 0;

    return {
      totalRevenue,
      avgAdr: Math.round(avgAdr),
      occupancy: 72,
      totalBookings: bookings.length,
      revenueChange: 12.5,
      adrChange: 8.2,
      occupancyChange: 5.3,
      bookingsChange: 15.1,
    };
  }, [bookings]);

  const formatCurrency = (value: number) => `₾${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {language === "ka" ? "გაფართოებული ანალიტიკა" : "Enhanced Analytics"}
          </h2>
          <p className="text-sm text-slate-400">
            {language === "ka"
              ? "დეტალური რეპორტები და ვიზუალიზაციები"
              : "Detailed reports and visualizations"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {(["week", "month", "quarter", "year"] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={dateRange === range ? "default" : "ghost"}
                className={dateRange === range ? "bg-blue-600" : "text-slate-400"}
                onClick={() => setDateRange(range)}
              >
                {range === "week"
                  ? language === "ka" ? "კვირა" : "Week"
                  : range === "month"
                  ? language === "ka" ? "თვე" : "Month"
                  : range === "quarter"
                  ? language === "ka" ? "კვარტალი" : "Quarter"
                  : language === "ka" ? "წელი" : "Year"}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="border-slate-700">
            <Download className="w-4 h-4 mr-2" />
            {language === "ka" ? "ექსპორტი" : "Export"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300/70">
                  {language === "ka" ? "სულ შემოსავალი" : "Total Revenue"}
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(kpis.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">+{kpis.revenueChange}%</span>
                </div>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-300/70">
                  {language === "ka" ? "საშუალო ADR" : "Avg ADR"}
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  ₾{kpis.avgAdr}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400">+{kpis.adrChange}%</span>
                </div>
              </div>
              <Star className="w-10 h-10 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300/70">
                  {language === "ka" ? "დაკავებულობა" : "Occupancy"}
                </p>
                <p className="text-2xl font-bold text-purple-400">{kpis.occupancy}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-400">+{kpis.occupancyChange}%</span>
                </div>
              </div>
              <Percent className="w-10 h-10 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-500/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-300/70">
                  {language === "ka" ? "ჯავშნები" : "Bookings"}
                </p>
                <p className="text-2xl font-bold text-orange-400">{kpis.totalBookings}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-400">+{kpis.bookingsChange}%</span>
                </div>
              </div>
              <Users className="w-10 h-10 text-orange-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {language === "ka" ? "შემოსავალი არხების მიხედვით" : "Revenue by Channel"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAirbnb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpedia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `₾${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="booking"
                  name="Booking.com"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorBooking)"
                />
                <Area
                  type="monotone"
                  dataKey="airbnb"
                  name="Airbnb"
                  stroke="#EC4899"
                  fillOpacity={1}
                  fill="url(#colorAirbnb)"
                />
                <Area
                  type="monotone"
                  dataKey="expedia"
                  name="Expedia"
                  stroke="#EAB308"
                  fillOpacity={1}
                  fill="url(#colorExpedia)"
                />
                <Area
                  type="monotone"
                  dataKey="direct"
                  name="Direct"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorDirect)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Distribution Pie */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-400" />
              {language === "ka" ? "წყაროების განაწილება" : "Source Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={SOURCE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ stroke: "#9CA3AF" }}
                >
                  {SOURCE_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Occupancy */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              {language === "ka" ? "კვირის დაკავებულობა" : "Weekly Occupancy"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={OCCUPANCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Occupancy"]}
                />
                <Bar
                  dataKey="occupancy"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  name={language === "ka" ? "დაკავებულობა" : "Occupancy"}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ADR & RevPAR Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              {language === "ka" ? "ADR & RevPAR ტრენდი" : "ADR & RevPAR Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ADR_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `₾${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="adr"
                  name="ADR"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="revpar"
                  name="RevPAR"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Room Type Performance Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            {language === "ka" ? "ოთახის ტიპების ეფექტურობა" : "Room Type Performance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "ოთახის ტიპი" : "Room Type"}
                  </th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "შემოსავალი" : "Revenue"}
                  </th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "ჯავშნები" : "Bookings"}
                  </th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">ADR</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "წილი" : "Share"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROOM_TYPE_PERFORMANCE.map((room, idx) => {
                  const totalRevenue = ROOM_TYPE_PERFORMANCE.reduce((sum, r) => sum + r.revenue, 0);
                  const share = ((room.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-700/30">
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">{room.type}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-emerald-400 font-semibold">
                          {formatCurrency(room.revenue)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-blue-400">{room.bookings}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-purple-400">₾{room.adr}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge className="bg-slate-700 text-slate-300">{share}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedReports;
