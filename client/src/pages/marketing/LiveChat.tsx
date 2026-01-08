import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  RefreshCw,
  Bell,
  Globe
} from "lucide-react";

export default function LiveChat() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch chat data
  const { data: chats, isLoading: chatsLoading, refetch: refetchChats } = trpc.tawkto.getAll.useQuery({
    limit: 50,
    offset: 0,
    status: activeTab === "all" ? "all" : activeTab as "active" | "ended" | "missed"
  });
  
  const { data: stats, isLoading: statsLoading } = trpc.tawkto.getStats.useQuery();
  const { data: unreadChats } = trpc.tawkto.getUnread.useQuery();
  
  const markAsReadMutation = trpc.tawkto.markAsRead.useMutation({
    onSuccess: () => refetchChats()
  });

  const t = {
    title: language === "en" ? "Live Chat" : "ლაივ ჩატი",
    subtitle: language === "en" ? "Real-time visitor conversations" : "რეალურ დროში ვიზიტორების საუბრები",
    totalChats: language === "en" ? "Total Chats" : "სულ ჩატები",
    activeChats: language === "en" ? "Active" : "აქტიური",
    endedChats: language === "en" ? "Ended" : "დასრულებული",
    missedChats: language === "en" ? "Missed" : "გამოტოვებული",
    unreadChats: language === "en" ? "Unread" : "წაუკითხავი",
    todayChats: language === "en" ? "Today" : "დღეს",
    all: language === "en" ? "All" : "ყველა",
    active: language === "en" ? "Active" : "აქტიური",
    ended: language === "en" ? "Ended" : "დასრულებული",
    missed: language === "en" ? "Missed" : "გამოტოვებული",
    visitor: language === "en" ? "Visitor" : "ვიზიტორი",
    message: language === "en" ? "Message" : "შეტყობინება",
    time: language === "en" ? "Time" : "დრო",
    status: language === "en" ? "Status" : "სტატუსი",
    openInTawkto: language === "en" ? "Open in Tawk.to" : "გახსნა Tawk.to-ში",
    markAsRead: language === "en" ? "Mark as Read" : "წაკითხულად მონიშვნა",
    refresh: language === "en" ? "Refresh" : "განახლება",
    noChats: language === "en" ? "No chats yet" : "ჯერ ჩატები არ არის",
    waitingForWebhook: language === "en" ? "Waiting for Tawk.to webhook events..." : "ველოდებით Tawk.to webhook ივენთებს...",
    webhookConfigured: language === "en" ? "Webhook configured and ready" : "Webhook კონფიგურირებულია და მზადაა",
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString(language === "en" ? "en-US" : "ka-GE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">{t.active}</Badge>;
      case "ended":
        return <Badge variant="secondary">{t.ended}</Badge>;
      case "missed":
        return <Badge variant="destructive">{t.missed}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-cyan-400">Live Chat</span>
                <span className="text-white/80 ml-3">{t.title !== "Live Chat" ? t.title : ""}</span>
              </h1>
              <p className="text-white/60 mt-2">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500 text-green-400 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                {t.webhookConfigured}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchChats()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.refresh}
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={() => window.open("https://dashboard.tawk.to", "_blank")}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.openInTawkto}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.totalChats}</p>
                  <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.activeChats}</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.active || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.endedChats}</p>
                  <p className="text-2xl font-bold text-white">{stats?.ended || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.missedChats}</p>
                  <p className="text-2xl font-bold text-red-400">{stats?.missed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.unreadChats}</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.unread || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">{t.todayChats}</p>
                  <p className="text-2xl font-bold text-cyan-400">{stats?.todayCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chats List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                {language === "en" ? "Chat History" : "ჩატის ისტორია"}
              </CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-cyan-600">{t.all}</TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-green-600">{t.active}</TabsTrigger>
                  <TabsTrigger value="ended" className="data-[state=active]:bg-gray-600">{t.ended}</TabsTrigger>
                  <TabsTrigger value="missed" className="data-[state=active]:bg-red-600">{t.missed}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {chatsLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading...</p>
              </div>
            ) : chats && chats.length > 0 ? (
              <div className="space-y-3">
                {chats.map((chat: any) => (
                  <div 
                    key={chat.id}
                    className={`p-4 rounded-lg border transition-all ${
                      chat.isRead 
                        ? "bg-white/5 border-white/10" 
                        : "bg-cyan-500/10 border-cyan-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {chat.visitorName?.[0]?.toUpperCase() || "V"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {chat.visitorName || "Visitor"}
                            </span>
                            {getStatusBadge(chat.status)}
                            {!chat.isRead && (
                              <Badge className="bg-cyan-500 text-xs">New</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                            {chat.visitorEmail && (
                              <span>{chat.visitorEmail}</span>
                            )}
                            {chat.visitorCountry && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {chat.visitorCity ? `${chat.visitorCity}, ` : ""}{chat.visitorCountry}
                              </span>
                            )}
                          </div>
                          {chat.message && (
                            <p className="text-white/80 mt-2 text-sm bg-white/5 p-2 rounded">
                              {chat.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-sm">{formatDate(chat.createdAt)}</p>
                        <div className="flex gap-2 mt-2">
                          {!chat.isRead && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsReadMutation.mutate({ id: chat.id })}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t.markAsRead}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">{t.noChats}</p>
                <p className="text-white/40 text-sm mt-2">{t.waitingForWebhook}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
