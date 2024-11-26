'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CanvasLayoutDetails } from '@/types/canvas-sections';
import { canvasTypeService, CanvasTypeService } from '@/services/canvasTypeService';

interface LayoutContextType {
  getLayoutsForSectionCount: (sectionCount: number) => Promise<CanvasLayoutDetails[]>;
  getLayouts: () => Promise<Record<string, CanvasLayoutDetails>>;
  isLoading: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layoutCache, setLayoutCache] = useState<Record<number, CanvasLayoutDetails[]>>({});
  const [layouts, setLayouts] = useState<Record<string, CanvasLayoutDetails>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getLayoutsForSectionCount = useCallback(async (sectionCount: number) => {
    if (layoutCache[sectionCount]) {
      return layoutCache[sectionCount];
    }

    try {
      setIsLoading(true);
      const layouts = await canvasTypeService.getLayoutsByType(sectionCount);
      setLayoutCache(prev => ({
        ...prev,
        [sectionCount]: layouts
      }));
      
      return layouts;
    } finally {
      setIsLoading(false);
    }
  }, [layoutCache]);

  const getLayouts = useCallback(async () => {
    if (Object.keys(layouts).length > 0) {
      return layouts
    }

    try {   
      setIsLoading(true);
      const layouts = await canvasTypeService.getCanvasLayouts();
      setLayouts(layouts)
      return layouts
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LayoutContext.Provider value={{ getLayoutsForSectionCount, getLayouts, isLoading }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayouts = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayouts must be used within a LayoutProvider');
  }
  return context;
}; 