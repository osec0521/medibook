import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, LanguageContextType } from './types';
import { TRANSLATIONS } from './constants';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko'); // Default to Korean
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('1'); // Default to first hospital

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, selectedHospitalId, setSelectedHospitalId, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};