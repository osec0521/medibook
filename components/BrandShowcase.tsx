import React, { useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

export const BrandShowcase: React.FC = () => {
  const { language } = useLanguage();
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback image if the specific brand image fails to load
    e.currentTarget.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600';
  };
  
  const brands = [
    { 
      nameKo: '휴먼셀바이오', 
      nameEn: 'Humancell Bio', 
      descKo: '선도적인 세포 치료 연구 및 개인 맞춤형 바이오 건강 솔루션.',
      descEn: 'Leading cellular therapy research and personalized biological health solutions.',
      tag: 'PREMIUM BIO',
      // Abstract cells/research
      image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      nameKo: '첨단재생의료', 
      nameEn: 'Adv. Regenerative Med', 
      descKo: '최첨단 재생 치료를 제공하는 프라이빗 메디컬 & 웰니스 라운지.',
      descEn: 'Exclusive Medical & Wellness Lounges offering cutting-edge regenerative treatments.',
      tag: 'ADVANCED',
      // Modern clean architecture
      image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      nameKo: '미토셀클리닉 전국 프랜차이즈', 
      nameEn: 'Mitocell Clinic National Franchise', 
      descKo: '전문 항노화 및 미토콘드리아 회춘 치료 센터.',
      descEn: 'Expert regenerative medicine focusing on mitochondrial health and anti-aging.',
      tag: 'CLINIC',
      // Clinic interior
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      nameKo: '신라웰케어라운지', 
      nameEn: 'Shilla Well Care', 
      descKo: '럭셔리하고 편안한 환경에서 제공되는 프리미엄 헬스케어 서비스.',
      descEn: 'Premium healthcare services provided in a luxurious and relaxing environment.',
      tag: 'WELLNESS',
      // Relaxing spa/lounge
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600' 
    }
  ];

  return (
    <div className="w-full mt-6 mb-2">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-[#111618] dark:text-white leading-tight">
          {language === 'ko' ? '첨단 재생 의료' : 'Advanced Regenerative Medicine'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {language === 'ko' ? '프리미엄 메디컬 & 웰니스 라운지' : 'Exclusive Medical & Wellness Lounges'}
        </p>
      </div>

      <div 
        ref={sliderRef}
        className={`flex overflow-x-auto no-scrollbar pl-4 gap-4 snap-x snap-mandatory pb-4 ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {brands.map((brand, index) => (
          <div 
            key={index} 
            className="min-w-[260px] max-w-[260px] bg-white dark:bg-[#1a2c36] border border-gray-200 dark:border-gray-800 rounded-2xl p-3 flex flex-col snap-center shadow-sm hover:shadow-md transition-shadow select-none"
          >
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 group bg-gray-100 dark:bg-gray-700">
              <img 
                src={brand.image} 
                alt={language === 'ko' ? brand.nameKo : brand.nameEn}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={handleImageError}
              />
              <div className="absolute top-3 left-3 bg-[#0EA5E9] text-white text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider shadow-sm">
                {brand.tag}
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-[#111618] dark:text-white mb-2 leading-tight">
              {language === 'ko' ? brand.nameKo : brand.nameEn}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed flex-1">
              {language === 'ko' ? brand.descKo : brand.descEn}
            </p>

            <button className="mt-auto text-primary text-xs font-bold uppercase flex items-center gap-1 hover:opacity-80 transition-opacity self-start">
              {language === 'ko' ? '자세히 보기' : 'LEARN MORE'}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        ))}
        {/* Spacer for right padding */}
        <div className="w-2 shrink-0"></div>
      </div>
    </div>
  );
};