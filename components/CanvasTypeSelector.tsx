'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasType, CanvasLayout, CanvasLayoutDetails, compareLayouts } from "@/types/canvas-sections"
import { useCanvas } from "@/contexts/CanvasContext"
import { NewCanvasDialog } from "./NewCanvasDialog"
import { LayoutSelector } from "./LayoutSelector"
import { TypeIcon as type, LucideIcon, XIcon, AlertCircle, ArrowLeft } from 'lucide-react'
import { useTheme } from "next-themes"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DynamicIcon from "./Util/DynamicIcon"
import { useLayouts } from "@/contexts/LayoutContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { TAG_INFO } from "@/src/constants/tags"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import CustomCanvasEditor from "@/components/CustomCanvas/CustomCanvasEditor"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface CanvasTypeSelectorProps {
  selectedType: CanvasType | null;
}

export function CanvasTypeSelector({ selectedType: initialType }: CanvasTypeSelectorProps) {
  const [selectedTypeLocal, setSelectedTypeLocal] = useState<CanvasType | null>(initialType);
  const [selectedLayout, setSelectedLayout] = useState<CanvasLayoutDetails | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { theme } = useTheme()
  const { userCanvases } = useCanvas()
  const containerRef = useRef<HTMLDivElement>(null)
  const { getLayoutsForSectionCount } = useLayouts()
  const { getCanvasTypes } = useCanvasTypes()
  const [compatibleLayouts, setCompatibleLayouts] = useState<CanvasLayoutDetails[]>([])
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { currentFolder  } = useCanvasFolders()
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customizedType, setCustomizedType] = useState<CanvasType | null>(null);
  
  useEffect(() => {
    getCanvasTypes().then((types) => {
        //for each type, type set its id as the key
        const typs = Object.entries(types).map(([key, type]) => ({
          ...type,
          id: key
        }))
        let record = typs.reduce((acc, type) => {   
          acc[type.id] = type;
          return acc;
        }, {} as Record<string, CanvasType>);
        setCanvasTypes(record)    
    })
  }, [getCanvasTypes])

  useEffect(() => {
    if (selectedTypeLocal) {
      const fetchLayouts = async () => {
        // Get base layouts for this section count
        const layouts = await getLayoutsForSectionCount(selectedTypeLocal.sections.length);
        
        // Create a new array with default layout if it exists
        let allLayouts = [...layouts];
        if (selectedTypeLocal.defaultLayout) {
          allLayouts = [
            {
              id: `${selectedTypeLocal.id}-default`,
              layout: selectedTypeLocal.defaultLayout.layout,
              name: 'Default Layout',
              sectionCount: selectedTypeLocal.sections.length,
              description: 'Default layout for this canvas type'
            },
            ...layouts
          ];
        }
        
        setCompatibleLayouts(allLayouts);
        
        // Set default layout as selected if no layout is currently selected
        if (!selectedLayout && selectedTypeLocal.defaultLayout) {
          setSelectedLayout(allLayouts[0]);
        }
      };
      fetchLayouts();
    } else {
      // Clear compatible layouts when no type is selected
      setCompatibleLayouts([]);
      setSelectedLayout(null);
    }
  }, [selectedTypeLocal, getLayoutsForSectionCount]);

  const handleCanvasTypeSelect = (canvasType: CanvasType) => {
    if (selectedTypeLocal === canvasType) {
      setSelectedTypeLocal(null);
      setSelectedLayout(null);
      setCompatibleLayouts([]);
    } else {
      setSelectedTypeLocal(canvasType);
    }
  }

  const handleLayoutSelect = (layout: CanvasLayoutDetails) => {
    setSelectedLayout(layout)
}

  useEffect(() => {
    if (selectedTypeLocal && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedTypeLocal])


  const handleTagSelect = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getAvailableTags = () => {
    const availableTags = new Set<string>();
    Object.values(canvasTypes).forEach(type => {
      type.tags?.forEach(tag => availableTags.add(tag));
    });
    return TAG_INFO.filter(tag => availableTags.has(tag.name));
  };

  const handleCustomization = (customType: CanvasType) => {
    setCustomizedType(customType);
    setSelectedTypeLocal(customType);
    setShowCustomEditor(false);
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-md">
      <AnimatePresence mode="wait">
        {!showCustomEditor ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full"
          >
            <div className="flex-none">
              <AnimatePresence mode="wait">
                {!selectedTypeLocal ? (
                  <motion.div
                    key="header"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-center space-y-4 w-full p-8"
                  >
                    <div className="max-w-[800px] mx-auto">
                      <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Create Your {userCanvases && userCanvases.length > 0 ? 'Next' : 'First'} Canvas
                      </h2>
                      <p className="text-muted-foreground">
                        Choose a canvas type to get started. Each canvas is designed to help you visualize and develop different aspects of your business.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-[1200px] mx-auto">
                      {getAvailableTags().map(({ name, color }) => (
                        <button
                          key={name}
                          onClick={() => handleTagSelect(name)}
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="selected-type"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex justify-center p-8"
                  >
                    <div className="max-w-[600px] w-full">
                      <div className="border rounded-lg p-6 bg-card shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                          <CanvasTypeIcon icon={selectedTypeLocal.icon} theme={theme} />
                          <div className="space-y-2 text-center">
                            <h3 className="text-2xl font-semibold text-foreground">{selectedTypeLocal.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedTypeLocal.description}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTypeLocal(null);
                                setSelectedLayout(null);
                              }}
                            >
                              <XIcon className="w-4 h-4 mr-2" />
                              Choose Different Type
                            </Button>
                            {selectedTypeLocal && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  if (selectedTypeLocal) {
                                    setShowCustomEditor(true);
                                  }
                                }}
                              >
                                Customize
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {!selectedTypeLocal ? (
                <ScrollArea className="h-full">
                  <div className="relative flex flex-wrap gap-6 w-full justify-center p-6">
                    <AnimatePresence>
                      {Object.entries(canvasTypes)
                        .filter(([_, type]) => 
                          selectedTags.length === 0 || 
                          type.tags?.some(tag => selectedTags.includes(tag))
                        )
                        .map(([key, type]) => (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 1, scale: 1 }}
                          animate={{
                            opacity: selectedTypeLocal ? (selectedTypeLocal === type ? 1 : 0.5) : 1,
                            scale: selectedTypeLocal === type ? 1.05 : 1,
                            zIndex: selectedTypeLocal === type ? 10 : 1,
                          }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          style={{
                            width: 510,
                            height: 'auto',
                          }}
                        >
                          <div
                            className={`h-full p-8 flex flex-col items-center gap-4 w-full bg-background hover:bg-muted cursor-pointer border rounded-md relative ${
                              selectedTypeLocal === type ? 'shadow-lg' : ''
                            }`}
                            onClick={() => handleCanvasTypeSelect(type)}
                          >
                            <CanvasTypeIcon icon={type.icon} theme={theme} />
                            <div className="space-y-2 text-center">
                              <h3 className="font-semibold text-foreground">{type.name}</h3>
                              <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis line-clamp-4">
                                {type.description}
                              </p>
                            </div>
                            
                            {type.tags && type.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {type.tags.map(tagName => {
                                  const tagInfo = TAG_INFO.find(t => t.name === tagName);
                                  return tagInfo && (
                                    <span
                                      key={tagName}
                                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${tagInfo.color}`}
                                    >
                                      {tagName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {type.defaultLayout && (
                              <div 
                                className="grid gap-1 p-2 border rounded-md w-full mt-2"
                                style={{
                                  gridTemplateColumns: type.defaultLayout.layout.gridTemplate.columns,
                                  gridTemplateRows: type.defaultLayout.layout.gridTemplate.rows,
                                  minHeight: '200px'
                                }}
                              >
                                {type.defaultLayout.layout.areas.map((area, index) => {
                                  const [row, col, rowSpan, colSpan] = area.split('/').map(n => n.trim());
                                  const sectionData = type.sections[index];

                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center justify-center border-2 border-dashed h-full"
                                      style={{
                                        gridArea: `${row} / ${col} / ${rowSpan} / ${colSpan}`,
                                      }}
                                    >
                                      {sectionData && (
                                        <div className="flex items-center justify-center flex-wrap gap-1">
                                          <DynamicIcon name={sectionData.icon} className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-xs text-center text-muted-foreground">{sectionData.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {selectedTypeLocal === type && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTypeLocal(null)
                                  setSelectedLayout(null)
                                }}
                              >
                                <XIcon className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-8">
                    <LayoutSelector
                      layouts={compatibleLayouts}
                      selectedLayout={selectedLayout}
                      onSelect={handleLayoutSelect}
                      canvasType={selectedTypeLocal}
                    />
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex-none p-6 bg-background flex justify-center">
              <NewCanvasDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                canvasType={selectedTypeLocal || undefined}
                layout={selectedLayout?.layout}
                folderId={currentFolder?.id}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <div className="p-4 flex items-center gap-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomEditor(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Canvas Types
              </Button>
              <div className="flex-1 text-center font-semibold">
                Customize Canvas Type
              </div>
            </div>
            {selectedTypeLocal && (
              <div className="h-[calc(100%-4rem)] overflow-auto">
                <CustomCanvasEditor
                  canvasTypeTemplate={selectedTypeLocal}
                  onChooseCanvasType={handleCustomization}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CanvasTypeIcon({ icon, theme }: { icon: string; theme?: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <DynamicIcon name={icon} className="w-6 h-6 text-foreground" />
    </div>
  )
}
