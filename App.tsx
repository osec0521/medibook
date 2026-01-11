import React from 'react';
import { Header } from './components/Header';
import { HospitalList } from './components/HospitalList';
import { LocationMap } from './components/LocationMap';
import { BookingForm } from './components/BookingForm';
import { ChatWidget } from './components/ChatWidget';
import { BrandShowcase } from './components/BrandShowcase';
import { LanguageProvider, useLanguage } from './LanguageContext';

const MainContent: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden mx-auto max-w-md bg-background-light dark:bg-background-dark pb-24 shadow-2xl transition-colors duration-200">
      <Header />
      
      <main>
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-[#111618] dark:text-white tracking-tight text-[32px] font-bold leading-tight text-left mb-2">
            {t.findBook}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
            {t.scheduleVisit}
          </p>
        </div>

        <BrandShowcase />

        <HospitalList />
        
        <LocationMap />
        
        <BookingForm />
      </main>

      <ChatWidget />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
};

export default App;