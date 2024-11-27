'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCanvas } from './CanvasContext';
import { CanvasLayoutSuggestion, CanvasType, CanvasTypeSuggestion } from '@/types/canvas-sections';
import { createCanvasInteractionRouter } from '@/services/interaction-routers/createCanvasRouter';
import { InteractionRouter } from '@/services/interaction-routers/interface';
import { defaultInteractionRouter } from '@/services/interaction-routers/default';
import { AIAgent } from '@/types/canvas';
import { useAuth } from './AuthContext';
import { sendChatRequest, sendContextlessChatRequest } from '@/services/aiService';
import { sendAdminChatRequest } from '@/services/aiService';
import { useCanvasContext } from './ContextEnabledContext';

export interface Message {
  role: 'user' | 'assistant' | 'error' | 'system' | 'thinking';
  content: string;
}

export interface MessageEnvelope {
  messageHistory: Message[];
  newMessage: Message;
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

export class TrailPeroidEndedMessage implements Message {
  role: 'assistant' = 'assistant'
  content: string = 'Your trial period has ended. Please upgrade your subscription to continue.'
}

export interface Interaction {
  interaction: string
  label: string
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
  interaction: Interaction | null;
  activeSection: string | null;
  activeTool: string | null;
  setActiveSection: (section: string|null) => void;
  setInput: (input: string) => void;
  setLoadingMessage: (message: string) => void;
  clearMessages: () => void;
  sendMessage: (message: Message, action?: string) => void;
  setInteraction: (interaction: Interaction|null) => void;
  setActiveTool: (tool: string|null) => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  input: '',
  isLoading: false,
  loadingMessage: '', 
  interaction: null,
  activeSection: null,
  activeTool: null,
  setActiveSection: () => {},
  setInput: () => {},
  setLoadingMessage: () => {},
  clearMessages: () => {},
  sendMessage: () => {},
  setInteraction: () => {},
  setActiveTool: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoadingPrivate] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const { isInTrialPeriod, userData } = useAuth()
  const { updateSection, updateQuestionAnswer, formData, aiAgent } = useCanvas()
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isContextEnabled } = useCanvasContext();

  const addMessage = (message: Message) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, message];
      console.log('newMessages', newMessages);
      return newMessages;
    });
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

  const routeInteraction = (messageEnvelope: MessageEnvelope) => {
    let interactionRouter:InteractionRouter = defaultInteractionRouter
    switch(interaction?.interaction) {
      case 'createCanvas':
          console.log('routing to createNewCanvas')
          interactionRouter = createCanvasInteractionRouter
          break
      default:
        console.log('routing to default')
        interactionRouter = defaultInteractionRouter
    }
    return interactionRouter.getRoute(messageEnvelope, formData, aiAgent)
  }

  const sendMessage = async (userMessage: Message, action?: string, section?: string) => {
    console.log('isInTrialPeriod', isInTrialPeriod)
    console.log('userData', userData)
    const currentMessages = [...messages.filter((m: Message) => 
      m.role == 'system' || m.role == 'user' || m.role == 'assistant'
    )]
    addMessage(userMessage)

    if (!isInTrialPeriod && (!userData?.subscriptionStatus || userData?.subscriptionPlan === 'free')) {
      addMessage(new TrailPeroidEndedMessage())
      return
    }

    if(interaction?.interaction === 'admin') {
      if(userMessage.content.trim()) {
        setInput('')
        setIsLoading(true)

        try {
          const aiResponse = await sendAdminChatRequest({
            messageHistory: currentMessages,
            newMessage: userMessage,
            action: action || activeTool || undefined
          })
          const formattedResponse: AdminMessage = {
            role: 'assistant',
            content: aiResponse.content || '',
            canvasTypeSuggestions: aiResponse.canvasTypeSuggestions?.map((suggestion: any) => ({
              id: suggestion.id,
              name: suggestion.name,
              icon: suggestion.icon,
              description: suggestion.description,
              defaultLayout: suggestion.defaultLayout,
              sections: suggestion.sections,
              rationale: suggestion.rationale
            } as CanvasTypeSuggestion)),
            canvasLayoutSuggestions: aiResponse.canvasLayoutSuggestions?.map((suggestion: any) => ({
              gridTemplate: {
                columns: suggestion.gridTemplate.columns,
                rows: suggestion.gridTemplate.rows
              },
              areas: suggestion.areas,
              rationale: suggestion.rationale
            } as CanvasLayoutSuggestion))
          }
          addMessage(formattedResponse)
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
            : String(error)
          
          addMessage({ 
            role: 'error', 
            content: `An error occurred:\n\n${errorMessage}` 
          })
        } finally {
          setIsLoading(false)
        }
      }
    }
    else if (userMessage.content.trim()) {
      setInput('')
      setIsLoading(true)

      try {
        const envelope: MessageEnvelope = {
          messageHistory: currentMessages,
          newMessage: userMessage,
          action: action || activeTool || undefined
        }
        console.log('envelope', envelope)
        console.log('interaction', interaction)
        const send = 
          interaction ? routeInteraction(envelope)
          : formData && isContextEnabled ? sendChatRequest
          : sendContextlessChatRequest
        const aiResponse = send(envelope, formData, aiAgent)
        for await (const message of aiResponse) {
          if(message.role === 'thinking') {
            setLoadingMessage(message.content)
          }
          else {
            addMessage(message)
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
          : String(error)
        
        addMessage({ 
          role: 'error', 
          content: `An error occurred:\n\n${errorMessage}` 
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      addMessage({ role: 'error', content: 'Please select a canvas type to continue.' })
    }
  }

  return (
    <ChatContext.Provider value={{
      messages,
      input,
      isLoading,
      loadingMessage,
      interaction,
      activeSection,
      activeTool,
      setInput,
      setLoadingMessage,
      clearMessages,
      sendMessage,
      setInteraction,
      setActiveTool,
      setActiveSection
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
 