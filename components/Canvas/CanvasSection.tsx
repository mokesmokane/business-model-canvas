'use client'

import React, { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LucideIcon, MoreVertical, Send } from 'lucide-react'
import { AISectionAssistButton } from './AISectionAssistButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DynamicInput } from './DynamicInput'
import SectionItem from './SectionItem'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Section, TextSectionItem } from '@/types/canvas'
import { Button } from '../ui/button'
import { QuestionsDialog } from './QuestionsDialog'
import { useCanvas } from '@/contexts/CanvasContext'
import { debounce } from 'lodash'
import DynamicIcon from '../Util/DynamicIcon'
import { useExpanded } from '@/contexts/ExpandedContext'
import { ConfirmDiveInDialog } from './ConfirmDiveInDialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { CanvasDiveSelector } from '../CanvasDiveSelector'
import { DiveSuggestionsProvider } from '@/contexts/DiveSuggestionsContext'
import { SectionItem as SectionItemType } from '@/types/canvas'
import { v4 as uuidv4 } from 'uuid';
interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

interface CanvasSectionProps {
  title: string;
  sectionKey: string;
  icon: string;
  section: Section;
  onChange: (value: SectionItemType[]) => void;
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
  const { updateQuestions, canvasTheme, updateItem, loadCanvas } = useCanvas()
  const sectionItemsArray = section.sectionItems || [];
  const questionsArray = section.qAndAs || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const { setIsExpanded, setIsWide } = useExpanded()
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);
  const [isDiveInDialogOpen, setIsDiveInDialogOpen] = useState(false)
  const [diveInItem, setDiveInItem] = useState<SectionItemType | null>(null)
  const [letsDiveIn, setLetsDiveIn] = useState(false)

  const handleItemClick = (index: number) => {
    setExpandedItemIndex(expandedItemIndex === index ? null : index);
  };

  const handleAddOrUpdateItem = (content: string) => {
    if (editingIndex !== null && editingIndex >= 0) {
      // Update existing item
      const newItems = [...sectionItemsArray]
      newItems[editingIndex] = new TextSectionItem(uuidv4(), content) 
      onChange(newItems)
      setEditingIndex(null)
    } else {
      // Add new item
      const newItems = [...sectionItemsArray, new TextSectionItem(uuidv4(), content)]
      onChange(newItems)
    }
  }

  const handleDeleteItem = (index: number) => {
    const newItems = [...sectionItemsArray]
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

  const handleDiveIn = (item: SectionItemType) => {
    if(item.canvasLink) {
      loadCanvas(item.canvasLink);
      localStorage.setItem('lastCanvasId', item.canvasLink);
    } else {
      setIsDiveInDialogOpen(true)
      setDiveInItem(item)
    }
  }
  
  return (
    <Card 
      canvasTheme={canvasTheme}
    className={`flex flex-col h-full max-h-full overflow-hidden`}>
      <CardHeader className={`flex-shrink-0`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className={`flex items-center gap-2 ${
                canvasTheme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                <DynamicIcon name={Icon} className={`h-5 w-5 ${
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
                <AISectionAssistButton section={title} sectionKey={sectionKey} onExpandSidebar={() => {setIsWide(true); setIsExpanded(true)}} />
              </CardTitle>
            </TooltipTrigger>
            {(sectionItemsArray.length > 0) && (
              <TooltipContent className={`whitespace-pre-line text-sm ${
                canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {placeholder}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className={`flex-1 flex flex-col overflow-hidden`}>
      <ScrollArea 
          className="flex-1 relative"
          style={{ height: 'calc(100% - 60px)' }}
        >
                    {sectionItemsArray.length === 0 && (
            <div className={`absolute top-0 left-0 pointer-events-none text-sm whitespace-pre-line ${
              canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {placeholder}
            </div>
          )}

          <div className="space-y-2">
            {sectionItemsArray.map((item, index) => (
              <SectionItem
                key={index}
                item={item}
                onDiveIn={handleDiveIn}
                isActive={activeItemIndex === index}
                isExpanded={expandedItemIndex === index}
                onClick={() => handleItemClick(index)}
                onDelete={() => handleDeleteItem(index)}
                isEditing={editingIndex === index}
                onEditStart={() => handleEditStart(index)}
                onEditEnd={() => handleEditCancel()}
                className={`cursor-pointer ${
                  expandedItemIndex === index ? 'bg-gray-200' : ''
                } hover:bg-gray-100`}
              />
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex-shrink-0 mt-auto pt-2">
          <DynamicInput 
            placeholder={`Add ${title}`}
            section={section}
            onSubmit={handleAddOrUpdateItem}
            onCancel={() => {
              handleEditCancel();
              setEditingIndex(null);
            }}
            initialValue={editingIndex !== null ? (sectionItemsArray[editingIndex] as TextSectionItem).content : ''}
            isEditing={editingIndex !== null}
            key={`input-${editingIndex}`}
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

      <DiveSuggestionsProvider>
      <ConfirmDiveInDialog
        isOpen={isDiveInDialogOpen && diveInItem !== null}
        onClose={() => setIsDiveInDialogOpen(false)}
        onConfirm={() => {
          setIsDiveInDialogOpen(false)
          setLetsDiveIn(true)
        }}
        itemContent={(diveInItem as TextSectionItem)?.content || ''}
        sectionName={title}
        icon={Icon}
      />

      <Dialog open={letsDiveIn} onOpenChange={setLetsDiveIn}>
        <DialogContent className="!max-w-[80vw] !w-[80vw] sm:!max-w-[80vw] h-[85vh] overflow-hidden rounded-md border">
          <DialogTitle></DialogTitle>
          <CanvasDiveSelector
            onSuccess={async (canvasId) => {
              console.log('canvasId', canvasId);
              const updatedItem = {...diveInItem, canvasLink: canvasId} as SectionItemType
              await updateItem(sectionKey, updatedItem)
              setLetsDiveIn(false)
              setDiveInItem(null)
              if (canvasId) {
                console.log('loading canvas', canvasId)
                // loadCanvas(canvasId)
                // localStorage.setItem('lastCanvasId', canvasId)
              }
            }}
              section={
                {
                  id: sectionKey,
                  name: title,
                  placeholder: placeholder
                }
              }
              item={diveInItem!}
              onClose={() => setLetsDiveIn(false)}
            />
        </DialogContent>
      </Dialog>
      </DiveSuggestionsProvider>
    </Card>
  )
}