import React from 'react';
import { useLanguage } from '../LanguageContext';

interface ChatWidgetProps {
  kakaoLink?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ kakaoLink }) => {
  const { t } = useLanguage();
  const DEFAULT_KAKAO_LINK = 'https://open.kakao.com/o/sh2HOMki';
  const finalLink = kakaoLink || DEFAULT_KAKAO_LINK;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Tooltip */}
      <div 
        className="mb-3 w-48 bg-white dark:bg-[#1a2c36] p-3 rounded-xl rounded-tr-none shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
          {t.needHelp}
        </p>
      </div>

      {/* KakaoTalk Link Button */}
      <a 
        href={finalLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE500] text-[#3C1E1E] shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
        title="카카오톡 상담"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M12 3c-5.523 0-10 3.477-10 7.75 0 2.79 1.884 5.232 4.693 6.645l-.975 3.562c-.1.366.31.65.61.45l4.19-2.794c.48.057.97.087 1.482.087 5.523 0 10-3.477 10-7.75s-4.477-7.75-10-7.75z" />
        </svg>
      </a>
    </div>
  );
};
