import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, List, Users, Mail, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { BookingsTable } from "@/components/BookingsTable";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const Reservations = () => {
  const [activeTab, setActiveTab] = useState("calendar");
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

  const tabs = [
    { id: "calendar", label: "კალენდარი", icon: CalendarDays },
    { id: "bookings", label: "ბრონირებები", icon: List },
    { id: "crm", label: "CRM", icon: Users },
    { id: "mail", label: "📧 ელფოსტა", icon: Mail },
    { id: "ai", label: "🤖 AI", icon: Bot },
  ];

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

      {/* Custom Tabs */}
      <div className="w-full">
        {/* Tab List */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 gap-2",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "calendar" && (
            <Card>
              <CardHeader>
                <CardTitle>კალენდარის ხედი</CardTitle>
                <CardDescription>Gantt-chart სტილის ვიზუალური ბრონირების კალენდარი</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  აქ იქნება ვიზუალური კალენდარი - ყველა 60 სტუდიოს ბრონირებები Gantt-chart ფორმატში, drag-and-drop ფუნქციით.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "bookings" && <BookingsTable />}

          {activeTab === "crm" && (
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
          )}

          {activeTab === "mail" && (
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
          )}

          {activeTab === "ai" && (
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
                <FileUpload
                  module="reservations"
                  onUploadSuccess={(url, fileName) => {
                    // Send uploaded file info to AI for analysis
                    handleSendMessage(`გააანალიზე ეს ფაილი: ${fileName} (${url})`);
                  }}
                />

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
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
