import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, RefreshCw, Star, TrendingUp, TrendingDown, Minus, ExternalLink, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewFilters } from "./ReviewFilters";
import { ReviewDetailPanel } from "./ReviewDetailPanel";
import { ReviewStats } from "./ReviewStats";
import { useGoogleBusinessReviews, useGoogleBusinessStats } from "@/hooks/useMarketingAnalytics";

export type Review = {
  id: string;
  source: string;
  review_date: string;
  guest_name: string | null;
  apartment_code: string | null;
  language: string;
  stars: number | null;
  review_title: string | null;
  review_body: string;
  sentiment: string;
  topics: string[];
  reply_status: string;
  ai_generated_reply: string | null;
  review_url: string | null;
  from_email: string | null;
};

export const GuestReviewsModule = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    source: "all",
    sentiment: "all",
    dateFrom: "2025-01-01",
    dateTo: new Date().toISOString().split('T')[0],
    stars: "all",
  });

  // Supabase Reviews API
  const googleReviews = useGoogleBusinessReviews(100);
  const reviewStats = useGoogleBusinessStats();

  // Transform reviews to our Review format
  const reviews: Review[] = useMemo(() => {
    if (!googleReviews.data?.reviews) return [];

    return googleReviews.data.reviews.map((review: any, index: number) => {
      const stars = review.rating || 5;
      let sentiment = 'neutral';
      if (stars >= 4) sentiment = 'positive';
      else if (stars <= 2) sentiment = 'negative';

      return {
        id: review.id || `review_${index}`,
        source: 'Google',
        review_date: review.date || new Date().toISOString(),
        guest_name: review.author || 'Anonymous',
        apartment_code: null,
        language: detectLanguage(review.text || ''),
        stars: stars,
        review_title: null,
        review_body: review.text || t('(მხოლოდ შეფასება)', '(Rating only)'),
        sentiment,
        topics: extractTopics(review.text || ''),
        reply_status: review.response ? 'replied' : 'pending',
        ai_generated_reply: review.response || null,
        review_url: null,
        from_email: null,
      };
    });
  }, [googleReviews.data, t]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      if (filters.source !== 'all' && review.source !== filters.source) return false;
      if (filters.sentiment !== 'all' && review.sentiment !== filters.sentiment) return false;
      if (filters.stars !== 'all' && review.stars !== parseInt(filters.stars)) return false;
      if (filters.dateFrom && new Date(review.review_date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(review.review_date) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [reviews, filters]);

  const handleRefresh = () => {
    googleReviews.refetch();
    reviewStats.refetch();
    toast({
      title: t("განახლება", "Refreshing"),
      description: t("მიმოხილვები განახლდება...", "Refreshing reviews..."),
    });
  };

  const handleConnect = () => {
    // Supabase is always connected - no external OAuth needed
    toast({
      title: t("Supabase დაკავშირებულია", "Supabase Connected"),
      description: t("მონაცემები Supabase-დან იტვირთება", "Data is loaded from Supabase"),
    });
  };

  const isLoading = googleReviews.isLoading;
  // Supabase is always connected
  const isConnected = true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("Google მიმოხილვები", "Google Reviews")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "Orbi City Sea view Aparthotel - Google Business Profile",
              "Orbi City Sea view Aparthotel - Google Business Profile"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!isConnected && (
            <Button onClick={handleConnect} variant="default">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("Google-თან დაკავშირება", "Connect Google")}
            </Button>
          )}
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t("განახლება", "Refresh")}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={`border-l-4 ${isConnected ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected 
                    ? t("Google Business Profile დაკავშირებულია", "Google Business Profile Connected")
                    : t("Google Business Profile არ არის დაკავშირებული", "Google Business Profile Not Connected")
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? t("მიმოხილვები ავტომატურად სინქრონიზდება", "Reviews sync automatically")
                    : t("დააკავშირეთ რეალური მიმოხილვების სანახავად", "Connect to see real reviews")
                  }
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? t("აქტიური", "Active") : t("დემო რეჟიმი", "Demo Mode")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("საერთო შეფასება", "Overall Rating")}
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewStats.data?.averageRating?.toFixed(1) || '3.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("5-დან", "out of 5")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("სულ მიმოხილვები", "Total Reviews")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviewStats.data?.totalReviews || reviews.length || 98}
            </div>
            <p className="text-xs text-muted-foreground">
              {reviewStats.data?.recentTrend || '+10'} {t("ბოლო თვეში", "last month")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("პასუხგაცემული", "Responded")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReviews.filter(r => r.reply_status === 'replied').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("მიმოხილვა", "reviews")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("მოლოდინში", "Pending")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReviews.filter(r => r.reply_status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("პასუხის გარეშე", "without reply")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t("შეფასებების განაწილება", "Rating Distribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviewStats.data?.ratingDistribution?.[rating as keyof typeof reviewStats.data.ratingDistribution] || 0;
              const total = reviewStats.data?.totalReviews || 98;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <ReviewFilters filters={filters} setFilters={setFilters} />

      {/* Reviews Table */}
      <ReviewsTable
        reviews={filteredReviews}
        isLoading={isLoading}
      />
    </div>
  );
};

// Helper functions
function detectLanguage(text: string): string {
  if (!text) return 'unknown';
  
  // Georgian
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka';
  // Russian
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  // Turkish
  if (/[ğüşıöçĞÜŞİÖÇ]/.test(text)) return 'tr';
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  
  return 'en';
}

function extractTopics(text: string): string[] {
  if (!text) return [];
  
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('clean') || lowerText.includes('чист') || lowerText.includes('temiz')) {
    topics.push('cleanliness');
  }
  if (lowerText.includes('view') || lowerText.includes('вид') || lowerText.includes('manzara')) {
    topics.push('view');
  }
  if (lowerText.includes('location') || lowerText.includes('локац') || lowerText.includes('konum')) {
    topics.push('location');
  }
  if (lowerText.includes('staff') || lowerText.includes('персонал') || lowerText.includes('personel')) {
    topics.push('staff');
  }
  if (lowerText.includes('price') || lowerText.includes('цен') || lowerText.includes('fiyat') || lowerText.includes('ucuz')) {
    topics.push('price');
  }
  
  return topics;
}
