import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Mail, ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { useState } from "react";
import type { Review } from "./GuestReviewsModule";
import { ReviewDetailRow } from "./ReviewDetailRow";

interface ReviewsTableProps {
  reviews: Review[];
  isLoading: boolean;
}

// Helper function to extract platform name from email
const getPlatformFromEmail = (email: string | null): string => {
  if (!email) return "Gmail";
  
  const lowerEmail = email.toLowerCase();
  
  if (lowerEmail.includes("tripadvisor")) return "Tripadvisor";
  if (lowerEmail.includes("google") || lowerEmail.includes("businessprofile")) return "Google";
  if (lowerEmail.includes("booking")) return "Booking.com";
  if (lowerEmail.includes("airbnb")) return "Airbnb";
  if (lowerEmail.includes("facebook")) return "Facebook";
  if (lowerEmail.includes("expedia")) return "Expedia";
  if (lowerEmail.includes("hotels.com")) return "Hotels.com";
  
  // Extract domain name as fallback
  const match = email.match(/@([^.]+)\./);
  if (match) {
    return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  }
  
  return "Email";
};

const sentimentColors = {
  positive: "bg-success/10 text-success border-success/20",
  neutral: "bg-muted text-muted-foreground",
  negative: "bg-destructive/10 text-destructive border-destructive/20",
};

const replyStatusColors = {
  new: "bg-primary/10 text-primary border-primary/20",
  drafted: "bg-warning/10 text-warning border-warning/20",
  auto_replied: "bg-success/10 text-success border-success/20",
  manual_pending: "bg-muted text-muted-foreground",
  closed: "bg-muted text-muted-foreground",
};

export const ReviewsTable = ({ reviews, isLoading }: ReviewsTableProps) => {
  const { t } = useLanguage();
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const toggleExpand = (reviewId: string) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("მიმოხილვები არ მოიძებნა", "No reviews found")}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>{t("თარიღი", "Date")}</TableHead>
            <TableHead>{t("სტუმარი", "Guest")}</TableHead>
            <TableHead>{t("რეიტინგი", "Rating")}</TableHead>
            <TableHead>{t("სენტიმენტი", "Sentiment")}</TableHead>
            <TableHead>{t("პასუხგაცემული", "Reply Status")}</TableHead>
            <TableHead>{t("წყარო", "Source")}</TableHead>
            <TableHead>{t("გამომგზავნი", "Sender")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review, index) => {
            const hasReply = review.reply_status !== 'new' && review.reply_status !== 'manual_pending';
            const platformName = getPlatformFromEmail(review.from_email);
            const isExpanded = expandedReviewId === review.id;
            return (
              <>
                <TableRow 
                  key={review.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(review.id)}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {index + 1}
                    </div>
                  </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(review.review_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{review.guest_name || t("ანონიმი", "Anonymous")}</div>
                    {review.apartment_code && (
                      <div className="text-xs text-muted-foreground">{review.apartment_code}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {review.stars && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{review.stars}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={sentimentColors[review.sentiment as keyof typeof sentimentColors]}>
                    {t(
                      review.sentiment === "positive" ? "დადებითი" : review.sentiment === "negative" ? "უარყოფითი" : "ნეიტრალური",
                      review.sentiment
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={hasReply ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                    {hasReply ? t("კი", "Yes") : t("არა", "No")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{platformName}</span>
                  </div>
                </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {review.from_email || t("არ მოიძებნა", "N/A")}
                    </span>
                  </TableCell>
                </TableRow>
                {isExpanded && <ReviewDetailRow review={review} />}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
