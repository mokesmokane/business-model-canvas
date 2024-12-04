'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useCanvas } from '@/contexts/CanvasContext'
import { SiteHeader } from '@/components/site/SiteHeader'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MobileBusinessModelCanvas } from '@/components/mobile/MobileBusinessModelCanvas'
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from 'next-themes'
import { Providers } from '@/components/providers/Providers'
import { CanvasFoldersProvider } from '@/contexts/CanvasFoldersContext'
import { CanvasContextProvider } from '@/contexts/ContextEnabledContext'
import { AIAgentProvider } from '@/contexts/AIAgentContext'
import { CanvasProvider } from '@/contexts/CanvasContext'
import { AiGenerationProvider } from '@/contexts/AiGenerationContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { BusinessModelCanvasComponent } from '@/components/business-model-canvas'
import { useState } from 'react'

export default function CanvasPage() {
  const params = useParams()
  const { loadCanvas } = useCanvas()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      loadCanvas(params.id)
    }
  }, [params.id, loadCanvas])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Providers>
        <CanvasFoldersProvider>
          <CanvasContextProvider>
            <AIAgentProvider>
              <CanvasProvider>
                <AiGenerationProvider>
                  <ChatProvider>
                    {isMobile ? (
                      <div className="flex flex-col h-screen overflow-hidden">
                        <MobileHeader />
                        <MobileBusinessModelCanvas canvasId={params.id as string} />
                        <MobileBottomNav />
                      </div>
                    ) : (
                      <div className="flex flex-col h-screen overflow-hidden">
                        <SiteHeader />
                        <div className="flex-1 overflow-hidden">
                          <BusinessModelCanvasComponent canvasId={params.id as string} />
                        </div>
                      </div>
                    )}
                  </ChatProvider>
                </AiGenerationProvider>
              </CanvasProvider>
            </AIAgentProvider>
          </CanvasContextProvider>
        </CanvasFoldersProvider>
      </Providers>
    </ThemeProvider>
  )
} 