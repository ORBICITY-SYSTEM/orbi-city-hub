import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, Users, Mail, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import VisualCalendar from "@/components/VisualCalendar";
import PlotlyGanttChart, { type GanttReservation } from "@/components/PlotlyGanttChart";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const Reservations = () => {
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              ბრონირებები
            </h1>
            <p className="text-sm text-muted-foreground">
              ბრონირების მართვა და სტუმრების სერვისი
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Modules Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            კალენდარი
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            ბრონირებები
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            📧 ელფოსტა
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            📊 Timeline
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            🤖 AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <VisualCalendar 
            bookings={[
              // Sample data - in production, fetch from trpc.modules.getData
              {
                id: 1,
                roomNumber: "505",
                guestName: "John Smith",
                checkIn: new Date(2025, 10, 20),
                checkOut: new Date(2025, 10, 25),
                status: "confirmed",
                channel: "Booking.com"
              },
              {
                id: 2,
                roomNumber: "510",
                guestName: "Maria Garcia",
                checkIn: new Date(2025, 10, 22),
                checkOut: new Date(2025, 10, 28),
                status: "checked-in",
                channel: "Airbnb"
              },
              {
                id: 3,
                roomNumber: "515",
                guestName: "David Lee",
                checkIn: new Date(2025, 10, 18),
                checkOut: new Date(2025, 10, 24),
                status: "checked-in",
                channel: "Direct"
              },
            ]}
            totalRooms={60}
            startRoomNumber={501}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>ყველა ბრონირება</CardTitle>
              <CardDescription>ძიებადი ცხრილი ყველა ბრონირებისთვის</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება ბრონირებების სრული ცხრილი - ძიება, ფილტრაცია, სორტირება, და ექსპორტი Excel/CSV ფორმატში.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card>
            <CardHeader>
              <CardTitle>სტუმრების CRM</CardTitle>
              <CardDescription>სტუმრების პროფილები, ისტორია და პრეფერენციები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება სტუმრების მონაცემთა ბაზა - სრული პროფილები, ბრონირებების ისტორია, პრეფერენციები, და ლოიალობის პროგრამა.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>📧 ელფოსტის ოთახი</CardTitle>
              <CardDescription>Gmail სინქრონიზაცია და OTA ბრონირებების პარსერი</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება Gmail ინტეგრაცია - ავტომატური ბრონირებების პარსინგი Booking.com, Airbnb, Expedia-დან, და სტუმრებთან კომუნიკაცია.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt">
          <Card>
            <CardHeader>
              <CardTitle>Room Occupancy Timeline (Gantt Chart)</CardTitle>
              <CardDescription>
                Visual timeline showing room bookings with color-coded status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlotlyGanttChart
                reservations={[
                  {
                    id: 1,
                    roomNumber: "505",
                    guestName: "John Smith",
                    checkIn: new Date(2025, 10, 20),
                    checkOut: new Date(2025, 10, 25),
                    status: "confirmed",
                    price: 450,
                    source: "Booking.com",
                  },
                  {
                    id: 2,
                    roomNumber: "510",
                    guestName: "Maria Garcia",
                    checkIn: new Date(2025, 10, 22),
                    checkOut: new Date(2025, 10, 28),
                    status: "confirmed",
                    price: 600,
                    source: "Airbnb",
                  },
                  {
                    id: 3,
                    roomNumber: "515",
                    guestName: "David Lee",
                    checkIn: new Date(2025, 10, 18),
                    checkOut: new Date(2025, 10, 23),
                    status: "checked_out",
                    price: 500,
                    source: "Direct",
                  },
                  {
                    id: 4,
                    roomNumber: "520",
                    guestName: "Sarah Johnson",
                    checkIn: new Date(2025, 10, 25),
                    checkOut: new Date(2025, 10, 30),
                    status: "pending",
                    price: 550,
                    source: "Booking.com",
                  },
                  {
                    id: 5,
                    roomNumber: "505",
                    guestName: "Michael Brown",
                    checkIn: new Date(2025, 10, 26),
                    checkOut: new Date(2025, 11, 2),
                    status: "confirmed",
                    price: 700,
                    source: "Airbnb",
                  },
                ] as GanttReservation[]}
              />
              
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold mb-2">Legend:</h3>
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-sm">Checked Out</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                🤖 Reservations AI Agent
              </CardTitle>
              <CardDescription>
                AI აგენტი ელფოსტების შედგენა, ტენდენციების ანალიზი, ვაუჩერების პარსინგი
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  ატვირთეთ ვაუჩერები, ბრონირების ფაილები, ან Excel რეპორტები ანალიზისთვის
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  აირჩიეთ ფაილები
                </Button>
              </div>

              {/* AI Chat Interface */}
              <AIChatBox
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="მაგ: 'დაწერე პასუხი ამ სტუმარს' ან 'რა ტენდენციებია ბრონირებებში?'"
                height={400}
              />

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendMessage("რა არის ბრონირებების ტენდენცია ამ თვეში?")}
                >
                  ტენდენციების ანალიზი
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendMessage("დაწერე პროფესიონალური პასუხი სტუმარს")}
                >
                  ელფოსტის შაბლონი
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reservations;
