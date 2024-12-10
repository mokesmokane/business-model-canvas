'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CanvasType } from "@/types/canvas-sections"
import { useTheme } from "next-themes"
import DynamicIcon from "./Util/DynamicIcon"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { Bot, FileText, Upload } from "lucide-react"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { CanvasTypeCardTags } from "./CanvasTypeCards/CanvasTypeCardTags"
import { CanvasTypeCard } from "./CanvasTypeCards/CanvasTypeCardBig"
import { useRecentCanvasTypes } from "@/contexts/RecentCanvasTypesContext"
import { useRouter } from 'next/navigation'
import { useDocumentDiveSuggestions } from "@/contexts/DocumentDiveSuggestionsContext"
import { useDocumentAiGeneration } from "@/contexts/DocumentAiGenerationContext"
import { DocumentService, ProcessedDocument } from '@/services/document';
import { v4 as uuidv4 } from 'uuid';
import { TAG_INFO } from "@/src/constants/tags"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DocumentDiveSelectorProps {
  pdfContent?: ProcessedDocument | null;
  onClose: () => void;
  onSuccess: (canvasId: string, canvasTypeId: string) => void;
  onPdfLoaded: (content: { text: string; fileName: string }) => void;
}

export function DocumentDiveSelector({ pdfContent, onClose, onSuccess, onPdfLoaded }: DocumentDiveSelectorProps) {
  const { theme } = useTheme();
  const { canvasTypes } : { canvasTypes: Record<string, CanvasType> } = useCanvasTypes();
  const [isCreating, setIsCreating] = useState(false);
  const [createdCanvasType, setCreatedCanvasType] = useState<CanvasType | null>(null);
  const { selected, setSelected, startDiveAnalysis } = useDocumentDiveSuggestions();
  const [searchTerm, setSearchTerm] = useState('');
  const { canvasIdFolderMap } = useCanvasFolders();
  const [filteredCanvasTypes, setFilteredCanvasTypes] = useState<[string, CanvasType][]>([]);
  const [content, setContent] = useState<ProcessedDocument | null>(pdfContent || null);
  const newCanvasRef = useRef<HTMLDivElement | null>(null);
  const {
    existingSuggestions,
    newSuggestions,
    statusMessage,
    createNewCanvasType,
    createCanvas,
  } = useDocumentDiveSuggestions();
  const { recentTypes } = useRecentCanvasTypes();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isCreatingNewType, setIsCreatingNewType] = useState(false);
  const { startGeneration } = useDocumentAiGeneration();
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypeLocal, setSelectedTypeLocal] = useState<CanvasType | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
  const { hasAccessToProFeatures, isFreeUser } = useSubscription();

  const getAvailableTags = () => {
    const availableTags = new Set<string>();
    Object.values(canvasTypes).forEach(type => {
      type.tags?.forEach(tag => availableTags.add(tag));
    });
    return TAG_INFO.filter(tag => availableTags.has(tag.name));
  };

  useEffect(() => {
    setFilteredCanvasTypes(Object.entries(canvasTypes).filter(([_, type]) => {
      const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => type.tags?.includes(tag));
      return matchesSearch && matchesTags;
    }));
  }, [searchTerm, canvasTypes, selectedTags]);

  const renderSelectedCanvasType = () => {
    if (isCreatingNewType ) {
      return (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-[800px] mx-auto px-6 flex flex-col items-center">
            <div className="w-full flex justify-center">
              <div className="border rounded-lg p-6 bg-card shadow-sm w-full max-w-[600px]">
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-md animate-pulse" />
                  <div className="space-y-2 text-center w-full">
                    <Skeleton className="h-8 w-48 mx-auto animate-pulse" />
                    <Skeleton className="h-4 w-96 mx-auto animate-pulse" />
                    <Skeleton className="h-4 w-80 mx-auto animate-pulse" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center mt-6"><button
              className="px-6 py-3 rounded-lg bg-primary/50 text-primary-foreground/50
                font-medium text-lg shadow-lg transition-all duration-200 
                relative group overflow-hidden cursor-not-allowed"
              disabled
              onClick={async () => {
              
              }}
            >
              <span className="relative z-10">Create Canvas</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/0 
                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
            </div>
          </div>
        </div>
      );
    }

    if (!selected) return null;

    const selectedType = canvasTypes[selected] || 
                        existingSuggestions.find(s => s.id === selected) ||
                        (createdCanvasType?.id === selected ? createdCanvasType : null);

    if (!selectedType) return null;

    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[800px] mx-auto px-6 flex flex-col items-center ">
          <div className="w-full flex justify-center">
            <CanvasTypeCard
              type={selectedType}
              onClick={() => {}}
              isSelected={true}
            />
          </div>
          <div className="flex justify-center gap-4 w-full mt-6">
            <button
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 
                font-medium text-lg shadow-lg transition-all duration-200 
                hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]
                relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreatingCanvas}
              onClick={async () => {
                if (!content) return;
                setIsCreatingCanvas(true);
                try {
                  const canvas = await createCanvas(selectedType, content.text, content.fileName, null, canvasId);
                  if (canvas) {
                    localStorage.setItem('pendingDocument', JSON.stringify({
                      textContent: content.text,
                      fileName: content.fileName,
                      processedPages: content.processedPages,
                      pageCount: content.pageCount,
                      canvasId: canvas.id
                    }));
                    localStorage.setItem('lastCanvasId', canvas.id);
                    onSuccess(canvas.id, selectedType.id);
                  }
                } catch (error) {
                  console.error('Error creating canvas', error);
                } finally {
                  setIsCreatingCanvas(false);
                }
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
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
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/0 
                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
          </div>
          <div className="w-full flex justify-center mt-6">
            <button
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
              onClick={() => setSelected(null)}
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
              Back to canvas selection
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuickSelect = () => {
    if (showAISuggestions) return null;

    return (
      <div className="w-full px-6 space-y-8">
        {/* Recently Used Types */}
        {recentTypes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recently Used</h3>
            <div className="flex flex-wrap gap-4">
              {recentTypes.map((type) => (
                <CanvasTypeCardTags
                  key={type.id}
                  type={type}
                  isSelected={selected === type.id}
                  onClick={() => setSelected(type.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Canvas Types */}
        <div>
          {!selectedTypeLocal ? (
            <ScrollArea className="h-full">
              <div className="relative flex flex-wrap gap-6 w-full justify-center p-6">
                <AnimatePresence>
                  {filteredCanvasTypes
                    .filter(([_, type]) => 
                      selectedTags.length === 0 || 
                      type.tags?.some(tag => selectedTags.includes(tag))
                    )
                    .map(([key, type]) => (
                      <CanvasTypeCard
                        key={key}
                        type={type}
                        onClick={() => setSelected(type.id)}
                        theme={theme}
                        isSelected={false}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-8">
                <div className="w-full flex justify-center">
                  <div className="max-w-[600px] w-full">
                    <div className="border rounded-lg p-6 bg-card shadow-sm">
                      <div className="flex flex-col items-center gap-4">
                        <DynamicIcon name={selectedTypeLocal.icon} className="w-12 h-12 text-primary" />
                        <div className="space-y-2 text-center">
                          <h3 className="text-2xl font-semibold text-foreground">{selectedTypeLocal.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedTypeLocal.description}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            onClick={() => setSelectedTypeLocal(null)}
                          >
                            Choose Different Type
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (selected) {
      return renderSelectedCanvasType();
    }

    if (!showAISuggestions) {
      return renderQuickSelect();
    }

    return (
      <div className="w-full px-6">
        {/* Existing Canvas Type Suggestions */}
        <div>
          {existingSuggestions.length > 0 ? 
          <h3 className="text-lg font-semibold text-center">
            Use an existing canvas type
          </h3>
          :
            <div className="flex items-center gap-3 justify-center m-4">
              <Bot className="w-6 h-6 text-primary" />
              <div className="relative">
                <span className="text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text bg-[length:200%_100%] animate-shimmer">
                  {statusMessage}
                </span>
              </div>
            </div>
          }
          <div className="flex justify-center gap-6">
            {existingSuggestions.length > 0 ? (
              existingSuggestions.map((ct) => (
                <CanvasTypeCardTags
                  key={ct.id}
                  type={ct}
                  isSelected={false}
                  onClick={() => setSelected(ct.id)}
                />
              ))
            ) : (
              // Loading skeletons for existing suggestions
              [1, 2, 3].map((i) => (
                <div key={i} className="w-[300px] p-6 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-1.5 mt-4">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-3 w-14 rounded-full" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Canvas Type Suggestions */}
        {((isLoadingSuggestions || newSuggestions.length > 0) && existingSuggestions.length > 0) && (
          <div>
            {newSuggestions.length > 0 ? 
              <h3 className="text-lg font-semibold text-center">
                Or create a new canvas type
              </h3>
              :
                <div className="flex items-center gap-3 justify-center m-4">
                  <Bot className="w-6 h-6 text-primary" />
                  <div className="relative">
                    <span className="text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text bg-[length:200%_100%] animate-shimmer">
                      {statusMessage}
                    </span>
                  </div>
                </div>
              }
            <div className="flex justify-center gap-6">
              {newSuggestions.length > 0 ? (
                newSuggestions.map((newCanvasType) => (
                  <motion.div
                    key={newCanvasType.name}
                    initial={{ opacity: 0, y: 20, scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="w-[300px] mt-2 p-6 rounded-lg border border-border bg-card hover:border-primary/50 cursor-pointer group"
                    onClick={async () => {
                      setSelected(newCanvasType.name);
                      setIsCreatingNewType(true);
                      await createNewCanvasType(newCanvasType);
                      setIsCreatingNewType(false);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <DynamicIcon name={newCanvasType.icon} className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold">{newCanvasType.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                      {newCanvasType.rationale}
                    </p>
                    <div className="absolute top-[72px] inset-x-6 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {newCanvasType.sections.map((section) => (
                        <div 
                          key={section.name} 
                          className="inline-block text-xs font-medium py-1 px-3 bg-gray-200 rounded-full text-gray-700"
                        >
                          {section.name}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                // Loading skeletons for new suggestions
                [1, 2, 3].map((i) => (
                  <div key={i} className="w-[300px] p-6 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-4/5" />
                    <div className="flex gap-1.5 mt-4">
                      <Skeleton className="h-3 w-16 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                      <Skeleton className="h-3 w-14 rounded-full" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      const canvasId = uuidv4();
      setCanvasId(canvasId);  
      const maxPages = isFreeUser ? 3 : undefined;
      console.log('maxPages', maxPages)
      const processedContent = await DocumentService.uploadAndProcess(file, canvasId, maxPages);
      
      if (onPdfLoaded) {
        onPdfLoaded(processedContent);
      }
      setContent(processedContent);

    } catch (error) {
      console.error('Error processing PDF:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  const renderFileUploader = () => {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[500px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Processing PDF...</span>
                <div className="animate-spin">
                  <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Extracting text from your document...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div 
              className="w-full max-w-[500px] h-64 border-2 border-dashed border-primary/20 rounded-lg 
                flex flex-col items-center justify-center p-6 transition-colors
                hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = e.dataTransfer.files;
                if (files.length) handleFileSelect(files[0]);
              }}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files?.length) handleFileSelect(files[0]);
                }}
              />
              <Upload className="w-12 h-12 text-primary/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upload a PDF Document
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Drag and drop your file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supported format: PDF
              </p>
            </div>
            
            {true && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Users in their trial period can analyze up to 3 pages
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
        )}
      </div>
    );
  };

  const scrollableContentClass = "overflow-y-auto scrollbar-hide";

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-md">
      <div className="flex-none p-4">
        <h2 className="text-2xl font-semibold text-center">
          {content ? 'Analyze Document' : 'Upload Document'}
        </h2>
      </div>

      {content && !selected && (
        <div className="flex-none space-y-4 p-4">
          <div className="flex justify-center w-full">
            <div className="inline-block bg-primary/5 rounded-lg p-3 border border-primary/20 relative overflow-hidden">
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
                          <button
                            className="ml-1.5 inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                          >
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
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="max-w-[66%] flex flex-wrap justify-center gap-2">
              {getAvailableTags().map(({ name, color }) => (
                <button
                  key={name}
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(name) 
                      ? prev.filter(t => t !== name)
                      : [...prev, name]
                  )}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    transition-colors duration-200
                    ${selectedTags.includes(name) 
                      ? color
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                    }
                  `}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 min-h-0 ${scrollableContentClass} ${selected ? 'flex items-center justify-center' : ''}`}>
        {content ? (
          <div className={`h-full w-full ${selected ? 'flex items-center justify-center' : ''}`}>
            
            {renderContent()}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            {hasAccessToProFeatures ? (
              renderFileUploader()
            ) : (
              <div 
                className="w-full max-w-[500px] h-64 border-2 border-dashed border-primary/20 rounded-lg 
                  flex flex-col items-center justify-center p-8 transition-colors
                  bg-card/50"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-5">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Document Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-[300px]">
                    Upload PDFs and let AI analyze them to automatically create the perfect canvas for your needs.
                  </p>
                  <div className="mb-4">
                    <Link href="/upgrade">
                      <Button variant="default" size="lg" className="gap-2 font-medium">
                        <span>Upgrade to Pro</span>
                        <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                          Unlock Feature
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {content && !showAISuggestions && !selected && (
        <div className="flex-none p-6 bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-lg blur opacity-25"></div>
              <button
                className="relative flex items-center gap-3 px-6 py-3 rounded-lg bg-background border border-primary/20 hover:border-primary/40 shadow-lg"
                onClick={() => {
                  if (!content) return;
                  setIsLoadingSuggestions(true);
                  Promise.resolve(startDiveAnalysis(content.text, content.fileName))
                    .finally(() => setIsLoadingSuggestions(false));
                  setShowAISuggestions(true);
                  setSelected(null);
                }}
              >
                <Bot className="w-6 h-6 text-primary" />
                <span className="text-lg font-medium">Get AI Canvas Suggestions</span>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Let AI analyze your document and suggest the best canvas type
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 