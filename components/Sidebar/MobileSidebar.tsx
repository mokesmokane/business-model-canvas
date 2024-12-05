'use client'

import React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarFooter } from './SidebarFooter'
import { useAuth } from '@/contexts/AuthContext'
import { useExpanded } from '@/contexts/ExpandedContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { CanvasNavigation } from './CanvasNavigation'

interface MobileSidebarProps {
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

export function MobileSidebar({setShowAuthDialog}: MobileSidebarProps) {
  const { user } = useAuth()
  const { isWide } = useExpanded()
  
  if (!user) return null;

  const sidebarWidth = isWide ? '42rem' : '24rem'
  let component = (
      <div 
        className="relative flex flex-col h-[calc(100vh)] bg-background border-r border-zinc-300/50 dark:border-zinc-800/50 transition-all duration-300 ease-in-out items-stretch z-50"
        style={{ width: sidebarWidth }}
      >
        <div className="flex flex-col gap-4 w-full py-2" style={{ maxHeight: 'calc(100vh * 0.4)' }}>
          <CanvasNavigation isExpanded={true} />
        </div>
        <div className="border-t border-zinc-300/50 dark:border-zinc-700/50 my-2 w-full"></div>
        <div className="flex-grow w-full" />
        <div className="w-full">
          <SidebarFooter isExpanded={true} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </div>
  )
  return (
      component
  )
}
