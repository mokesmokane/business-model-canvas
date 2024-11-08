
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
  }
  export function SectionItem({ 
    item, 
    onDelete, 
    isEditing,
    onEditStart
  }: SectionItemProps) {
    return (
      <Card className={`mb-2 p-3 flex items-center justify-between transition-all duration-300 ${
        isEditing ? 'border-primary/50 bg-primary/5 shadow-md' : ''
      }`}>
        <p className="text-sm flex-grow">
          {item}
        </p>
        <div>
          <Button 
            onClick={onEditStart}
            size="sm" 
            variant={isEditing ? "default" : "ghost"}
            className="mr-2"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onDelete} 
            size="sm" 
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }
  
  export default SectionItem