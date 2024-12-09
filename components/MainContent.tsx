'use client'

import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"
import { useAuth } from "@/contexts/AuthContext"
import LandingPage from "./landing/LandingPage"
import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"
import { MobileHeader } from "./mobile/MobileHeader"
import { MobileBusinessModelCanvas } from "./mobile/MobileBusinessModelCanvas"
import { CanvasProvider } from "@/contexts/CanvasContext"
import { AIAgentProvider } from "@/contexts/AIAgentContext"
import { Providers } from "./providers/Providers"
import { CanvasFoldersProvider } from "@/contexts/CanvasFoldersContext"
import { CanvasContextProvider } from "@/contexts/ContextEnabledContext"
import { ChatProvider } from "@/contexts/ChatContext"
import { AiGenerationProvider } from "@/contexts/AiGenerationContext"
import { MobileBottomNav } from "./mobile/MobileBottomNav"
import { UserCanvasSelector } from "./UserCanvasSelector"
import { Sidebar } from "./Sidebar/Sidebar"

export function MainContent() {
  const { user, isVerified } = useAuth()
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

  return (
    <div className={`h-screen flex flex-col ${user && isVerified ? 'overflow-hidden' : ''}`}>
      {user && isVerified ? (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <CanvasFoldersProvider>
            <CanvasContextProvider>
            <AIAgentProvider>
                <CanvasProvider>
                <AiGenerationProvider>
                <ChatProvider>
                  {isMobile ? (
                  <>
                    <MobileHeader />                      
                    <UserCanvasSelector />
                    <MobileBottomNav />
                  </>
                ) : (
                  <div className="flex flex-col h-screen overflow-hidden">
                    <SiteHeader />
                    <div className="flex-1 overflow-hidden">
                      <UserCanvasSelector />
                    </div>
                  </div>
                )}
                </ChatProvider> 
                </AiGenerationProvider>
                </CanvasProvider>
              </AIAgentProvider>    
              </CanvasContextProvider>
            </CanvasFoldersProvider>
        </ThemeProvider>
      ) : (
        <LandingPage />
      )}
    </div>
  )
} 