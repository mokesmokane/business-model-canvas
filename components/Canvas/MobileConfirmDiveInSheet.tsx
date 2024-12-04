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
import { TextSectionItem } from "@/types/canvas"
import 'swiper/css'

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

  const handleConfirm = async () => {
    if (!selected) return;
    
    const selectedType = canvasTypes[selected] || 
                        existingSuggestions.find(s => s.id === selected);
    
    if (!selectedType) return;

    const canvas = await createCanvas(selectedType, formData);
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
    <div className="space-y-6">
      <div className="text-lg">
        Create a new canvas to explore:
      </div>
      
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <DynamicIcon 
            name={icon} 
            className="text-primary h-8 w-8 flex-shrink-0 mt-0" 
          />
          <div className="font-medium text-foreground text-lg">{itemContent}</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
      </div>
      
      <div className="text-base">
        This helps you break down complex ideas into manageable pieces.
      </div>
      
      <div className="space-y-4">
        <div className="font-medium text-foreground text-lg">What happens when you dive in:</div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>AI analyzes your idea and suggests relevant canvas types</div>
          </div>
          <div className="flex items-start gap-3">
            <Link className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>The new canvas is automatically linked to this item</div>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>Navigate easily between connected canvases</div>
          </div>
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>Your ideas stay organized and connected naturally</div>
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

    const filteredCanvasTypes = Object.entries(canvasTypes)
      .filter(([_, type]) => type.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="space-y-4">
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

        {/* AI Suggestions */}
        {showAISuggestions && (
          <div className="space-y-4">
            {statusMessage && (
              <div className="flex items-center gap-3 justify-center">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
                <span>{statusMessage}</span>
              </div>
            )}

            {existingSuggestions.length > 0 && (
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold">AI Suggested Canvas Types</h3>
                </div>
                <CanvasTypeGrid
                  items={existingSuggestions}
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

            {newSuggestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">New Canvas Types</h3>
                {newSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.name}
                    className="relative p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer"
                    onClick={async () => {
                      await createNewCanvasType(suggestion);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <DynamicIcon name={suggestion.icon} className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-sm">{suggestion.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.rationale}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <SheetTitle className="flex items-center gap-2 text-2xl">
                <ArrowRightCircle className="h-6 w-6 text-primary" />
                Dive Deeper
              </SheetTitle>
              {showSelection && !selected && (
                <div className="text-sm text-muted-foreground">Choose a canvas type to explore this idea</div>
              )}
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
        
        {showSelection && !selected && (
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
          selected ? "px-6 flex items-center" : "px-6"
        )}>
          <div className={cn(
            "space-y-4",
            selected ? "w-full" : "pt-4"
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
              {!showAISuggestions && !selected && (
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
              )}
              {selected && (
                <Button
                  onClick={handleConfirm}
                  className="w-full gap-2"
                  size="lg"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Create Canvas
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            onClick={onClose}
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