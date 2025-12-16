import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Mail, Phone, MessageSquare, CheckCheck } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  guestId: number | null;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  message: string;
  source: string;
  direction: "incoming" | "outgoing";
  status: "unread" | "read" | "replied";
  metadata: string | null;
  createdAt: Date;
}

export default function Chat() {
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch chat messages
  const { data, isLoading, refetch } = trpc.n8nWebhook.getChatMessages.useQuery({
    limit: 100,
    offset: 0,
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.n8nWebhook.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Send reply mutation
  const sendReplyMutation = trpc.n8nWebhook.sendReply.useMutation({
    onSuccess: () => {
      toast.success("პასუხი გაიგზავნა!");
      setReplyText("");
      refetch();
    },
    onError: (error) => {
      toast.error(`შეცდომა: ${error.message}`);
    },
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleMessageClick = (message: ChatMessage) => {
    setSelectedMessage(message);
    if (message.status === "unread") {
      markAsReadMutation.mutate({ messageId: message.id });
    }
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error("გთხოვთ შეიყვანოთ პასუხი");
      return;
    }

    if (!selectedMessage.guestId) {
      toast.error("სტუმარი ვერ მოიძებნა");
      return;
    }

    sendReplyMutation.mutate({
      guestId: selectedMessage.guestId,
      message: replyText,
      originalMessageId: selectedMessage.id,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive">წაუკითხავი</Badge>;
      case "read":
        return <Badge variant="secondary">წაკითხული</Badge>;
      case "replied":
        return <Badge variant="default">პასუხგაცემული</Badge>;
      default:
        return null;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "n8n":
        return <MessageSquare className="w-4 h-4" />;
      case "whatsapp":
        return <Phone className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const messages = data?.messages || [];
  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">სტუმრების ჩათი</h1>
            <p className="text-sm text-gray-600">
              n8n workflow-დან მოსული შეტყობინებები
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {unreadCount} ახალი
              </Badge>
            )}
            <Button onClick={() => refetch()} variant="outline" size="sm">
              განახლება
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages List */}
        <div className="w-1/3 bg-white border-r">
          <ScrollArea className="h-full">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ჯერ არ მოსულა შეტყობინებები</p>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-blue-50" : ""
                    } ${message.status === "unread" ? "bg-yellow-50" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(message.source)}
                        <span className="font-semibold">{message.guestName}</span>
                      </div>
                      {getStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {message.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {message.guestEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {message.guestEmail}
                        </span>
                      )}
                      {message.guestPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {message.guestPhone}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(message.createdAt).toLocaleString("ka-GE")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Detail & Reply */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedMessage ? (
            <>
              {/* Message Detail */}
              <div className="border-b p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {selectedMessage.guestName}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {selectedMessage.guestEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedMessage.guestEmail}
                        </span>
                      )}
                      {selectedMessage.guestPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedMessage.guestPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(selectedMessage.status)}
                </div>

                <Card className="p-4 bg-gray-50">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </Card>

                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {getSourceIcon(selectedMessage.source)}
                    {selectedMessage.source}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(selectedMessage.createdAt).toLocaleString("ka-GE")}
                  </span>
                </div>
              </div>

              {/* Reply Section */}
              <div className="flex-1 flex flex-col p-6">
                <h3 className="text-lg font-semibold mb-4">პასუხის გაგზავნა</h3>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="დაწერეთ პასუხი..."
                  className="flex-1 mb-4 resize-none"
                  rows={8}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sendReplyMutation.isPending}
                  className="self-end"
                >
                  {sendReplyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      იგზავნება...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      გაგზავნა
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>აირჩიეთ შეტყობინება</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
