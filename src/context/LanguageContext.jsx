import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { readText, writeText } from '../utils/storage.js';
const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [lang, updateLang] = useState(() => readText('uw_lang', 'id') === 'en' ? 'en' : 'id');
  const setLang = useCallback(value => updateLang(prev => {
    const next = typeof value === 'function' ? value(prev) : value;
    return next === 'en' ? 'en' : 'id';
  }), []);
  const toggleLang = useCallback(() => setLang(value => value === 'en' ? 'id' : 'en'), [setLang]);
  useEffect(() => { document.documentElement.lang = lang; writeText('uw_lang', lang); }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { return useContext(LanguageContext); }
