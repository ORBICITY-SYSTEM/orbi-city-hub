import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Area } from "recharts";

interface FinanceReportChartsProps {
  records: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinanceReportCharts({ records }: FinanceReportChartsProps) {
  const { language } = useLanguage();

  // Monthly data
  const monthlyData = new Map<string, any>();
  records.forEach(r => {
    const month = r.date?.substring(0, 7);
    if (!month) return;
    if (!monthlyData.has(month)) {
      monthlyData.set(month, {
        month,
        revenue: 0,
        bookings: 0,
        nights: 0,
        rooms: new Set(),
      });
    }
    const data = monthlyData.get(month);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
    if (r.room_number) data.rooms.add(r.room_number);
  });

  const monthlyArray = Array.from(monthlyData.values())
    .map(m => ({
      month: m.month,
      revenue: m.revenue,
      bookings: m.bookings,
      nights: m.nights,
      roomCount: m.rooms.size,
      adr: m.nights > 0 ? m.revenue / m.nights : 0,
      occupancy: 0, // Will be calculated if needed
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Channel data
  const channelData = new Map<string, number>();
  records.forEach(r => {
    const channel = r.channel || 'Direct';
    channelData.set(channel, (channelData.get(channel) || 0) + Number(r.revenue || 0));
  });

  const channelArray = Array.from(channelData.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Building block data
  const blockData = new Map<string, any>();
  records.forEach(r => {
    const block = r.building_block || 'Unknown';
    if (!blockData.has(block)) {
      blockData.set(block, { block, revenue: 0, bookings: 0, nights: 0 });
    }
    const data = blockData.get(block);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
  });

  const blockArray = Array.from(blockData.values())
    .sort((a, b) => b.revenue - a.revenue);

  const chartConfig = {
    revenue: {
      label: language === 'ka' ? 'შემოსავალი' : 'Revenue',
      color: '#0088FE',
    },
    roomCount: {
      label: language === 'ka' ? 'სტუდიოები' : 'Studios',
      color: '#FF8042',
    },
    bookings: {
      label: language === 'ka' ? 'ჯავშნები' : 'Bookings',
      color: '#0088FE',
    },
    nights: {
      label: language === 'ka' ? 'ღამეები' : 'Nights',
      color: '#00C49F',
    },
    adr: {
      label: 'ADR',
      color: '#8884d8',
    },
  };

  return (
    <div className="grid gap-6">
      {/* Revenue Trend with Portfolio Growth */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ka' ? '📈 შემოსავლის ტრენდი და პორტფოლიოს ზრდა' : '📈 Revenue Trend & Portfolio Growth'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ComposedChart data={monthlyArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#0088FE" name={language === 'ka' ? 'შემოსავალი' : 'Revenue'} />
              <Line yAxisId="right" type="monotone" dataKey="roomCount" stroke="#FF8042" name={language === 'ka' ? 'სტუდიოები' : 'Studios'} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ka' ? '🌐 არხების განაწილება' : '🌐 Channel Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={channelArray}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${((entry.value / channelArray.reduce((s, c) => s + c.value, 0)) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Building Block Performance */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ka' ? '🏗️ ბლოკების შედარება' : '🏗️ Building Block Comparison'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={blockArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="revenue" fill="#00C49F" name={language === 'ka' ? 'შემოსავალი' : 'Revenue'} />
                <Bar dataKey="bookings" fill="#FFBB28" name={language === 'ka' ? 'ჯავშნები' : 'Bookings'} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ADR Trend */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ka' ? '💰 ADR-ის ევოლუცია' : '💰 ADR Evolution'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart data={monthlyArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="adr" stroke="#8884d8" strokeWidth={2} name="ADR" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bookings & Nights Trend */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ka' ? '📊 ჯავშნები და ღამეები' : '📊 Bookings & Nights Trend'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart data={monthlyArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#0088FE" name={language === 'ka' ? 'ჯავშნები' : 'Bookings'} />
              <Line type="monotone" dataKey="nights" stroke="#00C49F" name={language === 'ka' ? 'ღამეები' : 'Nights'} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
