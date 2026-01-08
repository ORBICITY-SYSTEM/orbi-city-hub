/**
 * Guest Communications Hub
 * Unified communication center with Live Chat (Tawk.to), Tickets, and Email tabs
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Bell,
  Globe,
  Mail,
  Ticket,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Inbox,
  Send,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GuestCommunications() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("live-chat");
  const [chatFilter, setChatFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Tawk.to chat data
  const {
    data: chats,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = trpc.tawkto.getAll.useQuery({
    limit: 50,
    offset: 0,
    status: chatFilter === "all" ? "all" : (chatFilter as "active" | "ended" | "missed"),
  });

  const { data: stats, isLoading: statsLoading } = trpc.tawkto.getStats.useQuery();
  const { data: unreadChats } = trpc.tawkto.getUnread.useQuery();

  // Fetch Tawk.to tickets
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = trpc.tawkto.getTickets.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: ticketStats } = trpc.tawkto.getTicketStats.useQuery();

  const markAsReadMutation = trpc.tawkto.markAsRead.useMutation({
    onSuccess: () => refetchChats(),
  });

  // Translations
  const t = {
    title: language === "en" ? "Guest Communications" : "სტუმრებთან კომუნიკაცია",
    subtitle:
      language === "en"
        ? "Live chat, tickets, and email management"
        : "ლაივ ჩატი, ტიკეტები და ელ-ფოსტის მართვა",
    liveChat: language === "en" ? "Live Chat" : "ლაივ ჩატი",
    tickets: language === "en" ? "Tickets" : "ტიკეტები",
    email: language === "en" ? "Email" : "ელ-ფოსტა",
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
    webhookConfigured:
      language === "en" ? "Webhook configured" : "Webhook კონფიგურირებულია",
    search: language === "en" ? "Search..." : "ძებნა...",
    filterBy: language === "en" ? "Filter by" : "ფილტრი",
    noTickets: language === "en" ? "No tickets yet" : "ჯერ ტიკეტები არ არის",
    ticketsComingSoon:
      language === "en"
        ? "Ticket management coming soon"
        : "ტიკეტების მართვა მალე",
    emailIntegration:
      language === "en"
        ? "Email integration via Gmail"
        : "ელ-ფოსტის ინტეგრაცია Gmail-ით",
    goToEmailInbox:
      language === "en" ? "Go to Email Inbox" : "ელ-ფოსტის გახსნა",
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString(language === "en" ? "en-US" : "ka-GE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  // Filter chats based on search query
  const filteredChats = chats?.filter((chat: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.visitorName?.toLowerCase().includes(query) ||
      chat.visitorEmail?.toLowerCase().includes(query) ||
      chat.message?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-cyan-400">Guest Communications</span>
                <span className="text-white/80 ml-3">
                  {t.title !== "Guest Communications" ? t.title : ""}
                </span>
              </h1>
              <p className="text-white/60 mt-2">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-green-500 text-green-400 px-3 py-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                {t.webhookConfigured}
              </Badge>
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
        {/* Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[30px]"
            style={{ transform: "rotate(180deg)" }}
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              className="fill-slate-900/80"
              opacity=".25"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              className="fill-slate-900/60"
              opacity=".5"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-slate-900"
            />
          </svg>
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
                  <p className="text-2xl font-bold text-white">
                    {statsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      stats?.total || 0
                    )}
                  </p>
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
                  <p className="text-2xl font-bold text-green-400">
                    {stats?.active || 0}
                  </p>
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
                  <p className="text-2xl font-bold text-white">
                    {stats?.ended || 0}
                  </p>
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
                  <p className="text-2xl font-bold text-red-400">
                    {stats?.missed || 0}
                  </p>
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
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats?.unread || 0}
                  </p>
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
                  <p className="text-2xl font-bold text-cyan-400">
                    {stats?.todayCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/10">
            <TabsTrigger
              value="live-chat"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.liveChat}
              {(stats?.unread || 0) > 0 && (
                <Badge className="ml-2 bg-red-500 text-xs">
                  {stats?.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Ticket className="w-4 h-4 mr-2" />
              {t.tickets}
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t.email}
            </TabsTrigger>
          </TabsList>

          {/* Live Chat Tab */}
          <TabsContent value="live-chat">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                    {language === "en" ? "Chat History" : "ჩატის ისტორია"}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        type="text"
                        placeholder={t.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 w-64"
                      />
                    </div>
                    {/* Filter */}
                    <Select value={chatFilter} onValueChange={setChatFilter}>
                      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder={t.filterBy} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.all}</SelectItem>
                        <SelectItem value="active">{t.active}</SelectItem>
                        <SelectItem value="ended">{t.ended}</SelectItem>
                        <SelectItem value="missed">{t.missed}</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Refresh */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchChats()}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t.refresh}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chatsLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading...</p>
                  </div>
                ) : filteredChats && filteredChats.length > 0 ? (
                  <div className="space-y-3">
                    {filteredChats.map((chat: any) => (
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
                                    {chat.visitorCountry}
                                  </span>
                                )}
                              </div>
                              {chat.message && (
                                <p className="text-white/80 mt-2 text-sm line-clamp-2">
                                  {chat.message}
                                </p>
                              )}
                              <p className="text-white/40 text-xs mt-2">
                                {formatDate(chat.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!chat.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  markAsReadMutation.mutate({ id: chat.id })
                                }
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-2">{t.noChats}</p>
                    <p className="text-white/40 text-sm">
                      {language === "en"
                        ? "Chats will appear here when visitors message via Tawk.to"
                        : "ჩატები გამოჩნდება, როცა ვიზიტორები დაწერენ Tawk.to-ით"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-cyan-400" />
                    {language === "en" ? "Support Tickets" : "მხარდაჭერის ტიკეტები"}
                    {ticketStats && ticketStats.total > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {ticketStats.total}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchTickets()}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t.refresh}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open("https://dashboard.tawk.to/tickets", "_blank")
                      }
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Tawk.to
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading...</p>
                  </div>
                ) : tickets && tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket: any) => (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-lg border bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                              <Ticket className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                  {ticket.visitorName || "Visitor"}
                                </span>
                                {getStatusBadge(ticket.status)}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                                {ticket.visitorEmail && (
                                  <span>{ticket.visitorEmail}</span>
                                )}
                              </div>
                              {ticket.message && (
                                <p className="text-white/80 mt-2 text-sm line-clamp-2">
                                  {ticket.message}
                                </p>
                              )}
                              <p className="text-white/40 text-xs mt-2">
                                {formatDate(ticket.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-2">{t.noTickets}</p>
                    <p className="text-white/40 text-sm mb-6">
                      {language === "en"
                        ? "Tickets from Tawk.to will appear here when visitors submit support requests"
                        : "ტიკეტები გამოჩნდება, როცა ვიზიტორები გამოგზავნიან მხარდაჭერის მოთხოვნებს"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open("https://dashboard.tawk.to/tickets", "_blank")
                      }
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {language === "en"
                        ? "View Tickets in Tawk.to"
                        : "ტიკეტების ნახვა Tawk.to-ში"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  {language === "en" ? "Email Management" : "ელ-ფოსტის მართვა"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">{t.emailIntegration}</p>
                  <p className="text-white/40 text-sm mb-6">
                    {language === "en"
                      ? "AI-powered email categorization and management"
                      : "AI-ით მართული ელ-ფოსტის კატეგორიზაცია"}
                  </p>
                  <Button
                    variant="default"
                    onClick={() => (window.location.href = "/email-management")}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Inbox className="w-4 h-4 mr-2" />
                    {t.goToEmailInbox}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
