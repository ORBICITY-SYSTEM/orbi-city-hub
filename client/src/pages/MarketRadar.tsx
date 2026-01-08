import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar, TrendingUp, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MarketRadar() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Market Radar
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Radar className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </h1>
          <p className="text-muted-foreground">AI-powered competitor intelligence and market analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Market trend analysis will be displayed here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Competitor analysis will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
