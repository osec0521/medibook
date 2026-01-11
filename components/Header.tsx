import React from 'react';
import { useLanguage } from '../LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 pb-2 border-b border-transparent dark:border-gray-800 transition-colors">
      <button 
        type="button"
        onClick={toggleFullScreen}
        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        aria-label={t.menu}
      >
        <span className="material-symbols-outlined text-[#111618] dark:text-white">menu</span>
      </button>
      
      <h2 className="text-[#111618] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
        MediBook
      </h2>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="px-2 py-1 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          {language === 'ko' ? 'EN' : '한글'}
        </button>
        <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          <span className="material-symbols-outlined text-primary text-sm">person</span>
        </div>
      </div>
    </header>
  );
};