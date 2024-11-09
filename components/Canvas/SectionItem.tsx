import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LucideIcon, Send } from 'lucide-react'
import { AIAssistButton } from './AIAssistButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '../ui/input'
import { Check, X, Edit2, Trash2 } from 'lucide-react'
import { DynamicInput } from './DynamicInput'
import AISuggestionItem from './AISuggestionItem'

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

    const showControls = isHovered || isEditing

    return (
      <Card 
        className={`mb-2 p-3 transition-all duration-300 ${
          isEditing ? 'border-primary/50 bg-primary/5 shadow-md' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p className="text-sm whitespace-pre-wrap mb-2">
          {item}
        </p>
        <div 
          className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            showControls ? 'opacity-100 max-h-24 translate-y-0' : 'opacity-0 max-h-0 translate-y-2'
          } overflow-hidden`}
        >
          <div className="flex items-center space-x-2 mt-2 justify-end">
            <AIAssistButton section={item} sectionKey={item} />
            <Button 
              onClick={isEditing ? onEditEnd : onEditStart}
              size="sm" 
              variant={isEditing ? "default" : "outline"}
              className="flex items-center"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onDelete} 
              size="sm" 
              variant="outline"
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }
  
  export default SectionItem