import { useState, useMemo } from "react";
import { CalendarDays, ChevronRight, ChevronLeft, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ka } from "date-fns/locale";
import { DAY_NAMES, type Post } from "../types";

interface CalendarModuleProps {
  posts: Post[];
  onExpand: () => void;
  onSelectPost: (post: Post) => void;
}

export const CalendarModule = ({ 
  posts, 
  onExpand,
  onSelectPost 
}: CalendarModuleProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group posts by date
  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.forEach(post => {
      if (!post.post_date) return;
      const dateKey = post.post_date.split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(post);
    });
    return map;
  }, [posts]);

  // Get days of current month
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get starting day offset
  const startOffset = getDay(startOfMonth(currentMonth));

  // Get max posts per day for color scaling
  const maxPosts = useMemo(() => {
    return Math.max(...Object.values(postsByDate).map(p => p.length), 1);
  }, [postsByDate]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthPosts = monthDays.flatMap(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return postsByDate[dateKey] || [];
    });
    return {
      posts: monthPosts.length,
      likes: monthPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
      reach: monthPosts.reduce((sum, p) => sum + (p.reach || 0), 0),
    };
  }, [monthDays, postsByDate]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-700/10';
    const ratio = count / maxPosts;
    if (ratio >= 0.7) return 'bg-cyan-500/70';
    if (ratio >= 0.4) return 'bg-cyan-500/40';
    return 'bg-cyan-500/20';
  };

  return (
    <div 
      className="bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer group hover:border-amber-500/50 transition-all"
      onClick={onExpand}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">აქტივობის რუკა</h3>
            <p className="text-xs text-white/60">კონტენტ კალენდარი</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonth(subMonths(currentMonth, 1));
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-white">
            {format(currentMonth, 'LLLL yyyy', { locale: ka })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonth(addMonths(currentMonth, 1));
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mini Calendar */}
        <div className="space-y-1">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5">
            {DAY_NAMES.map((day, i) => (
              <div key={i} className="text-center text-[9px] text-white/60">
                {day.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {monthDays.map(date => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayPosts = postsByDate[dateKey] || [];
              return (
                <div
                  key={dateKey}
                  className={`aspect-square rounded-sm flex items-center justify-center text-[9px] ${getColorClass(dayPosts.length)} ${dayPosts.length > 0 ? 'text-white font-medium' : 'text-white/40'}`}
                >
                  {format(date, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-slate-900/50">
            <p className="text-sm font-bold text-white">{monthStats.posts}</p>
            <p className="text-[10px] text-white/60">პოსტი</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-900/50">
            <p className="text-sm font-bold text-pink-500 flex items-center justify-center gap-1">
              <Heart className="h-3 w-3" />
              {monthStats.likes >= 1000 ? `${(monthStats.likes/1000).toFixed(1)}K` : monthStats.likes}
            </p>
            <p className="text-[10px] text-white/60">Likes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-900/50">
            <p className="text-sm font-bold text-cyan-400 flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" />
              {monthStats.reach >= 1000 ? `${(monthStats.reach/1000).toFixed(1)}K` : monthStats.reach}
            </p>
            <p className="text-[10px] text-white/60">Reach</p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-white/60 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <span>სრული კალენდარი</span>
            <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
};
