import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Star, Send, Instagram, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const Marketing = () => {
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    const newMessage = { role: "user" as const, content };
    setChatHistory(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        module: "Marketing",
        userMessage: content,
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">მარკეტინგი</h1>
            <p className="text-sm text-muted-foreground">მარკეტინგული კამპანიები და არხების შესრულება</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="channels"><BarChart3 className="h-4 w-4 mr-2" />არხები</TabsTrigger>
          <TabsTrigger value="reputation"><Star className="h-4 w-4 mr-2" />რეპუტაცია</TabsTrigger>
          <TabsTrigger value="campaigns"><Send className="h-4 w-4 mr-2" />კამპანიები</TabsTrigger>
          <TabsTrigger value="social"><Instagram className="h-4 w-4 mr-2" />სოც. მედია</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />🤖 AI</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Card><CardHeader><CardTitle>არხების შესრულება</CardTitle><CardDescription>ანალიტიკა რომელი OTA მეტ შემოსავალს იძლევა</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება არხების ანალიზი - Booking.com vs Airbnb vs Expedia შემოსავლები, კონვერსია, და ROI.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="reputation">
          <Card><CardHeader><CardTitle>რეპუტაციის მენეჯერი</CardTitle><CardDescription>სტუმრების რევიუების წაკითხვა და პასუხი</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება რევიუების სისტემა - ყველა OTA-დან რევიუების აგრეგაცია, sentiment ანალიზი, და ავტომატური პასუხები.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card><CardHeader><CardTitle>კამპანიების შემქმნელი</CardTitle><CardDescription>ელფოსტა/SMS კამპანიების შედგენა</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება კამპანიების სისტემა - email/SMS blasts, segmentation, A/B testing, და analytics.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="social">
          <Card><CardHeader><CardTitle>სოციალური მედია პლანერი</CardTitle><CardDescription>Instagram/TikTok პოსტების კალენდარი</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება სოციალური მედიის სისტემა - პოსტების დაგეგმვა, კონტენტის ბიბლიოთეკა, და engagement analytics.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-purple-500" />🤖 Marketing AI Agent</CardTitle>
          <CardDescription>AI აგენტი კრეატიული ტექსტებისა და პოსტების შესაქმნელად</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">ატვირთეთ რევიუები ან analytics რეპორტები ანალიზისთვის</p>
              <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />აირჩიეთ ფაილები</Button>
            </div>
            <AIChatBox messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="მაგ: 'დაწერე Instagram პოსტი' ან 'გააანალიზე რევიუების sentiment'" height={400} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("დაწერე Instagram პოსტი ზაფხულის სეზონისთვის")}>Instagram პოსტი</Button>
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("გააანალიზე რევიუების sentiment")}>Sentiment ანალიზი</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing;
