'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { CanvasTypeService } from '@/services/canvasTypeService';

interface CanvasTypeContextType {
  getCanvasTypes: () => Promise<Record<string, CanvasType>>;
  isLoading: boolean;
}

const CanvasTypeContext = createContext<CanvasTypeContextType | undefined>(undefined);

export function CanvasTypeProvider({ children }: { children: React.ReactNode }) {
  const [typeCache, setTypeCache] = useState<Record<string, CanvasType>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getCanvasTypes = useCallback(async () => {
    if (Object.keys(typeCache).length > 0) {
      return typeCache;
    }

    setIsLoading(true);
    try {
      const canvasTypeService = new CanvasTypeService();
      const types = await canvasTypeService.getCanvasTypes();
      setTypeCache(types);
      return types;
    } finally {
      setIsLoading(false);
    }
  }, [typeCache]);

  return (
    <CanvasTypeContext.Provider value={{ getCanvasTypes, isLoading }}>
      {children}
    </CanvasTypeContext.Provider>
  );
}

export const useCanvasTypes = () => {
  const context = useContext(CanvasTypeContext);
  if (!context) {
    throw new Error('useCanvasTypes must be used within a CanvasTypeProvider');
  }
  return context;
}; 