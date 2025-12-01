import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, RefreshCw, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewFilters } from "./ReviewFilters";
import { ReviewDetailPanel } from "./ReviewDetailPanel";
import { ReviewStats } from "./ReviewStats";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [filters, setFilters] = useState({
    source: "all",
    sentiment: "all",
    dateFrom: "2025-01-01",
    dateTo: new Date().toISOString().split('T')[0],
    stars: "all",
  });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("guest_reviews")
        .select("*")
        .order("review_date", { ascending: false });

      if (filters.source !== "all") {
        query = query.eq("source", filters.source);
      }
      if (filters.sentiment !== "all") {
        query = query.eq("sentiment", filters.sentiment);
      }
      if (filters.stars !== "all") {
        query = query.eq("stars", parseInt(filters.stars));
      }
      if (filters.dateFrom) {
        query = query.gte("review_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("review_date", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importGmailReviews = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-gmail-reviews");

      if (error) throw error;

      toast({
        title: t("წარმატება", "Success"),
        description: t(
          `${data.imported} მიმოხილვა იმპორტირებულია, ${data.skipped} გამოტოვებულია`,
          `${data.imported} reviews imported, ${data.skipped} skipped`
        ),
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: t("შეცდომა", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("სტუმრების მიმოხილვები", "Guest Reviews")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "ცენტრალიზებული სისტემა ყველა არხიდან მიმოხილვების მართვისთვის",
              "Centralized review management from all sources"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReviews} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t("განახლება", "Refresh")}
          </Button>
          <Button onClick={importGmailReviews} disabled={isImporting}>
            <Download className="mr-2 h-4 w-4" />
            {t("Gmail-დან იმპორტი", "Import from Gmail")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ReviewStats reviews={reviews} />

      {/* Filters */}
      <ReviewFilters filters={filters} setFilters={setFilters} />

      {/* Reviews Table */}
      <ReviewsTable
        reviews={reviews}
        isLoading={isLoading}
      />
    </div>
  );
};
