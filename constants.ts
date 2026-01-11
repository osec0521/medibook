import { Hospital } from './types';

export const TRANSLATIONS = {
  ko: {
    findBook: "토마톡 120세 건강 지킴이 메디컬 및 웰니스 센터를 찾아 예약하세요",
    scheduleVisit: "가까운 병원 진료를 예약하세요.",
    location: "위치",
    getDirections: "카카오맵",
    patientDetails: "고객 정보",
    fullName: "성함",
    phone: "전화번호",
    email: "이메일",
    agree: "개인정보 처리에 동의합니다.",
    terms: "이용약관",
    privacy: "개인정보처리방침",
    privacyConsent: "개인정보 수집 동의",
    bookBtn: "상담 및 예약하기",
    booked: "예약 완료!",
    confirmation: "osec0521@gmail.com으로 확인 메일이 발송되었습니다.",
    bookingNote: "상담 및 예약하기를 정상적으로 등록하신 분은 순서에 맞게 예약 담당자가 연락을 드립니다",
    chatHelp: "안녕하세요! 병원 예약이나 궁금한 점을 도와드릴까요?",
    chatPlaceholder: "메시지를 입력하세요...",
    loading: "처리중...",
    menu: "메뉴",
    alertConsent: "개인정보 처리방침에 동의해주세요.",
    chatTitle: "메디봇",
    needHelp: "예약 도움이 필요하신가요?",
    language: "Language",
    missingFields: "다음 정보를 입력해주세요:\n",
    inputCheck: "입력 확인",
    confirm: "확인"
  },
  en: {
    findBook: "Find & Book at Tomatalk 120-year Health Guardian Medical & Wellness Center",
    scheduleVisit: "Schedule your visit with top hospitals in your area.",
    location: "Location",
    getDirections: "Kakao Map",
    patientDetails: "Patient Details",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    agree: "I agree to the processing of my personal data.",
    terms: "Terms",
    privacy: "Privacy Policy",
    privacyConsent: "Privacy Policy Consent",
    bookBtn: "Book Appointment",
    booked: "Booked Successfully!",
    confirmation: "Confirmation sent to osec0521@gmail.com",
    bookingNote: "Those who have successfully registered will be contacted by the reservation manager in order.",
    chatHelp: "Hi there! I can help you find a hospital or answer questions about booking.",
    chatPlaceholder: "Ask for help...",
    loading: "Book Appointment", // Fallback if not submitting
    menu: "Menu",
    alertConsent: "Please agree to the privacy policy to continue.",
    chatTitle: "MediBot",
    needHelp: "Need help booking? Chat with us!",
    language: "언어",
    missingFields: "Please enter the following fields:\n",
    inputCheck: "Check Input",
    confirm: "OK"
  }
};

export const HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'Gangnam Mitocell Clinic',
    nameKo: '강남 미토셀의원',
    distance: '0.0km away',
    distanceKo: '0.0km 거리',
    hours: '09:00 - 19:00',
    hoursKo: '09:00 - 19:00',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    address: '411, Eonju-ro, Gangnam-gu, Seoul',
    addressKo: '서울 강남구 언주로 411'
  },
  {
    id: '2',
    name: 'Daejeon (Scheduled)',
    nameKo: '대전 (예정)',
    distance: '-',
    distanceKo: '-',
    hours: 'Coming Soon',
    hoursKo: '오픈 예정',
    rating: 0,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    address: 'Daejeon, South Korea',
    addressKo: '대전광역시'
  },
  {
    id: '3',
    name: 'Busan (Scheduled)',
    nameKo: '부산 (예정)',
    distance: '-',
    distanceKo: '-',
    hours: 'Coming Soon',
    hoursKo: '오픈 예정',
    rating: 0,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
    address: 'Busan, South Korea',
    addressKo: '부산광역시'
  },
  {
    id: '4',
    name: 'Jeju (Scheduled)',
    nameKo: '제주 (예정)',
    distance: '-',
    distanceKo: '-',
    hours: 'Coming Soon',
    hoursKo: '오픈 예정',
    rating: 0,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
    address: 'Jeju, South Korea',
    addressKo: '제주특별자치도'
  }
];

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_YOUR_SCRIPT_ID_HERE/exec';