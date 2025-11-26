import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Star, Send, Instagram, Bot } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MarketingDashboard } from "@/components/MarketingDashboard";
import ChannelsGrid from "@/components/ChannelsGrid";
import ChannelComparison from "@/components/ChannelComparison";
import { CHANNELS, COMING_SOON_CHANNELS } from "@/../../shared/channelsData";

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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Marketing</h1>
            <p className="text-sm text-muted-foreground">Marketing campaigns and channel performance</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="channels"><BarChart3 className="h-4 w-4 mr-2" />Channels</TabsTrigger>
          <TabsTrigger value="comparison"><BarChart3 className="h-4 w-4 mr-2" />Comparison</TabsTrigger>
          <TabsTrigger value="reputation"><Star className="h-4 w-4 mr-2" />Reputation</TabsTrigger>
          <TabsTrigger value="campaigns"><Send className="h-4 w-4 mr-2" />Campaigns</TabsTrigger>
          <TabsTrigger value="social"><Instagram className="h-4 w-4 mr-2" />Social Media</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />🤖 AI</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <MarketingDashboard />
        </TabsContent>

        <TabsContent value="channels">
          <ChannelsGrid channels={CHANNELS} comingSoonChannels={COMING_SOON_CHANNELS} />
        </TabsContent>

        <TabsContent value="comparison">
          <ChannelComparison channels={CHANNELS} />
        </TabsContent>

        <TabsContent value="reputation">
          <Card><CardHeader><CardTitle>Reputation Manager</CardTitle><CardDescription>Read and respond to guest reviews</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">Review system will be here - review aggregation from all OTAs, sentiment analysis, and automatic responses.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card><CardHeader><CardTitle>Campaignsს შემქმნელი</CardTitle><CardDescription>Email/SMS Campaignsს შედგენა</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">აქ იქნება Campaignsს სისტემა - email/SMS blasts, segmentation, A/B testing, და analytics.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="social">
          <Card><CardHeader><CardTitle>Social Media Planner</CardTitle><CardDescription>Instagram/TikTok პოსტების Calendar</CardDescription></CardHeader>
          <CardContent><p className="text-muted-foreground">Social media system will be here - post scheduling, content library, and engagement analytics.</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-purple-500" />🤖 Marketing AI Agent</CardTitle>
          <CardDescription>AI აგენტი კრეატიული ტექსტებისა და პოსტების შესაქმნელად</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              module="marketing"
              onUploadSuccess={(url, fileName) => {
                handleSendMessage(`Analyze this file: ${fileName} (${url})`);
              }}
            />
            <AIChatBox messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isLoading} placeholder="მაგ: 'Write Instagram post' ან 'Analyze review sentiment'" height={400} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("Write Instagram post ზაფხულის სეზონისთვის")}>Instagram პოსტი</Button>
              <Button variant="outline" size="sm" onClick={() => handleSendMessage("Analyze review sentiment")}>Sentiment Analysis</Button>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing;
