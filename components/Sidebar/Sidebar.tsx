import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LayoutDashboard } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { SidebarFooter } from './SidebarFooter'
import { AIChatArea } from './AIChatArea'
import { SidebarSection } from './SidebarSection'
import { useAuth } from '@/contexts/AuthContext'
import { useExpanded } from '@/contexts/ExpandedContext'


interface SidebarProps {
  isExpanded: boolean
  setShowAuthDialog: (show: boolean) => void
}

export function Sidebar({setShowAuthDialog}: SidebarProps) {
  const { user, userCanvases } = useAuth()
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  
  // Don't render sidebar if no user
  if (!user) return null;

  const sidebarWidth = !isExpanded ? '4rem' : isWide ? '42rem' : '24rem'

  return (
    <TooltipProvider>
      <div 
        className={`relative flex flex-col h-[calc(100vh-64px)] bg-gray-950 border-r border-gray-800 transition-all duration-300 ease-in-out ${
          isExpanded ? 'items-stretch' : 'items-center'
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className={`flex flex-col gap-4 ${isExpanded ? 'pw-full py-2' : 'items-center py-2'}`}>
          <SidebarSection
            icon={LayoutDashboard}
            title="Business Models"
            isExpanded={isExpanded}
            items={userCanvases.map(canvas => ({
              id: canvas.id,
              name: canvas.companyName || 'Untitled Canvas'
            }))}
          />
        </div>
        {isExpanded && <div className="border-t border-gray-800 my-2 w-full"></div>}
        <div className={`flex-grow overflow-hidden ${isExpanded ? 'w-full' : 'w-16'}`}>
          <AIChatArea/>
        </div>
        <div className={`flex-none ${isExpanded ? 'w-full' : 'w-16'}`}>
          <SidebarFooter isExpanded={isExpanded} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </div>
    </TooltipProvider>
  )
}