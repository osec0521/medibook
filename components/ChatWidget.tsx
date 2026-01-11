import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { useLanguage } from '../LanguageContext';

export const ChatWidget: React.FC = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize with localized message
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Effect to set initial message when language changes or on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'model',
        text: t.chatHelp,
        timestamp: new Date()
      }]);
    }
  }, [t.chatHelp]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const responseText = await sendMessageToGemini(userMsg.text, language);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[380px] h-[500px] max-h-[70vh] bg-white dark:bg-[#1a2c36] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Chat Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">smart_toy</span>
              <h3 className="font-bold">{t.chatTitle}</h3>
            </div>
            <button onClick={toggleChat} className="hover:bg-white/20 rounded-full p-1">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-transparent">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-none shadow-sm'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-none p-3 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1a2c36] border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white placeholder:text-gray-500"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="size-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Tooltip (Only show if closed) */}
      {!isOpen && (
        <div 
          className="absolute bottom-full right-0 mb-3 w-48 bg-white dark:bg-[#1a2c36] p-3 rounded-xl rounded-tr-none shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all animate-bounce pointer-events-auto"
          style={{ animationDuration: '3s' }}
        >
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {t.needHelp}
          </p>
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 pointer-events-auto"
      >
        <span className="material-symbols-outlined text-[28px]">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>
    </div>
  );
};