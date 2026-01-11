import { BookingFormData } from '../types';

/**
 * Simulates sending data to a Google Spreadsheet.
 * 
 * To make this fully functional for the user 'osec0521@gmail.com', they would need to:
 * 1. Create a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Add a script to handle doPost(e) and appendRow.
 * 4. Deploy as Web App with permissions "Anyone".
 * 5. Update the GOOGLE_SCRIPT_URL constant.
 */
export const submitBookingToSheet = async (data: BookingFormData): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.group("🏥 Booking Request");
  console.log("Status: Sending to Spreadsheet...");
  console.log("Recipient: osec0521@gmail.com (simulated)");
  console.log("Payload:", data);
  console.groupEnd();

  // In a real implementation with a Google Apps Script Web App:
  /*
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Important for Google Apps Script simple triggers
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
  */

  // For this demo, we return true to show the success UI.
  return true;
};