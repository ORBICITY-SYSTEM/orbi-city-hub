import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
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

interface FinanceRecord {
  date: string;
  revenue: number;
  nights: number;
  building_block: string;
  channel: string;
  room_number: string;
}

interface ExpenseRecord {
  date: string;
  category: string;
  amount: number;
}

interface MonthlyRoomCount {
  month: string;
  roomCount: number;
}

interface FinanceChartsProProps {
  records: FinanceRecord[];
  expenses: ExpenseRecord[];
  blockStats: any;
  channelStats: any;
  monthlyRoomCounts: MonthlyRoomCount[];
}

export const FinanceChartsPro = ({
  records,
  expenses,
  blockStats,
  channelStats,
  monthlyRoomCounts,
}: FinanceChartsProProps) => {
  const { t, language } = useLanguage();

  // Aggregate data by month
  const monthlyData = records.reduce((acc: any, record) => {
    const month = record.date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = {
        month,
        revenue: 0,
        nights: 0,
        bookings: 0,
        rooms: 0,
      };
    }
    acc[month].revenue += record.revenue || 0;
    acc[month].nights += record.nights || 0;
    acc[month].bookings += 1;
    return acc;
  }, {});

  // Add room counts to monthly data
  monthlyRoomCounts.forEach(({ month, roomCount }) => {
    if (monthlyData[month]) {
      monthlyData[month].rooms = roomCount;
    }
  });

  const chartData = Object.values(monthlyData).map((data: any) => {
    const [year, monthNum] = data.month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const totalPossibleNights = data.rooms * daysInMonth;
    const occupancy = totalPossibleNights > 0 ? (data.nights / totalPossibleNights) * 100 : 0;
    const adr = data.nights > 0 ? data.revenue / data.nights : 0;

    return {
      month: data.month.substring(5),
      revenue: data.revenue,
      nights: data.nights,
      bookings: data.bookings,
      rooms: data.rooms,
      occupancy: occupancy,
      adr: adr,
    };
  });

  // Building block data
  const blockData = Object.entries(blockStats).map(([block, stats]: [string, any]) => ({
    block,
    revenue: stats.revenue,
    bookings: stats.bookings,
    nights: stats.nights,
    adr: stats.nights > 0 ? stats.revenue / stats.nights : 0,
  }));

  // Channel distribution
  const channelData = Object.entries(channelStats).map(([channel, stats]: [string, any]) => ({
    name: channel,
    value: stats.revenue,
    bookings: stats.bookings,
  }));

  // Booking length distribution
  const lengthDistribution = records.reduce((acc: any, record) => {
    const nights = record.nights;
    let bucket;
    if (nights <= 2) bucket = "1-2";
    else if (nights <= 7) bucket = "3-7";
    else if (nights <= 14) bucket = "8-14";
    else if (nights <= 30) bucket = "15-30";
    else bucket = "31+";

    if (!acc[bucket]) {
      acc[bucket] = { range: bucket, count: 0, revenue: 0, nights: 0 };
    }
    acc[bucket].count += 1;
    acc[bucket].revenue += record.revenue || 0;
    acc[bucket].nights += nights;
    return acc;
  }, {});

  const lengthData = Object.values(lengthDistribution);

  // Colors
  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];
  const BLOCK_COLORS: any = {
    A: '#EF4444',
    C: '#3B82F6',
    D1: '#10B981',
    D2: '#8B5CF6',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "ka" ? "ka-GE" : "en-US", {
      style: "currency",
      currency: "GEL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-6">
      {/* Chart 1: Revenue Trend with Room Count */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>{t("შემოსავლები და სტუდიოები", "Revenue & Studios")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') return [formatCurrency(value), t('შემოსავალი', 'Revenue')];
                  if (name === 'rooms') return [value, t('სტუდიოები', 'Studios')];
                  return [value, name];
                }}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                fill="url(#colorRevenue)" 
                stroke="hsl(var(--primary))"
                name={t('შემოსავალი', 'Revenue')}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="rooms" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name={t('სტუდიოები', 'Studios')}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Corrected Occupancy Rate */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>{t("Occupancy (დინამიური)", "Occupancy (Dynamic)")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'occupancy') return [`${(value as number).toFixed(1)}%`, t('Occupancy', 'Occupancy')];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                dataKey="occupancy" 
                name={t('Occupancy %', 'Occupancy %')}
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.occupancy >= 75 ? '#10B981' :
                      entry.occupancy >= 60 ? '#EAB308' :
                      '#EF4444'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row 1: Building Blocks & Channels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Building Block Performance */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{t("ბლოკების Performance", "Building Block Performance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={blockData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="block" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return [formatCurrency(value), t('შემოსავალი', 'Revenue')];
                    if (name === 'bookings') return [value, t('ჯავშნები', 'Bookings')];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name={t('შემოსავალი', 'Revenue')} radius={[8, 8, 0, 0]}>
                  {blockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BLOCK_COLORS[entry.block] || '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{t("წყაროების განაწილება", "Channel Distribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} ${((entry.value / channelData.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(0)}%`}
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
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: ADR & Booking Length */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ADR Trend */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{t("ADR ტრენდი", "ADR Trend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="adr" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name={t('საშუალო ADR', 'Average ADR')}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Length Distribution */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{t("ჯავშნის ხანგრძლივობა", "Booking Length")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lengthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'count') return [value, t('ჯავშნები', 'Bookings')];
                    if (name === 'revenue') return [formatCurrency(value), t('შემოსავალი', 'Revenue')];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name={t('ჯავშნები', 'Bookings')} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Bookings & Nights Trend */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>{t("ჯავშნები და ღამეები", "Bookings & Nights")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#4F46E5" 
                strokeWidth={2}
                name={t('ჯავშნები', 'Bookings')}
              />
              <Line 
                type="monotone" 
                dataKey="nights" 
                stroke="#EC4899" 
                strokeWidth={2}
                name={t('ღამეები', 'Nights')}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
