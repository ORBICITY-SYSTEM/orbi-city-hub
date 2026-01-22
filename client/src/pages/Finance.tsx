import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, TrendingUp, Users, FileText, Bot, BarChart3, Brain } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FinanceDashboardContent } from "@/components/FinanceDashboardContent";
import { FinanceTransactions } from "@/components/FinanceTransactions";
import { FinancePL } from "@/components/FinancePL";
import { FinanceInvoices } from "@/components/FinanceInvoices";
import { FinanceCopilotWidget } from "@/components/finance-copilot";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Finance</h1>
            <p className="text-sm text-muted-foreground">Financial management and reporting</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="transactions"><Receipt className="h-4 w-4 mr-2" />transactions</TabsTrigger>
          <TabsTrigger value="pl"><TrendingUp className="h-4 w-4 mr-2" />P&L</TabsTrigger>
          <TabsTrigger value="settlements"><Users className="h-4 w-4 mr-2" />Settlements</TabsTrigger>
          <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-2" />Invoices</TabsTrigger>
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
          <Card><CardHeader><CardTitle>მესაკუთრეების Settlements</CardTitle><CardDescription>Profit sharing calculator and reports</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">Settlement system will be here - 80/20 profit split, automatic reports, and payment tracking.</p></CardContent></Card>
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
                handleSendMessage(`Analyze this file: ${fileName} (${url})`);
              }}
            />
            <AIChatBox messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="e.g. 'What is our biggest expense?' or 'Analyze this P&L report'" height={400} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("რა არის ჩვენი Biggest Expense?")}>Biggest Expense</Button>
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("How to increase profit?")}>Profit Optimization</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Finance Copilot Floating Button */}
      {!isCopilotOpen && (
        <Button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 z-40"
          size="icon"
        >
          <Brain className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Finance Copilot Widget */}
      <FinanceCopilotWidget
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        defaultLanguage="ka"
      />
    </div>
  );
};

export default Finance;
