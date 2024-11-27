'use client'

import React, { ContextType, createContext, useContext, useState } from 'react';

interface CanvasContextType {
  isContextEnabled: boolean;
  setIsContextEnabled: (enabled: boolean) => void;
}

const CanvasContext = createContext<CanvasContextType>({
  isContextEnabled: false,
  setIsContextEnabled: () => {},
});

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [isContextEnabled, setIsContextEnabledState] = useState(false);

  const setIsContextEnabled = (enabled: boolean) => {
    setIsContextEnabledState(enabled);
    console.log('Global isContextEnabled', enabled);
  };

  return (
    <CanvasContext.Provider value={{
      isContextEnabled,
      setIsContextEnabled,
    }}>
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvasContext = () => useContext(CanvasContext); 