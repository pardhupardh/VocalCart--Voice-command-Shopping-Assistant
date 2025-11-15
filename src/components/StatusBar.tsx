import React from 'react';
import { Language } from '../src/types';
import { useTranslations } from '../hooks/useTranslations';

interface StatusBarProps {
  isListening: boolean;
  isLoading: boolean;
  transcript: string;
  message: string;
  error: string | null;
  language: Language;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isListening, isLoading, transcript, message, error, language }) => {
  const { t } = useTranslations(language);
  let displayMessage: string | React.ReactNode = message;
  let textColor = "text-gray-400";

  if (error) {
    displayMessage = error;
    textColor = "text-red-400";
  } else if (isListening) {
    displayMessage = transcript ? <span className="text-white">{`"${transcript}"`}</span> : t('statusListening');
    textColor = "text-gray-300";
  } else if (isLoading) {
    displayMessage = t('statusThinking');
    textColor = "text-blue-300";
  }

  return (
    <div className="h-14 flex items-center justify-center px-4 text-center">
      <p className={`text-sm md:text-base transition-colors duration-300 ${textColor}`}>
        {displayMessage}
      </p>
    </div>
  );
};
