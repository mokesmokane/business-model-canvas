'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { canvasTypeService } from '@/services/canvasTypeService';
import { collection, onSnapshot } from 'firebase/firestore';
import { create } from 'zustand';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface CanvasTypeContextType {
  getCanvasTypes: () => Promise<Record<string, CanvasType>>;
  getCanvasType: (id: string) => Promise<CanvasType | null>;
  saveCustomCanvasType: (id: string, canvasType: CanvasType) => Promise<void>;
  getStandardCanvasTypes: () => Promise<Record<string, CanvasType>>;
  getCustomCanvasTypes: () => Promise<Record<string, CanvasType>>;
  isLoading: boolean;
}

  const CanvasTypeContext = createContext<CanvasTypeContextType | undefined>(undefined);

export function CanvasTypeProvider({ children }: { children: React.ReactNode }) {
  const [typeCache, setTypeCache] = useState<Record<string, CanvasType>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Subscribe to both standard and custom canvas types
    const unsubscribeStandard = onSnapshot(
      collection(db, 'canvasTypes'),
      async (snapshot) => {
        const standardTypes = snapshot.docs.reduce((acc, doc) => {
          const data = doc.data() as Omit<CanvasType, 'id'>;
          return {
            ...acc,
            [doc.id]: {
              id: doc.id,
              ...data
            }
          };
        }, {} as Record<string, CanvasType>);

        if (user?.uid) {
          // Get custom types
          canvasTypeService.initialize(user.uid);
          const customTypes = await canvasTypeService.getCustomCanvasTypes();
          setTypeCache({ ...standardTypes, ...customTypes });
        } else {
          setTypeCache(standardTypes);
        }
      }
    );

    let unsubscribeCustom: (() => void) | undefined;

    if (user?.uid) {
      unsubscribeCustom = onSnapshot(
        collection(db, 'userCanvasTypes', user.uid, 'canvasTypes'),
        async (snapshot) => {
          const customTypes = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data() as Omit<CanvasType, 'id'>;
            return {
              ...acc,
              [doc.id]: {
                id: doc.id,
                ...data
              }
            };
          }, {} as Record<string, CanvasType>);

          // Get standard types
          const standardTypes = await canvasTypeService.getStandardCanvasTypes();
          setTypeCache({ ...standardTypes, ...customTypes });
        }
      );
    }

    return () => {
      unsubscribeStandard();
      if (unsubscribeCustom) {
        unsubscribeCustom();
      }
    };
  }, [user?.uid]);

  const getCanvasType = useCallback(async (id: string) => {
    if (typeCache[id]) {
      return typeCache[id];
    }
    const type = await canvasTypeService.getCanvasType(id);
    if (type) {
      setTypeCache(prev => ({ ...prev, [id]: type }));
    }
    return type;
  }, [typeCache, user?.uid]);

  const saveCustomCanvasType = useCallback(async (id: string, canvasType: CanvasType) => {
    await canvasTypeService.saveCustomCanvasType(id, canvasType);
  }, []);

  const getStandardCanvasTypes = useCallback(async () => {
    const standardTypes = await canvasTypeService.getStandardCanvasTypes();
    return standardTypes;
  }, []);

  const getCustomCanvasTypes = useCallback(async () => {
    const customTypes = await canvasTypeService.getCustomCanvasTypes();
    return customTypes;
    return {};
  }, [user?.uid]);

  const getCanvasTypes = useCallback(async () => {
    if (Object.keys(typeCache).length > 0) {
      return typeCache;
    }

    setIsLoading(true);
    try {
      const types = await canvasTypeService.getCanvasTypes();
      setTypeCache(types);
      return types;
    } finally {
      setIsLoading(false);
    }
  }, [typeCache, user?.uid]);

  return (
    <CanvasTypeContext.Provider value={{ 
      getCanvasTypes, 
      getCanvasType, 
      saveCustomCanvasType, 
      getStandardCanvasTypes,
      getCustomCanvasTypes,
      isLoading,
    }}>
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
