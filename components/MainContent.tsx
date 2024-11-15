'use client'

import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"
import { useAuth } from "@/contexts/AuthContext"
import LandingPage from "./landing/LandingPage"
import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"
import { MobileHeader } from "./mobile/MobileHeader"
import { MobileBusinessModelCanvas } from "./business-model-canvas/MobileBusinessModelCanvas"

export function MainContent() {
  const { user, isVerified } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // You can adjust this breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {user && isVerified ? (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-1">
            {isMobile ? (
              <>
                <MobileHeader />
                <MobileBusinessModelCanvas />
              </>
            ) : (
              <>
                <MobileHeader />
                <BusinessModelCanvasComponent />
              </>
            )}
          </div>
        </ThemeProvider>
      ) : (
        <LandingPage />
      )}
    </div>
  )
} 