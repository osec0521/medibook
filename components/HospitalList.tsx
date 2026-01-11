import React, { useRef, useState } from 'react';
import { HOSPITALS } from '../constants';
import { useLanguage } from '../LanguageContext';

export const HospitalList: React.FC = () => {
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
    const walk = (x - startX) * 2; // scroll-fast
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="w-full mt-4 group">
      <div 
        ref={sliderRef}
        className={`flex overflow-x-auto no-scrollbar pb-4 pl-4 gap-4 snap-x snap-mandatory ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {HOSPITALS.map((hospital) => (
          <div 
            key={hospital.id} 
            className="flex flex-col gap-3 min-w-[280px] snap-center bg-white dark:bg-[#1a2c36] p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md select-none"
          >
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden group">
              <img
                src={hospital.image}
                alt={language === 'ko' ? hospital.nameKo : hospital.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                onError={handleImageError}
              />
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/60 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-amber-400 text-[16px] leading-none">star</span>
                <span className="text-xs font-bold text-[#111618] dark:text-white leading-none">{hospital.rating}</span>
              </div>
            </div>
            
            <div>
              <p className="text-[#111618] dark:text-white text-lg font-bold leading-tight">
                {language === 'ko' ? hospital.nameKo : hospital.name}
              </p>
              <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400 text-sm">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>
                  {language === 'ko' ? hospital.distanceKo : hospital.distance} • {language === 'ko' ? hospital.hoursKo : hospital.hours}
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* Spacer for right padding */}
        <div className="w-2 shrink-0"></div>
      </div>
    </div>
  );
};