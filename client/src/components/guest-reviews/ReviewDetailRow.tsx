import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Review } from "./GuestReviewsModule";

interface ReviewDetailRowProps {
  review: Review;
}

export const ReviewDetailRow = ({ review }: ReviewDetailRowProps) => {
  const { t } = useLanguage();
  const [generatingReply, setGeneratingReply] = useState(false);
  const [generatedReply, setGeneratedReply] = useState(review.ai_generated_reply || "");

  const handleGenerateReply = async () => {
    setGeneratingReply(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-review-reply', {
        body: {
          reviewId: review.id,
          reviewBody: review.review_body,
          sentiment: review.sentiment,
          language: review.language,
          guestName: review.guest_name,
          stars: review.stars,
        },
      });

      if (error) throw error;

      if (data?.reply) {
        setGeneratedReply(data.reply);
        toast.success(t("პასუხი წარმატებით გენერირდა", "Reply generated successfully"));
      }
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error(t("შეცდომა პასუხის გენერირებისას", "Error generating reply"));
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(generatedReply);
    toast.success(t("პასუხი დაკოპირდა", "Reply copied to clipboard"));
  };

  return (
    <TableRow>
      <TableCell colSpan={8} className="bg-muted/30 p-6">
        <div className="space-y-4">
          {/* Review Title */}
          {review.review_title && (
            <div>
              <h4 className="font-semibold text-lg mb-2">{review.review_title}</h4>
            </div>
          )}

          {/* Review Body */}
          <Card className="p-4 bg-background">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.review_body}</p>
          </Card>

          {/* Topics */}
          {review.topics && review.topics.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{t("თემები", "Topics")}:</p>
              <div className="flex flex-wrap gap-2">
                {review.topics.map((topic, idx) => (
                  <Badge key={idx} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Generated Reply Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("AI პასუხი", "AI Generated Reply")}
              </h5>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateReply}
                  disabled={generatingReply}
                  size="sm"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatingReply
                    ? t("გენერირდება...", "Generating...")
                    : generatedReply
                    ? t("ხელახალი გენერირება", "Regenerate")
                    : t("პასუხის გენერირება", "Generate Reply")}
                </Button>
                {generatedReply && (
                  <Button onClick={handleCopyReply} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    {t("კოპირება", "Copy")}
                  </Button>
                )}
              </div>
            </div>

            {generatedReply ? (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedReply}</p>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t("პასუხი ჯერ არ არის გენერირებული", "No reply generated yet")}
              </p>
            )}
          </div>

          {/* Review URL */}
          {review.review_url && (
            <div className="border-t pt-4">
              <a
                href={review.review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t("მიმოხილვის ნახვა პლატფორმაზე", "View review on platform")} →
              </a>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
