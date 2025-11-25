import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Activity, Download, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const Reports = () => {
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    const newMessage = { role: "user" as const, content };
    setChatHistory(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        module: "Reports & Analytics",
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">რეპორტები და ანალიტიკა</h1>
            <p className="text-sm text-muted-foreground">ბიზნეს ინტელექტი და მონაცემთა ანალიტიკა</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="monthly"><FileText className="h-4 w-4 mr-2" />თვიური</TabsTrigger>
          <TabsTrigger value="yearly"><TrendingUp className="h-4 w-4 mr-2" />წლიური</TabsTrigger>
          <TabsTrigger value="heatmap"><Activity className="h-4 w-4 mr-2" />Heatmap</TabsTrigger>
          <TabsTrigger value="export"><Download className="h-4 w-4 mr-2" />ექსპორტი</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />🤖 AI</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card><CardHeader><CardTitle>თვიური მიმოხილვა</CardTitle><CardDescription>მაღალი დონის PDF რეპორტი CEO-სთვის</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება თვიური რეპორტები - ავტომატური PDF გენერაცია ყველა KPI-თი, ტენდენციებით, და რეკომენდაციებით.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="yearly">
          <Card><CardHeader><CardTitle>წლიური ზრდა</CardTitle><CardDescription>წლიური შედარების დიაგრამები</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება წლიური ანალიზი - Year-over-Year შედარება, ზრდის ტენდენციები, და პროგნოზები.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card><CardHeader><CardTitle>დაკავების თერმული რუკა</CardTitle><CardDescription>პიკური თარიღების და დაბალი სეზონის ვიზუალიზაცია</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება occupancy heatmap - ვიზუალური კალენდარი პიკური და დაბალი სეზონების იდენტიფიკაციისთვის.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="export">
          <Card><CardHeader><CardTitle>ექსპორტის ცენტრი</CardTitle><CardDescription>ყველა მონაცემის ჩამოტვირთვა (CSV/Excel)</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება ექსპორტის სისტემა - ყველა მონაცემის ჩამოტვირთვა CSV/Excel ფორმატში ანალიზისთვის.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-purple-500" />🤖 Data Scientist AI Agent</CardTitle>
          <CardDescription>AI აგენტი დამალული პატერნების საპოვნელად</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              module="reports"
              onUploadSuccess={(url, fileName) => {
                handleSendMessage(`გააანალიზე ეს ფაილი: ${fileName} (${url})`);
              }}
            />
            <AIChatBox messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="მაგ: 'იპოვე დამალული პატერნები' ან 'პროგნოზი შემდეგი თვისთვის'" height={400} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("იპოვე დამალული პატერნები ბრონირებებში")}>პატერნების ძიება</Button>
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("პროგნოზი შემდეგი 3 თვისთვის")}>პროგნოზი</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
