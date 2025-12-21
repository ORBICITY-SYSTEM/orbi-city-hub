/**
 * Email Inbox - AI-Powered Email Management
 * Universal email categorization, summarization, and smart features
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Search,
  Inbox,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Star,
  Archive,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EmailCategory = "bookings" | "finance" | "marketing" | "spam" | "important" | "general";

const categoryIcons: Record<EmailCategory, any> = {
  bookings: Inbox,
  finance: DollarSign,
  marketing: TrendingUp,
  spam: AlertTriangle,
  important: Star,
  general: Archive,
};

const categoryColors: Record<EmailCategory, string> = {
  bookings: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  finance: "bg-green-500/10 text-green-600 border-green-500/20",
  marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  spam: "bg-red-500/10 text-red-600 border-red-500/20",
  important: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  general: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function EmailInbox() {
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Fetch categorized emails
  const { data: emailsData, isLoading, refetch } = trpc.emailCategorization.getCategorizedEmails.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 50,
    offset: 0,
  });

  // Fetch category stats
  const { data: statsData } = trpc.emailCategorization.getCategoryStats.useQuery();

  // Fetch unsubscribe suggestions
  const { data: unsubscribeData } = trpc.emailCategorization.getUnsubscribeSuggestions.useQuery({
    status: "suggested",
    limit: 20,
  });

  // Search emails
  const searchMutation = trpc.emailCategorization.searchEmails.useMutation();

  // Gmail sync
  const syncMutation = trpc.emailCategorization.syncGmailEmails.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      setIsSyncing(false);
    },
    onError: () => {
      toast.error("Gmail sync failed");
      setIsSyncing(false);
    },
  });

  // Gmail sync status
  const { data: syncStatus } = trpc.emailCategorization.getGmailSyncStatus.useQuery();

  // Update unsubscribe status
  const updateUnsubscribeMutation = trpc.emailCategorization.updateUnsubscribeStatus.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribe status updated");
      refetch();
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      const result = await searchMutation.mutateAsync({ query: searchQuery });
      toast.success(`Found ${result.total} emails`);
      // TODO: Display search results
    } catch (error) {
      toast.error("Search failed");
    }
  };

  const handleUnsubscribe = (id: number, status: "dismissed" | "unsubscribed" | "kept") => {
    updateUnsubscribeMutation.mutate({ id, status });
  };

  const toggleEmailSelection = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const selectAll = () => {
    if (emailsData) {
      const allIds = new Set(emailsData.emails.map(e => e.emailId));
      setSelectedEmails(allIds);
    }
  };

  const deselectAll = () => {
    setSelectedEmails(new Set());
  };

  const handleBatchCategorize = (category: EmailCategory) => {
    // In real implementation, would call batch categorization endpoint
    toast.success(`Categorizing ${selectedEmails.size} emails as ${category}...`);
    deselectAll();
    setIsSelectMode(false);
  };

  const handleBatchDelete = () => {
    toast.success(`Deleting ${selectedEmails.size} emails...`);
    deselectAll();
    setIsSelectMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
              <Mail className="w-8 h-8 text-blue-600" />
              Email Inbox
            </h1>
            <p className="text-white/60 mt-1">AI-powered email management with smart categorization</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => {
                setIsSyncing(true);
                syncMutation.mutate({ query: "newer_than:7d", maxResults: 50 });
              }} 
              variant="default" 
              size="sm"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Sync Gmail
            </Button>
            <Button 
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) deselectAll();
              }} 
              variant={isSelectMode ? "default" : "outline"}
              size="sm"
            >
              {isSelectMode ? "Cancel Selection" : "Select Multiple"}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Natural language search (e.g., 'find booking emails from last week')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={searchMutation.isPending}>
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Search
            </Button>
          </div>
        </Card>

        {/* Category Stats */}
        {statsData && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsData.stats.map((stat) => {
              const Icon = categoryIcons[stat.category as EmailCategory];
              const colorClass = categoryColors[stat.category as EmailCategory];
              
              return (
                <Card
                  key={stat.category}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    selectedCategory === stat.category ? "ring-2 ring-blue-500" : ""
                  } ${colorClass}`}
                  onClick={() => setSelectedCategory(stat.category as EmailCategory)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold capitalize">{stat.category}</span>
                  </div>
                  <div className="text-2xl font-bold">{Number(stat.count)}</div>
                  <div className="text-sm opacity-70">
                    {Math.round(Number(stat.avgConfidence))}% confidence
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="space-y-4">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="all">All Emails</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
            <TabsTrigger value="spam">Spam</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : emailsData && emailsData.emails.length > 0 ? (
              <div className="space-y-4">
                {/* Batch Actions Bar */}
                {isSelectMode && selectedEmails.size > 0 && (
                  <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">
                          {selectedEmails.size} selected
                        </span>
                        <Button size="sm" variant="outline" onClick={selectAll}>
                          Select All
                        </Button>
                        <Button size="sm" variant="outline" onClick={deselectAll}>
                          Deselect All
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={(v) => handleBatchCategorize(v as EmailCategory)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Categorize as..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bookings">Bookings</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="spam">Spam</SelectItem>
                            <SelectItem value="important">Important</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
                <div className="space-y-2">
                {emailsData.emails.map((email) => (
                  <Card
                    key={email.id}
                    className={`p-4 bg-white/80 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer ${
                      selectedEmails.has(email.emailId) ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.stopPropagation();
                        toggleEmailSelection(email.emailId);
                      } else {
                        setLocation(`/email-inbox/${email.emailId}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedEmails.has(email.emailId)}
                          onCheckedChange={() => toggleEmailSelection(email.emailId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={categoryColors[email.category]}>
                            {email.category}
                          </Badge>
                          <span className="text-sm text-gray-600 truncate">{email.emailFrom}</span>
                          <span className="text-xs text-gray-400">
                            {email.emailDate ? new Date(email.emailDate).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{email.emailSubject}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{email.aiReasoning}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-500">{email.confidence}% confident</div>
                        {email.manuallyOverridden && (
                          <Badge variant="outline" className="text-xs">Manual</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                 ))}
                </div>
              </div>
            ) : (
              <Card className="p-12 bg-white/80 backdrop-blur-sm border border-gray-200 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No emails found</h3>
                <p className="text-gray-600">
                  {selectedCategory === "all"
                    ? "No emails have been categorized yet."
                    : `No ${selectedCategory} emails found.`}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Unsubscribe Suggestions */}
        {unsubscribeData && unsubscribeData.suggestions.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Smart Unsubscribe Suggestions
            </h2>
            <div className="space-y-3">
              {unsubscribeData.suggestions.slice(0, 5).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{suggestion.emailFrom}</div>
                    <div className="text-sm text-gray-600 truncate">{suggestion.emailSubject}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.senderEmailCount} emails • {suggestion.detectionMethod.replace("_", " ")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnsubscribe(suggestion.id, "dismissed")}
                      disabled={updateUnsubscribeMutation.isPending}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnsubscribe(suggestion.id, "kept")}
                      disabled={updateUnsubscribeMutation.isPending}
                    >
                      Keep
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUnsubscribe(suggestion.id, "unsubscribed")}
                      disabled={updateUnsubscribeMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
