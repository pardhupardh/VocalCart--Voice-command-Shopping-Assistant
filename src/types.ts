export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  isRemoving?: boolean;
  isModified?: boolean;
}

export type Category = 'Produce' | 'Dairy' | 'Meat' | 'Pantry' | 'Frozen' | 'Household' | 'Other';

export type Language = 'en-US' | 'es-ES';

export interface LanguageOption {
  code: Language;
  name: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
];

export const getInitialLanguage = (): Language => {
  // Check localStorage for a saved language preference first
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedLang = localStorage.getItem('vocalcart-lang');
    if (savedLang === 'en-US' || savedLang === 'es-ES') {
      return savedLang;
    }
  }

  // If no saved preference, try to detect browser language
  if (typeof window !== 'undefined' && window.navigator) {
    const browserLang = navigator.language.split('-')[0]; // e.g., 'es' from 'es-MX'
    if (browserLang === 'es') {
      return 'es-ES';
    }
  }
  
  // Default to English
  return 'en-US';
};