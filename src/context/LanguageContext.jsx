import { createContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { translations } from "../i18n/translations";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useLocalStorage("language", "az");

  const t = (key, params) => {
    const dict = translations[language] || translations.az;
    let str = dict[key] ?? translations.az[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        str = str.replaceAll(`{${name}}`, String(value));
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
