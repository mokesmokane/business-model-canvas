'use client'

import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LucideIcon, MoreVertical, Send } from 'lucide-react'
import { AISectionAssistButton } from './AISectionAssistButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DynamicInput } from './DynamicInput'
import SectionItem from './SectionItem'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Section } from '@/types/canvas'
import { Button } from '../ui/button'
import { QuestionsDialog } from './QuestionsDialog'
import { useCanvas } from '@/contexts/CanvasContext'

interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

interface CanvasSectionProps {
  title: string;
  sectionKey: string;
  icon: LucideIcon;
  section: Section;
  onChange: (value: string[]) => void;
  placeholder: string;
  className?: string;
}

export function CanvasSection({ 
  title, 
  sectionKey, 
  icon: Icon, 
  section,
  onChange, 
  placeholder, 
  className 
}: CanvasSectionProps) {
  const { updateQuestions, canvasTheme } = useCanvas()
  const itemsArray = Array.isArray(section.items) ? section.items : section.items ? [section.items] : [];
  const questionsArray = Array.isArray(section.qAndAs) ? section.qAndAs : section.qAndAs ? [section.qAndAs] : [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = useState(false)


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

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questionsArray]
    newQuestions.splice(index, 1)
    updateQuestions(sectionKey, newQuestions)
  }

  const handleEditQuestion = (index: number, updatedQuestion: any) => {
    const newQuestions = [...questionsArray]
    newQuestions[index] = updatedQuestion
    // You'll need to add a method to update questions in your context/state management
    // updateQuestions(sectionKey, newQuestions)
  }

  return (
    <Card 
      canvasTheme={canvasTheme}
    className={`flex flex-col p-1 transition-all duration-300 !bg-transparent ${className}`}>
      <CardHeader className={`${
        canvasTheme === 'light' 
          ? 'bg-white border-gray-200'
          : 'bg-gray-950 border-gray-800'
      }`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className={`flex items-center gap-2 ${
                canvasTheme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`} />
                {title}
                <div className="flex-1" />
                {questionsArray.length > 0 && (
                  <Button 
                    canvasTheme={canvasTheme}
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsQuestionsDialogOpen(true)}
                  >
                    <MoreVertical />
                  </Button>
                )}
                <AISectionAssistButton section={title} sectionKey={sectionKey} onExpandSidebar={() => {}} />
              </CardTitle>
            </TooltipTrigger>
            {(itemsArray.length > 0) && (
              <TooltipContent className={`whitespace-pre-line text-sm ${
                canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {placeholder}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className={`flex-1 flex flex-col ${
        canvasTheme === 'light' 
          ? 'bg-white'
          : 'bg-gray-950'
      }`}>
        <ScrollArea className="flex-1 mb-4 h-full">
          {itemsArray.length === 0 ? (
            <p className={`text-sm whitespace-pre-line ${
              canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
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
        
        <div className="mt-auto">
          <DynamicInput 
            placeholder={title}
            onSubmit={handleAddOrUpdateItem}
            onCancel={editingIndex !== null ? handleEditCancel : undefined}
            initialValue={editingIndex !== null ? itemsArray[editingIndex] : ''}
            isEditing={editingIndex !== null}
          />
        </div>
      </CardContent>
      <QuestionsDialog
        open={isQuestionsDialogOpen}
        onOpenChange={setIsQuestionsDialogOpen}
        questions={questionsArray}
        onDelete={handleDeleteQuestion}
        onEdit={handleEditQuestion}
        sectionTitle={title}
      />
    </Card>
  )
}