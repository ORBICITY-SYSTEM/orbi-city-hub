import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, MessageSquare, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Review } from "./GuestReviewsModule";

interface ReviewStatsProps {
  reviews: Review[];
}

export const ReviewStats = ({ reviews }: ReviewStatsProps) => {
  const { t } = useLanguage();

  const totalReviews = reviews.length;
  const avgStars = reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / (totalReviews || 1);
  const positiveCount = reviews.filter((r) => r.sentiment === "positive").length;
  const negativeCount = reviews.filter((r) => r.sentiment === "negative").length;
  const newCount = reviews.filter((r) => r.reply_status === "new").length;

  const stats = [
    {
      title: t("სულ მიმოხილვები", "Total Reviews"),
      value: totalReviews,
      icon: MessageSquare,
      color: "text-primary",
    },
    {
      title: t("საშუალო რეიტინგი", "Avg Rating"),
      value: avgStars.toFixed(1),
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: t("დადებითი", "Positive"),
      value: `${((positiveCount / totalReviews) * 100).toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: t("პასუხის მოლოდინში", "Pending Reply"),
      value: newCount,
      icon: AlertCircle,
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
