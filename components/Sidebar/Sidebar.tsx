'use client'

import React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarFooter } from './SidebarFooter'
import { SidebarAIChatArea } from '../chat/SidebarAIChatArea'
import { useAuth } from '@/contexts/AuthContext'
import { useExpanded } from '@/contexts/ExpandedContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { CanvasNavigation } from './CanvasNavigation'

interface SidebarProps {
  setShowAuthDialog: (show: boolean) => void
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SubscriptionProvider>
            {children}
      </SubscriptionProvider>
    </TooltipProvider>
  )
} 

export function Sidebar({setShowAuthDialog}: SidebarProps) {
  const { user } = useAuth()
  const { isExpanded, isWide } = useExpanded()
  
  if (!user) return null;
  console.log('isExpanded', isExpanded)
  const sidebarWidth = !isExpanded ? '4rem' : isWide ? '42rem' : '24rem'
  let component = (
      <div 
        className={`relative flex flex-col h-[calc(100vh-64px)] bg-background border-r border-zinc-300/50 dark:border-zinc-800/50 transition-all duration-300 ease-in-out ${
          isExpanded ? 'items-stretch' : 'items-center'
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="flex flex-col gap-4 w-full py-2" style={{ maxHeight: 'calc(100vh / 3)' }}>
          <CanvasNavigation isExpanded={isExpanded} />
        </div>
        {isExpanded && <div className="border-t border-zinc-300/50 dark:border-zinc-700/50 my-2 w-full"></div>}
        <div className={`flex-grow overflow-hidden ${isExpanded ? 'w-full' : 'w-16'}`}>
          <SidebarAIChatArea/>
        </div>
        <div className={`flex-none ${isExpanded ? 'w-full' : 'w-16'}`}>
          <SidebarFooter isExpanded={isExpanded} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </div>
  )
  return (
      component
  )
}
