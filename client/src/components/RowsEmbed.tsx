import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS_CALENDAR_URL = import.meta.env.VITE_ROWS_CALENDAR_URL || "";
const ROWS_STATUS_URL = import.meta.env.VITE_ROWS_STATUS_URL || "";

export function RowsCalendarEmbed() {
  const { t } = useLanguage();

  if (!ROWS_CALENDAR_URL) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            {t("კალენდარი", "Calendar")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Table2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {t(
                "Rows.com კალენდარი არ არის კონფიგურირებული",
                "Rows.com calendar is not configured"
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(
                "დააყენეთ VITE_ROWS_CALENDAR_URL გარემოს ცვლადი",
                "Set VITE_ROWS_CALENDAR_URL environment variable"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Table2 className="h-5 w-5" />
          {t("კალენდარი - Rows.com", "Calendar - Rows.com")}
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href={ROWS_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("გახსნა", "Open")}
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border">
          <iframe
            src={ROWS_CALENDAR_URL}
            className="w-full h-full"
            title="Rows Calendar"
            allow="clipboard-write"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function RowsStatusEmbed() {
  const { t } = useLanguage();

  if (!ROWS_STATUS_URL) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            {t("სტატუსი", "Status")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Table2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {t(
                "Rows.com სტატუსი არ არის კონფიგურირებული",
                "Rows.com status is not configured"
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(
                "დააყენეთ VITE_ROWS_STATUS_URL გარემოს ცვლადი",
                "Set VITE_ROWS_STATUS_URL environment variable"
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Table2 className="h-5 w-5" />
          {t("სტატუსი - Rows.com", "Status - Rows.com")}
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href={ROWS_STATUS_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("გახსნა", "Open")}
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border">
          <iframe
            src={ROWS_STATUS_URL}
            className="w-full h-full"
            title="Rows Status"
            allow="clipboard-write"
          />
        </div>
      </CardContent>
    </Card>
  );
}
