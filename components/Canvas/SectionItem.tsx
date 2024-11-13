import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIItemAssistButton } from './AIItemAssistButton' 
import { Check, X, Edit2, Trash2 } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'

interface SectionItemProps {
  item: string
  onDelete: () => void
  isEditing: boolean
  onEditStart: () => void
  onEditEnd: () => void
}

export function SectionItem({ 
  item, 
  onDelete, 
  isEditing,
  onEditStart,
  onEditEnd
}: SectionItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { canvasTheme } = useCanvas()

  const showControls = isHovered || isEditing

  return (
    <Card 
      canvasTheme={canvasTheme}
      className={`mb-2 p-3 transition-all duration-300 !bg-transparent ${
        isEditing 
          ? 'border-primary/50 bg-primary/5 shadow-md' 
          : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className={`text-sm whitespace-pre-wrap mb-2 ${
        canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-100'
      }`}>
        {item}
      </p>
      <div 
        className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          showControls ? 'opacity-100 max-h-24 translate-y-0' : 'opacity-0 max-h-0 translate-y-2'
        } overflow-hidden`}
      >
        <div className="flex items-center space-x-2 mt-2 justify-end">
          <AIItemAssistButton 
            section={item} 
            sectionKey={item} 
            onExpandSidebar={() => {}} 
            onDropdownStateChange={() => {}} 
          />
          <Button 
            onClick={isEditing ? onEditEnd : onEditStart}
            size="sm" 
            variant={isEditing ? "default" : "outline"}
            canvasTheme={canvasTheme}
            className={`flex items-center ${
              canvasTheme === 'light' 
                ? 'border-gray-200 hover:bg-gray-100'
                : 'hover:bg-gray-800'
            }`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onDelete} 
            size="sm" 
            variant="outline"
            canvasTheme={canvasTheme}
            className={`flex items-center ${
              canvasTheme === 'light' 
                ? 'border-gray-200 hover:bg-gray-100'
                : 'hover:bg-gray-800'
            }`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default SectionItem