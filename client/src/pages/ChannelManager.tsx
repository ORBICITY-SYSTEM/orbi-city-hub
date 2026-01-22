import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

export default function ChannelManager() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{t("nav.channelManager")}</h1>
          <DataSourceBadge type="live" source="tRPC" size="md" />
        </div>
        <p className="text-muted-foreground">Channel Manager overview and navigation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/channel-manager/calendar">
          <Card className="cursor-pointer hover:bg-slate-800/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View reservations calendar</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/channel-manager/status">
          <Card className="cursor-pointer hover:bg-slate-800/50 transition-colors">
            <CardHeader>
              <CardTitle>Status Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View channel status</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/channel-manager/reports">
          <Card className="cursor-pointer hover:bg-slate-800/50 transition-colors">
            <CardHeader>
              <CardTitle>Reporting List</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View reports</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
