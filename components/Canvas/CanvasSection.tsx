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

interface CanvasSectionProps {
  title: string
  sectionKey: string
  icon: LucideIcon
  items: string[]
  aiSuggestionMd?: string
  onChange: (value: string[]) => void
  placeholder: string
  className?: string
}

interface Suggestion {
  id: string
  content: string
}

export function CanvasSection({ 
  title, 
  sectionKey, 
  icon: Icon, 
  items, 
  aiSuggestionMd, 
  onChange, 
  placeholder, 
  className 
}: CanvasSectionProps) {
  const itemsArray = Array.isArray(items) ? items : items ? [items] : [];
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (aiSuggestionMd) {
      const newSuggestions = aiSuggestionMd
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map((line, index) => ({
          id: `${sectionKey}-${index}-${Date.now()}`,
          content: line.trim().replace(/^[-*]\s*/, '')
        }))
      setSuggestions(newSuggestions)
    }
  }, [aiSuggestionMd, sectionKey])

  const handleAddSuggestion = (suggestion: Suggestion) => {
    const newItems = [...itemsArray, suggestion.content]
    onChange(newItems)
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  const handleDismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

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
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
          <div className="flex-1" />
          <AIAssistButton section={title} sectionKey={sectionKey} />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          {itemsArray.map((item, index) => (
            <SectionItem
              key={index}
              item={item}
              onDelete={() => handleDeleteItem(index)}
              isEditing={editingIndex === index}
              onEditStart={() => handleEditStart(index)}
            />
          ))}
        </ScrollArea>
        
        {suggestions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">AI Suggestions:</h3>
            {suggestions.map((suggestion) => (
              <AISuggestionItem

                key={suggestion.id}
                suggestion={suggestion}
                onLike={() => handleAddSuggestion(suggestion)}
                onDismiss={() => handleDismissSuggestion(suggestion.id)}
                onExpand={()=>{}}
              />
            ))}
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <DynamicInput 
            placeholder={placeholder}
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