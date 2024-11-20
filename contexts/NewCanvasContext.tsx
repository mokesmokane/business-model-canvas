'use client'

import { CanvasType } from '@/types/canvas-sections';
import { createContext, useCallback, useContext, useState } from 'react';

export const NewCanvasContext = createContext({
  newCanvas: false,
  selectedType: null as CanvasType | null,
  setNewCanvas: (value: boolean) => {},
  setSelectedType: (type: CanvasType | null) => {}
});

export const useNewCanvas = () => {
  return useContext(NewCanvasContext);
};


export function NewCanvasProvider({ children }: { children: React.ReactNode }) {
  const [newCanvas, setNewCanvas] = useState(false);
  const [selectedType, setSelectedType] = useState<CanvasType | null>(null);
  
  return (
    <NewCanvasContext.Provider value={{ 
      newCanvas, 
      selectedType,
      setNewCanvas, 
      setSelectedType 
    }}>
      {children}
    </NewCanvasContext.Provider>
  );
}   