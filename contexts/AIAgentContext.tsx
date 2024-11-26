import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AIAgent } from '@/types/canvas';
import { AIAgentService } from '@/services/aiAgentService';
import { useAuth } from './AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { aiAgentService } from '@/services/aiAgentService';

interface AIAgentContextType {
  getAIAgents: () => Promise<Record<string, AIAgent>>;
  getAIAgent: (id: string) => Promise<AIAgent | null>;
  saveCustomAIAgent: (id: string, aiAgent: AIAgent) => Promise<void>;
  getStandardAIAgents: () => Promise<Record<string, AIAgent>>;
  getCustomAIAgents: () => Promise<Record<string, AIAgent>>;
  agentCache: Record<string, AIAgent>;
  isLoading: boolean;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function AIAgentProvider({ children }: { children: React.ReactNode }) {
  const [agentCache, setAgentCache] = useState<Record<string, AIAgent>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Add real-time listener for standard AI agents
  useEffect(() => {
    const standardAgentsRef = collection(db, "aiAgents");
    
    const unsubscribe = onSnapshot(standardAgentsRef, (snapshot) => {
      const updates: Record<string, AIAgent> = {};
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          updates[change.doc.id] = change.doc.data() as AIAgent;
        } else if (change.type === 'removed') {
          delete updates[change.doc.id];
        }
      });

      setAgentCache(prev => ({
        ...prev,
        ...updates
      }));
    });

    return () => unsubscribe();
  }, []);

  // Add real-time listener for user's custom AI agents
  useEffect(() => {
    if (!user?.uid) return;


    const customAgentsRef = collection(db, 'userAIAgents', user.uid, 'aiAgents');
    
    const unsubscribe = onSnapshot(customAgentsRef, (snapshot) => {
      const updates: Record<string, AIAgent> = {};
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          updates[change.doc.id] = change.doc.data() as AIAgent;
        } else if (change.type === 'removed') {
          delete updates[change.doc.id];
        }
      });

      setAgentCache(prev => ({
        ...prev,
        ...updates
      }));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const getAIAgents = useCallback(async () => {
    if (Object.keys(agentCache).length > 0) {
      return agentCache;
    }

    setIsLoading(true);
    try {
      if (!aiAgentService.userId && user?.uid) {
        aiAgentService.initialize(user.uid);
      }
      if (aiAgentService.userId) {
        const agents = await aiAgentService.getAiAgents();
        setAgentCache(agents);
        return agents;
      }
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [agentCache, user?.uid]);

  const getAIAgent = useCallback(async (id: string) => {
    if (agentCache[id]) {
      return agentCache[id];
    }
    const agent = await aiAgentService.getAIAgent(id, user?.uid);
    if (agent) {
      setAgentCache(prev => ({ ...prev, [id]: agent }));
    }
    return agent;
  }, [agentCache, user?.uid]);

  const getStandardAIAgents = useCallback(async () => {
    const agents = await aiAgentService.getAiAgents();
    return agents;
  }, []);

  const getCustomAIAgents = useCallback(async () => {
    if (!user?.uid) return {};
    const agents = await aiAgentService.getAiAgents();
    return agents;
  }, [user?.uid]);

  const saveCustomAIAgent = useCallback(async (id: string, aiAgent: AIAgent) => {
    if (!user?.uid) throw new Error('User must be logged in to save custom AI agents');
    await aiAgentService.saveCustomAIAgent(id, aiAgent, user.uid);
    setAgentCache(prev => ({ ...prev, [id]: aiAgent }));
  }, [user?.uid]);

  return (
    <AIAgentContext.Provider value={{ 
      getAIAgents, 
      getAIAgent, 
      saveCustomAIAgent, 
      getStandardAIAgents,
      getCustomAIAgents,
      agentCache,
      isLoading 
    }}>
      {children}
    </AIAgentContext.Provider>
  );
}

export const useAIAgents = () => {
  const context = useContext(AIAgentContext);
  if (!context) {
    throw new Error('useAIAgents must be used within an AIAgentProvider');
  }
  return context;
};