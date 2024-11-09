'use client'

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
import SectionItem from './SectionItem'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

interface CanvasSectionProps {
  title: string;
  sectionKey: string;
  icon: LucideIcon;
  items: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  className?: string;
}

export function CanvasSection({ 
  title, 
  sectionKey, 
  icon: Icon, 
  items, 
  onChange, 
  placeholder, 
  className 
}: CanvasSectionProps) {
  const itemsArray = Array.isArray(items) ? items : items ? [items] : [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddOrUpdateItem = (content: string) => {
    if (editingIndex !== null) {
      // Update existing item
      const newItems = [...itemsArray]
      newItems[editingIndex] = content
      onChange(newItems)
      setEditingIndex(null)
    } else {
      // Add new item
      const newItems = [...itemsArray, content]
      onChange(newItems)
    }
  }

  const handleDeleteItem = (index: number) => {
    const newItems = [...itemsArray]
    newItems.splice(index, 1)
    onChange(newItems)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const handleEditStart = (index: number) => {
    setEditingIndex(index)
  }

  const handleEditCancel = () => {
    setEditingIndex(null)
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {title}
                <div className="flex-1" />
                <AIAssistButton section={title} sectionKey={sectionKey} onExpandSidebar={() => {}} />
              </CardTitle>
            </TooltipTrigger>
            {(itemsArray.length > 0) && (
              <TooltipContent className="whitespace-pre-line text-sm text-muted-foreground">
                {placeholder}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          {itemsArray.length === 0 ? (
            <p className="text-gray-500 text-sm whitespace-pre-line">
              {placeholder}
            </p>
          ) : (
            itemsArray.map((item, index) => (
              <SectionItem
                key={index}
                item={item}
                onDelete={() => handleDeleteItem(index)}
                isEditing={editingIndex === index}
                onEditStart={() => handleEditStart(index)}
                onEditEnd={() => handleEditCancel()}
              />
            ))
          )}
        </ScrollArea>
        
        <div className="flex items-center space-x-2">
          <DynamicInput 
            placeholder={title}
            onSubmit={handleAddOrUpdateItem}
            onCancel={editingIndex !== null ? handleEditCancel : undefined}
            initialValue={editingIndex !== null ? itemsArray[editingIndex] : ''}
            isEditing={editingIndex !== null}
          />
        </div>
      </CardContent>
    </Card>
  )
}