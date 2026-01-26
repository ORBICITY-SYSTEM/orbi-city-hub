import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Instagram, 
  RefreshCw, 
  CalendarIcon,
  Download,
  Plug,
  FileDown,
  Waves,
  FileText,
  FlaskConical,
  Bot,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import type { DateRange } from "./types";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";

interface InstagramHeaderProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onTestConnection: () => void;
  onSync: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onExportPDF?: () => void;
  onOpenABTesting?: () => void;
  onOpenAIAgent?: () => void;
  onOpenContentCalendar?: () => void;
  isTesting: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isExportingPDF?: boolean;
  hasData: boolean;
}

export const InstagramHeader = ({
  dateRange,
  setDateRange,
  onTestConnection,
  onSync,
  onRefresh,
  onExport,
  onExportPDF,
  onOpenABTesting,
  onOpenAIAgent,
  onOpenContentCalendar,
  isTesting,
  isSyncing,
  isLoading,
  isRefreshing,
  isExportingPDF,
  hasData,
}: InstagramHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(210,50%,8%)] via-[hsl(200,55%,12%)] to-[hsl(190,60%,15%)]">
        {/* Wave Layer 1 */}
        <svg 
          className="absolute bottom-0 left-0 w-[200%] h-24 opacity-20 animate-[wave_8s_ease-in-out_infinite]"
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,100 600,20 900,60 C1200,100 1200,100 1200,100 L1200,120 L0,120 Z" 
            fill="url(#wave-gradient-1)"
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(185, 85%, 50%)" />
              <stop offset="50%" stopColor="hsl(195, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(170, 70%, 45%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Wave Layer 2 */}
        <svg 
          className="absolute bottom-0 left-0 w-[200%] h-20 opacity-15 animate-[wave_12s_ease-in-out_infinite_reverse]"
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,80 C200,40 400,100 600,60 C800,20 1000,80 1200,40 L1200,120 L0,120 Z" 
            fill="url(#wave-gradient-2)"
          />
          <defs>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(170, 70%, 45%)" />
              <stop offset="100%" stopColor="hsl(185, 85%, 50%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Wave Layer 3 - Subtle */}
        <svg 
          className="absolute bottom-0 left-0 w-[200%] h-16 opacity-10 animate-[wave_15s_ease-in-out_infinite]"
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,40 C150,80 350,20 550,60 C750,100 950,40 1200,80 L1200,120 L0,120 Z" 
            fill="hsl(195, 100%, 60%)"
          />
        </svg>

        {/* Floating Bubbles */}
        <div className="absolute top-4 left-[10%] w-2 h-2 rounded-full bg-primary/30 animate-[float_4s_ease-in-out_infinite]" />
        <div className="absolute top-8 left-[25%] w-3 h-3 rounded-full bg-accent/20 animate-[float_6s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-6 right-[20%] w-2 h-2 rounded-full bg-info/25 animate-[float_5s_ease-in-out_infinite_1s]" />
        <div className="absolute top-12 right-[35%] w-1.5 h-1.5 rounded-full bg-primary/20 animate-[float_7s_ease-in-out_infinite_2s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="icon-3d w-14 h-14 rounded-2xl shadow-lg shadow-primary/30">
                <Instagram className="h-7 w-7 text-white relative z-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center shadow-lg shadow-success/50">
                <Waves className="h-3 w-3 text-success-foreground" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
                  Instagram Analytics
                </h1>
                <DataSourceBadge type="live" source="Supabase" size="md" />
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
                Synced from Supabase
              </p>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex items-center gap-3 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="justify-start text-left font-normal bg-card/30 backdrop-blur-md border-border/30 hover:bg-card/50 hover:border-primary/30 transition-all shadow-lg"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd.MM.yy")} - {format(dateRange.to, "dd.MM.yy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd.MM.yy")
                    )
                  ) : (
                    "All Dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card border-border/50" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
                {(dateRange.from || dateRange.to) && (
                  <div className="p-3 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={onTestConnection} 
              disabled={isTesting}
              variant="secondary"
              className="bg-secondary/50 backdrop-blur-md hover:bg-secondary border border-border/30 shadow-lg"
            >
              <Plug className={`h-4 w-4 mr-2 ${isTesting ? 'animate-pulse text-primary' : ''}`} />
              Test
            </Button>

            <Button 
              onClick={onSync} 
              disabled={isSyncing}
              variant="outline"
              className="bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 hover:border-primary/30 shadow-lg"
            >
              <Download className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-bounce text-primary' : ''}`} />
              Sync
            </Button>
            
            <Button 
              onClick={onRefresh} 
              disabled={isLoading || isRefreshing}
              variant="outline"
              className="bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 hover:border-primary/30 shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              Refresh
            </Button>

            {hasData && (
              <>
                {/* AI Agent Button - Featured */}
                <Button 
                  onClick={onOpenAIAgent}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 animate-pulse hover:animate-none"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Agent
                </Button>

                <Button 
                  onClick={onOpenABTesting}
                  variant="outline"
                  className="bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 hover:border-amber-500/30 shadow-lg"
                >
                  <FlaskConical className="h-4 w-4 mr-2 text-amber-500" />
                  A/B Test
                </Button>

                <Button 
                  onClick={onExportPDF}
                  disabled={isExportingPDF}
                  variant="outline"
                  className="bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 hover:border-rose-500/30 shadow-lg"
                >
                  <FileText className={`h-4 w-4 mr-2 text-rose-500 ${isExportingPDF ? 'animate-pulse' : ''}`} />
                  PDF
                </Button>

                <Button 
                  onClick={onExport}
                  variant="outline"
                  className="bg-card/30 backdrop-blur-md hover:bg-card/50 border-border/30 hover:border-primary/30 shadow-lg"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  CSV
                </Button>

                <Button 
                  onClick={onOpenContentCalendar}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  კალენდარი
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};
