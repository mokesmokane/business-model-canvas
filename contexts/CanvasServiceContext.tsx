'use client'

import React, { createContext, useContext, useEffect } from 'react';
import { CanvasService } from '@/services/canvasService';
import { useAuth } from './AuthContext';

interface CanvasServiceContextType {
  canvasService: CanvasService;
}

const CanvasServiceContext = createContext<CanvasServiceContextType | undefined>(undefined);

export function CanvasServiceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const canvasService = CanvasService.getInstance();

  useEffect(() => {
    if (user) {
      canvasService.initialize(user.uid);
    } else {
      canvasService.reset();
    }
  }, [user]);

  return (
    <CanvasServiceContext.Provider value={{ canvasService }}>
      {children}
    </CanvasServiceContext.Provider>
  );
}

export function useCanvasService() {
  const context = useContext(CanvasServiceContext);
  if (context === undefined) {
    throw new Error('useCanvasService must be used within a CanvasServiceProvider');
  }
  return context.canvasService;
} 