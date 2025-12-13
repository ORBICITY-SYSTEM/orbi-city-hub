/**
 * Demo Mode Badge - Displayed in header when APP_MODE=demo
 * 
 * Shows a prominent badge to indicate the user is in demo/sales mode
 */
export function DemoModeBadge() {
  // In production, this would check process.env.VITE_APP_MODE
  // For now, we'll add the logic when we integrate with the mode system
  const isDemoMode = import.meta.env.VITE_APP_MODE === 'demo';
  
  if (!isDemoMode) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>🎯 DEMO MODE</span>
      </div>
    </div>
  );
}
