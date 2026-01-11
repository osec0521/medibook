import React, { useState } from 'react';
import { BookingFormData, BookingStatus } from '../types';
import { submitBookingToSheet } from '../services/bookingService';
import { useLanguage } from '../LanguageContext';

export const BookingForm: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    email: '',
    consent: false
  });
  
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.IDLE);
  
  // Custom Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Logic: Check if any required field is missing
    const missingFields: string[] = [];
    if (!formData.fullName.trim()) missingFields.push(t.fullName);
    if (!formData.phone.trim()) missingFields.push(t.phone);
    if (!formData.email.trim()) missingFields.push(t.email);
    if (!formData.consent) missingFields.push(t.privacyConsent);

    // If there are missing fields, show custom popup and block submission
    if (missingFields.length > 0) {
      setModalMessage(`${t.missingFields}${missingFields.join(', ')}`);
      setShowModal(true);
      return;
    }

    setStatus(BookingStatus.SUBMITTING);
    const success = await submitBookingToSheet(formData);
    
    if (success) {
      setStatus(BookingStatus.SUCCESS);
      setFormData({ fullName: '', phone: '', email: '', consent: false });
      setTimeout(() => setStatus(BookingStatus.IDLE), 3000);
    } else {
      setStatus(BookingStatus.ERROR);
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
              {t.agree} <a href="#" className="font-semibold text-primary hover:text-primary/80">{t.terms}</a> & <a href="#" className="font-semibold text-primary hover:text-primary/80">{t.privacy}</a>.
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

      {/* Custom Validation Modal */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
           <div 
            className="bg-white dark:bg-[#1a2c36] rounded-2xl shadow-2xl w-full max-w-[320px] overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
           >
             <div className="p-6 text-center flex flex-col items-center">
               <div className="flex items-center justify-center size-12 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
                 <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-[28px]">priority_high</span>
               </div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                 {t.inputCheck}
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                 {modalMessage}
               </p>
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