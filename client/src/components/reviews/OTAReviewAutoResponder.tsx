/**
 * OTA Review Auto-Responder
 * AI-powered automatic review responses for Booking.com, Airbnb, Google, TripAdvisor
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MessageSquare,
  Bot,
  RefreshCw,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Edit,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useGoogleReviews } from "@/hooks/useMarketingAnalytics";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PendingReview {
  id: string;
  platform: string;
  guestName: string;
  rating: number;
  text: string;
  date: string;
  aiResponse?: string;
  status: "pending" | "approved" | "sent" | "edited";
}

export function OTAReviewAutoResponder() {
  const { language } = useLanguage();
  const [autoRespond, setAutoRespond] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [editedResponse, setEditedResponse] = useState("");
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Fetch reviews
  const { data: reviewsData, isLoading, refetch } = useGoogleReviews();

  // AI chat for generating responses
  const chatMutation = trpc.aiAgents.chat.useMutation();

  // Convert reviews to pending reviews format
  const pendingReviews: PendingReview[] = (reviewsData?.reviews || [])
    .filter((r) => !r.response)
    .slice(0, 10)
    .map((r) => ({
      id: r.id,
      platform: "Google",
      guestName: r.author,
      rating: r.rating,
      text: r.text,
      date: r.date,
      status: "pending" as const,
    }));

  const generateAIResponse = async (review: PendingReview) => {
    setGeneratingFor(review.id);
    try {
      const result = await chatMutation.mutateAsync({
        agentId: "marketing-ai",
        message: `გთხოვთ დაწეროთ პროფესიონალური პასუხი ამ მიმოხილვაზე:

სტუმარი: ${review.guestName}
რეიტინგი: ${review.rating}/5
მიმოხილვა: "${review.text}"

პასუხი უნდა იყოს ${review.rating <= 2 ? "მოხდენისა და გაუმჯობესების შეთავაზებით" : "მადლობითა და მოწვევით"}.
დაწერეთ ქართულად თუ მიმოხილვა ქართულადაა, წინააღმდეგ შემთხვევაში ინგლისურად.`,
        language: language as "ka" | "en",
      });

      setSelectedReview({
        ...review,
        aiResponse: result.response,
        status: "pending",
      });
      setEditedResponse(result.response);
      toast.success(language === "ka" ? "AI პასუხი გენერირებულია!" : "AI response generated!");
    } catch (error) {
      toast.error(language === "ka" ? "შეცდომა გენერირებისას" : "Error generating response");
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleApprove = () => {
    if (!selectedReview) return;
    // In a real app, this would send the response to the OTA platform
    toast.success(
      language === "ka"
        ? "პასუხი დამტკიცებულია! (სიმულაცია)"
        : "Response approved! (Simulation)"
    );
    setSelectedReview({ ...selectedReview, status: "approved" });
  };

  const t = {
    title: language === "ka" ? "მიმოხილვების ავტო-პასუხი" : "Review Auto-Responder",
    subtitle: language === "ka" ? "AI-თი გენერირებული პასუხები მიმოხილვებზე" : "AI-generated responses to reviews",
    pending: language === "ka" ? "მომლოდინე" : "Pending",
    approved: language === "ka" ? "დამტკიცებული" : "Approved",
    sent: language === "ka" ? "გაგზავნილი" : "Sent",
    autoRespond: language === "ka" ? "ავტო-პასუხი" : "Auto-respond",
    generateResponse: language === "ka" ? "AI პასუხის გენერირება" : "Generate AI Response",
    approve: language === "ka" ? "დამტკიცება" : "Approve",
    edit: language === "ka" ? "რედაქტირება" : "Edit",
    noReviews: language === "ka" ? "პასუხის მომლოდინე მიმოხილვები არ არის" : "No reviews pending response",
    selectReview: language === "ka" ? "აირჩიეთ მიმოხილვა" : "Select a review",
    aiResponse: language === "ka" ? "AI პასუხი" : "AI Response",
    originalReview: language === "ka" ? "ორიგინალი მიმოხილვა" : "Original Review",
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-400 bg-green-500/20";
    if (rating >= 3) return "text-yellow-400 bg-yellow-500/20";
    return "text-red-400 bg-red-500/20";
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "booking":
      case "booking.com":
        return "🅱️";
      case "airbnb":
        return "🏠";
      case "tripadvisor":
        return "🦉";
      case "expedia":
        return "✈️";
      default:
        return "🔍";
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">{t.title}</CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">{t.autoRespond}</span>
              <Switch checked={autoRespond} onCheckedChange={setAutoRespond} />
            </div>
            <Button size="sm" variant="ghost" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Review List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-slate-300">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                {t.pending} ({pendingReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[400px]">
                {pendingReviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
                    <CheckCircle className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">{t.noReviews}</p>
                  </div>
                ) : (
                  pendingReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                        selectedReview?.id === review.id
                          ? "bg-purple-500/20 border border-purple-500/30"
                          : "bg-slate-700/50 hover:bg-slate-700"
                      }`}
                      onClick={() => {
                        setSelectedReview(review);
                        setEditedResponse(review.aiResponse || "");
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPlatformIcon(review.platform)}</span>
                          <span className="font-medium text-white text-sm">{review.guestName}</span>
                        </div>
                        <Badge className={getRatingColor(review.rating)}>
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {review.rating}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{review.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {review.date}
                        </span>
                        {review.rating <= 2 && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {language === "ka" ? "პრიორიტეტული" : "Priority"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Response Editor */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-slate-300">
                <Sparkles className="w-4 h-4 inline mr-2" />
                {t.aiResponse}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedReview ? (
                <div className="space-y-4">
                  {/* Original Review */}
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">{t.originalReview}:</p>
                    <p className="text-sm text-slate-300">"{selectedReview.text}"</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRatingColor(selectedReview.rating)}>
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {selectedReview.rating}/5
                      </Badge>
                      <span className="text-xs text-slate-500">— {selectedReview.guestName}</span>
                    </div>
                  </div>

                  {/* AI Response or Generate Button */}
                  {selectedReview.aiResponse || editedResponse ? (
                    <>
                      <Textarea
                        value={editedResponse}
                        onChange={(e) => setEditedResponse(e.target.value)}
                        className="min-h-[150px] bg-slate-700 border-slate-600 text-slate-200"
                        placeholder={language === "ka" ? "AI პასუხი..." : "AI response..."}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApprove}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          {t.approve}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => generateAIResponse(selectedReview)}
                          disabled={generatingFor === selectedReview.id}
                          className="border-slate-600"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${generatingFor === selectedReview.id ? "animate-spin" : ""}`} />
                          {language === "ka" ? "რეგენერაცია" : "Regenerate"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Button
                        onClick={() => generateAIResponse(selectedReview)}
                        disabled={generatingFor === selectedReview.id}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {generatingFor === selectedReview.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {language === "ka" ? "გენერირდება..." : "Generating..."}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t.generateResponse}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">{t.selectReview}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default OTAReviewAutoResponder;
