'use client'

import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"
import { useAuth } from "@/contexts/AuthContext"
import LandingPage from "./landing/LandingPage"
import { ThemeProvider } from "next-themes"

export function MainContent() {
  const { user, isVerified } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      {user && isVerified ? (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <div className="flex-1">
            <BusinessModelCanvasComponent />
          </div>
        </ThemeProvider>
      ) : (
        <LandingPage />
      )}
    </div>
  )
} 