import { useState, useCallback, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { useInstagramAnalytics } from "@/hooks/useInstagramAnalytics";
import { InstagramHeader } from "@/components/instagram/InstagramHeader";
import { MediaTypeFilter } from "@/components/instagram/MediaTypeFilter";
import { HeroKPICard } from "@/components/instagram/modules/HeroKPICard";
import { TimingModule } from "@/components/instagram/modules/TimingModule";
import { ThemesModule } from "@/components/instagram/modules/ThemesModule";
import { CalendarModule } from "@/components/instagram/modules/CalendarModule";
import { TopPostsModule } from "@/components/instagram/modules/TopPostsModule";
import { Users, Eye, Heart, MessageCircle, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange, Post, ThemeData, DayOfWeekPerformance, HourlyPerformance, DayHourCell } from "@/components/instagram/types";

export default function InstagramAnalytics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string[]>([]);

  const { data, isLoading, error, fetchData, syncFromRows, testConnection } = useInstagramAnalytics();

  // Fetch data when date range changes
  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange.from, dateRange.to, fetchData]);

  const metrics = data?.metrics || [];
  const posts = data?.posts || [];
  const summary = data?.summary || null;
  const weeklyStats = data?.weeklyStats || [];

  const hasData = (posts && posts.length > 0) || (metrics && metrics.length > 0);

  // Processed data
  const processedPosts = useMemo(() => {
    if (!posts) return [];
    
    let filtered = posts.filter((p) => {
      if (mediaTypeFilter.length > 0 && p.media_type) {
        return mediaTypeFilter.includes(p.media_type);
      }
      return true;
    });

    return filtered.map((p, idx) => ({
      id: String(p.id || idx),
      post_date: p.post_date || null,
      created_time: p.created_time ? new Date(p.created_time).toISOString() : null,
      media_type: p.media_type || null,
      theme: p.theme || null,
      caption: p.caption || null,
      likes: p.likes || null,
      reach: p.reach || null,
      comments: p.comments || null,
      saved: p.saved || null,
      follows: p.follows || null,
      post_url: p.post_url || null,
      media_url: p.media_url || null,
    } as Post));
  }, [posts, mediaTypeFilter]);

  const themeData: ThemeData[] = useMemo(() => {
    const themeMap: Record<string, { posts: Post[]; totalLikes: number; totalComments: number; totalReach: number }> = {};
    
    processedPosts.forEach(post => {
      if (!post.theme || post.theme === '#VALUE!') return;
      if (!themeMap[post.theme]) {
        themeMap[post.theme] = { posts: [], totalLikes: 0, totalComments: 0, totalReach: 0 };
      }
      themeMap[post.theme].posts.push(post);
      themeMap[post.theme].totalLikes += post.likes || 0;
      themeMap[post.theme].totalComments += post.comments || 0;
      themeMap[post.theme].totalReach += post.reach || 0;
    });

    return Object.entries(themeMap).map(([theme, data]) => ({
      theme,
      posts: data.posts.length,
      totalLikes: data.totalLikes,
      totalComments: data.totalComments,
      totalReach: data.totalReach,
      engagementRate: data.totalReach > 0 
        ? Number((((data.totalLikes + data.totalComments) / data.totalReach) * 100).toFixed(2))
        : 0,
    })).sort((a, b) => b.engagementRate - a.engagementRate);
  }, [processedPosts]);

  const mediaTypes = useMemo(() => {
    const types = new Set<string>();
    processedPosts.forEach(p => {
      if (p.media_type) types.add(p.media_type);
    });
    return Array.from(types).sort();
  }, [processedPosts]);

  // KPI Calculations
  const totalFollowers = summary?.total_follows || 0;
  const totalReach = useMemo(() => {
    return metrics?.reduce((sum, m) => sum + (m.reach || 0), 0) || 0;
  }, [metrics]);

  const totalLikes = useMemo(() => {
    return processedPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  }, [processedPosts]);

  const totalComments = useMemo(() => {
    return processedPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  }, [processedPosts]);

  const avgEngagementRate = summary?.engagement_rate ? Number(summary.engagement_rate) : 0;

  // Timing data (simplified - would need full calculation in production)
  const dayOfWeekPerformance: DayOfWeekPerformance[] = useMemo(() => {
    const dayMap: Record<number, { count: number; totalLikes: number; totalReach: number }> = {};
    
    processedPosts.forEach(post => {
      if (!post.post_date) return;
      const date = new Date(post.post_date);
      const dayIndex = date.getDay();
      
      if (!dayMap[dayIndex]) {
        dayMap[dayIndex] = { count: 0, totalLikes: 0, totalReach: 0 };
      }
      dayMap[dayIndex].count++;
      dayMap[dayIndex].totalLikes += post.likes || 0;
      dayMap[dayIndex].totalReach += post.reach || 0;
    });

    return [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
      const data = dayMap[dayIndex] || { count: 0, totalLikes: 0, totalReach: 0 };
      const dayNames = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
      const avgLikes = data.count > 0 ? data.totalLikes / data.count : 0;
      const avgReach = data.count > 0 ? data.totalReach / data.count : 0;
      const engagementRate = avgReach > 0 ? ((avgLikes + (data.totalLikes * 0.1)) / avgReach) * 100 : 0;
      
      return {
        day: dayNames[dayIndex],
        dayIndex,
        count: data.count,
        avgLikes: Math.round(avgLikes),
        avgReach: Math.round(avgReach),
        engagementRate: Number(engagementRate.toFixed(2)),
      };
    });
  }, [processedPosts]);

  const hourlyPerformance: HourlyPerformance[] = [];
  const dayHourPerformance: DayHourCell[] = [];

  // Handlers - exactly like harmony repo (using Supabase)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(dateRange);
    setIsRefreshing(false);
  }, [fetchData, dateRange]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setConnectionStatus(null);
    try {
      const success = await syncFromRows();
      if (success) {
        toast({
          title: "Sync Successful",
          description: "Data synchronized from Rows.com",
        });
        setConnectionStatus({ success: true, message: "Data synchronized successfully" });
        await fetchData(dateRange);
      } else {
        setConnectionStatus({ success: false, message: "Failed to sync data from Rows.com" });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [syncFromRows, fetchData, dateRange, toast]);

  // Handler - EXACTLY like harmony (async function, not callback)
  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      const result = await testConnection();
      setConnectionStatus(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setConnectionStatus({ success: false, message: msg });
    }
    setIsTesting(false);
  };

  const handleExport = useCallback(() => {
    if (!processedPosts.length) return;
    
    const headers = ['თარიღი', 'ტიპი', 'თემა', 'Likes', 'Reach', 'Comments', 'Saved', 'Follows', 'Caption', 'URL'];
    const rows = processedPosts.map(post => [
      post.post_date || '',
      post.media_type || '',
      post.theme || '',
      (post.likes || 0).toString(),
      (post.reach || 0).toString(),
      (post.comments || 0).toString(),
      (post.saved || 0).toString(),
      (post.follows || 0).toString(),
      `"${(post.caption || '').replace(/"/g, '""')}"`,
      post.post_url || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `instagram_posts_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processedPosts]);

  return (
    <div className="space-y-6 p-6">
      <InstagramHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        onTestConnection={handleTestConnection}
        onSync={handleSync}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isTesting={isTesting}
        isSyncing={isSyncing}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        hasData={hasData}
      />

      {/* Connection Status - exactly like harmony */}
      {connectionStatus && (
        <div className={`glass-card rounded-xl p-4 flex items-center gap-3 ${
          connectionStatus.success 
            ? 'border-success/30 bg-success/5' 
            : 'border-destructive/30 bg-destructive/5'
        }`}>
          {connectionStatus.success ? (
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          )}
          <p className={connectionStatus.success ? "text-success" : "text-destructive"}>
            {connectionStatus.message}
          </p>
        </div>
      )}

      {hasData ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HeroKPICard
              title="Followers"
              value={totalFollowers}
              icon={Users}
              isLoading={isLoading}
              gradient="from-blue-500 to-cyan-500"
            />
            <HeroKPICard
              title="Total Reach"
              value={totalReach}
              icon={Eye}
              isLoading={isLoading}
              gradient="from-cyan-500 to-blue-500"
            />
            <HeroKPICard
              title="Total Likes"
              value={totalLikes}
              icon={Heart}
              isLoading={isLoading}
              gradient="from-pink-500 to-rose-500"
            />
            <HeroKPICard
              title="Engagement Rate"
              value={avgEngagementRate}
              icon={TrendingUp}
              isLoading={isLoading}
              suffix="%"
              gradient="from-purple-500 to-indigo-500"
            />
          </div>

          {/* Media Type Filter */}
          {mediaTypes.length > 0 && (
            <MediaTypeFilter
              mediaTypes={mediaTypes}
              mediaTypeFilter={mediaTypeFilter}
              setMediaTypeFilter={setMediaTypeFilter}
            />
          )}

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimingModule
              dayOfWeekData={dayOfWeekPerformance}
              hourlyData={hourlyPerformance}
              heatmapData={dayHourPerformance}
              onExpand={() => {}}
            />
            <ThemesModule
              themeData={themeData}
              onExpand={() => {}}
              onSelectTheme={(theme) => setSelectedTheme(theme)}
            />
            <CalendarModule
              posts={processedPosts}
              onExpand={() => {}}
              onSelectPost={(post) => setSelectedPost(post)}
            />
            <TopPostsModule
              posts={processedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0))}
              onExpand={() => {}}
              onSelectPost={(post) => setSelectedPost(post)}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/60">
            {isLoading ? "Loading..." : "No data available. Please synchronize."}
          </p>
        </div>
      )}
    </div>
  );
}
