'use client'

import { UserCanvasSelector } from "@/components/UserCanvasSelector"
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav"
import { Providers } from "@/components/providers/Providers"
import { AIAgentProvider } from "@/contexts/AIAgentContext"
import { CanvasProvider } from "@/contexts/CanvasContext"
import { CanvasFoldersProvider } from "@/contexts/CanvasFoldersContext"
import { CanvasContextProvider } from "@/contexts/ContextEnabledContext"

export default function CanvasesPage() {
  return (
    <>
      <Providers>
        <CanvasFoldersProvider>
          <CanvasContextProvider>
            <AIAgentProvider>
              <CanvasProvider>
                <div className="h-[calc(100vh-4rem)]">
                  <UserCanvasSelector />    
                </div>
              </CanvasProvider>
            </AIAgentProvider>
          </CanvasContextProvider>
        </CanvasFoldersProvider>
      </Providers>
      <MobileBottomNav />
    </>
  )
} 