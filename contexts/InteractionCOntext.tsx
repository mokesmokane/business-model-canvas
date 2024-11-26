'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';

interface InteractionContextType {
  interaction: string | null;
  setInteraction: (interaction: string | null) => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const [interaction, setInteraction] = useState<string | null>(null);


  return (
    <InteractionContext.Provider value={{ interaction, setInteraction }}>
      {children}
    </InteractionContext.Provider>
  );
}

export const useInteraction = (): InteractionContextType => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
};