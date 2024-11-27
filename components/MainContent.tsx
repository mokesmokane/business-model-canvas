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
export function MainContent() {
  const { user, isVerified } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

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
          <Providers>
            <CanvasFoldersProvider>
            <CanvasContextProvider>
            <AIAgentProvider>
                <CanvasProvider>
                <ChatProvider>
                  {isMobile ? (
                  <>
                    <MobileHeader />
                    <MobileBusinessModelCanvas />
                  </>
                ) : (
                  <div className="flex flex-col h-screen overflow-hidden">
                    <SiteHeader />
                    <div className="flex-1 overflow-hidden">
                      <BusinessModelCanvasComponent />
                    </div>
                  </div>
                )}
                </ChatProvider> 
                </CanvasProvider>
              </AIAgentProvider>    
              </CanvasContextProvider>
            </CanvasFoldersProvider>
          </Providers>
        </ThemeProvider>
      ) : (
        <LandingPage />
      )}
    </div>
  )
} 