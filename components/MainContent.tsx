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
import { useRouter } from 'next/navigation'

export function MainContent() {
  const { user, isVerified } = useAuth()
  const router = useRouter()
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

  useEffect(() => {
    // Check if user needs onboarding
    if (user && isVerified) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
      if (!hasCompletedOnboarding) {
        router.push('/onboarding')
      }
    }
  }, [user, isVerified, router])

  if (!user || !isVerified) {
    return null // or a loading state, or redirect
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
    </div>
  )
} 