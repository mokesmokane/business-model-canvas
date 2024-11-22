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
import { NewCanvasProvider } from "@/contexts/NewCanvasContext"
import { AIAgentProvider } from "@/contexts/AIAgentContext"
import { Providers } from "./providers/Providers"
import { SIDEBAR_WIDTH_MOBILE} from "@/src/constants/sideBarWidths"
import { CanvasFoldersProvider } from "@/contexts/CanvasFoldersContext"
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
    <div className="h-screen flex flex-col overflow-hidden">
      {user && isVerified ? (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <CanvasFoldersProvider>
            <NewCanvasProvider>
              <CanvasProvider>
              <AIAgentProvider>
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
              </AIAgentProvider>
            </CanvasProvider>
          </NewCanvasProvider> 
          </CanvasFoldersProvider>
          </Providers>
        </ThemeProvider>
      ) : (
        <LandingPage />
      )}
    </div>
  )
} 