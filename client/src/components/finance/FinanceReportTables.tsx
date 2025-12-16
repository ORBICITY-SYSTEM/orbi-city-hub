import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinanceReportTablesProps {
  records: any[];
  expenses: any[];
}

export function FinanceReportTables({ records, expenses }: FinanceReportTablesProps) {
  const { language } = useLanguage();
  const [searchRoom, setSearchRoom] = useState("");
  const [sortField, setSortField] = useState<string>("revenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const formatCurrency = (amount: number) => {
    return language === 'ka'
      ? `${amount.toLocaleString('ka-GE', { maximumFractionDigits: 2 })} ₾`
      : `€${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  // Monthly Performance
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
      studios: m.rooms.size,
      adr: m.nights > 0 ? m.revenue / m.nights : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Room-by-Room Performance
  const roomData = new Map<string, any>();
  records.forEach(r => {
    const room = r.room_number;
    if (!room) return;
    if (!roomData.has(room)) {
      roomData.set(room, {
        room,
        block: r.building_block,
        revenue: 0,
        bookings: 0,
        nights: 0,
        firstBooking: r.date,
      });
    }
    const data = roomData.get(room);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
    if (r.date < data.firstBooking) data.firstBooking = r.date;
  });

  let roomArray = Array.from(roomData.values())
    .map(r => ({
      ...r,
      adr: r.nights > 0 ? r.revenue / r.nights : 0,
    }))
    .filter(r => searchRoom === "" || r.room.toLowerCase().includes(searchRoom.toLowerCase()));

  // Sorting
  roomArray.sort((a, b) => {
    const aVal = a[sortField as keyof typeof a];
    const bVal = b[sortField as keyof typeof b];
    const modifier = sortDirection === "asc" ? 1 : -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * modifier;
    }
    return String(aVal).localeCompare(String(bVal)) * modifier;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Building Block Summary
  const blockData = new Map<string, any>();
  records.forEach(r => {
    const block = r.building_block || 'Unknown';
    if (!blockData.has(block)) {
      blockData.set(block, { block, revenue: 0, bookings: 0, nights: 0, rooms: new Set() });
    }
    const data = blockData.get(block);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
    if (r.room_number) data.rooms.add(r.room_number);
  });

  const blockArray = Array.from(blockData.values())
    .map(b => ({
      block: b.block,
      studios: b.rooms.size,
      revenue: b.revenue,
      bookings: b.bookings,
      nights: b.nights,
      adr: b.nights > 0 ? b.revenue / b.nights : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Channel Summary
  const channelData = new Map<string, any>();
  records.forEach(r => {
    const channel = r.channel || 'Direct';
    if (!channelData.has(channel)) {
      channelData.set(channel, { channel, revenue: 0, bookings: 0, nights: 0 });
    }
    const data = channelData.get(channel);
    data.revenue += Number(r.revenue || 0);
    data.bookings += 1;
    data.nights += Number(r.nights || 0);
  });

  const channelArray = Array.from(channelData.values())
    .map(c => ({
      channel: c.channel,
      revenue: c.revenue,
      bookings: c.bookings,
      avgAdr: c.nights > 0 ? c.revenue / c.nights : 0,
      avgStay: c.bookings > 0 ? c.nights / c.bookings : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      {/* Monthly Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ka' ? '📅 თვეების მიხედვით' : '📅 Monthly Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ka' ? 'თვე' : 'Month'}</TableHead>
                <TableHead>{language === 'ka' ? 'სტუდიოები' : 'Studios'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'შემოსავალი' : 'Revenue'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'ჯავშნები' : 'Bookings'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'ღამეები' : 'Nights'}</TableHead>
                <TableHead className="text-right">ADR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyArray.map((m) => (
                <TableRow key={m.month}>
                  <TableCell className="font-medium">{m.month}</TableCell>
                  <TableCell>{m.studios}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(m.revenue)}</TableCell>
                  <TableCell className="text-right">{m.bookings}</TableCell>
                  <TableCell className="text-right">{m.nights}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.adr)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Building Block Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ka' ? '🏗️ ბლოკების მიხედვით' : '🏗️ Building Block Breakdown'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ka' ? 'ბლოკი' : 'Block'}</TableHead>
                <TableHead>{language === 'ka' ? 'სტუდიოები' : 'Studios'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'შემოსავალი' : 'Revenue'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'ჯავშნები' : 'Bookings'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'ღამეები' : 'Nights'}</TableHead>
                <TableHead className="text-right">ADR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockArray.map((b) => (
                <TableRow key={b.block}>
                  <TableCell className="font-medium">{b.block}</TableCell>
                  <TableCell>{b.studios}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(b.revenue)}</TableCell>
                  <TableCell className="text-right">{b.bookings}</TableCell>
                  <TableCell className="text-right">{b.nights}</TableCell>
                  <TableCell className="text-right">{formatCurrency(b.adr)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ka' ? '🌐 არხების მიხედვით' : '🌐 Channel Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ka' ? 'წყარო' : 'Channel'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'შემოსავალი' : 'Revenue'}</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'ჯავშნები' : 'Bookings'}</TableHead>
                <TableHead className="text-right">Avg ADR</TableHead>
                <TableHead className="text-right">{language === 'ka' ? 'საშუალო ყოფნა' : 'Avg Stay'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelArray.map((c) => (
                <TableRow key={c.channel}>
                  <TableCell className="font-medium">{c.channel}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(c.revenue)}</TableCell>
                  <TableCell className="text-right">{c.bookings}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.avgAdr)}</TableCell>
                  <TableCell className="text-right">{c.avgStay.toFixed(1)} {language === 'ka' ? 'ღამე' : 'nights'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Room-by-Room Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{language === 'ka' ? '🏨 ოთახების მიხედვით' : '🏨 Room-by-Room Performance'}</span>
            <Input
              placeholder={language === 'ka' ? 'ოთახის ძებნა...' : 'Search room...'}
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="max-w-xs"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("room")}>
                    {language === 'ka' ? 'ოთახი' : 'Room'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{language === 'ka' ? 'ბლოკი' : 'Block'}</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort("revenue")}>
                    {language === 'ka' ? 'შემოსავალი' : 'Revenue'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort("bookings")}>
                    {language === 'ka' ? 'ჯავშნები' : 'Bookings'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort("nights")}>
                    {language === 'ka' ? 'ღამეები' : 'Nights'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => handleSort("adr")}>
                    ADR
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{language === 'ka' ? 'პირველი ჯავშანი' : 'First Booking'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomArray.slice(0, 50).map((r) => (
                <TableRow key={r.room}>
                  <TableCell className="font-medium">{r.room}</TableCell>
                  <TableCell>{r.block}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(r.revenue)}</TableCell>
                  <TableCell className="text-right">{r.bookings}</TableCell>
                  <TableCell className="text-right">{r.nights}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.adr)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.firstBooking}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {roomArray.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              {language === 'ka' 
                ? `ნაჩვენებია პირველი 50 ოთახი ${roomArray.length}-დან` 
                : `Showing first 50 of ${roomArray.length} rooms`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
