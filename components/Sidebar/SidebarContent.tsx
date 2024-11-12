import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayoutDashboard } from 'lucide-react'
import { SidebarSection } from './SidebarSection'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarContentProps {
  isExpanded: boolean
}

export function SidebarContent({ isExpanded }: SidebarContentProps) {
  const { userCanvases } = useAuth()

  return (
    <div className={`flex flex-col h-full ${isExpanded ? '' : 'items-center'}`}>
      <ScrollArea className={`flex-grow ${isExpanded ? 'w-full' : 'w-16'}`}>
        <div className={`flex flex-col gap-4 ${isExpanded ? 'px-4 py-2' : 'items-center py-2'}`}>
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
      </ScrollArea>
    </div>
  )
}