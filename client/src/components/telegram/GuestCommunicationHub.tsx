/**
 * Guest Communication Hub - Telegram Bot Integration
 * Allows managing guest communications via Telegram
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageSquare,
  Bot,
  Users,
  Bell,
  Calendar,
  Star,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  id: string;
  chatId: number;
  fromUsername?: string;
  fromFirstName?: string;
  text: string;
  date: string;
  type: "incoming" | "outgoing";
}

export function GuestCommunicationHub() {
  const { language } = useLanguage();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [customChatId, setCustomChatId] = useState("");

  // Fetch bot info
  const { data: botInfo, isLoading: botLoading, refetch: refetchBot } = trpc.telegram.getBotInfo.useQuery();

  // Fetch recent messages
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = trpc.telegram.getUpdates.useQuery({
    limit: 50,
  });

  // Send message mutation
  const sendMessageMutation = trpc.telegram.sendMessage.useMutation({
    onSuccess: () => {
      toast.success(language === "ka" ? "შეტყობინება გაიგზავნა!" : "Message sent!");
      setMessageText("");
      refetchMessages();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Send booking confirmation mutation
  const sendBookingMutation = trpc.telegram.sendBookingConfirmation.useMutation({
    onSuccess: () => {
      toast.success(language === "ka" ? "დადასტურება გაიგზავნა!" : "Confirmation sent!");
    },
  });

  // Send check-in reminder mutation
  const sendReminderMutation = trpc.telegram.sendCheckInReminder.useMutation({
    onSuccess: () => {
      toast.success(language === "ka" ? "შეხსენება გაიგზავნა!" : "Reminder sent!");
    },
  });

  // Send review request mutation
  const sendReviewMutation = trpc.telegram.sendReviewRequest.useMutation({
    onSuccess: () => {
      toast.success(language === "ka" ? "მოთხოვნა გაიგზავნა!" : "Review request sent!");
    },
  });

  const handleSendMessage = () => {
    const chatId = selectedChat || parseInt(customChatId);
    if (!chatId || !messageText.trim()) return;

    sendMessageMutation.mutate({
      chatId,
      text: messageText,
      parseMode: "HTML",
    });
  };

  // Group messages by chat
  const chatGroups = (messagesData?.messages || []).reduce((acc, msg) => {
    if (!acc[msg.chatId]) {
      acc[msg.chatId] = {
        chatId: msg.chatId,
        chatTitle: msg.chatTitle || msg.fromFirstName || `Chat ${msg.chatId}`,
        messages: [],
      };
    }
    acc[msg.chatId].messages.push(msg);
    return acc;
  }, {} as Record<number, { chatId: number; chatTitle: string; messages: typeof messagesData.messages }>);

  const t = {
    title: language === "ka" ? "სტუმრებთან კომუნიკაცია" : "Guest Communication",
    subtitle: language === "ka" ? "Telegram ბოტით კომუნიკაცია" : "Communicate via Telegram Bot",
    botStatus: language === "ka" ? "ბოტის სტატუსი" : "Bot Status",
    connected: language === "ka" ? "დაკავშირებულია" : "Connected",
    disconnected: language === "ka" ? "გაწყვეტილია" : "Disconnected",
    messages: language === "ka" ? "შეტყობინებები" : "Messages",
    templates: language === "ka" ? "შაბლონები" : "Templates",
    send: language === "ka" ? "გაგზავნა" : "Send",
    refresh: language === "ka" ? "განახლება" : "Refresh",
    noMessages: language === "ka" ? "შეტყობინებები არ არის" : "No messages yet",
    typeMessage: language === "ka" ? "დაწერეთ შეტყობინება..." : "Type a message...",
    chatId: language === "ka" ? "ჩატის ID" : "Chat ID",
    bookingConfirmation: language === "ka" ? "ჯავშნის დადასტურება" : "Booking Confirmation",
    checkInReminder: language === "ka" ? "ჩექინის შეხსენება" : "Check-in Reminder",
    reviewRequest: language === "ka" ? "მიმოხილვის მოთხოვნა" : "Review Request",
    customMessage: language === "ka" ? "ინდივიდუალური შეტყობინება" : "Custom Message",
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white">{t.title}</CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {botInfo ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                @{botInfo.username}
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t.disconnected}
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                refetchBot();
                refetchMessages();
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="messages" className="data-[state=active]:bg-slate-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t.messages}
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
              <Bell className="w-4 h-4 mr-2" />
              {t.templates}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chat List */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-slate-300">
                      <Users className="w-4 h-4 inline mr-2" />
                      {language === "ka" ? "ჩატები" : "Chats"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ScrollArea className="h-[300px]">
                      {Object.values(chatGroups).length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">{t.noMessages}</p>
                      ) : (
                        Object.values(chatGroups).map((chat) => (
                          <div
                            key={chat.chatId}
                            className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                              selectedChat === chat.chatId
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : "bg-slate-700/50 hover:bg-slate-700"
                            }`}
                            onClick={() => setSelectedChat(chat.chatId)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white text-sm">{chat.chatTitle}</span>
                              <Badge variant="secondary" className="text-xs">
                                {chat.messages.length}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-1">
                              {chat.messages[0]?.text || "..."}
                            </p>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Message Area */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <ScrollArea className="h-[200px] mb-4">
                      {selectedChat && chatGroups[selectedChat] ? (
                        chatGroups[selectedChat].messages.map((msg, idx) => (
                          <div key={idx} className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-400">
                                {msg.fromUsername || msg.fromFirstName || "User"}
                              </span>
                              <span className="text-xs text-slate-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(msg.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 bg-slate-700/50 rounded-lg p-2">
                              {msg.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                          {language === "ka" ? "აირჩიეთ ჩატი" : "Select a chat"}
                        </div>
                      )}
                    </ScrollArea>

                    <div className="flex gap-2">
                      {!selectedChat && (
                        <Input
                          placeholder={t.chatId}
                          value={customChatId}
                          onChange={(e) => setCustomChatId(e.target.value)}
                          className="w-32 bg-slate-700 border-slate-600"
                        />
                      )}
                      <Input
                        placeholder={t.typeMessage}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 bg-slate-700 border-slate-600"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending || (!selectedChat && !customChatId)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Booking Confirmation Template */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    {t.bookingConfirmation}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-slate-400 mb-3">
                    <p>🏨 <b>Booking Confirmation</b></p>
                    <p>📍 Property: Studio Name</p>
                    <p>📅 Check-in/out dates</p>
                    <p>🔑 Confirmation code</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const chatId = selectedChat || parseInt(customChatId);
                      if (!chatId) {
                        toast.error(language === "ka" ? "შეიყვანეთ ჩატის ID" : "Enter chat ID");
                        return;
                      }
                      sendBookingMutation.mutate({
                        chatId,
                        guestName: "Guest",
                        studioName: "Orbi City Studio",
                        checkIn: new Date().toLocaleDateString(),
                        checkOut: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
                        confirmationCode: "OC" + Math.random().toString(36).substring(2, 8).toUpperCase(),
                      });
                    }}
                    disabled={sendBookingMutation.isPending}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {t.send}
                  </Button>
                </CardContent>
              </Card>

              {/* Check-in Reminder Template */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    {t.checkInReminder}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-slate-400 mb-3">
                    <p>⏰ <b>Check-in Reminder</b></p>
                    <p>📅 Tomorrow's check-in</p>
                    <p>🕐 Check-in time: 14:00</p>
                    <p>Arrival time request</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => {
                      const chatId = selectedChat || parseInt(customChatId);
                      if (!chatId) {
                        toast.error(language === "ka" ? "შეიყვანეთ ჩატის ID" : "Enter chat ID");
                        return;
                      }
                      sendReminderMutation.mutate({
                        chatId,
                        guestName: "Guest",
                        studioName: "Orbi City Studio",
                        checkInDate: new Date(Date.now() + 86400000).toLocaleDateString(),
                        checkInTime: "14:00",
                      });
                    }}
                    disabled={sendReminderMutation.isPending}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {t.send}
                  </Button>
                </CardContent>
              </Card>

              {/* Review Request Template */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    {t.reviewRequest}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-slate-400 mb-3">
                    <p>⭐ <b>How was your stay?</b></p>
                    <p>Thank you message</p>
                    <p>Review link</p>
                    <p>Feedback request</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      const chatId = selectedChat || parseInt(customChatId);
                      if (!chatId) {
                        toast.error(language === "ka" ? "შეიყვანეთ ჩატის ID" : "Enter chat ID");
                        return;
                      }
                      sendReviewMutation.mutate({
                        chatId,
                        guestName: "Guest",
                        studioName: "Orbi City Studio",
                        reviewLink: "https://g.page/r/orbi-city-batumi/review",
                      });
                    }}
                    disabled={sendReviewMutation.isPending}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {t.send}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default GuestCommunicationHub;
