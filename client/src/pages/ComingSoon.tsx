import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ComingSoon() {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();
  
  const pageName = location
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "Page";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
          <Construction className="h-8 w-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {pageName}
          </h1>
          <p className="text-sm text-white/60">
            {language === 'ka' 
              ? "ეს მოდული მალე დაემატება" 
              : "This module will be available soon"}
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/")} className="mt-4">
          {language === 'ka' ? "უკან დაბრუნება" : "Go Back"}
        </Button>
      </div>
    </div>
  );
}
