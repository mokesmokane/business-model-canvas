import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, Target, Link, Layers, ArrowRight, Bot, ChevronRight } from 'lucide-react'
import { useCanvas } from "@/contexts/CanvasContext"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { motion } from "framer-motion"
import DynamicIcon from "@/components/Util/DynamicIcon"
import { useDiveSuggestions } from "@/contexts/DiveSuggestionsContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { useRecentCanvasTypes } from "@/contexts/RecentCanvasTypesContext"
import { useAiGeneration } from '@/contexts/AiGenerationContext'
import { useRouter } from 'next/navigation'
import { CanvasTypeCardTags } from "../CanvasTypeCards/CanvasTypeCardTags"
import { CanvasTypeCard } from "../CanvasTypeCards/CanvasTypeCard"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Swiper, SwiperSlide } from 'swiper/react'
import { SectionItem, TextSectionItem } from "@/types/canvas"
import 'swiper/css'
import { Skeleton } from "@/components/ui/skeleton"

interface MobileConfirmDiveInSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (canvasId: string, canvasTypeId: string) => void
  itemContent: string
  sectionName: string
  icon: string
}

// Mobile-optimized compact canvas type card
function CompactCanvasTypeCard({ type, isSelected, onClick }: { 
  type: any, 
  isSelected: boolean,
  onClick: () => void 
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all",
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <DynamicIcon name={type.icon} className="w-5 h-5 text-primary" />
        <div className="font-medium text-sm">{type.name}</div>
      </div>
      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {type.description}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {type.sections?.slice(0, 4).map((section: any) => (
          <div 
            key={section.name}
            className="text-[10px] px-2 py-0.5 bg-muted rounded-full truncate max-w-[100px]"
          >
            {section.name}
          </div>
        ))}
        {type.sections?.length > 4 && (
          <div className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
            +{type.sections.length - 4} more
          </div>
        )}
      </div>
    </div>
  );
}

function CanvasTypeGrid({ items, renderItem }: { items: any[], renderItem: (item: any) => React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border border-border">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-5 w-5 rounded-md" />
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
  )
}

export function MobileConfirmDiveInSheet({
  isOpen,
  onClose,
  onConfirm,
  itemContent,
  sectionName,
  icon
}: MobileConfirmDiveInSheetProps) {
  const { formData } = useCanvas();
  const { canvasIdFolderMap } = useCanvasFolders();
  const { canvasTypes } = useCanvasTypes();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { recentTypes } = useRecentCanvasTypes();
  const { startGeneration } = useAiGeneration();
  const {
    selected,
    setSelected,
    existingSuggestions,
    newSuggestions,
    statusMessage,
    createNewCanvasType,
    createCanvas,
    startDiveAnalysis,
  } = useDiveSuggestions();
  const [showSelection, setShowSelection] = useState(false);
  const [selectedNewSuggestion, setSelectedNewSuggestion] = useState<any>(null);
  const [isCreatingNewType, setIsCreatingNewType] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    
    const selectedType = canvasTypes[selected] || 
                        existingSuggestions.find(s => s.id === selected);
    
    if (!selectedType) return;

    const canvas = await createCanvas(selectedType, formData, formData?.sections.get(sectionName) || { name: sectionName, gridIndex: 0, sectionItems: [], qAndAs: [] },{ content: itemContent } as TextSectionItem);
    if (!canvas) return;

    // Start the generation process and navigate immediately
    startGeneration({
      canvas,
      selectedType,
      parentCanvas: formData!,
      diveItem: { content: itemContent } as TextSectionItem
    });
    
    localStorage.setItem('lastCanvasId', canvas.id);
    router.push(`/canvas/${canvas.id}`);
    onConfirm(canvas.id, selectedType.id);
    onClose();
  }

  const renderInitialView = () => (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <DynamicIcon 
            name={icon} 
            className="text-primary h-6 w-6 flex-shrink-0 mt-0" 
          />
          <div className="font-medium text-foreground text-base line-clamp-6">{itemContent}</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
      </div>
      
      <div className="text-sm text-muted-foreground">
        This helps you break down complex ideas into manageable pieces.
      </div>
      
      <div className="space-y-2">
        <div className="font-medium text-foreground text-base">What happens when you dive in:</div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <div className="text-sm">AI analyzes your idea and suggests relevant canvas types</div>
          </div>
          <div className="flex items-start gap-2">
            <Link className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <div className="text-sm">The new canvas is automatically linked to this item</div>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <div className="text-sm">Navigate easily between connected canvases</div>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <div className="text-sm">Your ideas stay organized and connected naturally</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCanvasSelection = () => {
    if (selected) {
      const selectedType = canvasTypes[selected] || 
                          existingSuggestions.find(s => s.id === selected);
      
      if (!selectedType) return null;

      return (
        <div className="flex flex-col items-center">
          <CanvasTypeCard
            type={selectedType}
            onClick={() => {}}
          />
          <Button
            onClick={() => setSelected(null)}
            variant="ghost"
            className="mt-4"
          >
            ← Back to canvas selection
          </Button>
        </div>
      );
    }

    if (selectedNewSuggestion) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-2">
              <DynamicIcon name={selectedNewSuggestion.icon} className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium text-sm">{selectedNewSuggestion.name}</h3>
                <div className="text-xs text-primary/80">New suggestion</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedNewSuggestion.rationale}
            </p>
          </div>
        </div>
      );
    }

    const filteredCanvasTypes = Object.entries(canvasTypes)
      .filter(([_, type]) => type.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="space-y-4">
        {!showAISuggestions && (
          <>
            {/* Recently Used */}
            {recentTypes.length > 0 && !searchTerm && (
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold">Recently Used</h3>
                </div>
                <CanvasTypeGrid
                  items={recentTypes}
                  renderItem={(type) => (
                    <CompactCanvasTypeCard
                      type={type}
                      isSelected={selected === type.id}
                      onClick={() => setSelected(type.id)}
                    />
                  )}
                />
              </div>
            )}

            {/* Canvas Types */}
            <CanvasTypeGrid
              items={filteredCanvasTypes}
              renderItem={([id, type]) => (
                <CompactCanvasTypeCard
                  type={type}
                  isSelected={selected === id}
                  onClick={() => setSelected(id)}
                />
              )}
            />
          </>
        )}

        {/* AI Suggestions */}
        {showAISuggestions && (
          <div className="space-y-4">
            {/* Show full skeleton state when nothing is loaded */}
            {existingSuggestions.length === 0 && newSuggestions.length === 0 && (
              <div className="space-y-4">
                {/* Existing Suggestions Skeleton */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Existing Canvas Suggestions</h3>
                  </div>
                  <Swiper
                    spaceBetween={12}
                    slidesPerView="auto"
                    className="w-full"
                  >
                    {[1, 2, 3].map((i) => (
                      <SwiperSlide key={i} style={{ width: '85%' }}>
                        <SkeletonCard />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}

            {/* Content when suggestions start loading */}
            <div className="space-y-4">
              {/* Existing Suggestions */}
              {existingSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Existing Canvas Suggestions</h3>
                  </div>
                  
                  <Swiper
                    spaceBetween={12}
                    slidesPerView="auto"
                    className="w-full"
                  >
                    {existingSuggestions.map((type) => (
                      <SwiperSlide key={type.id} style={{ width: '85%' }}>
                        <CompactCanvasTypeCard
                          type={type}
                          isSelected={selected === type.id}
                          onClick={() => setSelected(type.id)}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* New Canvas Types - Show skeleton if not loaded yet, otherwise show content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Create New Canvas Type</h3>
                </div>

                <Swiper
                  spaceBetween={12}
                  slidesPerView="auto"
                  className="w-full"
                >
                  {newSuggestions.length === 0 ? (
                    // Show skeletons while new suggestions are loading
                    [1].map((i) => (
                      <SwiperSlide key={i} style={{ width: '85%' }}>
                        <SkeletonCard />
                      </SwiperSlide>
                    ))
                  ) : (
                    // Show actual new suggestions once loaded  
                    newSuggestions.map((suggestion) => (
                      <SwiperSlide key={suggestion.name} style={{ width: '85%' }}>
                        <div
                          className="relative h-full p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer"
                          onClick={async () => {
                            setSelectedNewSuggestion(suggestion);
                            setIsCreatingNewType(true);
                            await createNewCanvasType(suggestion);
                            setIsCreatingNewType(false);
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <DynamicIcon name={suggestion.icon} className="w-5 h-5 text-primary" />
                            <div>
                              <h3 className="font-medium text-sm">{suggestion.name}</h3>
                              <div className="text-xs text-primary/80">New suggestion</div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.rationale}
                          </p>
                        </div>
                      </SwiperSlide>
                    ))
                  )}
                </Swiper>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <SheetTitle className="flex items-center gap-2 text-2xl">
                <ArrowRightCircle className="h-6 w-6 text-primary" />
                Dive Deeper
              </SheetTitle>
              <div className="text-sm text-muted-foreground">
                {showSelection 
                  ? (showAISuggestions 
                      ? (statusMessage 
                          ? (
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-primary animate-pulse" />
                              <span>{statusMessage}</span>
                            </div>
                          )
                          : "Choose a canvas type to explore this idea"
                        )
                      : "Choose a canvas type to explore this idea")
                  : "Create a new canvas to explore"}
              </div>
            </div>
            <div className="flex items-start gap-2 py-1.5 px-2.5 bg-muted/50 rounded-lg border border-border/50 min-w-0 max-w-[180px]">
              <DynamicIcon name={icon} className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{itemContent}</div>
                <div className="text-[10px] text-muted-foreground truncate">{sectionName}</div>
              </div>
            </div>
          </div>
        </div>
        
        {showSelection && !selected && !showAISuggestions && (
          <div className="px-6">
            <Input
              placeholder="Search canvas types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className={cn(
          "flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          selected ? "px-6 flex items-center" : "px-6",
          !showSelection ? "overflow-hidden" : ""
        )}>
          <div className={cn(
            "space-y-4",
            selected ? "w-full" : showSelection ? "pt-4" : ""
          )}>
            {!showSelection ? renderInitialView() : renderCanvasSelection()}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-6 pt-4">
          {!showSelection ? (
            <Button
              onClick={() => setShowSelection(true)}
              className="w-full gap-2"
              size="lg"
            >
              <ArrowRightCircle className="h-4 w-4" />
              Dive In
            </Button>
          ) : (
            <>
              {
                showAISuggestions && !selected ?(
                  <Button
                    onClick={() => {
                      setShowAISuggestions(false);
                      setSelected(null);
                      setSelectedNewSuggestion(null);
                    }}
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                  >
                    ← Back to canvas types
                  </Button>
                ) : (
                  !selected && !showAISuggestions && (
                  <Button
                    onClick={() => {
                      startDiveAnalysis({
                        parentCanvas: formData,
                        folderId: canvasIdFolderMap.get(formData?.id || "") || "root",
                        section: {
                          name: sectionName,
                          placeholder: ""
                        },
                        item: itemContent,
                      });
                      setShowAISuggestions(true);
                    }}
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Bot className="h-4 w-4" />
                    Get AI Suggestions
                  </Button>
                )
              )}
              {selected || selectedNewSuggestion ? (
                <Button
                  onClick={async () => {
                    await handleConfirm();
                  }}
                  className="w-full gap-2"
                  size="lg"
                  disabled={isCreatingNewType}
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  {isCreatingNewType ? "Creating Canvas Type..." : "Create Canvas"}
                </Button>
              ) : null
            }
            </>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setShowSelection(false);
              setShowAISuggestions(false);
              setSelected(null);
              setSelectedNewSuggestion(null);
              setSearchTerm('');
            }}
            className="w-full"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
} 