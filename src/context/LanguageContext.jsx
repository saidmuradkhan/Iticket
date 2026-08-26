import { createContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { translations } from "../i18n/translations";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useLocalStorage("language", "az");

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
