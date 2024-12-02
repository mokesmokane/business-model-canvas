import React from 'react'
import { Header } from "./Header"
import { CanvasContent } from "./CanvasContent"
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { AiGenerationStatus } from '@/components/AiGenerationStatus'
import { useCanvas } from '@/contexts/CanvasContext'

interface CanvasProps {
  onExpandSidebar: () => void
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      {children}
    </SubscriptionProvider>
  )
}

export function Canvas({ onExpandSidebar }: CanvasProps) {
  const { formData } = useCanvas();

  let component = (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />
      <CanvasContent 
        onExpandSidebar={onExpandSidebar}
      />
      {formData?.id && <AiGenerationStatus canvasId={formData.id} />}
    </div>
  )
  return (
    <Providers>
      {component}
    </Providers>
  )
}