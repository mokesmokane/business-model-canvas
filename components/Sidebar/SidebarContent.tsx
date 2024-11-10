import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayoutDashboard } from 'lucide-react'
import { SidebarSection } from './SidebarSection'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarContentProps {
  isExpanded: boolean
  onToggle: () => void
}

export function SidebarContent({ isExpanded, onToggle }: SidebarContentProps) {
  const { userCanvases } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="flex flex-col gap-4 p-4">
          <SidebarSection
            icon={LayoutDashboard}
            title="Business Models"
            isExpanded={isExpanded}
            onToggle={onToggle}
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