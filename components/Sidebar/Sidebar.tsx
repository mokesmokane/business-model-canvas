import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ChevronRight, ChevronLeft, Expand, Shrink } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { SidebarFooter } from './SidebarFooter'
import { AIChatArea } from './AIChatArea'

interface SidebarProps {
  isExpanded: boolean
  setShowAuthDialog: (show: boolean) => void
}

export function Sidebar({ isExpanded, setShowAuthDialog}: SidebarProps) {
  const [isWide, setIsWide] = useState(false)
  
  const sidebarWidth = !isExpanded ? '4rem' : isWide ? '42rem' : '24rem'

  return (
    <TooltipProvider>
      <div 
        className="relative flex flex-col h-[calc(100vh-64px)] bg-gray-950 border-r border-gray-800"
        style={{ 
          width: sidebarWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="flex-none">
          <SidebarContent isExpanded={isExpanded}/>
        </div>
        <div className="border-t border-gray-800 my-2"></div>
        <div className="flex-grow overflow-hidden">
          <AIChatArea isExpanded={isExpanded}  isWide={isWide} onToggle={()=>setIsWide(!isWide)} />
        </div>
        <div className="flex-none">
          <SidebarFooter isExpanded={isExpanded} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </div>
    </TooltipProvider>
  )
} 