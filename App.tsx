import React, { useEffect, useState } from 'react'; // useState 추가
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { ExternalLink, Copy, Check } from 'lucide-react'; // 아이콘 추가
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
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
  const { tenantId } = useParams();
  const { t } = useLanguage();
  const { user, login, loading } = useFirebase();
  const [copied, setCopied] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const targetTenantId = tenantId || 'tomatok';
        const q = query(collection(db, 'partners'), where('tenantId', '==', targetTenantId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setPartnerInfo(snapshot.docs[0].data());
        } else {
          setPartnerInfo(null);
        }
      } catch (error) {
        console.error("Error fetching partner info:", error);
        setPartnerInfo(null);
      }
    };
    fetchPartner();
  }, [tenantId]);

  useEffect(() => {
    if (partnerInfo?.seoTitle) {
      document.title = partnerInfo.seoTitle;
    } else {
      document.title = 'MediBook - Medical & Wellness Booking';
    }
  }, [partnerInfo]);

  const openExternalBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const currentUrl = window.location.href;

    if (userAgent.includes('kakaotalk')) {
      window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(currentUrl)}`;
    } else if (userAgent.includes('line')) {
      const sep = currentUrl.includes('?') ? '&' : '?';
      window.location.href = `${currentUrl}${sep}openExternalBrowser=1`;
    } else if (userAgent.includes('android')) {
      // 안드로이드 크롬 강제 실행 인텐트
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } else {
      // iOS 등 기타 브라우저: 새 창 열기 시도 및 복사 안내
      window.open(currentUrl, '_blank');
      handleCopy();
    }
  };

  const handleCopy = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers or restricted environments
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed');
      }
      document.body.removeChild(textArea);
    });
  };
  
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
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all w-[310px] mb-4"
        >
          Google로 로그인하기
        </button>
        
        {/* 카카오톡/인앱 브라우저 대응 버튼 영역 */}
        <div className="flex flex-col gap-3 w-[310px] mb-8">
          <button 
            onClick={openExternalBrowser}
            className="bg-[#FEE500] text-[#191919] px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-[#FADA0A] transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            다른 브라우저로 열기
          </button>
          
          <button 
            onClick={handleCopy}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? '주소가 복사되었습니다' : '페이지 주소 복사하기'}
          </button>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px]">
          카카오톡 등 인앱 브라우저에서는 구글 로그인이 제한될 수 있습니다. <br/>
          오류가 발생하면 우측 상단 <b>'...'</b> 버튼을 눌러 <b>'다른 브라우저로 열기'</b>를 선택하거나 위의 버튼을 이용해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden mx-auto max-w-md bg-background-light dark:bg-background-dark pb-24 shadow-2xl transition-colors duration-200">
      <Header />
      
      <main>
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-[#111618] dark:text-white tracking-tight text-[32px] font-bold leading-tight text-left mb-2 break-keep">
            {partnerInfo?.displayTitle || t.findBook}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
            {t.scheduleVisit}
          </p>
        </div>

        <BrandShowcase />

        <HospitalList />
        
        <LocationMap />
        
        <BookingForm tenantId={tenantId || 'tomatok'} />
      </main>

      <ChatWidget kakaoLink={partnerInfo?.kakaoLink} />
    </div>
  );
}

const App: React.FC = () => {
  // [강화된 자동 탈출 로직]
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const currentUrl = window.location.href;

    // 1. 카카오톡 내부 브라우저인 경우
    if (userAgent.includes('kakaotalk')) {
      // 카카오톡 전용 외부 브라우저 호출 스킴 실행
      window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(currentUrl)}`;
      return; // 실행 후 아래 로직 중단
    }

    // 2. 기타 인앱 브라우저 (인스타, 페이스북, 라인 등) + 안드로이드 환경
    const isInApp = /instagram|line|fbav|fb_iab|messenger|naver/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    if (isInApp && isAndroid) {
      // 안드로이드 크롬 강제 실행 인텐트
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    }
    
    // 3. iOS 인앱 브라우저의 경우 (정책상 강제 실행 불가)
    // 이 경우는 MainContent에서 보여주는 "다른 브라우저로 열기" 안내가 최선입니다.
  }, []);
  // --- 추가 끝 ---
  return (
    <FirebaseProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/:tenantId" element={<MainContent />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </FirebaseProvider>
  );
};

export default App;