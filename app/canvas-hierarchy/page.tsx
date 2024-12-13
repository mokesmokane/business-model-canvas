'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site/SiteHeader'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav'
import { CanvasHierarchyClient } from '@/components/CanvasHierarchy/CanvasHierarchyClient'
import { useSearchParams } from 'next/navigation'
import { CanvasFoldersProvider } from '@/contexts/CanvasFoldersContext'
import { CanvasContextProvider } from '@/contexts/ContextEnabledContext'
import { AIAgentProvider } from '@/contexts/AIAgentContext'
import { CanvasProvider } from '@/contexts/CanvasContext'
import { AiGenerationProvider } from '@/contexts/AiGenerationContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { Sidebar } from '@/components/Sidebar/Sidebar'

export default function Page() {
  const searchParams = useSearchParams()
  const canvasId = searchParams.get('canvasId')
  const [isMobile, setIsMobile] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const content = (
    <div className="flex-1 overflow-hidden">
      {!canvasId ? (
        <div className="text-muted-foreground p-8">Please provide a canvas ID in the URL</div>
      ) : (
        <CanvasHierarchyClient canvasId={canvasId} />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <MobileHeader />
        {content}
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <CanvasFoldersProvider>
      <CanvasContextProvider>
        <AIAgentProvider>
          <CanvasProvider>
            <AiGenerationProvider>
              <ChatProvider>
                <div className="flex flex-col h-screen">
                  <SiteHeader />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex h-full">
                      <Sidebar setShowAuthDialog={setShowAuthDialog} />
                      <div className="flex-1">
                        {content}
                      </div>
                    </div>
                  </div>
                </div>
              </ChatProvider>
            </AiGenerationProvider>
          </CanvasProvider>
        </AIAgentProvider>
      </CanvasContextProvider>
    </CanvasFoldersProvider>
  )
}

