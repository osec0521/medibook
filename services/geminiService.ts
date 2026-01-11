import { GoogleGenAI, Chat } from "@google/genai";
import { Language } from '../types';

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `You are MediBot, a helpful AI assistant for a hospital booking application called "MediBook".
Your goal is to assist users in finding the right care and understanding the booking process.
You are polite, professional, and concise.
The application supports both Korean and English. 

You can answer questions about:
- General hospital information.
- What to bring to an appointment.
- How to book (fill out the form).
- General medical triage advice (always include a disclaimer that you are an AI and this is not professional medical advice).

If a user asks about specific waiting times or doctor availability, explain that you don't have real-time access but they can call the hospital directly using the phone number on the main page.
`;

export const initializeChat = (): void => {
  try {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key is missing. Chat functionality will be limited.");
      return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini chat:", error);
  }
};

export const sendMessageToGemini = async (message: string, language: Language = 'ko'): Promise<string> => {
  if (!chatSession) {
    // Re-initialize if null (e.g. key was added later or init failed)
    initializeChat();
    if (!chatSession) {
        return language === 'ko' 
          ? "죄송합니다. 서버 연결에 문제가 발생했습니다. API 설정을 확인해주세요."
          : "I'm sorry, I'm currently having trouble connecting to the server. Please check your API configuration.";
    }
  }

  try {
    // Enforce the selected language for this specific turn
    const languageInstruction = language === 'ko' 
      ? "\n(System: 반드시 한국어로 답변해주세요.)" 
      : "\n(System: Please answer strictly in English.)";
      
    const prompt = `${message}${languageInstruction}`;

    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || (language === 'ko' ? "죄송합니다. 다시 말씀해 주시겠어요?" : "I didn't quite catch that. Could you please rephrase?");
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return language === 'ko'
      ? "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      : "I apologize, but I encountered an error while processing your request. Please try again later.";
  }
};