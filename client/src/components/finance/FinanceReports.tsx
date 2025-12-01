import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export const FinanceReports = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const { data: summaries, refetch } = useQuery({
    queryKey: ['monthly-summaries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      return data || [];
    }
  });

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('generate-finance-summary', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast({
        title: t("წარმატებით შეიქმნა", "Successfully generated"),
        description: t("თვიური ანგარიში მზადაა", "Monthly report is ready")
      });

      refetch();
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: t("შეცდომა", "Error"),
        description: t("ანგარიშის შექმნა ვერ მოხერხდა", "Failed to generate report"),
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t("თვიური ანგარიშები", "Monthly Reports")}
        </h3>
        <Button onClick={generateSummary} disabled={generating}>
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t("GPT ანგარიშის შექმნა", "Generate GPT Report")}
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {summaries?.map((summary) => (
            <Card key={summary.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {t(
                      `${summary.year} წლის ${summary.month} თვე`,
                      `${new Date(summary.year, summary.month - 1).toLocaleString('en', { month: 'long' })} ${summary.year}`
                    )}
                  </span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t("გადმოწერა", "Download")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("შემოსავალი", "Revenue")}
                    </p>
                    <p className="text-lg font-bold text-success">
                      €{parseFloat(summary.total_revenue as any || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ხარჯები", "Expenses")}
                    </p>
                    <p className="text-lg font-bold text-destructive">
                      €{parseFloat(summary.total_expenses as any || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("მოგება", "Profit")}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      €{parseFloat(summary.net_profit as any || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ოკუპაცია", "Occupancy")}
                    </p>
                    <p className="text-lg font-bold text-ocean">
                      {parseFloat(summary.occupancy as any || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ADR", "ADR")}
                    </p>
                    <p className="text-lg font-bold text-accent">
                      €{parseFloat(summary.adr as any || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {language === 'ka' && summary.summary_ka && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{summary.summary_ka}</p>
                  </div>
                )}

                {language === 'en' && summary.summary_en && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{summary.summary_en}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
