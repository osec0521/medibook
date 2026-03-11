import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HospitalList } from './components/HospitalList';
import { LocationMap } from './components/LocationMap';
import { BookingForm } from './components/BookingForm';
import { ChatWidget } from './components/ChatWidget';
import { BrandShowcase } from './components/BrandShowcase';
import { AdminDashboard } from './components/AdminDashboard';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { FirebaseProvider, useFirebase } from './FirebaseContext';

const MainContent: React.FC = () => {
  const { t } = useLanguage();
  const { user, login, loading } = useFirebase();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">MediBook</h1>
        <p className="text-gray-600 mb-8">서비스를 이용하시려면 로그인이 필요합니다.</p>
        <button 
          onClick={login}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all"
        >
          Google로 로그인하기
        </button>
      </div>
    );
  }

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
    <FirebaseProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </FirebaseProvider>
  );
};

export default App;