'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ExpandedContextType {
  isExpanded: boolean;
  isWide: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  setIsWide: (isWide: boolean) => void;
}

const ExpandedContext = createContext<ExpandedContextType | undefined>(undefined);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWide, setIsWide] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  }

  return (
    <ExpandedContext.Provider value={{ isExpanded, setIsExpanded, isWide, setIsWide }}>
      {children}
    </ExpandedContext.Provider>
  );
}

export const useExpanded = (): ExpandedContextType => {
  const context = useContext(ExpandedContext);
  if (!context) {
    throw new Error('useExpanded must be used within an ExpandedProvider');
  }
  return context;
};