import React from 'react';
import { MicIcon, StopIcon } from './Icons';
import { Language } from '../src/types';
import { useTranslations } from '../hooks/useTranslations';


interface VoiceControlButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled: boolean;
  language: Language;
}

export const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({ isListening, onClick, disabled, language }) => {
  const { t } = useTranslations(language);

  return (
    <div className="flex items-center justify-center p-4 bg-black/30 backdrop-blur-md border-t border-white/10">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg
          ${ isListening ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400 shadow-red-500/30' : 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 shadow-emerald-500/30' }
          ${ disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105' }`}
          aria-label={isListening ? t('stopListeningLabel') : t('startListeningLabel')}
        >
          {isListening && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          )}
          <div className="z-10 text-white">
            {isListening ? <StopIcon className="w-10 h-10"/> : <MicIcon className="w-10 h-10" />}
          </div>
        </button>
    </div>
  );
};
