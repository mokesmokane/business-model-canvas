'use client'

import { CanvasType } from '@/types/canvas-sections';
import { createContext, useCallback, useContext, useState } from 'react';

export const NewCanvasContext = createContext({
  newCanvas: false,
  folderId: null as string | null,
  selectedType: null as CanvasType | null,
  setNewCanvas: (value: [boolean, string | null]) => {},
  setSelectedType: (type: CanvasType | null) => {}
});

export const useNewCanvas = () => {
  return useContext(NewCanvasContext);
};


export function NewCanvasProvider({ children }: { children: React.ReactNode }) {
  const [newCanvas, setNewCanvasBool] = useState<boolean>(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<CanvasType | null>(null);

  const setNewCanvas = (value: [boolean, string | null]) => {
    setNewCanvasBool(value[0])
    setFolderId(value[1])
  }
  
  return (
    <NewCanvasContext.Provider value={{ 
      newCanvas, 
      folderId,
      selectedType,
      setNewCanvas, 
      setSelectedType 
    }}>
      {children}
    </NewCanvasContext.Provider>
  );
}   