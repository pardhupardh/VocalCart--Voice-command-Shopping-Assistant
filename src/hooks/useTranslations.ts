
import { useCallback } from 'react';

import { Language } from '../src/types';
import { translations } from "../translations";


export const useTranslations = (language: Language) => {
  const t = useCallback((key: string, ...args: any[]): string => {
    const langTranslations = translations[language] || translations['en-US'];
    const translation = langTranslations[key as keyof typeof langTranslations];

    if (typeof translation === 'function') {
      return (translation as Function)(...args);
    }
    
    if (typeof translation === 'string') {
      return translation;
    }
    
    // Fallback for missing keys, using English as default
    console.warn(`Translation key "${key}" not found for language "${language}".`);
    const fallbackTranslations = translations['en-US'];
    const fallback = fallbackTranslations[key as keyof typeof fallbackTranslations];
    if (typeof fallback === 'function') {
        return (fallback as Function)(...args);
    }
    return fallback || key;

  }, [language]);

  return { t };
};
