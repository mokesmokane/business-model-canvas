import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AIAgent } from '@/types/canvas';
import { AIAgentService } from '@/services/aiAgentService';

interface AIAgentContextType {
  getAIAgents: () => Promise<Record<string, AIAgent>>;
  getAIAgent: (id: string) => Promise<AIAgent | null>;
  isLoading: boolean;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function AIAgentProvider({ children }: { children: React.ReactNode }) {
  const [agentCache, setAgentCache] = useState<Record<string, AIAgent>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getAIAgents = useCallback(async () => {
    if (Object.keys(agentCache).length > 0) {
      return agentCache;
    }

    setIsLoading(true);
    try {
      const aiAgentService = new AIAgentService();
      const agents = await aiAgentService.getAiAgents();
      setAgentCache(agents);
      return agents;
    } finally {
      setIsLoading(false);
    }
  }, [agentCache]);

  const getAIAgent = useCallback(async (id: string) => {
    if (agentCache[id]) {
      return agentCache[id];
    }
    const aiAgentService = new AIAgentService();
    const agent = await aiAgentService.getAIAgent(id);
    if (agent) {
      setAgentCache(prev => ({ ...prev, [id]: agent }));
    }
    return agent;
  }, [agentCache]);

  return (
    <AIAgentContext.Provider value={{ getAIAgents, getAIAgent, isLoading }}>
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