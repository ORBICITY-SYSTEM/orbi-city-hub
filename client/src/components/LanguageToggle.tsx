import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {language === 'ka' ? 'KA 🇬🇪' : 'EN 🇬🇧'}
    </Button>
  );
};
