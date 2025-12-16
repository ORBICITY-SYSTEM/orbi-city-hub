import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Copy, Send, X, Star } from "lucide-react";
import { format } from "date-fns";
import type { Review } from "./GuestReviewsModule";
import { useState } from "react";

interface ReviewDetailPanelProps {
  review: Review | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const ReviewDetailPanel = ({ review, onClose, onUpdate }: ReviewDetailPanelProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!review) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          {t("აირჩიეთ მიმოხილვა დეტალების სანახავად", "Select a review to view details")}
        </CardContent>
      </Card>
    );
  }

  const generateReply = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-review-reply", {
        body: { reviewId: review.id },
      });

      if (error) throw error;

      toast({
        title: t("პასუხი გენერირებულია", "Reply Generated"),
        description: t("AI-მ შექმნა პასუხი ამ მიმოხილვაზე", "AI has generated a reply to this review"),
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyReply = () => {
    if (review.ai_generated_reply) {
      navigator.clipboard.writeText(review.ai_generated_reply);
      toast({
        title: t("დაკოპირდა", "Copied"),
        description: t("პასუხი დაკოპირდა", "Reply copied to clipboard"),
      });
    }
  };

  const markAsReplied = async () => {
    try {
      const { error } = await supabase
        .from("guest_reviews")
        .update({ reply_status: "auto_replied" })
        .eq("id", review.id);

      if (error) throw error;

      toast({
        title: t("განახლდა", "Updated"),
        description: t("მიმოხილვა მონიშნულია როგორც პასუხგაცემული", "Review marked as replied"),
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{review.review_title || t("მიმოხილვა", "Review")}</CardTitle>
            <CardDescription>
              {review.guest_name || t("ანონიმი", "Anonymous")} • {format(new Date(review.review_date), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating and Sentiment */}
        <div className="flex items-center gap-4">
          {review.stars && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.stars! ? "fill-yellow-400 text-yellow-400" : "text-muted"
                  }`}
                />
              ))}
            </div>
          )}
          <Badge variant="outline" className={
            review.sentiment === "positive" ? "bg-success/10 text-success border-success/20" :
            review.sentiment === "negative" ? "bg-destructive/10 text-destructive border-destructive/20" :
            "bg-muted text-muted-foreground"
          }>
            {review.sentiment}
          </Badge>
        </div>

        {/* Topics */}
        {review.topics && review.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Review Body */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{t("მიმოხილვა", "Review")}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.review_body}</p>
        </div>

        {/* AI Generated Reply */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{t("AI პასუხი", "AI Reply")}</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={generateReply}
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t("გენერაცია", "Generate")}
            </Button>
          </div>
          {review.ai_generated_reply ? (
            <Textarea
              value={review.ai_generated_reply}
              readOnly
              rows={6}
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t("პასუხი ჯერ არ არის გენერირებული", "No reply generated yet")}
            </p>
          )}
        </div>

        {/* Actions */}
        {review.ai_generated_reply && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyReply} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              {t("კოპირება", "Copy")}
            </Button>
            <Button size="sm" onClick={markAsReplied} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {t("გაგზავნა", "Mark as Sent")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
