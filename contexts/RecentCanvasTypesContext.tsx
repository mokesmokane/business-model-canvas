'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { CanvasType } from '@/types/canvas-sections';

interface RecentCanvasTypesContextType {
  recentTypes: CanvasType[];
  addRecentType: (type: CanvasType) => void;
}

const RecentCanvasTypesContext = createContext<RecentCanvasTypesContextType>({
  recentTypes: [],
  addRecentType: () => {},
});

export function RecentCanvasTypesProvider({ children }: { children: React.ReactNode }) {
  const [recentTypes, setRecentTypes] = useState<CanvasType[]>([]);

  useEffect(() => {
    // Load recent types from localStorage on mount
    const stored = localStorage.getItem('recentCanvasTypes');
    if (stored) {
      setRecentTypes(JSON.parse(stored));
    }
  }, []);

  const addRecentType = (type: CanvasType) => {
    setRecentTypes((prev) => {
      const filtered = prev.filter((t) => t.id !== type.id);
      const updated = [type, ...filtered].slice(0, 5); // Keep last 5 recent types
      localStorage.setItem('recentCanvasTypes', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <RecentCanvasTypesContext.Provider value={{ recentTypes, addRecentType }}>
      {children}
    </RecentCanvasTypesContext.Provider>
  );
}

export const useRecentCanvasTypes = () => useContext(RecentCanvasTypesContext); 