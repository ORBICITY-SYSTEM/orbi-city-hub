import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-cyan-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "ka")}
        className="bg-slate-800 border border-cyan-500/30 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
      >
        <option value="en">🇬🇧 EN</option>
        <option value="ka">🇬🇪 ქარ</option>
      </select>
    </div>
  );
}
