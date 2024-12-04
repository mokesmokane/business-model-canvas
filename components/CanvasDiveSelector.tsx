'use client'

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CanvasType } from "@/types/canvas-sections"
import { useTheme } from "next-themes"
import DynamicIcon from "./Util/DynamicIcon"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { Bot, Loader2 } from "lucide-react"
import { useCanvas } from "@/contexts/CanvasContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { CanvasTypeCardTags } from "./CanvasTypeCards/CanvasTypeCardTags"
import { sendCreateCanvasTypeFromDiveRequest, generateSectionSuggestions, updateCanvasSection } from "@/services/aiCreateCanvasService"
import { SectionItem as SectionItemType, TextSectionItem } from "@/types/canvas"
import { ExistingCanvasDiveResponse, ExistingCanvasTypeSuggestion, NewCanvasDiveResponse, NewCanvasTypeSuggestion } from "@/app/api/ai-canvas-dive/types"
import { CanvasTypeCard } from "./CanvasTypeCards/CanvasTypeCard"
import { useDiveSuggestions } from '@/contexts/DiveSuggestionsContext';
import { useRecentCanvasTypes } from "@/contexts/RecentCanvasTypesContext"
import { useAiGeneration } from '@/contexts/AiGenerationContext';
import { useRouter } from 'next/navigation'

interface CanvasDiveSelectorProps {
  section: {
    id: string;
    name: string;
    icon: string;
    placeholder: string;
  };
  item: SectionItemType;
  onClose: () => void;
  onSuccess: (canvasId: string, canvasTypeId: string) => void;
}

export function CanvasDiveSelector({ section, item, onClose, onSuccess }: CanvasDiveSelectorProps) {
  const { theme } = useTheme();
  const { formData } = useCanvas();
  const { canvasTypes } : { canvasTypes: Record<string, CanvasType> } = useCanvasTypes();
  const [isCreating, setIsCreating] = useState(false);
  const [createdCanvasType, setCreatedCanvasType] = useState<CanvasType | null>(null);
  const { selected, setSelected, startDiveAnalysis } = useDiveSuggestions();
  const [searchTerm, setSearchTerm] = useState('');
  const { canvasIdFolderMap } = useCanvasFolders();
  const [filteredCanvasTypes, setFilteredCanvasTypes] = useState<[string, CanvasType][]>([]);
  const newCanvasRef = useRef<HTMLDivElement>(null);
  const {
    existingSuggestions,
    newSuggestions,
    statusMessage,
    createNewCanvasType,
    createCanvas,
    setExistingSuggestions,
    setNewSuggestions,
  } = useDiveSuggestions();
  const { recentTypes } = useRecentCanvasTypes();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isCreatingNewType, setIsCreatingNewType] = useState(false);
  const { startGeneration, updateSectionStatus, setError } = useAiGeneration();
  const router = useRouter()

  useEffect(() => {
    setFilteredCanvasTypes(Object.entries(canvasTypes).filter(([_, type]) => type.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, canvasTypes]);

  // Get linked canvas types from the current section
  const linkedTypes = useMemo(() => {
    if (!formData) return [];
    const currentSection = formData.sections.get(section.id);
    const linkedCanvasIds = currentSection?.sectionItems
      .map((item: SectionItemType) => item.canvasLink?.canvasTypeId)
      .filter((id): id is string => id !== undefined) || [];
    //shouldnt have the same id multiple times
    const uniqueLinkedCanvasIds = [...new Set(linkedCanvasIds)];
    console.log('linkedCanvasIds', uniqueLinkedCanvasIds);
    return uniqueLinkedCanvasIds.map(id => canvasTypes[id]).filter(Boolean);
  }, [formData, section.name, canvasTypes]);

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

        {/* Linked Types */}
        {linkedTypes.length > 0 && (
          <div className="flex items-center gap-4 mb-4 w-full justify-center" >
            <h3 className="text-lg font-semibold">Linked Canvas Types</h3>
            <div className="flex flex-wrap gap-2">
              {linkedTypes.map((type: any) => (
                <div
                  key={type.id}
                  className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full cursor-pointer ${
                    selected === type.id ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setSelected(type.id)}
                >
                  <DynamicIcon name={type.icon} className="w-4 h-4" />
                  <span className="text-sm">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Canvas Types */}
        <div>
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold tracking-tight mr-4">All Canvas Types</h2> 
              <input
                type="text"
                placeholder="Search canvas types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md p-2 max-w-xs"
              />
            </div>
            <div className="overflow-hidden" ref={newCanvasRef}>
              <div className="flex gap-6 pl-6">
                {filteredCanvasTypes.map(([key, type]) => (
                  <CanvasTypeCardTags
                    key={key}
                    type={type}
                    isSelected={selected === type.id}
                    onClick={() => setSelected(type.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        {/* <div>
          <h3 className="text-lg font-semibold mb-4">All Canvas Types</h3>
          <div className="flex flex-wrap gap-4">
            {Object.values(canvasTypes).map((type) => (
              <CanvasTypeCardTags
                key={type.id}
                type={type}
                isSelected={selected === type.id}
                onClick={() => setSelected(type.id)}
              />
            ))}
          </div>
        </div> */}

        {/* Get AI Suggestions Button */}
        <div className="flex justify-center mt-6">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
            onClick={() => {
              startDiveAnalysis({
                parentCanvas: formData,
                folderId: canvasIdFolderMap.get(formData?.id || "") || "root",
                section: {
                  name: section.name,
                  placeholder: section.placeholder
                },
                item: (item as TextSectionItem).content,
              })
              setShowAISuggestions(true)
              setSelected(null)
            }}
          >
            <Bot className="w-5 h-5" />
            Get AI Suggestions
          </button>
        </div>
      </div>
    );
  };

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
            />
          </div>
          <div className="flex justify-center gap-4 w-full mt-6">
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={async () => {
                const canvas = await createCanvas(selectedType, formData);
                if(canvas) onSuccess(canvas.id, selectedType.id);
                onClose();
              }}
            >
              Create Canvas
            </button>
            <button
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => createCanvasWithSuggestions(selectedType)}
            >
              Create with Suggestions
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

  const createCanvasWithSuggestions = async (selectedType: CanvasType) => {
    // First create the canvas
    const canvas = await createCanvas(selectedType, formData);
    if (!canvas) return;

    // Start the generation process and navigate immediately
    startGeneration({
      canvas,
      selectedType,
      parentCanvas: formData!,
      diveItem: item
    });
    
    localStorage.setItem('lastCanvasId', canvas.id)
    router.push(`/canvas/${canvas.id}`)
    onSuccess(canvas.id, selectedType.id);
    onClose();
  };

  const renderContent = () => {
    // If there's a selected canvas type, show only that
    if (selected) {
      return renderSelectedCanvasType();
    }

    // Otherwise show the regular selection UI
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
                {selected === null && newSuggestions.map((newCanvasType) => {
                  if (createdCanvasType) return null;
                  
                  return (
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
                  );
                })}
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
                {/* Base border with pulse */}
                <div className="absolute inset-0 rounded-lg border-2 border-primary/50 animate-pulse" />
                
                {/* Layered shimmer effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer-fast" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent animate-shimmer" />
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    {/* Bot icon with shimmer */}
                    <div className="relative">
                      <Bot className="w-8 h-8 text-primary animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
                    </div>
                    
                    <div>
                      {/* Title with shimmer */}
                      <div className="relative">
                        <h3 className="font-semibold text-lg relative inline-block">
                          Creating New Canvas Type
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" />
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI is analyzing and crafting the perfect canvas...
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Selected Template</h4>
                      <div className="flex items-center gap-2">
                        <DynamicIcon 
                          name={newSuggestions[0].icon} 
                          className="w-5 h-5 text-primary animate-pulse" 
                        />
                        <span className="font-medium">{newSuggestions[0].name}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Purpose</h4>
                      <p className="text-sm">{newSuggestions[0].rationale}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Planned Sections</h4>
                      <div className="flex flex-wrap gap-2">
                        {newSuggestions[0].sections.map((section) => (
                          <div 
                            key={section.name} 
                            className="inline-block text-xs font-medium py-1 px-3 bg-primary/10 rounded-full text-primary animate-pulse"
                          >
                            {section.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-md">
      <div className="flex-none text-center space-y-4 w-full p-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Dive Deeper
          </h2>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/20 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <DynamicIcon 
                name={section.icon} 
                className="text-primary h-8 w-8 flex-shrink-0 mt-0" 
              />
              <div className="font-medium text-foreground text-lg">{(item as TextSectionItem).content}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 p-6">
            {statusMessage && !isCreatingNewType && (
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary" />
                <div className="relative">
                  <span className="text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text bg-[length:200%_100%] animate-shimmer">
                    {statusMessage}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
} 