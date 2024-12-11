'use client'

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { CanvasType } from "@/types/canvas-sections"
import { Bot, FileText, Upload } from "lucide-react"
import DynamicIcon from "./Util/DynamicIcon"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { useDocumentDiveSuggestions } from "@/contexts/DocumentDiveSuggestionsContext"
import { useDocumentAiGeneration } from "@/contexts/DocumentAiGenerationContext"
import { DocumentService, ProcessedDocument } from '@/services/document'
import { v4 as uuidv4 } from 'uuid'
import { TAG_INFO } from "@/src/constants/tags"
import { Skeleton } from "@/components/ui/skeleton"
import { useSubscription } from "@/contexts/SubscriptionContext"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Swiper, SwiperSlide } from 'swiper/react'
import { SelectedCanvasTypeCard } from "./CanvasTypeCards/SelectedCanvasTypeCard"

interface MobileDocumentDiveSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (canvasId: string, canvasTypeId: string) => void
}

interface NewCanvasTypeSuggestion {
  name: string;
  icon: string;
  description: string;
  sections: { name: string; placeholder: string }[];
  rationale: string;
}

// Reuse the CompactCanvasTypeCard from MobileCanvasTypeSelector
function CompactCanvasTypeCard({ type, isSelected, onClick }: { 
  type: CanvasType, 
  isSelected: boolean,
  onClick: () => void 
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all h-[180px]",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DynamicIcon name={type.icon} className="w-5 h-5 text-primary" />
          <div className="font-medium text-sm">{type.name}</div>
        </div>
        {type.tags && type.tags.length > 0 && (
          <div className="flex gap-1">
            {type.tags.slice(0, 2).map(tag => {
              const tagInfo = TAG_INFO.find(t => t.name === tag);
              return tagInfo ? (
                <div
                  key={tag}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    tagInfo.color
                  )}
                >
                  {tag}
                </div>
              ) : null;
            })}
            {type.tags.length > 2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-[10px] px-2 py-0.5 bg-muted rounded-full cursor-help">
                      +{type.tags.length - 2}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {type.tags.slice(2).map(tag => {
                        const tagInfo = TAG_INFO.find(t => t.name === tag);
                        return tagInfo ? (
                          <div
                            key={tag}
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full",
                              tagInfo.color
                            )}
                          >
                            {tag}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground line-clamp-4 mb-2">
        {type.description}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {type.sections?.slice(0, 3).map((section: any) => (
          <div 
            key={section.name}
            className="text-[10px] px-2 py-0.5 bg-muted rounded-full truncate max-w-[100px]"
          >
            {section.name}
          </div>
        ))}
        {type.sections?.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground cursor-help">
                  +{type.sections.length - 3} more
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <div className="flex flex-wrap gap-1">
                  {type.sections.slice(3).map((section: any) => (
                    <div 
                      key={section.name}
                      className="text-[10px] px-2 py-0.5 bg-muted rounded-full"
                    >
                      {section.name}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

function Tag({ name, color, selected, onClick }: { 
  name: string
  color: string
  selected: boolean
  onClick: () => void 
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer",
        selected ? color : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
      )}
    >
      {name}
    </div>
  );
}

// Add new component for suggestion cards
function CompactSuggestionCard({ suggestion, onClick }: { 
  suggestion: NewCanvasTypeSuggestion, 
  onClick: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all
        border-border hover:border-primary/50 h-[180px]"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <DynamicIcon name={suggestion.icon} className="w-5 h-5 text-primary" />
        <div className="font-medium text-sm">{suggestion.name}</div>
      </div>
      <div className="text-xs text-muted-foreground line-clamp-4">
        {suggestion.rationale}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {suggestion.sections.slice(0, 3).map((section) => (
          <div 
            key={section.name}
            className="text-[10px] px-2 py-0.5 bg-muted rounded-full truncate max-w-[100px]"
          >
            {section.name}
          </div>
        ))}
        {suggestion.sections.length > 3 && (
          <div className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
            +{suggestion.sections.length - 3} more
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function MobileDocumentDiveSelector({
  isOpen,
  onClose,
  onSuccess,
}: MobileDocumentDiveSelectorProps) {
  const { theme } = useTheme()
  const { canvasTypes } = useCanvasTypes()
  const [content, setContent] = useState<ProcessedDocument | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false)
  const [canvasId, setCanvasId] = useState<string | null>(null)
  const { hasAccessToProFeatures, isFreeUser } = useSubscription()
  const { 
    selected, 
    setSelected, 
    startDiveAnalysis, 
    existingSuggestions, 
    newSuggestions, 
    statusMessage, 
    createCanvas,
    createNewCanvasType 
  } = useDocumentDiveSuggestions()
  const [isCreatingNewType, setIsCreatingNewType] = useState(false)

  const getAvailableTags = () => {
    const availableTags = new Set<string>()
    Object.values(canvasTypes).forEach(type => {
      type.tags?.forEach(tag => availableTags.add(tag))
    })
    return TAG_INFO.filter(tag => availableTags.has(tag.name))
  }

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)

    try {
      const canvasId = uuidv4()
      setCanvasId(canvasId)
      const maxPages = isFreeUser ? 3 : undefined
      const processedContent = await DocumentService.uploadAndProcess(file, canvasId, maxPages)
      setContent(processedContent)
    } catch (error) {
      console.error('Error processing PDF:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderFileUploader = () => {
    if (!hasAccessToProFeatures) {
      return (
        <div className="flex flex-col items-center px-4 py-8">
          <div className="p-3 rounded-full bg-primary/10 mb-5">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Document Analysis
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-[300px]">
            Upload PDFs and let AI analyze them to automatically create the perfect canvas for your needs.
          </p>
          <Link href="/upgrade">
            <Button variant="default" size="lg" className="gap-2 font-medium">
              <span>Upgrade to Pro</span>
              <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                Unlock Feature
              </span>
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Processing your document...</p>
          </div>
        ) : (
          <div 
            className="w-full border-2 border-dashed border-primary/20 rounded-lg 
              flex flex-col items-center justify-center p-6 transition-colors
              hover:border-primary/40 hover:bg-primary/5"
            onClick={() => document.getElementById('mobile-file-upload')?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const files = e.dataTransfer.files
              if (files.length) handleFileSelect(files[0])
            }}
          >
            <input
              type="file"
              id="mobile-file-upload"
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const files = e.target.files
                if (files?.length) handleFileSelect(files[0])
              }}
            />
            <Upload className="w-12 h-12 text-primary/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload a PDF Document
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Tap to select a file
            </p>
            <p className="text-xs text-muted-foreground">
              Supported format: PDF
            </p>
          </div>
        )}

        {isFreeUser && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Trial users can analyze up to 3 pages
            </p>
            <Link href="/upgrade">
              <Button variant="outline" className="gap-2">
                <span>Upgrade to Pro</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Unlimited Pages
                </span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    if (selected) {
      const selectedCanvasType = canvasTypes[selected] || 
                          existingSuggestions.find(s => s.id === selected) ||
                          (isCreatingNewType ? newSuggestions.find(s => s.name === selected) : null)

      if (!selectedCanvasType && !isCreatingNewType) return null;

      if (isCreatingNewType) {
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full px-4 space-y-6">
                <div className="border rounded-lg p-6 bg-card shadow-sm w-full">
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md animate-pulse" />
                    <div className="space-y-2 text-center w-full">
                      <Skeleton className="h-8 w-48 mx-auto animate-pulse" />
                      <Skeleton className="h-4 w-full mx-auto animate-pulse" />
                      <Skeleton className="h-4 w-[90%] mx-auto animate-pulse" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelected(null);
                      setIsCreatingNewType(false);
                    }}
                  >
                    Back to selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <SelectedCanvasTypeCard 
                type={selectedCanvasType} 
                className="max-w-none shadow-none"
                compact
              />
              
              <Button
                className="w-full gap-2"
                disabled={isCreatingCanvas}
                onClick={async () => {
                  if (!content || !selectedCanvasType) return;
                  setIsCreatingCanvas(true);
                  try {
                    const canvas = await createCanvas(selectedCanvasType, content.text, content.fileName, null, canvasId);
                    if (canvas) {
                      localStorage.setItem('pendingDocument', JSON.stringify({
                        textContent: content.text,
                        fileName: content.fileName,
                        processedPages: content.processedPages,
                        pageCount: content.pageCount,
                        canvasId: canvas.id
                      }));
                      localStorage.setItem('lastCanvasId', canvas.id);
                      onSuccess(canvas.id, selectedCanvasType.id);
                      onClose();
                    }
                  } catch (error) {
                    console.error('Error creating canvas', error);
                  } finally {
                    setIsCreatingCanvas(false);
                  }
                }}
              >
                {isCreatingCanvas ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Canvas...
                  </>
                ) : (
                  'Create Canvas'
                )}
              </Button>
              
              <button
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setSelected(null)}
              >
                Back to selection
              </button>
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (showAISuggestions) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              {existingSuggestions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Use an existing canvas type
                  </h3>
                  <Swiper
                    slidesPerView="auto"
                    spaceBetween={12}
                    className="w-full"
                  >
                    {existingSuggestions.map((type) => (
                      <SwiperSlide key={type.id} className="!w-[85%]">
                        <CompactCanvasTypeCard
                          type={type}
                          isSelected={false}
                          onClick={() => setSelected(type.id)}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center py-4">
                  <Bot className="w-6 h-6 text-primary" />
                  <div className="relative">
                    <span className="text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text bg-[length:200%_100%] animate-shimmer">
                      {statusMessage}
                    </span>
                  </div>
                </div>
              )}

              {newSuggestions.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-semibold">
                    Or create a new canvas type
                  </h3>
                  <Swiper
                    slidesPerView="auto"
                    spaceBetween={12}
                    className="w-full"
                  >
                    {newSuggestions.map((newCanvasType) => (
                      <SwiperSlide key={newCanvasType.name} className="!w-[85%]">
                        <CompactSuggestionCard
                          suggestion={newCanvasType}
                          onClick={async () => {
                            setSelected(newCanvasType.name);
                            setIsCreatingNewType(true);
                            await createNewCanvasType(newCanvasType);
                            setIsCreatingNewType(false);
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-background flex justify-center">
            <button
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
              onClick={() => {
                setShowAISuggestions(false)
                setSelected(null)
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="rotate-180"
              >
                <path 
                  d="M6.66667 4L10.6667 8L6.66667 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Back to all canvas types
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4">
            {Object.entries(canvasTypes)
              .filter(([_, type]) => 
                selectedTags.length === 0 || 
                selectedTags.every(tag => type.tags?.includes(tag))
              )
              .map(([key, type]) => (
                <CompactCanvasTypeCard
                  key={key}
                  type={type}
                  isSelected={false}
                  onClick={() => setSelected(type.id)}
                />
              ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
        <SheetHeader className="pt-4">
          <SheetTitle>
            {content ? 'Analyze Document' : 'Upload Document'}
          </SheetTitle>
        </SheetHeader>

        {content && !selected && (
          <div className="px-4">
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center gap-3 mb-1">
                <FileText className="text-primary h-5 w-5 flex-shrink-0" />
                <div className="font-medium text-foreground">{content.fileName}</div>
              </div>
              
              {content.processedPages && content.pageCount && (
                <div className="text-sm text-muted-foreground pl-0.5 flex items-center">
                  {content.processedPages}/{content.pageCount} pages
                  {isFreeUser && content.pageCount > 3 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="ml-1.5 inline-flex items-center text-yellow-600 dark:text-yellow-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              <path d="M12 16v-4" strokeWidth="2" strokeLinecap="round" />
                              <path d="M12 8h.01" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Free trial limited to first 3 pages</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {content && !selected && !showAISuggestions && (
          <div className="p-4 border-b">
            <ScrollArea className="max-h-[60px]">
              <div className="flex gap-2">
                {getAvailableTags().map(({ name, color }) => (
                  <Tag
                    key={name}
                    name={name}
                    color={color}
                    selected={selectedTags.includes(name)}
                    onClick={() => setSelectedTags(prev => 
                      prev.includes(name) 
                        ? prev.filter(t => t !== name)
                        : [...prev, name]
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {content ? (
            renderContent()
          ) : (
            renderFileUploader()
          )}
        </div>

        {content && !showAISuggestions && !selected && (
          <div className="p-4 border-t bg-background">
            <div className="flex flex-col items-center gap-4">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  if (!content) return
                  setIsLoadingSuggestions(true)
                  Promise.resolve(startDiveAnalysis(content.text, content.fileName))
                    .finally(() => setIsLoadingSuggestions(false))
                  setShowAISuggestions(true)
                  setSelected(null)
                }}
              >
                <Bot className="w-5 h-5" />
                Get AI Canvas Suggestions
              </Button>
              <p className="text-sm text-muted-foreground">
                Let AI analyze your document and suggest the best canvas type
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 