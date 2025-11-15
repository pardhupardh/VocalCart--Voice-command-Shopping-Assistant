import React from 'react';
import { SparklesIcon } from './Icons';
import { Language } from '../src/types';
import { useTranslations } from '../hooks/useTranslations';


interface SuggestionsProps {
  suggestions: string[];
  onAdd: (itemName: string) => void;
  language: Language;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onAdd, language }) => {
  const { t } = useTranslations(language);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-500/10 backdrop-blur-sm rounded-xl border border-white/10">
      <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2 font-poppins">
        <SparklesIcon className="w-5 h-5 text-yellow-400" />
        {t('suggestionsTitle')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onAdd(suggestion)}
            className="px-3 py-1.5 text-sm bg-white/10 rounded-full hover:bg-emerald-500/30 transition-colors text-emerald-300"
          >
            + {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
