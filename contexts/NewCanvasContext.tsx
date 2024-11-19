'use client'

import { createContext, useCallback, useContext, useState } from 'react';

export const NewCanvasContext = createContext({
  newCanvas: false,
  setNewCanvas: (value: boolean) => {}
});

export const useNewCanvas = () => {
  return useContext(NewCanvasContext);
};


export function NewCanvasProvider({ children }: { children: React.ReactNode }) {
  const [newCanvas, setNewCanvas] = useState(false);
  
  return (
    <NewCanvasContext.Provider value={{ newCanvas, setNewCanvas }}>
      {children}
    </NewCanvasContext.Provider>
  );
}   