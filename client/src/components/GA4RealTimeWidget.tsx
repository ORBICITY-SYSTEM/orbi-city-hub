import { useEffect } from 'react';
import { Activity, Eye, MousePointer } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function GA4RealTimeWidget() {
  const { data, refetch } = trpc.google.getRealTimeMetrics.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Live Website Traffic</h3>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Active Users */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
          <Activity className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-3xl font-bold text-blue-600">
            {data?.activeUsers || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active Users</div>
        </div>

        {/* Page Views */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
          <Eye className="w-8 h-8 text-purple-600 mb-2" />
          <div className="text-3xl font-bold text-purple-600">
            {data?.screenPageViews || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Page Views</div>
        </div>

        {/* Events */}
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
          <MousePointer className="w-8 h-8 text-green-600 mb-2" />
          <div className="text-3xl font-bold text-green-600">
            {data?.eventCount || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Events</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Updates every 30 seconds • Powered by Google Analytics 4
      </div>
    </div>
  );
}
