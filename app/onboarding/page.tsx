'use client'

import { useState } from "react"
import { OnboardingWizard } from "@/components/Onboarding/OnboardingWizard"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Sidebar } from "@/components/Sidebar/Sidebar"
import { CanvasFoldersProvider } from "@/contexts/CanvasFoldersContext"
import { CanvasContextProvider } from "@/contexts/ContextEnabledContext"
import { AIAgentProvider } from "@/contexts/AIAgentContext"
import { CanvasProvider } from "@/contexts/CanvasContext"
import { AiGenerationProvider } from "@/contexts/AiGenerationContext"
import { ChatProvider } from "@/contexts/ChatContext"
import { CanvasTypeProvider } from "@/contexts/CanvasTypeContext"

export default function OnboardingPage() {
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  return (
    <CanvasTypeProvider>
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
                          <OnboardingWizard />
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
    </CanvasTypeProvider>
  )
}

