import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  Star,
  RefreshCw,
  Check,
  X,
  Copy,
  Edit3,
  Sparkles,
  Clock,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Platform config with OTA URLs
const platformConfig: Record<string, { 
  name: string; 
  color: string; 
  bgColor: string; 
  icon: string;
  reviewUrl?: string;
}> = {
  google: { 
    name: "Google", 
    color: "text-blue-600", 
    bgColor: "bg-blue-500/10 border-blue-500/20", 
    icon: "G",
    reviewUrl: "https://business.google.com/reviews"
  },
  booking: { 
    name: "Booking.com", 
    color: "text-blue-800", 
    bgColor: "bg-blue-800/10 border-blue-800/20", 
    icon: "B",
    reviewUrl: "https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html"
  },
  airbnb: { 
    name: "Airbnb", 
    color: "text-rose-500", 
    bgColor: "bg-rose-500/10 border-rose-500/20", 
    icon: "A",
    reviewUrl: "https://www.airbnb.com/hosting/reviews"
  },
  tripadvisor: { 
    name: "TripAdvisor", 
    color: "text-green-600", 
    bgColor: "bg-green-500/10 border-green-500/20", 
    icon: "T",
    reviewUrl: "https://www.tripadvisor.com/Owners"
  },
  expedia: { 
    name: "Expedia", 
    color: "text-yellow-600", 
    bgColor: "bg-yellow-500/10 border-yellow-500/20", 
    icon: "E",
    reviewUrl: "https://apps.expediapartnercentral.com/lodging/reviews"
  },
};

// Priority config
const priorityConfig: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  urgent: { label: "სასწრაფო", color: "bg-red-500 text-white", icon: AlertTriangle },
  high: { label: "მაღალი", color: "bg-orange-500 text-white", icon: Clock },
  medium: { label: "საშუალო", color: "bg-blue-500 text-white", icon: Clock },
  low: { label: "დაბალი", color: "bg-gray-500 text-white", icon: Clock },
};

interface AIReviewResponseCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: string;
    status: string;
    ai_suggestion: {
      reviewId: number;
      responseText: string;
      language: string;
      source: string;
      reviewerName: string;
      rating: number;
      originalReview: string;
    };
    context?: {
      source: string;
      externalId?: string;
      reviewDate: string;
    };
    created_at: string;
  };
  onApprove?: () => void;
  onReject?: () => void;
}

export function AIReviewResponseCard({ task, onApprove, onReject }: AIReviewResponseCardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(task.ai_suggestion.responseText);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  // Mark as done mutation - this updates AI memory and statistics
  const markDoneMutation = trpc.butler.markResponseDone.useMutation({
    onSuccess: (data) => {
      toast({
        title: t("დასრულდა! ✅", "Done! ✅"),
        description: t(
          "პასუხი დაფიქსირდა, სტატისტიკა განახლდა", 
          "Response recorded, statistics updated"
        ),
      });
      onApprove?.();
    },
    onError: (error) => {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
      setIsMarkingDone(false);
    },
  });

  const rejectMutation = trpc.butler.reject.useMutation({
    onSuccess: () => {
      toast({
        title: t("უარყოფილია", "Rejected"),
        description: t("Task უარყოფილია", "Task has been rejected"),
      });
      onReject?.();
    },
  });

  const regenerateMutation = trpc.butler.regenerateResponse.useMutation({
    onSuccess: (data) => {
      setEditedResponse(data.newResponse);
      setIsRegenerating(false);
      setIsCopied(false); // Reset copy state when regenerated
      toast({
        title: t("განახლდა!", "Regenerated!"),
        description: t("ახალი პასუხი დაგენერირდა", "New response generated"),
      });
    },
    onError: () => {
      setIsRegenerating(false);
    },
  });

  // Step 1: Copy response
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedResponse);
      setIsCopied(true);
      toast({
        title: t("დაკოპირდა! 📋", "Copied! 📋"),
        description: t(
          "ახლა გახსენით OTA და ჩასვით პასუხი", 
          "Now open OTA and paste the response"
        ),
      });
    } catch (err) {
      toast({
        title: t("შეცდომა", "Error"),
        description: t("კოპირება ვერ მოხერხდა", "Failed to copy"),
        variant: "destructive",
      });
    }
  };

  // Step 2: Open OTA link
  const handleOpenOTA = () => {
    const platform = platformConfig[task.ai_suggestion.source?.toLowerCase()];
    if (platform?.reviewUrl) {
      window.open(platform.reviewUrl, '_blank');
    }
  };

  // Step 3: Mark as Done
  const handleMarkDone = () => {
    setIsMarkingDone(true);
    markDoneMutation.mutate({
      taskId: task.id,
      responseText: editedResponse,
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({
      taskId: task.id,
      reason: "Rejected by manager",
    });
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setIsCopied(false);
    regenerateMutation.mutate({ taskId: task.id });
  };

  const { ai_suggestion } = task;
  const platform = platformConfig[ai_suggestion.source?.toLowerCase()] || platformConfig.google;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const PriorityIcon = priority.icon;

  // Render stars
  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );

  return (
    <Card className="overflow-hidden border-l-4 border-l-accent shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-card to-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Platform Badge */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border",
              platform.bgColor,
              platform.color
            )}>
              {platform.icon}
            </div>
            
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{ai_suggestion.reviewerName}</span>
                {renderStars(ai_suggestion.rating)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="outline" className={cn("text-xs", platform.bgColor, platform.color)}>
                  {platform.name}
                </Badge>
                <Badge className={cn("text-xs", priority.color)}>
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {priority.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className={cn("h-8", isEditing && "bg-accent/20")}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Original Review */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <MessageSquare className="h-4 w-4" />
            {t("ორიგინალი მიმოხილვა", "Original Review")}
          </div>
          <p className="text-sm leading-relaxed">
            "{ai_suggestion.originalReview}"
          </p>
        </div>

        {/* AI Generated Response */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Sparkles className="h-4 w-4" />
              {t("AI-ს პასუხი", "AI Response")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="h-7 text-xs"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRegenerating && "animate-spin")} />
              {t("ახალი ვარიანტი", "Regenerate")}
            </Button>
          </div>
          
          {isEditing ? (
            <Textarea
              value={editedResponse}
              onChange={(e) => {
                setEditedResponse(e.target.value);
                setIsCopied(false);
              }}
              className="min-h-[150px] bg-background/50"
              placeholder={t("შეცვალეთ პასუხი...", "Edit response...")}
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {editedResponse}
            </p>
          )}
        </div>

        {/* Simple 3-Step Workflow for Manager */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-3">
            {t("მარტივი 3 ნაბიჯი:", "Simple 3 Steps:")}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Step 1: Copy */}
            <Button
              size="lg"
              variant={isCopied ? "outline" : "default"}
              onClick={handleCopy}
              className={cn(
                "flex-1 min-w-[140px] h-12 text-base font-semibold transition-all",
                isCopied 
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
              )}
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {t("დაკოპირდა!", "Copied!")}
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  {t("1. კოპირება", "1. Copy")}
                </>
              )}
            </Button>

            {/* Step 2: Open OTA */}
            <Button
              size="lg"
              variant="outline"
              onClick={handleOpenOTA}
              disabled={!platform.reviewUrl}
              className="flex-1 min-w-[140px] h-12 text-base font-semibold border-2 border-accent hover:bg-accent/10"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              {t("2. გახსნა", "2. Open")} {platform.name}
            </Button>

            {/* Step 3: Mark Done */}
            <Button
              size="lg"
              onClick={handleMarkDone}
              disabled={isMarkingDone || markDoneMutation.isPending}
              className={cn(
                "flex-1 min-w-[140px] h-12 text-base font-semibold shadow-lg",
                "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              )}
            >
              {isMarkingDone || markDoneMutation.isPending ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              {t("3. დასრულდა!", "3. Done!")}
            </Button>
          </div>
        </div>

        {/* Reject Button (smaller, less prominent) */}
        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            {t("გამოტოვება", "Skip")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIReviewResponseCard;
