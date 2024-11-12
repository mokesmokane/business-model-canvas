'use client'

import { BusinessModelCanvasComponent } from "@/components/business-model-canvas"
import { SiteHeader } from "@/components/site/SiteHeader"
import { useAuth } from "@/contexts/AuthContext"
import LandingPage from "./landing/LandingPage"

export function MainContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      {user ? (
        <>
          <SiteHeader />
          <div className="flex-1">
            <BusinessModelCanvasComponent />
          </div>
        </>
      ) : (
        <LandingPage />
      )}
    </div>
  )
} 