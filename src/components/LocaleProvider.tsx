"use client";

import React, { createContext, useContext, useState } from "react";
import locales, { Locale, Translations } from "@/data/locales";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'zh';
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    return savedLocale || "zh";
  });
  const [translations, setTranslations] = useState<Translations>(() => {
    if (typeof window === 'undefined') return locales.zh;
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    return locales[savedLocale as Locale] || locales.zh;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(locales[newLocale]);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[key] || key;

    // 如果有参数，替换文本中的参数
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return text;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleProvider;
