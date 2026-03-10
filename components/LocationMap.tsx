import React from 'react';
import { HOSPITALS } from '../constants';
import { useLanguage } from '../LanguageContext';

export const LocationMap: React.FC = () => {
  const { language, t, selectedHospitalId } = useLanguage();
  
  // Find the selected hospital, fallback to first one
  const featuredHospital = HOSPITALS.find(h => h.id === selectedHospitalId) || HOSPITALS[0];

  // Encoding the address for the Google Maps embed URL
  const mapQuery = `${featuredHospital.nameKo} ${featuredHospital.addressKo}`;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleDirectionsClick = () => {
    if (featuredHospital.kakaoMapUrl) {
      window.open(featuredHospital.kakaoMapUrl, '_blank');
    } else {
      const query = encodeURIComponent(language === 'ko' ? featuredHospital.addressKo : featuredHospital.address);
      window.open(`https://map.kakao.com/?q=${query}`, '_blank');
    }
  };

  return (
    <div id="location-map" className="px-4 mt-2 scroll-mt-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#111618] dark:text-white text-[20px] leading-[25px] font-bold">{t.location}</h3>
        <button 
          onClick={handleDirectionsClick}
          className="flex items-center gap-1 text-[#FEE500] hover:bg-[#FEE500]/20 transition-colors text-xs font-bold bg-[#FEE500]/10 px-2 py-1 rounded-md border border-[#FEE500]/20"
        >
          <span className="material-symbols-outlined text-[14px] text-black dark:text-[#FEE500]">map</span>
          <span className="text-black dark:text-[#FEE500] text-[15px] leading-[14px]">{t.getDirections}</span>
        </button>
      </div>
      
      <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 relative bg-gray-100 dark:bg-gray-800">
        <iframe 
          key={featuredHospital.id}
          title="Google Map Location"
          allowFullScreen 
          height="100%" 
          loading="lazy" 
          src={mapSrc}
          style={{ border: 0 }} 
          width="100%"
          className="grayscale-[20%] hover:grayscale-0 transition-all duration-700"
        />
        
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-[#1a2c36]/95 backdrop-blur-sm p-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#111618] dark:text-white truncate">
              {language === 'ko' ? featuredHospital.nameKo : featuredHospital.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {language === 'ko' ? featuredHospital.addressKo : featuredHospital.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};