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
      <div className={`flex flex-col h-screen border-r transition-all duration-300 ${isExpanded ? "w-96" : "w-16"}`}>
        <div className="flex items-center justify-between p-4">
          {isExpanded && <h2 className="text-lg font-semibold">Menu</h2>}
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-none">
          <SidebarContent isExpanded={isExpanded}/>
        </div>
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