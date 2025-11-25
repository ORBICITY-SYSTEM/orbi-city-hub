import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, TrendingUp, Users, FileText, Bot, BarChart3 } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FinanceDashboardContent } from "@/components/FinanceDashboardContent";
import { FinanceTransactions } from "@/components/FinanceTransactions";
import { FinancePL } from "@/components/FinancePL";
import { FinanceInvoices } from "@/components/FinanceInvoices";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    const newMessage = { role: "user" as const, content };
    setChatHistory(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        module: "Finance",
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
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Finance</h1>
            <p className="text-sm text-muted-foreground">Financial management and reporting</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="transactions"><Receipt className="h-4 w-4 mr-2" />ტრანზაქციები</TabsTrigger>
          <TabsTrigger value="pl"><TrendingUp className="h-4 w-4 mr-2" />P&L</TabsTrigger>
          <TabsTrigger value="settlements"><Users className="h-4 w-4 mr-2" />ანგარიშსწორება</TabsTrigger>
          <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-2" />ინვოისები</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />🤖 AI</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinanceDashboardContent />
        </TabsContent>

        <TabsContent value="transactions">
          <FinanceTransactions />
        </TabsContent>

        <TabsContent value="pl">
          <FinancePL />
        </TabsContent>

        <TabsContent value="settlements">
          <Card><CardHeader><CardTitle>მესაკუთრეების ანგარიშსწორება</CardTitle><CardDescription>მოგების გაყოფის კალკულატორი და რეპორტები</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება ანგარიშსწორების სისტემა - 80/20 მოგების გაყოფა, ავტომატური რეპორტები, და გადახდების თვალყურის დევნება.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="invoices">
          <FinanceInvoices />
        </TabsContent>

        <TabsContent value="ai">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-purple-500" />🤖 Finance AI Agent</CardTitle>
          <CardDescription>AI აგენტი Excel რეპორტების ანალიზისთვის</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              module="finance"
              onUploadSuccess={(url, fileName) => {
                // Send uploaded file info to AI for analysis
                handleSendMessage(`გააანალიზე ეს ფაილი: ${fileName} (${url})`);
              }}
            />
            <AIChatBox messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="მაგ: 'რა არის ჩვენი უდიდესი ხარჯი?' ან 'გააანალიზე ეს P&L რეპორტი'" height={400} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("რა არის ჩვენი უდიდესი ხარჯი?")}>უდიდესი ხარჯი</Button>
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("როგორ ავამაღლო მოგება?")}>მოგების ოპტიმიზაცია</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
