import { createContext, useContext, ReactNode } from "react";

interface LanguageContextType {
  t: (georgian: string, english: string) => string;
  language: "ka" | "en";
  setLanguage: (lang: "ka" | "en") => void;
}

const LanguageContext = createContext<LanguageContextType>({
  t: (georgian: string) => georgian, // Default to Georgian
  language: "ka",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const t = (georgian: string, english: string) => georgian; // Always return Georgian for now
  
  return (
    <LanguageContext.Provider value={{ t, language: "ka", setLanguage: () => {} }}>
      {children}
    </LanguageContext.Provider>
  );
};
