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
  Send,
  Sparkles,
  Clock,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Platform config
const platformConfig: Record<string, { name: string; color: string; bgColor: string; icon: string }> = {
  google: { name: "Google", color: "text-blue-600", bgColor: "bg-blue-500/10 border-blue-500/20", icon: "G" },
  booking: { name: "Booking.com", color: "text-blue-800", bgColor: "bg-blue-800/10 border-blue-800/20", icon: "B" },
  airbnb: { name: "Airbnb", color: "text-rose-500", bgColor: "bg-rose-500/10 border-rose-500/20", icon: "A" },
  tripadvisor: { name: "TripAdvisor", color: "text-green-600", bgColor: "bg-green-500/10 border-green-500/20", icon: "T" },
  expedia: { name: "Expedia", color: "text-yellow-600", bgColor: "bg-yellow-500/10 border-yellow-500/20", icon: "E" },
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

  const approveMutation = trpc.butler.approve.useMutation({
    onSuccess: (data) => {
      toast({
        title: t("დადასტურდა!", "Approved!"),
        description: data.n8nResult?.sent 
          ? t("პასუხი გაიგზავნა N8N-ში", "Response sent to N8N")
          : t("პასუხი შენახულია", "Response saved"),
      });
      onApprove?.();
    },
    onError: (error) => {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: t("განახლდა!", "Regenerated!"),
        description: t("ახალი პასუხი დაგენერირდა", "New response generated"),
      });
    },
    onError: () => {
      setIsRegenerating(false);
    },
  });

  const handleApprove = () => {
    approveMutation.mutate({
      taskId: task.id,
      modifiedContent: isEditing ? { responseText: editedResponse } : undefined,
      sendToN8N: true,
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
    regenerateMutation.mutate({ taskId: task.id });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedResponse);
    toast({
      title: t("დაკოპირდა!", "Copied!"),
      description: t("პასუხი დაკოპირდა", "Response copied to clipboard"),
    });
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={cn("h-8", isEditing && "bg-accent/20")}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
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
              onChange={(e) => setEditedResponse(e.target.value)}
              className="min-h-[150px] bg-background/50"
              placeholder={t("შეცვალეთ პასუხი...", "Edit response...")}
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {editedResponse}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            {t("უარყოფა", "Reject")}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-accent/30 hover:bg-accent/10"
            >
              <Copy className="h-4 w-4 mr-1" />
              {t("კოპირება", "Copy")}
            </Button>
            
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
            >
              {approveMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {t("დადასტურება & გაგზავნა", "Approve & Send")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIReviewResponseCard;
