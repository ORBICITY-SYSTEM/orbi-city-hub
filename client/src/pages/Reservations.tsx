import { useState } from "react";
import { CalendarDays, List, Users, Mail, Bot, TrendingUp, TrendingDown, Calendar, DollarSign, Star, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockBookings = [
  { id: "BK-001", guest: "John Smith", room: "A 3041", checkIn: "2025-11-26", checkOut: "2025-11-30", status: "confirmed", channel: "Booking.com", price: 450, nights: 4 },
  { id: "BK-002", guest: "Mariam Gelashvili", room: "C 2641", checkIn: "2025-11-27", checkOut: "2025-12-02", status: "confirmed", channel: "Airbnb", price: 520, nights: 5 },
  { id: "BK-003", guest: "David Brown", room: "D 3418", checkIn: "2025-11-26", checkOut: "2025-11-28", status: "checked-in", channel: "Expedia", price: 280, nights: 2 },
  { id: "BK-004", guest: "Anna Müller", room: "A 2441", checkIn: "2025-11-28", checkOut: "2025-12-05", status: "pending", channel: "Booking.com", price: 780, nights: 7 },
  { id: "BK-005", guest: "Nino Beridze", room: "C 2547", checkIn: "2025-11-26", checkOut: "2025-11-29", status: "checked-in", channel: "Direct", price: 360, nights: 3 },
  { id: "BK-006", guest: "Michael Johnson", room: "A 1833", checkIn: "2025-11-29", checkOut: "2025-12-03", status: "confirmed", channel: "Airbnb", price: 520, nights: 4 },
  { id: "BK-007", guest: "Tamar Makharadze", room: "C 4706", checkIn: "2025-11-27", checkOut: "2025-12-01", status: "confirmed", channel: "Agoda", price: 450, nights: 4 },
  { id: "BK-008", guest: "Sophie Martin", room: "A 4027", checkIn: "2025-11-30", checkOut: "2025-12-07", status: "pending", channel: "Booking.com", price: 890, nights: 7 },
];

const Reservations = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "system" | "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    const newMessage = { role: "user" as const, content };
    setChatHistory(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        module: "Reservations",
        userMessage: content,
      });

      setChatHistory(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "bookings", label: "Reservations", icon: List },
    { id: "crm", label: "CRM", icon: Users },
    { id: "mail", label: "📧 Email", icon: Mail },
    { id: "ai", label: "🤖 AI", icon: Bot },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      "confirmed": { variant: "default", label: "Confirmed", icon: CheckCircle2 },
      "checked-in": { variant: "secondary", label: "Checked In", icon: Calendar },
      "pending": { variant: "outline", label: "Pending", icon: Clock },
      "cancelled": { variant: "destructive", label: "Cancelled", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Calculate KPIs
  const totalBookings = mockBookings.length;
  const checkInsToday = mockBookings.filter(b => b.checkIn === "2025-11-26").length;
  const checkOutsToday = mockBookings.filter(b => b.checkOut === "2025-11-26").length;
  const occupancyRate = 85;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Reservations</h1>
        <p className="text-gray-600">Manage reservations and guests</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium">Total Reservations</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">{totalBookings}</div>
              <div className="text-xs text-blue-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs last month
              </div>
            </div>
            <Calendar className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 font-medium">Check-ins Today</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">{checkInsToday}</div>
              <div className="text-xs text-green-600 mt-1">{mockBookings.filter(b => b.checkIn === "2025-11-26").map(b => b.room).join(", ")}</div>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-700 font-medium">Check-outs Today</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">{checkOutsToday}</div>
              <div className="text-xs text-orange-600 mt-1">Cleaning required</div>
            </div>
            <XCircle className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 font-medium">occupancy</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">{occupancyRate}%</div>
              <div className="text-xs text-purple-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% vs last month
              </div>
            </div>
            <Star className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-yellow-700 font-medium">Revenue</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">₾{totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-yellow-600 mt-1">Current Reservations</div>
            </div>
            <DollarSign className="h-10 w-10 text-yellow-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-green-600 text-green-600 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "calendar" && (
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">Calendar</h2>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <CalendarDays className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Calendarს ვიზუალიზაცია</h3>
                <p className="text-gray-600 mb-4">აქ გამოჩნდება ინტერაქტიული Calendar ყველა ბრონირებით</p>
                <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <div key={i} className="text-xs font-semibold text-gray-500">{day}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "aspect-square rounded border text-sm flex items-center justify-center",
                        i % 7 === 5 || i % 7 === 6 ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300",
                        i >= 25 && i <= 28 ? "bg-green-100 border-green-300 font-semibold" : ""
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "bookings" && (
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">All Bookings</h2>
              <p className="text-sm text-gray-600">Total {totalBookings} active bookings</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>guests</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Nights</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                    <TableCell className="font-medium">{booking.guest}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.room}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{booking.checkIn}</TableCell>
                    <TableCell className="text-sm">{booking.checkOut}</TableCell>
                    <TableCell className="text-center">{booking.nights}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{booking.channel}</TableCell>
                    <TableCell className="text-right font-semibold">₾{booking.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === "crm" && (
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">Guest CRM</h2>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg border-2 border-dashed border-purple-300">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Guest Management</h3>
                <p className="text-purple-600 mb-4">Guest profiles, history and preferences will appear here</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-xl mx-auto mt-6">
                  <Card className="p-4 bg-white">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">156</div>
                    <div className="text-xs text-purple-600">Total guests</div>
                  </Card>
                  <Card className="p-4 bg-white">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">42</div>
                    <div className="text-xs text-purple-600">VIP guests</div>
                  </Card>
                  <Card className="p-4 bg-white">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">89%</div>
                    <div className="text-xs text-purple-600">Return Rate</div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "mail" && (
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4">📧 Email Integration</h2>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border-2 border-dashed border-blue-300">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Gmail Sync</h3>
                <p className="text-blue-600 mb-4">Automatic booking extraction from Booking.com, Airbnb and other channels</p>
                <Button className="mt-4">
                  <Mail className="h-4 w-4 mr-2" />
                  Connect Gmail
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "ai" && (
          <div>
            <AIChatBox
              messages={chatHistory}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
