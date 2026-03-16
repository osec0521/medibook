import React, { useState } from 'react';
import { BookingFormData, BookingStatus } from '../types';
import { submitBookingToFirestore } from '../services/bookingService';
import { useLanguage } from '../LanguageContext';
import { useFirebase } from '../FirebaseContext';
import { HOSPITALS } from '../constants';

interface BookingFormProps {
  tenantId?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ tenantId }) => {
  const { t, selectedHospitalId, language } = useLanguage();
  const { user } = useFirebase();
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    email: '',
    consent: false
  });
  
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.IDLE);
  
  // Custom Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'error' | 'info'>('error');

  const selectedHospital = HOSPITALS.find(h => h.id === selectedHospitalId);

  const TERMS_CONTENT = `제1조 (목적 및 서비스)
본 약관은 회사가 제공하는 메디컬·웰니스 케어 서비스 및 관련 상담, 예약 안내 서비스 이용에 관한 권리와 의무를 규정합니다.

제2조 (의료행위의 제한)
회사는 정보 제공 및 플랫폼 운영자로서, 직접적인 의료행위를 수행하지 않습니다. 모든 의학적 진단과 치료는 해당 의료기관의 전문 의료진을 통해 이루어집니다.

제3조 (이용자의 의무)
회원은 서비스 이용 시 본인의 정확한 건강 상태 정보를 제공해야 합니다.
타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 금합니다.`;

  const PRIVACY_CONTENT = `[수집 및 이용 안내]
구분: 내용
수집 항목: 성명, 연락처, 이메일, 생년월일, 건강정보(상담내역)
수집 목적: 맞춤형 케어 서비스 제공, 예약 관리, 본인 확인
보유 기간: 회원 탈퇴 시 즉시 파기 (단, 법령에 의거 보관 필요 시 해당 기간 준수)

[제3자 제공]
메디컬·웰니스 케어 서비스 및 관련 상담, 예약 안내 서비스를 위해 최소한의 정보에 한해 해당 기관에 공유됩니다.`;

  const handleShowTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalTitle(t.terms);
    setModalMessage(TERMS_CONTENT);
    setModalType('info');
    setShowModal(true);
  };

  const handleShowPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalTitle(t.privacy);
    setModalMessage(PRIVACY_CONTENT);
    setModalType('info');
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setModalTitle('로그인 필요');
      setModalMessage('예약을 위해 로그인이 필요합니다.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    // Validation Logic: Check if any required field is missing
    const missingFields: string[] = [];
    if (!formData.fullName.trim()) missingFields.push(t.fullName);
    if (!formData.phone.trim()) missingFields.push(t.phone);
    if (!formData.email.trim()) missingFields.push(t.email);
    if (!formData.consent) missingFields.push(t.privacyConsent);

    // If there are missing fields, show custom popup and block submission
    if (missingFields.length > 0) {
      setModalTitle(t.inputCheck);
      setModalMessage(`${t.missingFields}${missingFields.join(', ')}`);
      setModalType('error');
      setShowModal(true);
      return;
    }

    setStatus(BookingStatus.SUBMITTING);
    
    const finalData = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      consent: formData.consent,
      hospitalId: selectedHospitalId,
      hospitalName: selectedHospital ? (language === 'ko' ? selectedHospital.nameKo : selectedHospital.name) : 'Unknown',
      tenantId: (tenantId === 'default' || !tenantId) ? '' : tenantId,
      date: new Date().toISOString().split('T')[0] // Default to today for simplicity in this demo
    };

    const result = await submitBookingToFirestore(finalData as any, user.uid, user.email);
    
    if (result.success) {
      setStatus(BookingStatus.SUCCESS);
      setFormData({ fullName: '', phone: '', email: '', consent: false });
      setTimeout(() => setStatus(BookingStatus.IDLE), 3000);
    } else {
      setStatus(BookingStatus.ERROR);
      if (result.errorType === 'phone') {
        setModalTitle(language === 'ko' ? '등록 실패' : 'Registration Failed');
        setModalMessage(t.duplicatePhone);
        setModalType('error');
        setShowModal(true);
      } else if (result.errorType === 'email') {
        setModalTitle(language === 'ko' ? '등록 실패' : 'Registration Failed');
        setModalMessage(t.duplicateEmail);
        setModalType('error');
        setShowModal(true);
      } else {
        setModalTitle(language === 'ko' ? '오류 발생' : 'Error Occurred');
        setModalMessage(language === 'ko' ? '예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.' : 'An error occurred while processing your booking. Please try again.');
        setModalType('error');
        setShowModal(true);
      }
    }
  };

  return (
    <div className="mb-8 relative">
      <div className="h-4"></div>
      <h3 className="text-[#111618] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-4">
        {t.patientDetails}
      </h3>
      
      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-4" noValidate>
        <div className="group relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors">person</span>
          </div>
          <input 
            type="text" 
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="block w-full rounded-lg border-0 py-3.5 pl-11 text-[#111618] dark:text-white bg-white dark:bg-[#1a2c36] shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-medium transition-all" 
            placeholder={t.fullName} 
          />
        </div>

        <div className="group relative flex rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 bg-white dark:bg-[#1a2c36] focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary transition-all">
          <div className="flex items-center pl-3 border-r border-gray-200 dark:border-gray-700 pr-2">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 mr-1">call</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">+82</span>
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-sm ml-1">arrow_drop_down</span>
          </div>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="block w-full border-0 bg-transparent py-3.5 pl-3 text-[#111618] dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 font-medium" 
            placeholder="010-0000-0000" 
          />
        </div>

        <div className="group relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors">mail</span>
          </div>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="block w-full rounded-lg border-0 py-3.5 pl-11 text-[#111618] dark:text-white bg-white dark:bg-[#1a2c36] shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 font-medium transition-all" 
            placeholder={t.email} 
          />
        </div>

        <div className="flex items-start gap-3 py-2">
          <div className="flex h-6 items-center">
            <input 
              id="consent" 
              name="consent" 
              type="checkbox" 
              checked={formData.consent}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700" 
            />
          </div>
          <div className="text-sm leading-6">
            <label htmlFor="consent" className="font-normal text-gray-600 dark:text-gray-400">
              {t.agree} <button type="button" onClick={handleShowTerms} className="font-semibold text-primary hover:text-primary/80">{t.terms}</button> & <button type="button" onClick={handleShowPrivacy} className="font-semibold text-primary hover:text-primary/80">{t.privacy}</button>.
            </label>
          </div>
        </div>

        <div className="h-2"></div>
        
        {/* Button remains enabled to allow clicking, which triggers the validation popup logic */}
        <button 
          type="submit" 
          disabled={status === BookingStatus.SUBMITTING || status === BookingStatus.SUCCESS}
          className={`flex w-full items-center justify-center rounded-lg px-3 py-4 text-base font-bold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all active:scale-[0.98]
            ${status === BookingStatus.SUCCESS 
              ? 'bg-green-600 hover:bg-green-700 focus-visible:outline-green-600' 
              : 'bg-primary hover:bg-primary/90 focus-visible:outline-primary'
            }
            ${status === BookingStatus.SUBMITTING ? 'opacity-80 cursor-wait' : ''}
          `}
        >
          {status === BookingStatus.SUBMITTING && (
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          )}
          {status === BookingStatus.SUCCESS ? t.booked : status === BookingStatus.SUBMITTING ? t.loading : t.bookBtn}
        </button>

        <p className="mt-2 text-xs text-center text-primary/90 dark:text-primary/80 font-medium break-keep px-1 leading-relaxed">
          {t.bookingNote}
        </p>

        {status === BookingStatus.SUCCESS && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 animate-pulse">
            {t.confirmation}
          </p>
        )}
      </form>

      {/* Custom Modal */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
           <div 
            className="bg-white dark:bg-[#1a2c36] rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
           >
             <div className="p-6 flex flex-col items-center">
               <div className={`flex items-center justify-center size-12 rounded-full mb-4 ${modalType === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                 <span className={`material-symbols-outlined text-[28px] ${modalType === 'error' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                   {modalType === 'error' ? 'priority_high' : 'info'}
                 </span>
               </div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                 {modalTitle}
               </h3>
               <div className="w-full max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                 <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-left">
                   {modalMessage}
                 </p>
               </div>
             </div>
             <div className="border-t border-gray-100 dark:border-gray-700 p-4">
               <button
                 type="button"
                 onClick={() => setShowModal(false)}
                 className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
               >
                 {t.confirm}
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};