/**
 * Email Inbox Dashboard
 * AI-powered email management with categorization and auto-response
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  RefreshCw,
  Search,
  Star,
  Inbox,
  Calendar,
  HelpCircle,
  DollarSign,
  AlertTriangle,
  FileText,
  Wrench,
  Newspaper,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_CONFIG = {
  booking: { icon: Calendar, label: "Bookings", color: "bg-blue-500", priority: "high" },
  question: { icon: HelpCircle, label: "Questions", color: "bg-purple-500", priority: "normal" },
  financial: { icon: DollarSign, label: "Payments", color: "bg-green-500", priority: "high" },
  complaint: { icon: AlertTriangle, label: "Complaints", color: "bg-red-500", priority: "urgent" },
  general: { icon: FileText, label: "General Info", color: "bg-gray-500", priority: "normal" },
  technical: { icon: Wrench, label: "Tech Support", color: "bg-orange-500", priority: "normal" },
  marketing: { icon: Newspaper, label: "Newsletters", color: "bg-pink-500", priority: "low" },
  spam: { icon: Trash2, label: "Spam", color: "bg-gray-400", priority: "low" },
  review: { icon: Star, label: "Reviews", color: "bg-yellow-500", priority: "high" },
  important: { icon: Star, label: "Important", color: "bg-red-600", priority: "urgent" },
};

export default function EmailInbox() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: connectionStatus } = trpc.gmailSync.getConnectionStatus.useQuery();
  const { data: messages, isLoading, refetch } = trpc.gmailSync.getMessages.useQuery({
    limit: 50,
    offset: 0,
  });
  const { data: syncHistory } = trpc.gmailSync.getSyncHistory.useQuery({ limit: 5 });

  // Mutations
  const syncMutation = trpc.gmailSync.syncMessages.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Synced ${data.messagesFetched} emails (${data.messagesNew} new)`);
      refetch();
    },
    onError: (error) => {
      toast.error(`❌ Sync failed: ${error.message}`);
    },
  });

  const handleSync = () => {
    syncMutation.mutate({ maxResults: 50 });
  };

  // Filter messages
  const filteredMessages = messages?.filter((msg) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.subject?.toLowerCase().includes(query) ||
        msg.fromEmail?.toLowerCase().includes(query) ||
        msg.snippet?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Category stats (mock for now, will be real after AI categorization)
  const categoryStats = {
    booking: 12,
    question: 8,
    financial: 5,
    complaint: 2,
    general: 15,
    technical: 3,
    marketing: 20,
    spam: 10,
    review: 7,
    important: 4,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.12_0.08_235)] to-[oklch(0.18_0.08_250)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Email Inbox
            </h1>
            <p className="text-white/70 mt-1">
              AI-powered email management with auto-categorization
            </p>
          </div>

          <div className="flex items-center gap-3">
            {connectionStatus?.connected ? (
              <Badge className="bg-green-500 text-white">
                ✅ Connected to Gmail
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white">
                ❌ Not Connected
              </Badge>
            )}

            <Button
              onClick={handleSync}
              disabled={syncMutation.isPending || !connectionStatus?.connected}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`}
              />
              {syncMutation.isPending ? "Syncing..." : "Sync Gmail"}
            </Button>
          </div>
        </div>

        {/* Connection Warning */}
        {!connectionStatus?.connected && (
          <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white">Gmail Not Connected</h3>
                <p className="text-white/70 text-sm mt-1">
                  Please connect your Gmail account in Settings to start syncing emails.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            placeholder="Search emails by subject, sender, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
          />
        </div>

        {/* Category Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = categoryStats[key as keyof typeof categoryStats] || 0;
            const isSelected = selectedCategory === key;

            return (
              <Card
                key={key}
                onClick={() => setSelectedCategory(isSelected ? null : key)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white/20 border-white/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{config.label}</p>
                      <p className="text-xs text-white/50">{count} emails</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Email List */}
        <Card className="bg-white/5 border-white/10">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              {selectedCategory
                ? `${CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG].label} (${filteredMessages?.length || 0})`
                : `All Emails (${filteredMessages?.length || 0})`}
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-8 text-center text-white/50">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading emails...
              </div>
            ) : filteredMessages && filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {msg.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        <p className="font-semibold text-white truncate">
                          {msg.fromEmail}
                        </p>
                        {!msg.isRead && (
                          <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-white/90 mb-1">{msg.subject}</h3>
                      <p className="text-sm text-white/60 line-clamp-2">{msg.snippet}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xs text-white/50 whitespace-nowrap">
                        {msg.receivedDate
                          ? new Date(msg.receivedDate).toLocaleDateString()
                          : "Unknown"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-white/50">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No emails found</p>
                {!connectionStatus?.connected && (
                  <p className="text-sm mt-1">Connect Gmail to start syncing</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Sync History */}
        {syncHistory && syncHistory.length > 0 && (
          <Card className="bg-white/5 border-white/10 p-4">
            <h3 className="font-semibold text-white mb-3">Recent Syncs</h3>
            <div className="space-y-2">
              {syncHistory.map((sync) => (
                <div
                  key={sync.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        sync.status === "success"
                          ? "bg-green-500 text-white"
                          : sync.status === "partial"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }
                    >
                      {sync.status}
                    </Badge>
                    <span className="text-white/70">
                      {sync.messagesFetched} fetched, {sync.messagesNew} new
                    </span>
                  </div>
                  <span className="text-white/50">
                    {new Date(sync.syncStartedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
