'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { CanvasTypeService } from '@/services/canvasTypeService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { create } from 'zustand';

interface CanvasTypeContextType {
  getCanvasTypes: () => Promise<Record<string, CanvasType>>;
  isLoading: boolean;
}

const CanvasTypeContext = createContext<CanvasTypeContextType | undefined>(undefined);

export function CanvasTypeProvider({ children }: { children: React.ReactNode }) {
  const [typeCache, setTypeCache] = useState<Record<string, CanvasType>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'canvasTypes'),
      (snapshot) => {
        const types = snapshot.docs.reduce((acc, doc) => ({
          ...acc,
          [doc.id]: { id: doc.id, ...(doc.data() as Omit<CanvasType, 'id'>)}
        }), {} as Record<string, CanvasType>);
        
        setTypeCache(types);
      }
    );

    return () => unsubscribe();
  }, []);

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
