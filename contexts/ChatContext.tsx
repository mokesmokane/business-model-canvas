'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
import { useAIAgents } from './AIAgentContext';
import { doc, collection, addDoc, getDocs, query, where, orderBy, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

export type MessageType = 
  | 'text' 
  | 'suggestion' 
  | 'question' 
  | 'canvasType' 
  | 'admin'
  | 'error'
  | 'createCanvasType'
  | 'trailPeriodEnded'
  | 'subscriptionRequired'
  | 'newCanvasType'
  | 'thinking';

export interface BaseMessage {
  type: MessageType;
  role: 'user' | 'assistant' | 'error' | 'system' | 'thinking';
  content: string;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
}

export interface SubscriptionRequiredMessage extends BaseMessage {
  type: 'subscriptionRequired';
}

export const createSubscriptionRequiredMessage = (): SubscriptionRequiredMessage => ({
  type: 'subscriptionRequired',
  role: 'assistant',
  content: 'Your subscription has expired. Please upgrade your subscription to continue.'
});

export const createTextMessage = (content: string, role: 'user' | 'assistant' = 'assistant'): TextMessage => ({
  type: 'text',
  role,
  content
});

export interface SuggestionMessage extends BaseMessage {
  type: 'suggestion';
  suggestions: {
    id: string;
    section: string;
    suggestion: string;
    rationale: string;
    icon: string;
  }[];
}

export const createSuggestionMessage = (content: string, suggestions: SuggestionMessage['suggestions']): SuggestionMessage => ({
  type: 'suggestion',
  role: 'assistant',
  content,
  suggestions
});

export interface QuestionMessage extends BaseMessage {
  type: 'question';
  questions: {
    id: string;
    question: string;
    section: string;
    type: 'open' | 'rating' | 'multipleChoice';
    options: string[];
    scale: {
      min: number;
      max: number;
      label: string;
    }|null;
    answer: string | number | null;
  }[];
}

export const createQuestionMessage = (content: string, questions: QuestionMessage['questions']): QuestionMessage => ({
  type: 'question',
  role: 'assistant',
  content,
  questions
});

export interface CanvasTypeSuggestionMessage extends BaseMessage {
  type: 'canvasType';
  canvasTypes: string[];
  newCanvasType: {
    canvasType: string;
    sections: string[];
    purpose: string;
  };
}

export const createCanvasTypeSuggestionMessage = (
  content: string, 
  canvasTypes: string[], 
  newCanvasType: CanvasTypeSuggestionMessage['newCanvasType']
): CanvasTypeSuggestionMessage => ({
  type: 'canvasType',
  role: 'assistant',
  content,
  canvasTypes,
  newCanvasType
});

export interface AdminMessage extends BaseMessage {
  type: 'admin';
  canvasTypeSuggestions?: CanvasTypeSuggestion[];
  canvasLayoutSuggestions?: CanvasLayoutSuggestion[];
}

export const createAdminMessage = (
  content: string,
  canvasTypeSuggestions?: CanvasTypeSuggestion[],
  canvasLayoutSuggestions?: CanvasLayoutSuggestion[]
): AdminMessage => ({
  type: 'admin',
  role: 'assistant',
  content,
  canvasTypeSuggestions,
  canvasLayoutSuggestions
});

export interface TrailPeroidEndedMessage extends BaseMessage {
  type: 'trailPeriodEnded';   
}

export const createTrialEndedMessage = (): TrailPeroidEndedMessage => ({
  type: 'trailPeriodEnded',
  role: 'assistant',
  content: 'Your trial period has ended. Please upgrade your subscription to continue.'
});

export interface NewCanvasTypeMessage extends BaseMessage {
  newCanvasType: string
}

export const createErrorMessage = (content: string): BaseMessage => ({
  type: 'error',
  role: 'error',
  content
});

export interface CreateCanvasTypeMessage extends BaseMessage {
  type: 'createCanvasType';
  action: 'createCanvasType';
  newCanvasType: {
    canvasType: string;
    sections: string[];
    purpose: string;
  };
}

export type Message = 
  | TextMessage 
  | SuggestionMessage 
  | QuestionMessage 
  | CanvasTypeSuggestionMessage 
  | AdminMessage
  | TrailPeroidEndedMessage
  | CreateCanvasTypeMessage
  | BaseMessage;

export interface MessageEnvelope {
  messageHistory: Message[];
  newMessage: Message;
  action?: string;
}

export interface Interaction {
  interaction: string
  label: string
}

export interface ChatHistory {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title: string;
  canvasInfo?: {
    id: string;
    type: string;
    name: string;
    icon: string;
  };
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
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  loadChatHistories: () => Promise<void>;
  saveCurrentChat: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  createNewChat: () => void;
  deleteChat: (chatId: string) => Promise<void>;
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
  chatHistories: [],
  currentChatId: null,
  loadChatHistories: async () => {},
  saveCurrentChat: async () => {},
  loadChat: async (chatId: string) => {},
  createNewChat: () => {},
  deleteChat: async (chatId: string) => {},
});

interface ChatHistoryItem {
  id: string
  title: string
  timestamp: Date
  preview: string
}

export function useChatHistory() {
  const [history, setHistory] = useState<ChatHistoryItem[]>([])

  useEffect(() => {
    // Fetch chat history from your backend/database
    // This is just an example
    const fetchHistory = async () => {
      const response = await fetch('/api/chat-history')
      const data = await response.json()
      setHistory(data)
    }
    
    fetchHistory()
  }, [])

  return history
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoadingPrivate] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const { user, isInTrialPeriod, userData } = useAuth()
  const { updateSection, updateQuestionAnswer, formData} = useCanvas()
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isContextEnabled } = useCanvasContext();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [aiAgent, setAiAgent] = useState<AIAgent | null>(null)
  const { agentCache } = useAIAgents()

  const addMessage = (message: Message) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, message];
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
          interactionRouter = createCanvasInteractionRouter
          break
      default:
        interactionRouter = defaultInteractionRouter
    }
    return interactionRouter.getRoute(messageEnvelope, formData, aiAgent)
  }

  const sendMessage = async (userMessage: Message, action?: string, section?: string) => {
    const currentMessages = [...messages.filter((m: Message) => 
      m.role == 'system' || m.role == 'user' || m.role == 'assistant'
    )]
    addMessage(userMessage)

    if (!isInTrialPeriod && (!userData?.subscriptionStatus || userData?.subscriptionPlan === 'free')) {
      addMessage(createTrialEndedMessage())
      return
    }

    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user logged in');
    }

    const idToken = await user.getIdToken();

    if(interaction?.interaction === 'admin') {
      if(userMessage.content.trim()) {
        setInput('')
        setIsLoading(true)

        try {
          const aiResponse = await sendAdminChatRequest(
            {
              messageHistory: currentMessages,
              newMessage: userMessage,
              action: action || activeTool || undefined
          }, idToken)
          const formattedResponse: AdminMessage = {
            type: 'admin',
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
            type: 'error',
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
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('No user logged in');
        }

        const envelope: MessageEnvelope = {
          messageHistory: currentMessages,
          newMessage: userMessage,
          action: action || activeTool || undefined
        }

        console.log('sending message', envelope)
        console.log('interaction', interaction)
        console.log('formData', formData)
        console.log('isContextEnabled', isContextEnabled)

        const send = 
          interaction ? routeInteraction(envelope)
          : formData && isContextEnabled ? sendChatRequest
          : sendContextlessChatRequest

        const aiResponse = send(envelope, formData, aiAgent, idToken)
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
          type: 'error',
          role: 'error', 
          content: `An error occurred:\n\n${errorMessage}` 
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      addMessage({ 
        type: 'error',
        role: 'error', 
        content: 'Please select a canvas type to continue.' 
      })
    }
  }

  const loadChatHistories = async () => {
    if (!user?.uid) return;
    try {
      const userChatsRef = collection(db, 'userChats', user.uid, 'chats');
      const chatQuery = query(
        userChatsRef,
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(chatQuery);
      const histories = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          canvasInfo: data.canvasInfo || undefined
        };
      }) as ChatHistory[];
      
      setChatHistories(histories);
    } catch (error) {
      console.error('Error loading chat histories:', error);
      addMessage({ 
        type: 'error',
        role: 'error', 
        content: 'Failed to load chat histories' 
      });
    }
  };

  const saveCurrentChat = async () => {
    if (!user?.uid || messages.length === 0) return;
    const { id: canvasId, canvasType, name: canvasName } = formData || {};

    const chatData: Record<string, any> = {
      messages: messages.map(msg => ({
        ...msg,
      })),
      updatedAt: new Date(),
      title: messages[0]?.content.slice(0, 50) || 'New Chat',
    };

    if (canvasId && canvasType) {
      chatData.canvasInfo = {
        id: canvasId,
        type: canvasType.id,
        icon: canvasType.icon,
        name: canvasName || 'Untitled Canvas'
      };
    }

    try {
      const userChatsRef = collection(db, 'userChats', user.uid, 'chats');
      const chatRef = currentChatId 
        ? doc(userChatsRef, currentChatId)
        : doc(userChatsRef);
      
      if (currentChatId) {
        await updateDoc(chatRef, chatData);
      } else {
        await setDoc(chatRef, {
          ...chatData,
          createdAt: new Date(),
        });
        setCurrentChatId(chatRef.id);
      }

      await loadChatHistories();
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    if (!user?.uid) return;

    try {
      const chatRef = doc(collection(db, 'userChats', user.uid, 'chats'), chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const data = chatDoc.data();
        const chatData = {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as ChatHistory;
        
        setMessages(chatData.messages);
        setCurrentChatId(chatId);

        if (chatData.canvasInfo && chatData.canvasInfo.id && chatData.canvasInfo.type) {
          // You might want to add a function to load the associated canvas
          // await loadCanvas(chatData.canvasInfo.id);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      addMessage({ 
        type: 'error',
        role: 'error', 
        content: 'Failed to load chat' 
      });
    }
  };

  const createNewChat = () => {
    clearMessages();
    setCurrentChatId(null);
  };

  const deleteChat = async (chatId: string) => {
    if (!user?.uid) return;

    try {
      const chatRef = doc(db, 'userChats', user.uid, 'chats', chatId);
      await deleteDoc(chatRef);
      await loadChatHistories();
    } catch (error) {
      console.error('Error deleting chat:', error);
      addMessage({ 
        type: 'error',
        role: 'error', 
        content: 'Failed to delete chat' 
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
  }, [messages]);

  useEffect(() => {
    if (user?.uid) {
      loadChatHistories();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (formData?.canvasType?.id) {
      console.log('setting ai agent', agentCache)
      console.log('formData.canvasType.id', formData.canvasType.id)
      console.log('agentCache[formData.canvasType.id]', agentCache[formData.canvasType.id])
      setAiAgent(agentCache[formData.canvasType.id])
    }
  }, [formData?.canvasType?.id])

  const chatContextValue = {
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
    setActiveSection,
    chatHistories,
    currentChatId,
    loadChatHistories,
    saveCurrentChat,
    loadChat,
    createNewChat,
    deleteChat,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);

export const createCanvasTypeMessage = (newCanvasType: CreateCanvasTypeMessage['newCanvasType']): CreateCanvasTypeMessage => ({
  type: 'createCanvasType',
  role: 'user',
  content: 'Great! lets create that canvas type now...',
  action: 'createCanvasType',
  newCanvasType
});
