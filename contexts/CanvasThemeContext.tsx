'use client'

import React, { createContext, useContext, useState } from 'react'

type CanvasTheme = 'light' | 'dark'

interface CanvasThemeContextType {
  canvasTheme: CanvasTheme
  setCanvasTheme: (theme: CanvasTheme) => void
}

const CanvasThemeContext = createContext<CanvasThemeContextType>({
  canvasTheme: 'light',
  setCanvasTheme: () => {},
})

export function CanvasThemeProvider({ children }: { children: React.ReactNode }) {
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>('light')

  return (
    <CanvasThemeContext.Provider value={{ canvasTheme, setCanvasTheme }}>
      {children}
    </CanvasThemeContext.Provider>
  )
}

export const useCanvasTheme = () => useContext(CanvasThemeContext) 