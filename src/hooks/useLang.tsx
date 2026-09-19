import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, Translations, translations } from '@/lib/i18n';

interface LangContextType {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: 'ar',
  t: translations.ar,
  toggleLang: () => {},
  isRTL: true,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('edumk_lang') as Lang) || 'ar';
  });

  const t = translations[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('edumk_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [lang, isRTL]);

  const toggleLang = () => setLang((prev: Lang) => prev === 'ar' ? 'en' : 'ar');

  return (
    <LangContext.Provider value={{ lang, t, toggleLang, isRTL }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
