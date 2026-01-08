import { Skeleton } from "@/components/ui/skeleton";

// Fast, lightweight loading skeleton that appears instantly
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a1628] p-6 animate-in fade-in duration-150">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg bg-[#1a2942]" />
          <div>
            <Skeleton className="h-8 w-48 mb-2 bg-[#1a2942]" />
            <Skeleton className="h-4 w-64 bg-[#1a2942]" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 bg-[#1a2942]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1a2942] rounded-xl p-4 border border-[#2a3f5f]">
            <Skeleton className="h-4 w-24 mb-2 bg-[#2a3f5f]" />
            <Skeleton className="h-8 w-32 bg-[#2a3f5f]" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1a2942] rounded-xl p-4 border border-[#2a3f5f]">
          <Skeleton className="h-6 w-48 mb-4 bg-[#2a3f5f]" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full bg-[#0d1829]" />
            ))}
          </div>
        </div>
        <div className="bg-[#1a2942] rounded-xl p-4 border border-[#2a3f5f]">
          <Skeleton className="h-6 w-32 mb-4 bg-[#2a3f5f]" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-[#0d1829]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal spinner for quick transitions
export function QuickSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Inline loading for buttons/small areas
export function InlineLoader() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>იტვირთება...</span>
    </div>
  );
}
