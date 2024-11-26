'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCanvas } from './CanvasContext';
import { CanvasLayoutSuggestion, CanvasType, CanvasTypeSuggestion } from '@/types/canvas-sections';

export interface Message {
  role: 'user' | 'assistant' | 'error' | 'system' | 'thinking';
  content: string;
  action?: string;
}

export class SuggestionMessage implements Message {
  role: 'assistant' = 'assistant'
  content: string
  suggestions: {
    id: string;
    section: string;
    suggestion: string;
    rationale: string;
    icon: string;
  }[]

  constructor(content: string, suggestions: {
    id: string;
    section: string;
    suggestion: string;
    rationale: string;
    icon: string;
  }[]) {
    this.content = content
    this.suggestions = suggestions
  }
}

export class QuestionMessage implements Message {
  role: 'assistant' = 'assistant'
  content: string
  questions: {
    id: string;
    question: string;
    section: string;
    type: 'open' | 'rating' | 'multipleChoice';
    options?: string[];
    scale?: {
      min: number;
      max: number;
      label: string;
    };
  }[]

  constructor(content: string, questions: {
    id: string;
    question: string;
    section: string;
    type: 'open' | 'rating' | 'multipleChoice';
    options?: string[];
    scale?: {
      min: number;
      max: number;
      label: string;
    };
  }[]) {
    this.content = content
    this.questions = questions
  }
}


export class CreateCanvasTypeMessage implements Message {
  role: 'user' = 'user'
  content: 'Great! lets create that canvas type now...' = 'Great! lets create that canvas type now...'
  action = 'createCanvasType'
  newCanvasType: {
    canvasType: string;
    sections: string[];
    purpose: string;
  }

  constructor(newCanvasType: {
    canvasType: string;
    sections: string[];
    purpose: string;
  }) {
    this.newCanvasType = newCanvasType
  }
}

export class CanvasTypeSuggestionMessage implements Message {
  role: 'assistant' = 'assistant'
  content: string
  canvasTypeSuggestions: string[]
  newCanvasType: {
    canvasType: string;
    sections: string[];
    purpose: string;
  }

  constructor(content: string, canvasTypeSuggestions: string[], newCanvasType: {
    canvasType: string;
    sections: string[];
    purpose: string;
  }) {
    this.content = content
    this.canvasTypeSuggestions = canvasTypeSuggestions
    this.newCanvasType = newCanvasType
  }
}

export interface NewCanvasTypeMessage extends Message {
  newCanvasType: string
}

export class AdminMessage implements Message {
  role: 'assistant' = 'assistant'
  content: string
  canvasTypeSuggestions?: CanvasTypeSuggestion[];
  canvasLayoutSuggestions?: CanvasLayoutSuggestion[];

  constructor(content: string, canvasTypeSuggestions?: CanvasTypeSuggestion[], canvasLayoutSuggestions?: CanvasLayoutSuggestion[]) {
    this.content = content
    this.canvasTypeSuggestions = canvasTypeSuggestions
    this.canvasLayoutSuggestions = canvasLayoutSuggestions
  }
}

interface ChatContextType {
  messages: Message[];
  input: string;
  isLoading: boolean;
  loadingMessage: string;
  setInput: (input: string) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  input: '',
  isLoading: false,
  loadingMessage: '',
  setInput: () => {},
  setIsLoading: () => {},
  setLoadingMessage: () => {},
  addMessage: () => {},
  addMessages: () => {},
  clearMessages: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoadingPrivate] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

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

  const clearMessages = useCallback(() => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  }, []);

  const setIsLoading = (loading: boolean) => {
    setLoadingMessage('');
    setIsLoadingPrivate(loading);
  }

  return (
    <ChatContext.Provider value={{
      messages,
      input,
      isLoading,
      loadingMessage,
      setInput,
      setIsLoading,
      setLoadingMessage,
      addMessage,
      addMessages,
      clearMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
 