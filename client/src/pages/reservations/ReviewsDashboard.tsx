import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Send,
  Globe,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  Copy,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { AIReviewResponseQueue, AIResponseMetricsWidget } from "@/components/ai-review-response";

// Platform icons/colors
const platformConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  google: { color: "text-blue-600", bgColor: "bg-blue-500/10", icon: "G" },
  booking: { color: "text-blue-800", bgColor: "bg-blue-800/10", icon: "B" },
  airbnb: { color: "text-rose-500", bgColor: "bg-rose-500/10", icon: "A" },
  expedia: { color: "text-yellow-600", bgColor: "bg-yellow-500/10", icon: "E" },
  tripadvisor: { color: "text-green-600", bgColor: "bg-green-500/10", icon: "T" },
  facebook: { color: "text-blue-600", bgColor: "bg-blue-600/10", icon: "F" },
  agoda: { color: "text-red-600", bgColor: "bg-red-500/10", icon: "Ag" },
  hostelworld: { color: "text-orange-500", bgColor: "bg-orange-500/10", icon: "H" },
  direct: { color: "text-emerald-600", bgColor: "bg-emerald-500/10", icon: "D" },
};

const ReviewsDashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Filters state
  const [filters, setFilters] = useState({
    source: "all" as const,
    sentiment: "all" as const,
    rating: "all" as const,
    hasReply: "all" as const,
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // API queries
  const { data: reviewsData, isLoading, refetch } = trpc.reviews.getAll.useQuery({
    source: filters.source,
    sentiment: filters.sentiment,
    rating: filters.rating,
    hasReply: filters.hasReply,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: filters.search || undefined,
    limit: 100,
  });

  const { data: stats } = trpc.reviews.getStats.useQuery({
    source: filters.source,
  });

  const { data: topicsData } = trpc.reviews.getTopicsAnalysis.useQuery({
    source: filters.source,
  });

  const replyMutation = trpc.reviews.reply.useMutation({
    onSuccess: () => {
      toast({ title: t("წარმატება", "Success"), description: t("პასუხი გაიგზავნა", "Reply sent successfully") });
      setReplyDialogOpen(false);
      setReplyText("");
      refetch();
    },
  });

  const generateAiReplyMutation = trpc.reviews.generateAiReply.useMutation({
    onSuccess: (data) => {
      setReplyText(data.aiReply);
      setIsGeneratingAi(false);
    },
    onError: () => {
      setIsGeneratingAi(false);
    },
  });

  // Outscraper webhook status
  const { data: outscraperStatus } = trpc.reviews.getOutscraperStatus.useQuery();
  const [showWebhookInfo, setShowWebhookInfo] = useState(false);

  const syncDemoMutation = trpc.reviews.syncDemoReviews.useMutation({
    onSuccess: (data) => {
      toast({ 
        title: t("წარმატება", "Success"), 
        description: t(
          `${data.imported} დემო მიმოხილვა იმპორტირებულია`,
          `${data.imported} demo reviews imported`
        )
      });
      refetch();
    },
    onError: (error) => {
      toast({ 
        title: t("შეცდომა", "Error"), 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/trpc/reviews.receiveOutscraperWebhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast({ 
      title: t('toast.copied'), 
      description: t('toast.copied')
    });
  };

  const handleGenerateAiReply = () => {
    if (!selectedReview) return;
    setIsGeneratingAi(true);
    generateAiReplyMutation.mutate({ id: selectedReview.id });
  };

  const handleSendReply = () => {
    if (!selectedReview || !replyText.trim()) return;
    replyMutation.mutate({ id: selectedReview.id, replyContent: replyText });
  };

  const openReplyDialog = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.replyContent || "");
    setReplyDialogOpen(true);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  // Sentiment badge
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><ThumbsUp className="h-3 w-3 mr-1" />{t('reviews.positiveReviews')}</Badge>;
      case "negative":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><ThumbsDown className="h-3 w-3 mr-1" />{t('reviews.negativeReviews')}</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20"><Minus className="h-3 w-3 mr-1" />{t('reviews.neutralReviews')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Ocean Wave */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="relative z-10 px-8 pt-8 pb-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                {t('reviews.title')}
              </h1>
              <p className="text-lg text-white/90 mt-2 font-medium">
                {t('reviews.subtitle')}
              </p>
            </div>
            <div className="flex gap-2 items-center">
          {/* Outscraper Webhook Info Button */}
          <Button onClick={() => setShowWebhookInfo(!showWebhookInfo)} variant="outline" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            {t("Outscraper Webhook", "Outscraper Webhook")}
          </Button>
          
          {/* Demo Sync Button */}
          <Button onClick={() => syncDemoMutation.mutate()} variant="default" disabled={syncDemoMutation.isPending}>
            <Globe className={`h-4 w-4 mr-2 ${syncDemoMutation.isPending ? "animate-spin" : ""}`} />
            {t('ota.sync')}
          </Button>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {t('common.refresh')}
          </Button>
            </div>
          </div>
        </div>
        {/* Ocean Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
          </svg>
        </div>
        {/* Background */}
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
      </div>

      {/* Outscraper Webhook Info Panel */}
      {showWebhookInfo && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{t("Outscraper Webhook კონფიგურაცია", "Outscraper Webhook Configuration")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("დააკოპირეთ ეს URL და ჩასვით Outscraper-ის Webhook პარამეტრებში", "Copy this URL and paste it in Outscraper's Webhook settings")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="bg-background/50 px-3 py-2 rounded text-sm font-mono flex-1">
                    {`${window.location.origin}/api/trpc/reviews.receiveOutscraperWebhook`}
                  </code>
                  <Button onClick={copyWebhookUrl} size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{t("Google მიმოხილვები", "Google Reviews")}: {outscraperStatus?.totalGoogleReviews || 0}</span>
                  </div>
                  {outscraperStatus?.lastSync && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t("ბოლო სინქრონიზაცია", "Last sync")}: {format(new Date(outscraperStatus.lastSync), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={() => setShowWebhookInfo(false)} variant="ghost" size="sm">
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("სულ მიმოხილვები", "Total Reviews")}</p>
                <p className="text-3xl font-bold mt-1">{stats?.total || 0}</p>
                {stats?.trend && (
                  <div className={`flex items-center text-sm mt-1 ${stats.trend.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {stats.trend.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {stats.trend.change >= 0 ? "+" : ""}{stats.trend.change} {t("ბოლო 30 დღე", "last 30 days")}
                  </div>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("საშუალო რეიტინგი", "Average Rating")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold">{stats?.avgRating?.toFixed(1) || "0.0"}</p>
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("პასუხის მოლოდინში", "Pending Replies")}</p>
                <p className="text-3xl font-bold mt-1">{stats?.pendingCount || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats?.responseRate || 0}% {t("პასუხგაცემული", "response rate")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("დადებითი %", "Positive %")}</p>
                <p className="text-3xl font-bold mt-1 text-emerald-500">
                  {stats?.positiveRate || 0}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ThumbsUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("ფილტრები", "Filters")}</span>
            </div>
            
            <Select value={filters.source} onValueChange={(v) => setFilters({ ...filters, source: v as any })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("წყარო", "Source")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა", "All")}</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="booking">Booking.com</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="expedia">Expedia</SelectItem>
                <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sentiment} onValueChange={(v) => setFilters({ ...filters, sentiment: v as any })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("სენტიმენტი", "Sentiment")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა", "All")}</SelectItem>
                <SelectItem value="positive">{t("დადებითი", "Positive")}</SelectItem>
                <SelectItem value="neutral">{t("ნეიტრალური", "Neutral")}</SelectItem>
                <SelectItem value="negative">{t("უარყოფითი", "Negative")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.rating} onValueChange={(v) => setFilters({ ...filters, rating: v as any })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("რეიტინგი", "Rating")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა", "All")}</SelectItem>
                <SelectItem value="5">5 ⭐</SelectItem>
                <SelectItem value="4">4 ⭐</SelectItem>
                <SelectItem value="3">3 ⭐</SelectItem>
                <SelectItem value="2">2 ⭐</SelectItem>
                <SelectItem value="1">1 ⭐</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.hasReply} onValueChange={(v) => setFilters({ ...filters, hasReply: v as any })}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("პასუხის სტატუსი", "Reply Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა", "All")}</SelectItem>
                <SelectItem value="yes">{t("პასუხგაცემული", "Replied")}</SelectItem>
                <SelectItem value="no">{t("მოლოდინში", "Pending")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("ძიება...", "Search...")}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="ai-responses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[550px]">
          <TabsTrigger value="ai-responses" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t("AI პასუხები", "AI Responses")}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("მიმოხილვები", "Reviews")}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("ანალიტიკა", "Analytics")}
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            {t("თემები", "Topics")}
          </TabsTrigger>
        </TabsList>

        {/* AI Response Queue - NEW */}
        <TabsContent value="ai-responses" className="space-y-6">
          {/* AI Response Metrics Widget */}
          <AIResponseMetricsWidget />
          
          {/* AI Response Queue */}
          <AIReviewResponseQueue />
        </TabsContent>

        {/* Reviews List */}
        <TabsContent value="reviews" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviewsData?.reviews?.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("მიმოხილვები არ მოიძებნა", "No reviews found")}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewsData?.reviews?.map((review: any) => {
                const platform = platformConfig[review.source] || platformConfig.direct;
                return (
                  <Card key={review.id} className="hover:border-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Platform Badge */}
                        <div className={`h-12 w-12 rounded-full ${platform.bgColor} flex items-center justify-center shrink-0`}>
                          <span className={`font-bold ${platform.color}`}>{platform.icon}</span>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{review.reviewerName || t("ანონიმური", "Anonymous")}</span>
                              {review.reviewerCountry && (
                                <Badge variant="outline" className="text-xs">
                                  <Globe className="h-3 w-3 mr-1" />
                                  {review.reviewerCountry}
                                </Badge>
                              )}
                              {getSentimentBadge(review.sentiment)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(review.reviewDate), "dd MMM yyyy")}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            {renderStars(review.rating)}
                            {review.apartmentCode && (
                              <Badge variant="secondary" className="text-xs">
                                {review.apartmentCode}
                              </Badge>
                            )}
                          </div>

                          {review.title && (
                            <h4 className="font-medium mb-2">{review.title}</h4>
                          )}
                          <p className="text-muted-foreground leading-relaxed">{review.content}</p>

                          {/* Topics */}
                          {review.topics && (review.topics as string[]).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {(review.topics as string[]).map((topic: string) => (
                                <Badge key={topic} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Reply Section */}
                          {review.hasReply && review.replyContent && (
                            <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium text-emerald-600">{t("პასუხი გაცემულია", "Reply sent")}</span>
                                {review.replyDate && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(review.replyDate), "dd MMM yyyy")}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{review.replyContent}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              variant={review.hasReply ? "outline" : "default"}
                              onClick={() => openReplyDialog(review)}
                            >
                              {review.hasReply ? (
                                <>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  {t("პასუხის რედაქტირება", "Edit Reply")}
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  {t("პასუხის გაცემა", "Reply")}
                                </>
                              )}
                            </Button>
                            {review.reviewUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  {t("ნახვა", "View")}
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("რეიტინგის განაწილება", "Rating Distribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats?.ratingDistribution?.[rating] || 0;
                    const percentage = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="font-medium">{rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {t("წყაროების განაწილება", "Source Distribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.sourceDistribution?.map((source: any) => {
                    const platform = platformConfig[source.source] || platformConfig.direct;
                    const percentage = stats?.total ? Math.round((source.count / stats.total) * 100) : 0;
                    return (
                      <div key={source.source} className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full ${platform.bgColor} flex items-center justify-center`}>
                          <span className={`text-sm font-bold ${platform.color}`}>{platform.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{source.source}</span>
                            <span className="text-sm text-muted-foreground">
                              {source.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${platform.bgColor.replace("/10", "")} rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{source.avgRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("სენტიმენტის ანალიზი", "Sentiment Analysis")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                    <ThumbsUp className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-emerald-600">{stats?.sentiment?.positive || 0}</p>
                    <p className="text-sm text-muted-foreground">{t("დადებითი", "Positive")}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-500/10 rounded-lg">
                    <Minus className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-600">{stats?.sentiment?.neutral || 0}</p>
                    <p className="text-sm text-muted-foreground">{t("ნეიტრალური", "Neutral")}</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 rounded-lg">
                    <ThumbsDown className="h-8 w-8 mx-auto text-red-500 mb-2" />
                    <p className="text-2xl font-bold text-red-600">{stats?.sentiment?.negative || 0}</p>
                    <p className="text-sm text-muted-foreground">{t("უარყოფითი", "Negative")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {t("პასუხის სტატისტიკა", "Response Statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="relative h-32 w-32">
                      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-muted"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={`${(stats?.replies?.responseRate || 0) * 2.51} 251`}
                          className="text-emerald-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{stats?.replies?.responseRate || 0}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t("პასუხის მაჩვენებელი", "Response Rate")}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">{stats?.replies?.answered || 0}</p>
                        <p className="text-sm text-muted-foreground">{t("პასუხგაცემული", "Answered")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">{stats?.replies?.pending || 0}</p>
                        <p className="text-sm text-muted-foreground">{t("მოლოდინში", "Pending")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("თემების ანალიზი", "Topics Analysis")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topicsData?.map((topic: any) => (
                  <Card key={topic.topic} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">{topic.topic}</Badge>
                        <span className="text-sm text-muted-foreground">{topic.total} {t("ხსენება", "mentions")}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${topic.positiveRate}%` }}
                          />
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${100 - topic.positiveRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-emerald-600">{topic.positiveRate}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("პასუხის გაცემა", "Reply to Review")}</DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              {/* Original Review */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.reviewerName}</span>
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedReview.content}</p>
              </div>

              {/* Reply Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t("თქვენი პასუხი", "Your Reply")}</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateAiReply}
                    disabled={isGeneratingAi}
                  >
                    <Sparkles className={`h-4 w-4 mr-2 ${isGeneratingAi ? "animate-pulse" : ""}`} />
                    {t("AI პასუხი", "AI Reply")}
                  </Button>
                </div>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("დაწერეთ პასუხი...", "Write your reply...")}
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              {t("გაუქმება", "Cancel")}
            </Button>
            <Button onClick={handleSendReply} disabled={!replyText.trim() || replyMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {t("გაგზავნა", "Send Reply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsDashboard;
