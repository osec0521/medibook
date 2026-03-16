import { collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BookingFormData } from '../types';

/**
 * Sends booking data to Firestore with duplicate check.
 */
export const submitBookingToFirestore = async (data: BookingFormData, userUid: string, userEmail: string | null): Promise<{ success: boolean; errorType?: 'phone' | 'email' | 'other' }> => {
  const path = 'bookings';
  try {
    // 1. Check for duplicate phone
    const phoneQuery = query(collection(db, path), where('phone', '==', data.phone), limit(1));
    const phoneSnapshot = await getDocs(phoneQuery);
    if (!phoneSnapshot.empty) {
      return { success: false, errorType: 'phone' };
    }

    // 2. Check for duplicate email
    const emailQuery = query(collection(db, path), where('email', '==', data.email), limit(1));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return { success: false, errorType: 'email' };
    }

    const bookingData = {
      ...data,
      userUid,
      loginEmail: userEmail,
      status: 'pending',
      tenantId: data.tenantId || 'default',
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, path), bookingData);
    
    console.group("🏥 Booking Request Saved to Firestore");
    console.log("Payload:", bookingData);
    console.groupEnd();

    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return { success: false, errorType: 'other' };
  }
};
