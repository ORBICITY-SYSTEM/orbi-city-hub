import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SampleDataBadgeProps {
  /**
   * Whether to show the badge (typically controlled by isDemoMode())
   */
  show?: boolean;
  /**
   * Custom tooltip text
   */
  tooltip?: string;
  /**
   * Badge variant
   */
  variant?: 'default' | 'compact';
}

/**
 * Badge to indicate sample/demo data in DEMO mode
 * 
 * Usage:
 * <SampleDataBadge show={isDemoMode()} />
 */
export function SampleDataBadge({ 
  show = true, 
  tooltip,
  variant = 'default'
}: SampleDataBadgeProps) {
  if (!show) return null;
  
  const defaultTooltip = "This is sample data to demonstrate the system. Your real data will sync after setup.";
  
  if (variant === 'compact') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-amber-700 bg-amber-100 rounded-full cursor-help">
            S
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip || defaultTooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full cursor-help transition-colors hover:bg-amber-100">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          Sample Data
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{tooltip || defaultTooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
