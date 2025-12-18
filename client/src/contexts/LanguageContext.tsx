import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { en, ka, type Translations } from "@/lib/translations";

type Language = "en" | "ka";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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

  const translations = translationsMap[language];
  
  // Translation function that supports dot notation for nested keys
  const t = useCallback((key: string): string => {
    return getNestedValue(translations, key);
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
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
