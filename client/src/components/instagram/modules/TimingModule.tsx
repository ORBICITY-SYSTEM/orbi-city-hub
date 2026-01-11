import { Clock, TrendingUp, ChevronRight } from "lucide-react";
import { DAY_NAMES, type DayOfWeekPerformance, type HourlyPerformance, type DayHourCell } from "../types";

interface TimingModuleProps {
  dayOfWeekData: DayOfWeekPerformance[];
  hourlyData: HourlyPerformance[];
  heatmapData: DayHourCell[];
  onExpand: () => void;
}

export const TimingModule = ({ 
  dayOfWeekData, 
  hourlyData, 
  heatmapData,
  onExpand 
}: TimingModuleProps) => {
  // Find best day
  const bestDay = dayOfWeekData.reduce((best, day) => 
    day.engagementRate > (best?.engagementRate || 0) ? day : best
  , dayOfWeekData[0]);

  // Find best hour
  const bestHour = hourlyData.reduce((best, hour) => 
    hour.engagementRate > (best?.engagementRate || 0) ? hour : best
  , hourlyData[0]);

  // Create mini heatmap grid (simplified 7x4 for visibility)
  const hourGroups = [
    { label: "დილა", hours: [6, 7, 8, 9, 10, 11] },
    { label: "შუადღე", hours: [12, 13, 14, 15, 16, 17] },
    { label: "საღამო", hours: [18, 19, 20, 21, 22, 23] },
  ];

  const getHeatmapColor = (dayIndex: number, hourGroup: number[]) => {
    const cells = heatmapData.filter(
      c => c.dayIndex === dayIndex && hourGroup.includes(c.hour)
    );
    if (cells.length === 0) return 'bg-slate-700/20';
    const avgEngagement = cells.reduce((sum, c) => sum + c.engagementRate, 0) / cells.length;
    if (avgEngagement >= 5) return 'bg-cyan-500/80';
    if (avgEngagement >= 3) return 'bg-cyan-500/50';
    if (avgEngagement >= 1) return 'bg-cyan-500/30';
    return 'bg-cyan-500/10';
  };

  return (
    <div 
      className="bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer group hover:border-cyan-500/50 transition-all"
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">როდის დავპოსტოთ?</h3>
            <p className="text-xs text-white/60">საუკეთესო დროის ანალიზი</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Best Time Badges */}
        <div className="flex gap-3">
          {bestDay && (
            <div className="flex-1 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-white/60 mb-1">საუკეთესო დღე</p>
              <p className="font-bold text-lg text-cyan-400">{bestDay.day}</p>
              <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>{bestDay.engagementRate}%</span>
              </div>
            </div>
          )}
          {bestHour && (
            <div className="flex-1 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-white/60 mb-1">საუკეთესო საათი</p>
              <p className="font-bold text-lg text-cyan-400">{bestHour.hourLabel}</p>
              <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>{bestHour.engagementRate}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Mini Heatmap */}
        <div className="space-y-2">
          <p className="text-xs text-white/60">აქტივობის რუკა</p>
          <div className="grid grid-cols-8 gap-1 text-[10px]">
            {/* Header row */}
            <div></div>
            {DAY_NAMES.map((day, i) => (
              <div key={i} className="text-center text-white/60 truncate">
                {day.slice(0, 2)}
              </div>
            ))}
            
            {/* Data rows */}
            {hourGroups.map((group, gi) => (
              <>
                <div key={`label-${gi}`} className="text-white/60 flex items-center">
                  {group.label.slice(0, 3)}
                </div>
                {DAY_NAMES.map((_, di) => (
                  <div 
                    key={`cell-${gi}-${di}`}
                    className={`aspect-square rounded-sm ${getHeatmapColor(di, group.hours)} transition-colors`}
                  />
                ))}
              </>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-white/60 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
            <span>სრული ანალიზი</span>
            <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
};
