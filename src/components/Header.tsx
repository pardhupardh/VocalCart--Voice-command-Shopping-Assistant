import React from 'react';
import {Language, SUPPORTED_LANGUAGES } from "../types";

import { GlobeIcon, LogoIcon } from './Icons';
import { useTranslations } from '../hooks/useTranslations';

interface HeaderProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const { t } = useTranslations(language);

  return (
    <header className="p-4 flex justify-between items-center text-white border-b border-white/10">
      <div className="flex items-center gap-3">
        <LogoIcon className="w-8 h-8 text-emerald-400" />
        <h1 className="text-xl md:text-2xl font-bold font-poppins tracking-tight">{t('vocalCartTitle')}</h1>
      </div>
      <div className="relative">
        <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-white"
          aria-label={t('selectLanguageLabel')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-black bg-gray-800">
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
