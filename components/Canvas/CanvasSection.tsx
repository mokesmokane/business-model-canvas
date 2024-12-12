'use client'

import React, { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LucideIcon, MoreVertical, Send, Grid2x2, List, Grid, Eye, EyeOff, MessageCircleQuestion } from 'lucide-react'
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
import { useAiGeneration } from '@/contexts/AiGenerationContext';
import { useRouter } from 'next/navigation'
import { MobileConfirmDiveInSheet } from './MobileConfirmDiveInSheet'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SectionItemAIEditProvider } from '@/contexts/SectionItemAIEditContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

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
  const { updateQuestions, canvasTheme, updateItem, loadCanvas, formData, updateSectionViewPreferences, showInputs } = useCanvas();
  const { generationStatus } = useAiGeneration();
  const isGenerating = formData?.id ? generationStatus[formData.id]?.isGenerating : false;
  const currentGeneratingSection = formData?.id ? generationStatus[formData.id]?.currentSection : null;
  const isCurrentSectionGenerating = currentGeneratingSection === title;
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
  const router = useRouter()
  const isMobile = useIsMobile()
  const [viewType, setViewType] = useState<{ type: 'list' | 'grid', columns?: number }>(
    section.viewPreferences?.type === 'grid' 
      ? { type: 'grid', columns: section.viewPreferences.columns || 2 }
      : { type: 'list' }
  );
  const [isActive, setIsActive] = useState(false);

  // Update preferences when they change
  useEffect(() => {
    updateSectionViewPreferences(sectionKey, {
      type: viewType.type,
      columns: viewType.columns
    });
  }, [viewType, sectionKey, updateSectionViewPreferences]);

  // Handle section click
  const handleSectionClick = () => {
    if (!showInputs) {
      setIsActive(true);
    }
  };

  // Handle clicking outside the section
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      const isClickInside = element.closest(`[data-section-id="${sectionKey}"]`);
      if (!isClickInside && !showInputs) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sectionKey, showInputs]);

  const handleItemClick = (index: number) => {
    setExpandedItemIndex(expandedItemIndex === index ? null : index);
  };

  const handleAddOrUpdateItem = (content: string) => {
    if (isGenerating) return;
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

  const handleDeleteLink = (index: number) => {
    const newItems = [...sectionItemsArray]
    newItems[index].canvasLink = null
    onChange(newItems)
  }

  const handleDeleteItem = (index: number) => {
    if (isGenerating) return;
    const newItems = [...sectionItemsArray]
    newItems.splice(index, 1)
    onChange(newItems)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const handleEditStart = (index: number) => {
    if (isGenerating) return;
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
    if (isGenerating) return;
    if(item.canvasLink) {
      localStorage.setItem('lastCanvasId', item.canvasLink.canvasId)
      router.push(`/canvas/${item.canvasLink.canvasId}`)
    } else {
      setIsDiveInDialogOpen(true)
      setDiveInItem(item)
    }
  }
  
  const getGridClass = (columns?: number) => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      default:
        return 'grid-cols-2';
    }
  };

  return (
    <Card 
      data-section-id={sectionKey}
      canvasTheme={canvasTheme}
      className={`flex flex-col h-full max-h-full overflow-hidden ${isGenerating ? 'opacity-50' : ''} ${isCurrentSectionGenerating ? 'border-primary' : ''}`}
      onClick={handleSectionClick}
    >
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
                {isCurrentSectionGenerating && (
                  <div className="ml-2 text-xs text-primary animate-pulse">
                    Generating...
                  </div>
                )}
                <div className="flex-1" />
                {!isGenerating && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`${
                          canvasTheme === 'light'
                            ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                            : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800'
                        }`}
                      >
                        <Grid2x2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" canvasTheme={canvasTheme}>
                      <DropdownMenuLabel>View Options</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setViewType({ type: 'list' })}>
                        <List className="h-4 w-4 mr-2" />
                        List View {viewType.type === 'list' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Grid Layout</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setViewType({ type: 'grid', columns: 2 })}>
                        <Grid className="h-4 w-4 mr-2" />
                        2 Columns {viewType.type === 'grid' && viewType.columns === 2 && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewType({ type: 'grid', columns: 3 })}>
                        <Grid className="h-4 w-4 mr-2" />
                        3 Columns {viewType.type === 'grid' && viewType.columns === 3 && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewType({ type: 'grid', columns: 4 })}>
                        <Grid className="h-4 w-4 mr-2" />
                        4 Columns {viewType.type === 'grid' && viewType.columns === 4 && '✓'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {questionsArray.length > 0 && !isGenerating && (
                  <Button 
                    canvasTheme={canvasTheme}
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsQuestionsDialogOpen(true)}
                  >
                    <MessageCircleQuestion />
                  </Button>
                )}
                {!isGenerating && (
                  <AISectionAssistButton 
                    section={title} 
                    sectionKey={sectionKey} 
                    onExpandSidebar={() => {setIsWide(true); setIsExpanded(true)}} 
                  />
                )}
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
      <CardContent className={`flex-1 flex flex-col overflow-hidden ${isGenerating ? 'pointer-events-none' : ''}`}>
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

          <div className={viewType.type === 'grid' 
            ? `grid ${getGridClass(viewType.columns)} gap-2` 
            : 'space-y-2'
          }>
            {sectionItemsArray.map((item, index) => (
              <SectionItemAIEditProvider>
                <SectionItem
                  key={index}
                  item={item}
                  section={sectionKey}
                  onDiveIn={handleDiveIn}
                  isActive={activeItemIndex === index}  
                  isExpanded={expandedItemIndex === index}
                  onClick={() => handleItemClick(index)}
                  onDelete={() => handleDeleteItem(index)}
                  isEditing={editingIndex === index}
                  onEditStart={() => handleEditStart(index)}
                  onDeleteLink={() => handleDeleteLink(index)}
                  onEditEnd={() => handleEditCancel()}
                  className={`cursor-pointer ${
                    expandedItemIndex === index ? 'bg-gray-200' : ''
                  } hover:bg-gray-100`}
                />
              </SectionItemAIEditProvider>
            ))}
          </div>
        </ScrollArea>
        
        {(showInputs || isActive) && (
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
        )}
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
      {isMobile ? (
        <MobileConfirmDiveInSheet
          isOpen={isDiveInDialogOpen && diveInItem !== null}
          onClose={() => setIsDiveInDialogOpen(false)}
          icon={Icon}
          onConfirm={() => {
            setIsDiveInDialogOpen(false)
            setLetsDiveIn(true)
          }}
          itemContent={(diveInItem as TextSectionItem)?.content || ''}
          sectionName={title}
        />
      ) : (
        <ConfirmDiveInDialog
          isOpen={isDiveInDialogOpen && diveInItem !== null}
          onClose={() => setIsDiveInDialogOpen(false)}
          icon={Icon}
          onConfirm={() => {
            setIsDiveInDialogOpen(false)
            setLetsDiveIn(true)
          }}
          itemContent={(diveInItem as TextSectionItem)?.content || ''}
          sectionName={title}
        />
      )}

      <Dialog open={letsDiveIn} onOpenChange={setLetsDiveIn}>
        <DialogContent className="!max-w-[80vw] !w-[80vw] sm:!max-w-[80vw] h-[85vh] overflow-hidden rounded-md border">
          <DialogTitle></DialogTitle>
          <CanvasDiveSelector
            onSuccess={async (canvasId, canvasTypeId) => {
              console.log('canvasId', canvasId);
              const updatedItem = {...diveInItem, canvasLink: {canvasId, canvasTypeId}} as SectionItemType
              await updateItem(sectionKey, updatedItem)
              setLetsDiveIn(false)
              setDiveInItem(null)
              if (canvasId) {
                console.log('loading canvas', canvasId)
                loadCanvas(canvasId)
                localStorage.setItem('lastCanvasId', canvasId)
              }
            }}
            section={
              {
                id: sectionKey,
                name: title,
                icon: Icon,
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