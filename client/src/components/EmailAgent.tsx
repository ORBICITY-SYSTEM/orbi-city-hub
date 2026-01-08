import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  RefreshCw, 
  Inbox, 
  AlertCircle, 
  Search,
  Brain,
  Filter,
  Trash2,
  Star,
  Archive,
  Send,
  MessageSquare,
  TrendingUp,
  Shield,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  labelIds: string[];
  category?: string;
  priority?: string;
  sentiment?: string;
  suggestedActions?: string[];
}

interface EmailStats {
  total: number;
  unread: number;
  important: number;
  spam: number;
  categories: {
    booking: number;
    guest: number;
    marketing: number;
    operational: number;
    other: number;
  };
}

export const EmailAgent = () => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stats, setStats] = useState<EmailStats>({
    total: 0,
    unread: 0,
    important: 0,
    spam: 0,
    categories: {
      booking: 0,
      guest: 0,
      marketing: 0,
      operational: 0,
      other: 0
    }
  });
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('google_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsConnected(!!data);
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const categorizeEmail = (message: any): GmailMessage => {
    const subject = message.subject.toLowerCase();
    const from = message.from.toLowerCase();
    const snippet = message.snippet.toLowerCase();
    
    let category = "other";
    let priority = "normal";
    let sentiment = "neutral";
    const suggestedActions: string[] = [];

    // Categorization logic
    if (
      subject.includes("booking") || 
      subject.includes("reservation") || 
      from.includes("booking.com") ||
      from.includes("airbnb") ||
      from.includes("expedia")
    ) {
      category = "booking";
      priority = "high";
      suggestedActions.push("Review booking details");
      suggestedActions.push("Update calendar");
    } else if (
      subject.includes("guest") || 
      subject.includes("review") ||
      subject.includes("feedback") ||
      subject.includes("complaint")
    ) {
      category = "guest";
      priority = snippet.includes("urgent") || snippet.includes("complaint") ? "high" : "normal";
      suggestedActions.push("Respond to guest");
      
      // Sentiment analysis (basic)
      if (snippet.includes("thank") || snippet.includes("great") || snippet.includes("excellent")) {
        sentiment = "positive";
      } else if (snippet.includes("problem") || snippet.includes("issue") || snippet.includes("complaint")) {
        sentiment = "negative";
        priority = "high";
      }
    } else if (
      subject.includes("marketing") || 
      subject.includes("promotion") ||
      subject.includes("newsletter") ||
      subject.includes("unsubscribe") ||
      from.includes("marketing") ||
      from.includes("newsletter")
    ) {
      category = "marketing";
      priority = "low";
      suggestedActions.push("Consider unsubscribing");
      suggestedActions.push("Move to archive");
    } else if (
      subject.includes("invoice") || 
      subject.includes("payment") ||
      subject.includes("maintenance") ||
      subject.includes("housekeeping") ||
      subject.includes("staff")
    ) {
      category = "operational";
      priority = "normal";
      suggestedActions.push("Review and process");
    }

    // Spam detection
    if (
      snippet.includes("click here now") ||
      snippet.includes("limited time offer") ||
      snippet.includes("act now") ||
      subject.includes("re:") && !message.threadId
    ) {
      suggestedActions.push("Mark as spam");
    }

    return {
      ...message,
      category,
      priority,
      sentiment,
      suggestedActions
    };
  };

  const analyzeEmails = (rawMessages: any[]) => {
    const categorized = rawMessages.map(categorizeEmail);
    
    const newStats: EmailStats = {
      total: categorized.length,
      unread: categorized.filter(m => m.labelIds.includes("UNREAD")).length,
      important: categorized.filter(m => m.priority === "high").length,
      spam: categorized.filter(m => m.suggestedActions?.includes("Mark as spam")).length,
      categories: {
        booking: categorized.filter(m => m.category === "booking").length,
        guest: categorized.filter(m => m.category === "guest").length,
        marketing: categorized.filter(m => m.category === "marketing").length,
        operational: categorized.filter(m => m.category === "operational").length,
        other: categorized.filter(m => m.category === "other").length
      }
    };

    setStats(newStats);
    setMessages(categorized);
    setFilteredMessages(categorized);
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "gmail-fetch-messages",
        {
          body: { maxResults: 50 },
        }
      );

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      analyzeEmails(data.messages || []);
      
      toast({
        title: "✅ Emails Analyzed",
        description: `${data.messages?.length || 0} emails processed with AI`,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.subject.toLowerCase().includes(query) ||
        m.from.toLowerCase().includes(query) ||
        m.snippet.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchMessages();
    }
  }, [isConnected]);

  useEffect(() => {
    filterMessages();
  }, [searchQuery, selectedCategory, messages]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "normal": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "😊";
      case "negative": return "😟";
      default: return "😐";
    }
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gmail connection required. Please connect Gmail above to use the Email Agent.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Emails</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unread</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.unread}</CardTitle>
          </CardHeader>
          <CardContent>
            <Inbox className="h-4 w-4 text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Priority</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.important}</CardTitle>
          </CardHeader>
          <CardContent>
            <Star className="h-4 w-4 text-red-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bookings</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.categories.booking}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Spam Detected</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.spam}</CardTitle>
          </CardHeader>
          <CardContent>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Email Interface */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  AI Email Agent
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </CardTitle>
                <CardDescription>
                  Intelligent email processing and management
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={fetchMessages}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh & Analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails by subject, sender, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              <option value="booking">Bookings</option>
              <option value="guest">Guest Communication</option>
              <option value="operational">Operational</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Separator className="my-4" />

          {/* Email List */}
          <ScrollArea className="h-[600px]">
            {filteredMessages.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No emails found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <Card key={message.id} className="border-muted hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                              {message.subject || "(No subject)"}
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                                {message.priority?.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {message.category}
                              </Badge>
                              {message.labelIds.includes("UNREAD") && (
                                <Badge variant="default" className="text-xs">
                                  NEW
                                </Badge>
                              )}
                              {message.sentiment && message.sentiment !== "neutral" && (
                                <Badge variant="outline" className="text-xs">
                                  {getSentimentIcon(message.sentiment)} {message.sentiment}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="text-xs text-muted-foreground">
                          <p className="line-clamp-1">
                            <span className="font-medium">From:</span> {message.from}
                          </p>
                          <p className="mt-1">{message.date}</p>
                        </div>

                        {/* Snippet */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.snippet}
                        </p>

                        {/* AI Suggested Actions */}
                        {message.suggestedActions && message.suggestedActions.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Suggestions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestedActions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                >
                                  {action}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
