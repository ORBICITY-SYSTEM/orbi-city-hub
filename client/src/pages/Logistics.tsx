import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Sparkles, Wrench, ShoppingCart, Users, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { LogisticsHousekeeping } from "@/components/LogisticsHousekeeping";

const Logistics = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    const newMessage = { role: "user" as const, content };
    setChatHistory(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        module: "Logistics",
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
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              ლოგისტიკა
            </h1>
            <p className="text-sm text-muted-foreground">
              ინვენტარი, დასუფთავება და ტექნიკური მოვლა
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Modules Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            ინვენტარი
          </TabsTrigger>
          <TabsTrigger value="housekeeping" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            დასუფთავება
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            ტექნიკური
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            მარაგები
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            პერსონალი
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            🤖 AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>ინვენტარის მართვა</CardTitle>
              <CardDescription>მარაგების თვალყურის დევნება და მართვა</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება ინვენტარის სრული სისტემა - ყველა 60 სტუდიოს ინვენტარი, დაბალი მარაგის შეტყობინებები, და ავტომატური შეკვეთები.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housekeeping">
          <LogisticsHousekeeping />
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>ტექნიკური მოვლა</CardTitle>
              <CardDescription>რემონტისა და მოვლის თვალყურის დევნება</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება ტექნიკური მოვლის სისტემა - პრობლემების რეგისტრაცია, რემონტის გრაფიკები, და ხარჯების აღრიცხვა.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplies">
          <Card>
            <CardHeader>
              <CardTitle>მარაგების მართვა</CardTitle>
              <CardDescription>მარაგების შეკვეთა და მართვა</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება მარაგების სისტემა - ავტომატური შეკვეთები, მომწოდებლების მართვა, და ხარჯების ოპტიმიზაცია.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>პერსონალის მართვა</CardTitle>
              <CardDescription>პერსონალის გრაფიკი და დავალებები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება პერსონალის სისტემა - სამუშაო გრაფიკები, დავალებების განაწილება, და შესრულების თვალყურის დევნება.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                🤖 Logistics AI Agent
              </CardTitle>
              <CardDescription>
                AI აგენტი მარაგების ანალიზისთვის ფოტოებიდან/სიებიდან და ავტომატური შეკვეთების რეკომენდაციებისთვის
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Section */}
              <FileUpload
                module="logistics"
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
                placeholder="მაგ: 'რა მარაგები არის დაბალი დონეზე?' ან 'გააანალიზე ეს ინვენტარის ფოტო'"
                height={400}
              />

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendMessage("რა მარაგები არის დაბალი დონეზე?")}
                >
                  დაბალი მარაგები
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSendMessage("რა უნდა შევუკვეთო ამ კვირაში?")}
                >
                  შეკვეთის რეკომენდაცია
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Logistics;
