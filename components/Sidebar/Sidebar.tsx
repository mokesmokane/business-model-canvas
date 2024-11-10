import React from 'react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Menu } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { SidebarFooter } from './SidebarFooter'
import { AIChatArea } from './AIChatArea'

interface SidebarProps {
  isExpanded: boolean
  onToggle: () => void
  setShowAuthDialog: (show: boolean) => void
}

export function Sidebar({ isExpanded, onToggle, setShowAuthDialog}: SidebarProps) {
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-screen bg-gray-950 border-r border-gray-800 transition-all duration-300 ${isExpanded ? "w-96" : "w-16"}`}>
        <div className="flex-none">
          <SidebarContent isExpanded={isExpanded} onToggle={onToggle} />
        </div>
        <div className="border-t border-gray-800 my-2"></div>
        <div className="flex-grow overflow-hidden">
          <AIChatArea isExpanded={isExpanded} />
        </div>
        <div className="flex-none">
          <SidebarFooter isExpanded={isExpanded} setShowAuthDialog={setShowAuthDialog} />
        </div>
      </div>
    </TooltipProvider>
  )
} 