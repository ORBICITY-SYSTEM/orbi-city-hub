/**
 * RowsEmbed Component
 * Embeds Rows.com tables/charts into the application
 */

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RowsEmbedProps {
  /** Rows.com spreadsheet ID */
  spreadsheetId?: string;
  /** Rows.com table ID */
  tableId?: string;
  /** Chart ID (if embedding chart) */
  chartId?: string;
  /** Embed mode: 'table' or 'chart' */
  mode?: "table" | "chart";
  /** Title for the embed */
  title?: string;
  /** Description for the embed */
  description?: string;
  /** Height of the embed (in pixels or CSS value) */
  height?: string | number;
  /** Custom className */
  className?: string;
}

export function RowsEmbed({
  spreadsheetId,
  tableId,
  chartId,
  mode = "table",
  title,
  description,
  height = 600,
  className,
}: RowsEmbedProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get values from environment variables if not provided
  const finalSpreadsheetId = spreadsheetId || import.meta.env.VITE_ROWS_SPREADSHEET_ID;
  const finalTableId = tableId || import.meta.env.VITE_ROWS_CALENDAR_TABLE_ID;

  useEffect(() => {
    if (!finalSpreadsheetId) {
      setError("Rows.com Spreadsheet ID is not configured");
      setIsLoading(false);
      return;
    }

    if (mode === "table" && !finalTableId) {
      setError("Rows.com Table ID is not configured");
      setIsLoading(false);
      return;
    }

    if (mode === "chart" && !chartId) {
      setError("Rows.com Chart ID is required for chart mode");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Construct Rows.com embed URL
    let embedUrl: string;
    
    if (mode === "table" && finalTableId) {
      // Table embed URL format
      embedUrl = `https://rows.com/spreadsheets/${finalSpreadsheetId}/tables/${finalTableId}?embed=true`;
    } else if (mode === "chart" && chartId) {
      // Chart embed URL format
      embedUrl = `https://rows.com/spreadsheets/${finalSpreadsheetId}/charts/${chartId}?embed=true`;
    } else {
      // Fallback: full spreadsheet view
      embedUrl = `https://rows.com/spreadsheets/${finalSpreadsheetId}?embed=true`;
    }

    // Create iframe with timeout
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.style.width = "100%";
    iframe.style.height = typeof height === "number" ? `${height}px` : height;
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.allowFullscreen = true;
    
    // Set timeout (10 seconds)
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        if (retryCount < 3) {
          // Retry
          setRetryCount(prev => prev + 1);
          setIsLoading(false);
        } else {
          setError("Timeout loading Rows.com embed. Please check your connection.");
          setIsLoading(false);
        }
      }
    }, 10000);
    
    iframe.onload = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
    iframe.onerror = () => {
      clearTimeout(timeoutId);
      setError("Failed to load Rows.com embed");
      setIsLoading(false);
    };

    if (embedRef.current) {
      embedRef.current.innerHTML = "";
      embedRef.current.appendChild(iframe);
    }

    return () => {
      clearTimeout(timeoutId);
      if (embedRef.current) {
        embedRef.current.innerHTML = "";
      }
    };
  }, [finalSpreadsheetId, finalTableId, chartId, mode, height, retryCount]);

  if (error) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading Rows.com embed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        )}
        <div
          ref={embedRef}
          style={{
            width: "100%",
            height: typeof height === "number" ? `${height}px` : height,
            minHeight: typeof height === "number" ? `${height}px` : height,
          }}
          className="rounded-lg overflow-hidden"
        />
      </CardContent>
    </Card>
  );
}

/**
 * Convenience component for embedding Rows.com calendar
 */
export function RowsCalendarEmbed(props: Omit<RowsEmbedProps, "mode" | "tableId">) {
  const tableId = props.tableId || import.meta.env.VITE_ROWS_CALENDAR_TABLE_ID;
  return (
    <RowsEmbed
      {...props}
      mode="table"
      tableId={tableId}
      title={props.title || "Reservations Calendar"}
      description={props.description || "Live calendar from Rows.com"}
    />
  );
}

/**
 * Convenience component for embedding Rows.com status table
 */
export function RowsStatusEmbed(props: Omit<RowsEmbedProps, "mode" | "tableId">) {
  const tableId = props.tableId || import.meta.env.VITE_ROWS_STATUS_TABLE_ID;
  return (
    <RowsEmbed
      {...props}
      mode="table"
      tableId={tableId}
      title={props.title || "Reservations Status"}
      description={props.description || "Live status from Rows.com"}
    />
  );
}
