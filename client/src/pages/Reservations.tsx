import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, Users, Mail, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
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
        <TabsList className="grid w-full grid-cols-5 mb-6">
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
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            🤖 AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reservations;
