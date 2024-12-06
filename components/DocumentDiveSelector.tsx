'use client'

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CanvasType } from "@/types/canvas-sections"
import { useTheme } from "next-themes"
import DynamicIcon from "./Util/DynamicIcon"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { Bot, Loader2, FileText, Upload } from "lucide-react"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { CanvasTypeCardTags } from "./CanvasTypeCards/CanvasTypeCardTags"
import { CanvasTypeCard } from "./CanvasTypeCards/CanvasTypeCardBig"
import { useDiveSuggestions } from '@/contexts/DiveSuggestionsContext';
import { useRecentCanvasTypes } from "@/contexts/RecentCanvasTypesContext"
import { useAiGeneration } from '@/contexts/AiGenerationContext';
import { useRouter } from 'next/navigation'
import { useDocumentDiveSuggestions } from "@/contexts/DocumentDiveSuggestionsContext"
import { useDocumentAiGeneration } from "@/contexts/DocumentAiGenerationContext"
import mockContentString from "./Util/mock"
import { DocumentService } from '@/services/document';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSwipeable } from 'react-swipeable';
import { TAG_INFO } from "@/src/constants/tags"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentDiveSelectorProps {
  pdfContent?: {
    text: string;
    fileName: string;
  } | null;
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
  const [content, setContent] = useState<{ text: string; fileName: string } | null>(pdfContent || null);
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
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={async () => {
                if (!content) return;
                const canvas = await createCanvas(selectedType, content.text, content.fileName, null, canvasId);
                if(canvas) {
                  localStorage.setItem('pendingDocument', JSON.stringify({
                    textContent: content.text,
                    fileName: content.fileName,
                    canvasId: canvas.id
                  }));
                  localStorage.setItem('lastCanvasId', canvas.id);
                  router.push(`/canvas/${canvas.id}`);
                  onSuccess(canvas.id, selectedType.id);
                }
                onClose();
              }}
            >
              Create Canvas
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
      <>
        {existingSuggestions.length > 0 && (
          <div className="w-full px-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Use an existing canvas type</h3>
            <div className="relative flex flex-wrap gap-6 w-full justify-center">
              <AnimatePresence>
                {existingSuggestions.map((ct) => (
                  <CanvasTypeCardTags
                    key={ct.id}
                    type={ct}
                    isSelected={false}
                    onClick={() => setSelected(ct.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {newSuggestions.length > 0 && !isCreatingNewType && (
          <div className="w-full px-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Or create a new canvas type</h3>
            <div className="flex items-center justify-center w-full">
              <div className="flex flex-row gap-6">
                {newSuggestions.map((newCanvasType) => (
                  <motion.div
                    key={newCanvasType.name}
                    initial={{ opacity: 0, y: 20, scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-[300px] p-6 rounded-lg border border-border bg-card hover:border-primary/50 cursor-pointer group"
                    onClick={async () => {
                      try {
                        setIsCreatingNewType(true);
                        await createNewCanvasType(newCanvasType);
                      } catch (error) {
                        console.error('Error creating canvas:', error);
                        setIsCreatingNewType(false);
                      }
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
                ))}
              </div>
            </div>
          </div>
        )}

        {isCreatingNewType && newSuggestions.length > 0 && (
          <div className="w-full px-6 mt-6">
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-[400px] p-8 rounded-lg bg-card shadow-lg overflow-hidden"
              >
                {/* Loading state UI remains the same */}
              </motion.div>
            </div>
          </div>
        )}
      </>
    );
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      const canvasId = uuidv4();
      setCanvasId(canvasId);
      const processedContent = await DocumentService.uploadAndProcess(file, canvasId);
      
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
                <span className="text-sm text-muted-foreground">{Math.round(loadingProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Extracting text from your document...</p>
          </div>
        ) : (
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
        )}
      </div>
    );
  };

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      if (newCanvasRef.current) {
        newCanvasRef.current.scrollLeft += e.deltaX;
      }
    },
    trackMouse: true
  });

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
              <div className="flex items-start gap-3">
                <FileText className="text-primary h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="font-medium text-foreground">{content.fileName}</div>
              </div>
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
            {statusMessage && !isCreatingNewType && (
              <div className="flex items-center gap-3 justify-center mt-4">
                <Bot className="w-6 h-6 text-primary" />
                <div className="relative">
                  <span className="text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text bg-[length:200%_100%] animate-shimmer">
                    {statusMessage}
                  </span>
                </div>
              </div>
            )}
            {renderContent()}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            {renderFileUploader()}
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
                  startDiveAnalysis(content.text, content.fileName)
                  setShowAISuggestions(true)
                  setSelected(null)
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