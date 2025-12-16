import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface DateRange {
  from: Date;
  to: Date;
}

interface FinanceDateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function FinanceDateRangePicker({ dateRange, onDateRangeChange }: FinanceDateRangePickerProps) {
  const { language } = useLanguage();

  const presets = [
    { label: language === 'ka' ? 'ბოლო 30 დღე' : 'Last 30 Days', days: 30 },
    { label: language === 'ka' ? 'ბოლო 3 თვე' : 'Last 3 Months', days: 90 },
    { label: language === 'ka' ? 'იან-სექ 2025' : 'Jan-Sep 2025', custom: { from: new Date('2025-01-01'), to: new Date('2025-09-30') } },
    { label: language === 'ka' ? 'ამ წელს' : 'This Year', custom: { from: new Date(new Date().getFullYear(), 0, 1), to: new Date() } },
  ];

  const handlePreset = (preset: typeof presets[0]) => {
    if (preset.custom) {
      onDateRangeChange(preset.custom);
    } else {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - preset.days);
      onDateRangeChange({ from, to });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">
        {language === 'ka' ? 'პერიოდი:' : 'Period:'}
      </span>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => handlePreset(preset)}
        >
          {preset.label}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.from, 'PP')} - {format(dateRange.to, 'PP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3">
            <div>
              <div className="text-sm font-medium mb-2">
                {language === 'ka' ? 'დან' : 'From'}
              </div>
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => date && onDateRangeChange({ ...dateRange, from: date })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">
                {language === 'ka' ? 'მდე' : 'To'}
              </div>
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => date && onDateRangeChange({ ...dateRange, to: date })}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
