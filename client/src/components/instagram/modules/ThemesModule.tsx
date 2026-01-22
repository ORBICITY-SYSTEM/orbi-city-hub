import { Tag, ChevronRight, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ThemeData } from "../types";

interface ThemesModuleProps {
  themeData: ThemeData[];
  onExpand: () => void;
  onSelectTheme: (theme: string) => void;
}

export const ThemesModule = ({ 
  themeData, 
  onExpand,
  onSelectTheme 
}: ThemesModuleProps) => {
  const topThemes = themeData.slice(0, 3);
  const maxEngagement = Math.max(...topThemes.map(t => t.engagementRate), 1);

  const getThemeColor = (index: number) => {
    const colors = [
      'from-violet-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-cyan-500 to-blue-500',
    ];
    return colors[index] || colors[0];
  };

  return (
    <div 
      className="bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer group hover:border-violet-500/50 transition-all"
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">რა თემები მუშაობს?</h3>
            <p className="text-xs text-white/60">კონტენტის კატეგორიები</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {topThemes.length > 0 ? (
          <div className="space-y-3">
            {topThemes.map((theme, index) => (
              <div 
                key={theme.theme}
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 hover:border-violet-500/50 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTheme(theme.theme);
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getThemeColor(index)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate text-white">{theme.theme}</p>
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>{theme.engagementRate}%</span>
                      </div>
                    </div>
                    <Progress 
                      value={(theme.engagementRate / maxEngagement) * 100} 
                      className="h-1.5"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      {theme.posts} პოსტი • {theme.totalLikes.toLocaleString()} likes
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-white/60">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">თემები არ არის</p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-white/60 flex items-center gap-1 group-hover:text-violet-400 transition-colors">
            <span>ყველა თემა ({themeData.length})</span>
            <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
};
