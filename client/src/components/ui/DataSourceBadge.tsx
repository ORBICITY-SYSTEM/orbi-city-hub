/**
 * DataSourceBadge - Shows whether data is DEMO or LIVE
 *
 * Usage:
 * <DataSourceBadge type="demo" />  // Red badge
 * <DataSourceBadge type="live" />  // Green badge
 * <DataSourceBadge type="live" source="ROWS.COM" />  // With source name
 */

import { Badge } from "@/components/ui/badge";
import { Database, Wifi, WifiOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DataSourceBadgeProps {
  type: "demo" | "live" | "loading" | "error";
  source?: string; // e.g., "ROWS.COM", "Supabase", "OtelMS"
  size?: "sm" | "md";
  className?: string;
}

export function DataSourceBadge({ type, source, size = "sm", className = "" }: DataSourceBadgeProps) {
  const { language } = useLanguage();

  const configs = {
    demo: {
      label: language === "ka" ? "ᲓᲔᲛᲝ" : "DEMO",
      icon: WifiOff,
      className: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    },
    live: {
      label: language === "ka" ? "ᲚᲐᲘᲕ" : "LIVE",
      icon: Wifi,
      className: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
    },
    loading: {
      label: language === "ka" ? "იტვირთება..." : "Loading...",
      icon: Database,
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse",
    },
    error: {
      label: language === "ka" ? "შეცდომა" : "Error",
      icon: WifiOff,
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
  };

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} font-bold uppercase tracking-wider ${className}`}
    >
      <Icon className={size === "sm" ? "w-2.5 h-2.5 mr-1" : "w-3 h-3 mr-1"} />
      {config.label}
      {source && (
        <span className="ml-1 opacity-70 font-normal normal-case">
          ({source})
        </span>
      )}
    </Badge>
  );
}

export default DataSourceBadge;
