import { useState } from "react";
import { 
  Send, 
  Bot, 
  MessageSquare, 
  Users, 
  Settings, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bell,
  Calendar,
  Star,
  Copy,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TelegramBot() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [chatId, setChatId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [notificationType, setNotificationType] = useState<"info" | "warning" | "success" | "error">("info");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");

  // Get bot info
  const { data: botInfo, isLoading: botLoading, refetch: refetchBot } = trpc.telegram.getBotInfo.useQuery();
  
  // Get recent messages
  const { data: updates, isLoading: updatesLoading, refetch: refetchUpdates } = trpc.telegram.getUpdates.useQuery({ limit: 50 });

  // Send message mutation
  const sendMessageMutation = trpc.telegram.sendMessage.useMutation({
    onSuccess: () => {
      toast.success(language === 'ka' ? "შეტყობინება გაიგზავნა!" : "Message sent!");
      setMessageText("");
      refetchUpdates();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Send notification mutation
  const sendNotificationMutation = trpc.telegram.sendNotification.useMutation({
    onSuccess: () => {
      toast.success(language === 'ka' ? "შეტყობინება გაიგზავნა!" : "Notification sent!");
      setNotificationTitle("");
      setNotificationBody("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSendMessage = () => {
    if (!chatId || !messageText) {
      toast.error(language === 'ka' ? "შეავსეთ ყველა ველი" : "Please fill all fields");
      return;
    }
    sendMessageMutation.mutate({
      chatId: chatId,
      text: messageText,
      parseMode: 'HTML'
    });
  };

  const handleSendNotification = () => {
    if (!chatId || !notificationTitle || !notificationBody) {
      toast.error(language === 'ka' ? "შეავსეთ ყველა ველი" : "Please fill all fields");
      return;
    }
    sendNotificationMutation.mutate({
      chatId: chatId,
      title: notificationTitle,
      body: notificationBody,
      type: notificationType
    });
  };

  const copyBotUsername = () => {
    if (botInfo?.username) {
      navigator.clipboard.writeText(`@${botInfo.username}`);
      toast.success(language === 'ka' ? "დაკოპირდა!" : "Copied!");
    }
  };

  // Stats
  const totalMessages = updates?.messages?.length || 0;
  const uniqueChats = new Set(updates?.messages?.map(m => m.chatId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="relative z-10 px-8 pt-8 pb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Send className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                  {language === 'ka' ? "Telegram Bot" : "Telegram Bot"}
                </h1>
                <p className="text-white/70">
                  {language === 'ka' ? "სტუმრებთან კომუნიკაცია Telegram-ით" : "Guest communication via Telegram"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => { refetchBot(); refetchUpdates(); }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === 'ka' ? "განახლება" : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
        {/* Ocean Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px]" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#0f3460]" style={{ zIndex: -1 }} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">{language === 'ka' ? "ბოტის სტატუსი" : "Bot Status"}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {botLoading ? "..." : botInfo ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      {language === 'ka' ? "აქტიური" : "Active"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      {language === 'ka' ? "არააქტიური" : "Inactive"}
                    </span>
                  )}
                </p>
              </div>
              <Bot className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300">{language === 'ka' ? "სულ შეტყობინებები" : "Total Messages"}</p>
                <p className="text-2xl font-bold text-white mt-1">{totalMessages}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300">{language === 'ka' ? "უნიკალური ჩატები" : "Unique Chats"}</p>
                <p className="text-2xl font-bold text-white mt-1">{uniqueChats}</p>
              </div>
              <Users className="w-10 h-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">{language === 'ka' ? "ბოტის სახელი" : "Bot Username"}</p>
                <p className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  @{botInfo?.username || "..."}
                  {botInfo?.username && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyBotUsername}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </p>
              </div>
              <Settings className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
              <Bot className="w-4 h-4 mr-2" />
              {language === 'ka' ? "მიმოხილვა" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="send" className="data-[state=active]:bg-cyan-500/20">
              <Send className="w-4 h-4 mr-2" />
              {language === 'ka' ? "გაგზავნა" : "Send Message"}
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-cyan-500/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              {language === 'ka' ? "შეტყობინებები" : "Messages"}
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-cyan-500/20">
              <Bell className="w-4 h-4 mr-2" />
              {language === 'ka' ? "შაბლონები" : "Templates"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    {language === 'ka' ? "ბოტის ინფორმაცია" : "Bot Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-400">{language === 'ka' ? "სახელი" : "Name"}</span>
                    <span className="text-white font-medium">{botInfo?.firstName || "..."}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-400">{language === 'ka' ? "მომხმარებლის სახელი" : "Username"}</span>
                    <span className="text-white font-medium">@{botInfo?.username || "..."}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-slate-400">{language === 'ka' ? "ID" : "Bot ID"}</span>
                    <span className="text-white font-medium">{botInfo?.id || "..."}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">{language === 'ka' ? "სტატუსი" : "Status"}</span>
                    <Badge className={botInfo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {botInfo ? (language === 'ka' ? "აქტიური" : "Active") : (language === 'ka' ? "არააქტიური" : "Inactive")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-cyan-400" />
                    {language === 'ka' ? "სწრაფი ბმულები" : "Quick Links"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href={`https://t.me/${botInfo?.username || ''}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <Send className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{language === 'ka' ? "ბოტის გახსნა" : "Open Bot"}</p>
                      <p className="text-sm text-slate-400">t.me/{botInfo?.username}</p>
                    </div>
                  </a>
                  <a 
                    href="https://core.telegram.org/bots/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">{language === 'ka' ? "API დოკუმენტაცია" : "API Documentation"}</p>
                      <p className="text-sm text-slate-400">core.telegram.org/bots/api</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Send Message Tab */}
          <TabsContent value="send" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-cyan-400" />
                    {language === 'ka' ? "შეტყობინების გაგზავნა" : "Send Message"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {language === 'ka' ? "გაგზავნეთ პირდაპირი შეტყობინება" : "Send a direct message to a chat"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">{language === 'ka' ? "ჩატის ID" : "Chat ID"}</Label>
                    <Input
                      placeholder={language === 'ka' ? "მაგ: 123456789" : "e.g., 123456789"}
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">{language === 'ka' ? "შეტყობინება" : "Message"}</Label>
                    <Textarea
                      placeholder={language === 'ka' ? "შეიყვანეთ შეტყობინება..." : "Enter your message..."}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                    />
                    <p className="text-xs text-slate-500">
                      {language === 'ka' ? "მხარდაჭერილია HTML ფორმატირება" : "HTML formatting is supported"}
                    </p>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendMessageMutation.isPending 
                      ? (language === 'ka' ? "იგზავნება..." : "Sending...") 
                      : (language === 'ka' ? "გაგზავნა" : "Send Message")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-cyan-400" />
                    {language === 'ka' ? "შეტყობინების გაგზავნა" : "Send Notification"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {language === 'ka' ? "გაგზავნეთ ფორმატირებული შეტყობინება" : "Send a formatted notification"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">{language === 'ka' ? "ჩატის ID" : "Chat ID"}</Label>
                    <Input
                      placeholder={language === 'ka' ? "მაგ: 123456789" : "e.g., 123456789"}
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">{language === 'ka' ? "ტიპი" : "Type"}</Label>
                    <Select value={notificationType} onValueChange={(v: any) => setNotificationType(v)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">ℹ️ Info</SelectItem>
                        <SelectItem value="success">✅ Success</SelectItem>
                        <SelectItem value="warning">⚠️ Warning</SelectItem>
                        <SelectItem value="error">❌ Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">{language === 'ka' ? "სათაური" : "Title"}</Label>
                    <Input
                      placeholder={language === 'ka' ? "შეტყობინების სათაური" : "Notification title"}
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">{language === 'ka' ? "ტექსტი" : "Body"}</Label>
                    <Textarea
                      placeholder={language === 'ka' ? "შეტყობინების ტექსტი..." : "Notification body..."}
                      value={notificationBody}
                      onChange={(e) => setNotificationBody(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white min-h-[80px]"
                    />
                  </div>
                  <Button
                    onClick={handleSendNotification}
                    disabled={sendNotificationMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {sendNotificationMutation.isPending 
                      ? (language === 'ka' ? "იგზავნება..." : "Sending...") 
                      : (language === 'ka' ? "გაგზავნა" : "Send Notification")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  {language === 'ka' ? "მიღებული შეტყობინებები" : "Received Messages"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {language === 'ka' ? "ბოლო 50 შეტყობინება" : "Last 50 messages"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updatesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  </div>
                ) : updates?.messages && updates.messages.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {updates.messages.map((msg, index) => (
                      <div key={index} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <Users className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {msg.fromFirstName || msg.fromUsername || `Chat ${msg.chatId}`}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: {msg.chatId} • {new Date(msg.date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setChatId(msg.chatId.toString());
                              setActiveTab("send");
                            }}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-slate-300">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">
                      {language === 'ka' ? "შეტყობინებები არ არის" : "No messages yet"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {language === 'ka' 
                        ? "დაიწყეთ ჩატი ბოტთან შეტყობინებების მისაღებად" 
                        : "Start a chat with the bot to receive messages"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {language === 'ka' ? "ჯავშნის დადასტურება" : "Booking Confirmation"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {language === 'ka' ? "ავტომატური შეტყობინება" : "Automated message"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {language === 'ka' 
                      ? "გაგზავნეთ ჯავშნის დადასტურება სტუმარს" 
                      : "Send booking confirmation to guest"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {language === 'ka' ? "Check-in შეხსენება" : "Check-in Reminder"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {language === 'ka' ? "1 დღით ადრე" : "1 day before"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {language === 'ka' 
                      ? "შეახსენეთ სტუმარს მომავალი ჩამოსვლა" 
                      : "Remind guest about upcoming arrival"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {language === 'ka' ? "მიმოხილვის მოთხოვნა" : "Review Request"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {language === 'ka' ? "Check-out-ის შემდეგ" : "After check-out"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {language === 'ka' 
                      ? "სთხოვეთ სტუმარს მიმოხილვის დატოვება" 
                      : "Ask guest to leave a review"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
