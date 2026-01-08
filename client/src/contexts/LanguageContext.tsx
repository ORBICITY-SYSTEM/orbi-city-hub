import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { en, ka, type Translations } from "@/lib/translations";

type Language = "en" | "ka";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyOrKa: string, enText?: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsMap: Record<Language, Translations> = {
  en,
  ka,
};

// Helper to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return path; // Return the key if not found
    }
  }
  return typeof result === "string" ? result : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to Georgian
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("orbi-language");
      return (saved as Language) || "ka";
    }
    return "ka";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("orbi-language", lang);
    }
  };

  // Memoize translations based on language
  const translations = useMemo(() => translationsMap[language], [language]);
  
  /**
   * Translation function that supports two modes:
   * 1. Key-based: t("reviews.title") - looks up in translations object
   * 2. Inline: t("ქართული ტექსტი", "English text") - returns based on current language
   * 
   * The inline mode is detected by checking if the second argument exists.
   * This allows backward compatibility while transitioning to key-based translations.
   */
  const t = useMemo(() => {
    return (keyOrKa: string, enText?: string): string => {
      // If second argument provided, use inline mode (ka, en)
      if (enText !== undefined) {
        return language === "ka" ? keyOrKa : enText;
      }
      
      // Otherwise use key-based lookup from current language translations
      const currentTranslations = translationsMap[language];
      return getNestedValue(currentTranslations, keyOrKa);
    };
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    translations,
  }), [language, t, translations]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook for getting translation function
export function useTranslation() {
  const { t, language, translations } = useLanguage();
  return { t, language, translations };
}
