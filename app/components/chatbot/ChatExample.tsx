import React from 'react';
import { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  isTyping?: boolean;
  isNew?: boolean; // Add new property to track new messages
}

interface ChatResponse {
  response: string;
  session_id: string;
}

// TypingEffect component
interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypingEffect({ text, speed = 30, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <>{displayedText}</>;
}

export default function ChatPopup() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session when component mounts
  useEffect(() => {
    initializeSession();
  }, []);

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && sessionId) {
      addBotMessage("Hi! I'm Anaas kalkhi AI chatbot, What do you want to know?");
    }
  }, [isOpen, messages.length, sessionId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/new-session', {
        method: 'POST',
      });
      const data = await response.json();
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
        }),
      });

      const data: ChatResponse = await response.json();
      
      // Add bot response to chat
      addBotMessage(data.response);
      
      // Update session ID if new one is provided
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addBotMessage('Sorry, there was an error processing your message.');
    } finally {
      setIsLoading(false);
    }
  };

  const addBotMessage = (response: string) => {
    // Add new bot message with isNew flag set to true
    setMessages(prev => [...prev, { 
      text: response, 
      isUser: false,
      isTyping: true,
      isNew: true
    }]);

    // After the message has been displayed with the typing effect
    // we set isNew to false to mark it as an "old" message
    setTimeout(() => {
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, isNew: false } : msg
        )
      );
    }, response.length * 20 + 500); // Rough estimate for typing effect completion
  };

  return (
    <>
      {/* Chat button - small circle in the initial state */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center z-50 shadow-lg"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
      )}

      {/* Chat popup */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-[480px] h-[640px] bg-white rounded-lg shadow-2xl z-40 overflow-hidden "
        >
          <div className="flex flex-col h-[640px] bg-zinc-900">
            {/* Header */}
            <div className="bg-white p-3 flex items-center justify-between border-b ">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 mr-3 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-black">AI Chatbot</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 w-10 h-8"
                aria-label="Close chat"
              >
                <svg className="" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 mb-1 flex items-center justify-center text-white text-xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                  )}
                  <div
                    className={`w-fit rounded-lg px-4 py-2  ${
                      message.isUser
                        ? 'bg-green-700 text-white/90'
                        : 'bg-zinc-800 text-white/70'
                    }`}
                  >
                    {message.isTyping && !message.isUser && message.isNew ? (
                      <div className="text-left whitespace-pre-wrap break-words text-sm font-semibold">
                        <TypingEffect 
                          text={message.text} 
                          speed={20} 
                        />
                      </div>
                    ) : (
                      <div className="text-left text-sm font-semibold ">
                        {message.text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center space-x-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 mb-1 flex items-center justify-center text-white text-xs">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 p-2 text-white bg-zinc-100 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:bg-zinc-800 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-md bg-black text-white hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
            
            {/* Footer */}
            
          </div>
        </div>
      )}
    </>
  );
}