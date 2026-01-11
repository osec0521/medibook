export type Language = 'ko' | 'en';

export interface Hospital {
  id: string;
  name: string;
  nameKo: string;
  distance: string;
  distanceKo: string;
  hours: string;
  hoursKo: string;
  rating: number;
  image: string;
  address: string;
  addressKo: string;
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
}

export enum BookingStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any; // Using any for simplicity in the dictionary access
}