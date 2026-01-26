import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Globe, Users, Mail, Bot, Brain } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MarketingDashboard } from "@/components/MarketingDashboard";
import ChannelsGrid from "@/components/ChannelsGrid";
import { CHANNELS, COMING_SOON_CHANNELS } from "@/../../shared/channelsData";
import GoogleModule from "@/pages/marketing/GoogleModule";
import SocialMediaModule from "@/pages/marketing/SocialMediaModule";
import OthersModule from "@/pages/marketing/OthersModule";
import { AIAgentsPanel } from "@/components/ai-agents/AIAgentsPanel";

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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ota">
            <Globe className="h-4 w-4 mr-2" />
            OTA Channels
          </TabsTrigger>
          <TabsTrigger value="google">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </TabsTrigger>
          <TabsTrigger value="social">
            <Users className="h-4 w-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="others">
            <Mail className="h-4 w-4 mr-2" />
            Others
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4 mr-2" />
            AI Agents
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <MarketingDashboard />
        </TabsContent>

        {/* OTA Channels Tab */}
        <TabsContent value="ota">
          <ChannelsGrid channels={CHANNELS} comingSoonChannels={COMING_SOON_CHANNELS} />
        </TabsContent>

        {/* Google Tab */}
        <TabsContent value="google">
          <GoogleModule />
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <SocialMediaModule />
        </TabsContent>

        {/* Others Tab (Email, SMS, Referral) */}
        <TabsContent value="others">
          <OthersModule />
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="ai">
          <AIAgentsPanel module="marketing" defaultLanguage="ka" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing;
