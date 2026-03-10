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
      nameKo: '헤마퓨어 포톤광양자 테라피', 
      nameEn: 'HemaPure Photon Therapy', 
      descKo: '독일에서 시작된 100년 역사의 프리미엄 혈액 테라피. 시간을 되돌리는 혈액 혁명, 당신의 삶을 바꿀 압도적인 안티에이징.',
      descEn: '100-year history of premium blood therapy from Germany. A blood revolution that turns back time, overwhelming anti-aging.',
      tag: 'ANTI-AGING',
      image: 'https://images.unsplash.com/photo-1579152276506-5d577f7bff5f?auto=format&fit=crop&q=80&w=600',
      link: 'https://drive.google.com/file/d/1moaNQ6A2PqeKBdyCc0mXAo1MVLuT3x_f/view?usp=drive_link'
    },
    { 
      nameKo: '인피니티웨이브 토탈케어', 
      nameEn: 'Infinity Wave Total Care', 
      descKo: '얼굴 브이라인 리프팅, 피부 재생 및 탄력 강화, 만성 염증 및 통증 근육 케어. 4세대 뷰티 디바이스의 새로운 체험.',
      descEn: 'V-line lifting, skin regeneration, elasticity, chronic inflammation and pain muscle care. 4th gen beauty device experience.',
      tag: 'BEAUTY TECH',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600',
      link: 'https://drive.google.com/file/d/1xRlV67pDpWrTCgi1L9abC5ouHeFbb9_F/view?usp=drive_link'
    },
    { 
      nameKo: '슬리미엄 다이어트 케어', 
      nameEn: 'Slimium Diet Care', 
      descKo: '마취가 필요없는 5세대 디바이스, 부작용 없는 강력한 비수술 다이어트 케어 프로그램. 마이크로 극초단파 리프팅.',
      descEn: '5th gen device, no anesthesia, non-surgical diet care with no side effects. Micro-microwave lifting for face and body.',
      tag: 'DIET',
      image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600',
      link: '#'
    },
    { 
      nameKo: '동안 리프팅 및 피부성형', 
      nameEn: 'Youth Lifting & Plastic Surgery', 
      descKo: '국내외 최고의 성형 리프팅 및 바디 컨투어링 전문의와 코 성형 대가 전문의의 진료 및 시/수술.',
      descEn: 'Treatment and surgery by top experts in plastic lifting, body contouring, and rhinoplasty.',
      tag: 'SURGERY',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600',
      link: 'https://gv-clinic.com/'
    },
    { 
      nameKo: '줄기세포 특화클리닉', 
      nameEn: 'Stem Cell Clinic', 
      descKo: '미라셀 및 美 하버드 IDI연구소 협력. 세계최고 줄기세포 추출 기술력으로 혈액/골수 줄기세포 치료.',
      descEn: 'Collaboration with Miracell and Harvard IDI. Blood/bone marrow stem cell therapy with world-class extraction tech.',
      tag: 'STEM CELL',
      image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
      link: 'https://www.cellpia.net/intro/'
    },
    { 
      nameKo: '제노시스항노화면역센터 암 치료', 
      nameEn: 'Genosis Cancer Care', 
      descKo: '국립암센터 항암신약개발사업단 임상개발본부장 종양내과전문의 서울대 김정용 박사 (암환자 실비 적용).',
      descEn: 'Dr. Jung-yong Kim (SNU), oncologist. Former head of clinical development at National Cancer Center.',
      tag: 'CANCER CARE',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
      link: 'https://blog.naver.com/post223'
    },
    { 
      nameKo: '악성 및 문제성 발톱 치료', 
      nameEn: 'Medical Pedicure', 
      descKo: '악성 무좀, 내성발톱, 조갑이영양증 치료. 메디컬페디큐어 서비스로 의료 및 미용 토탈 치료 (내성발톱 실비 적용).',
      descEn: 'Treatment for athlete\'s foot, ingrown nails, and nail dystrophy. Total medical pedicure service.',
      tag: 'FOOT CARE',
      image: 'https://images.unsplash.com/photo-1519415510236-8559b1985602?auto=format&fit=crop&q=80&w=600',
      link: 'https://k-doc.ai/ko/gv?view=hospital&id=h_1767850767491'
    },
    { 
      nameKo: '남성여성 성기능 강화', 
      nameEn: 'Sexual Health Enhancement', 
      descKo: '남성 전립선 보호 및 성기능 강화, 여성 자궁 보호 및 여성 건강 최적화 프로그램.',
      descEn: 'Male prostate protection and sexual enhancement, female uterine protection and health optimization.',
      tag: 'WELLNESS',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
      link: 'https://www.youtube.com/@genosis_clinic'
    }
  ];

  return (
    <div className="w-full mt-6 mb-2">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-[#111618] dark:text-white leading-tight">
          {language === 'ko' ? '첨단 재생 의료 및 웰니스 서비스' : 'Advanced Regenerative Medicine & Wellness Services'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {language === 'ko' ? '프리미엄 메디컬 & 웰니스 프로그램' : 'Exclusive Medical & Wellness Program'}
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
            
            <h3 className="font-bold text-[17px] text-[#111618] dark:text-white mb-2 leading-tight">
              {language === 'ko' ? brand.nameKo : brand.nameEn}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed flex-1">
              {language === 'ko' ? brand.descKo : brand.descEn}
            </p>

            <button 
              onClick={() => brand.link !== '#' && window.open(brand.link, '_blank')}
              className="mt-auto text-primary text-xs font-bold uppercase flex items-center gap-1 hover:opacity-80 transition-opacity self-start"
            >
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