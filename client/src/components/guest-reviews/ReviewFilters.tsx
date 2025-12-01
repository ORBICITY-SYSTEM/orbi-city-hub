import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewFiltersProps {
  filters: {
    source: string;
    sentiment: string;
    dateFrom: string;
    dateTo: string;
    stars: string;
  };
  setFilters: (filters: any) => void;
}

export const ReviewFilters = ({ filters, setFilters }: ReviewFiltersProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>{t("წყარო", "Source")}</Label>
            <Select 
              value={filters.source} 
              onValueChange={(value) => setFilters({ ...filters, source: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("ყველა", "All")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა", "All")}</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="booking">Booking.com</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("სენტიმენტი", "Sentiment")}</Label>
            <Select 
              value={filters.sentiment} 
              onValueChange={(value) => setFilters({ ...filters, sentiment: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("ყველა", "All")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ყველა", "All")}</SelectItem>
                <SelectItem value="positive">{t("დადებითი", "Positive")}</SelectItem>
                <SelectItem value="neutral">{t("ნეიტრალური", "Neutral")}</SelectItem>
                <SelectItem value="negative">{t("უარყოფითი", "Negative")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("რეიტინგი", "Stars")}</Label>
            <Select 
              value={filters.stars} 
              onValueChange={(value) => setFilters({ ...filters, stars: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("ყველა", "All")} />
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
          </div>

          <div className="space-y-2">
            <Label>{t("დან", "From")}</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("მდე", "To")}</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
