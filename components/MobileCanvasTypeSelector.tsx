'use client'

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useCanvas } from "@/contexts/CanvasContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { CanvasType, CanvasLayoutDetails } from "@/types/canvas-sections"
import { NewCanvasDialog } from "./NewCanvasDialog"
import { LayoutSelector } from "./LayoutSelector"
import { useLayouts } from "@/contexts/LayoutContext"
import { ArrowLeft, Bot, Layout, Plus } from "lucide-react"
import DynamicIcon from "./Util/DynamicIcon"
import { TAG_INFO } from "@/src/constants/tags"
import { cn } from "@/lib/utils"
import CustomCanvasEditor from "./CustomCanvas/CustomCanvasEditor"
import { AIAgent } from "@/types/canvas"
import { MobileBottomNav } from "./mobile/MobileBottomNav"
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ControlledCompanyEditDialog } from "./Canvas/ControlledCompnayEditDialog"

interface MobileCanvasTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
}

// Reuse the CompactCanvasTypeCard from MobileConfirmDiveInSheet
function CompactCanvasTypeCard({ type, isSelected, onClick }: { 
  type: CanvasType, 
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground cursor-help">
                  +{type.sections.length - 4} more
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <div className="flex flex-wrap gap-1">
                  {type.sections.slice(4).map((section: any) => (
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

// First, let's create a simple Tag component
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

export function MobileCanvasTypeSelector({
  isOpen,
  onClose,
}: MobileCanvasTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<CanvasType | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<CanvasLayoutDetails | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { theme } = useTheme();
  const { userCanvases } = useCanvas();
  const { getLayoutsForSectionCount } = useLayouts();
  const { getCanvasTypes } = useCanvasTypes();
  const { currentFolder } = useCanvasFolders();
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({});
  const [compatibleLayouts, setCompatibleLayouts] = useState<CanvasLayoutDetails[]>([]);

  useEffect(() => {
    getCanvasTypes().then((types) => {
      const typs = Object.entries(types).map(([key, type]) => ({
        ...type,
        id: key
      }));
      let record = typs.reduce((acc, type) => {   
        acc[type.id] = type;
        return acc;
      }, {} as Record<string, CanvasType>);
      setCanvasTypes(record);    
    });
  }, [getCanvasTypes]);

  useEffect(() => {
    if (selectedType) {
      const fetchLayouts = async () => {
        const layouts = await getLayoutsForSectionCount(selectedType.sections.length);
        let allLayouts = [...layouts];
        if (selectedType.defaultLayout) {
          allLayouts = [
            {
              id: `${selectedType.id}-default`,
              layout: selectedType.defaultLayout.layout,
              name: 'Default Layout',
              sectionCount: selectedType.sections.length,
              description: 'Default layout for this canvas type'
            },
            ...layouts
          ];
        }
        setCompatibleLayouts(allLayouts);
        if (!selectedLayout && selectedType.defaultLayout) {
          setSelectedLayout(allLayouts[0]);
        }
      };
      fetchLayouts();
    }
  }, [selectedType, getLayoutsForSectionCount]);

  const handleTagSelect = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getAvailableTags = () => {
    // First get all available tags from canvas types
    const availableTags = new Set<string>();
    Object.values(canvasTypes).forEach(type => {
      type.tags?.forEach(tag => availableTags.add(tag));
    });
    
    // Then filter TAG_INFO based on search term matching tag names
    return TAG_INFO.filter(tag => 
      availableTags.has(tag.name) && 
      (searchTerm === '' || tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredCanvasTypes = Object.values(canvasTypes).filter(type => 
    (selectedTags.length > 0 
      ? type.tags?.some(tag => selectedTags.includes(tag))
      : searchTerm === '' || type.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[95vh] flex flex-col p-0">
        <div className="px-6 py-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedType ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-2"
                    onClick={() => {
                      setSelectedType(null);
                      setSelectedLayout(null);
                    }}
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <div className="flex flex-col items-start -mt-1">
                    <span className="text-xl font-semibold leading-tight">{selectedType.name}</span>
                    <span className="text-sm text-muted-foreground font-normal leading-tight">
                      Choose a layout
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Create Canvas</span>
                </>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {!selectedType && (
          <div className="px-6 space-y-4">
            <Input
              placeholder="Search canvas types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            
            <div className="relative">
              <Swiper
                    spaceBetween={12}
                    slidesPerView="auto"
                    className="w-full"
              >
                {getAvailableTags().map(({ name, color }) => (
                  <SwiperSlide key={name} className="!w-auto">
                    <Tag
                      name={name}
                      color={color}
                      selected={selectedTags.includes(name)}
                      onClick={() => handleTagSelect(name)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-6">
          <AnimatePresence mode="wait">
            {!selectedType ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 py-4"
              >
                {filteredCanvasTypes.map((type) => (
                  <CompactCanvasTypeCard
                    key={type.id}
                    type={type}
                    isSelected={false}
                    onClick={() => setSelectedType(type)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <LayoutSelector
                  layouts={compatibleLayouts}
                  selectedLayout={selectedLayout}
                  onSelect={setSelectedLayout}
                  canvasType={selectedType}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <div className="p-6 space-y-2">
          {selectedType && (
            <Button
              onClick={() => setShowDialog(true)}
              className="w-full gap-2"
              size="lg"
              disabled={!selectedLayout}
            >
              <Layout className="h-4 w-4" />
              Create Canvas
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setSelectedType(null);
              setSelectedLayout(null);
              setSearchTerm('');
              setSelectedTags([]);
            }}
            className="w-full"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
} 