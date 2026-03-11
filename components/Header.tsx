import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useFirebase } from '../FirebaseContext';
import { LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user, role, logout } = useFirebase();

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 pb-2 border-b border-transparent dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="px-2 py-1 rounded-md text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          {language === 'ko' ? 'EN' : '한글'}
        </button>
        {user && role === 'admin' && (
          <Link 
            to="/admin"
            className="p-2 text-gray-500 hover:text-primary transition-colors"
            title="관리자 대시보드"
          >
            <Settings size={18} />
          </Link>
        )}
      </div>
      
      <h2 className="text-[#111618] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
        MediBook
      </h2>
      
      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2">
            <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              )}
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};