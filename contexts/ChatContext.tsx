'use client'

import React, { createContext, useContext, useState } from 'react';
import { useCanvas } from './CanvasContext';

export interface Message {
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  suggestions?: Array<{
    id: string;
    section: string;
    suggestion: string;
    rationale: string;
  }>;
}

interface ChatContextType {
  messages: Message[];
  input: string;
  isLoading: boolean;
  setInput: (input: string) => void;
  setIsLoading: (loading: boolean) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  input: '',
  isLoading: false,
  setInput: () => {},
  setIsLoading: () => {},
  addMessage: () => {},
  addMessages: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: Message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
  };

  const sendMessage = async (content: string) => {
    const userMessage = { role: 'user', content } as Message;
    await addMessage(userMessage);
  };

  const addMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      input,
      isLoading,
      setInput,
      setIsLoading,
      addMessage,
      addMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
 