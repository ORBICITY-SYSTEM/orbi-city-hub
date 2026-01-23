import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ChannelManager() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <PageHeader
        title="Channel Manager"
        titleKa="არხების მენეჯერი"
        subtitle="Channel Manager overview and navigation"
        subtitleKa="არხების მენეჯერის მიმოხილვა და ნავიგაცია"
        icon={LinkIcon}
        iconGradient="from-blue-500 to-purple-600"
        dataSource={{ type: "live", source: "tRPC" }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
    </div>
  );
}
