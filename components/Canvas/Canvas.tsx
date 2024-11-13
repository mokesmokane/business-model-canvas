import React from 'react'
import { Header } from "./Header"
import { CanvasContent } from "./CanvasContent"
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { CanvasThemeProvider } from '@/contexts/CanvasThemeContext'

interface CanvasProps {
  onExpandSidebar: () => void
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      <CanvasThemeProvider>
        {children}
      </CanvasThemeProvider>
    </SubscriptionProvider>
  )
}

export function Canvas({ onExpandSidebar }: CanvasProps) {
  let component = (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />
      <CanvasContent 
        onExpandSidebar={onExpandSidebar}
      />
    </div>
  )
  return (
    <Providers>
      {component}
    </Providers>
  )
}