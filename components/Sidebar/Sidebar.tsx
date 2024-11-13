'use client'

import React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LayoutDashboard } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { SidebarFooter } from './SidebarFooter'
import { AIChatArea } from './AIChatArea'
import { SidebarSection } from './SidebarSection'
import { useAuth } from '@/contexts/AuthContext'
import { useExpanded } from '@/contexts/ExpandedContext'
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ChatProvider } from '@/contexts/ChatContext'

interface SidebarProps {
  setShowAuthDialog: (show: boolean) => void
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SubscriptionProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
      </SubscriptionProvider>
    </TooltipProvider>
  )
} 

export function Sidebar({setShowAuthDialog}: SidebarProps) {
  const { user } = useAuth()
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  const { userCanvases } = useCanvas()
  
  if (!user) return null;

  const sidebarWidth = !isExpanded ? '4rem' : isWide ? '42rem' : '24rem'
  let component = (
      <div 
        className={`relative flex flex-col h-[calc(100vh-64px)] bg-background border-r border-zinc-300/50 dark:border-zinc-800/50 transition-all duration-300 ease-in-out ${
          isExpanded ? 'items-stretch' : 'items-center'
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className={`flex flex-col gap-4 ${isExpanded ? 'pw-full py-2' : 'items-center py-2'}`}>
          <SidebarSection
            icon={LayoutDashboard}
            title="Business Models"
            isExpanded={isExpanded}
          />
        </div>
        {isExpanded && <div className="border-t border-zinc-300/50 dark:border-zinc-700/50 my-2 w-full"></div>}
        <div className={`flex-grow overflow-hidden ${isExpanded ? 'w-full' : 'w-16'}`}>
          <AIChatArea/>
        </div>
        <div className={`flex-none ${isExpanded ? 'w-full' : 'w-16'}`}>
          <SidebarFooter isExpanded={isExpanded} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </div>
  )
  return (
    <Providers>
      {component}
    </Providers>
  )
}
