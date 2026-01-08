import { Switch } from "@/components/ui/switch";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Sparkles } from "lucide-react";

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="flex items-center gap-2 bg-[#1a2942] px-3 py-1.5 rounded-lg border border-[#2a3f5f]">
      <Sparkles className={`w-4 h-4 ${isDemoMode ? "text-amber-400" : "text-gray-500"}`} />
      <span className={`text-sm ${isDemoMode ? "text-amber-400" : "text-gray-400"}`}>Demo</span>
      <Switch 
        checked={isDemoMode} 
        onCheckedChange={toggleDemoMode}
        className="data-[state=checked]:bg-amber-500"
      />
    </div>
  );
}
